import {
  supabase,
  DEMO_WORKSPACE_ID,
  isSupabaseConfigured,
} from '../lib/supabase';
import {
  Meeting,
  Participant,
  TranscriptTurn,
  MeetingSummary,
  ActionItem,
  Highlight,
  Clip,
  Workspace,
  UserProfile,
} from '../types';


export interface WorkspaceBootstrapData {
  workspace: Workspace;
  profile: UserProfile;
  meetings: Meeting[];
}

export interface DatabaseSearchResults {
  meetings: { id: string; title: string; category: string; date: string }[];
  transcriptMoments: {
    meetingId: string;
    meetingTitle: string;
    turnId: string;
    speakerName: string;
    text: string;
    timestamp: number;
  }[];
  actionItems: {
    meetingId: string;
    meetingTitle: string;
    text: string;
    timestamp: number;
    completed: boolean;
  }[];
}

function ensureConfigured() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase environment variables (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY) are not configured.'
    );
  }
}

function assembleMeetings(
  meetingRows: any[],
  mpRows: any[],
  transcriptRows: any[],
  summaryRows: any[],
  actionRows: any[],
  highlightRows: any[],
  clipRows: any[]
): Meeting[] {
  return meetingRows.map((mRow) => {
    const meetingUuid = mRow.id;
    const meetingSlug = mRow.slug;

    // Participants ordered by display_order
    const participants: Participant[] = mpRows
      .filter((mp) => mp.meeting_id === meetingUuid && mp.participant)
      .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
      .map((mp) => ({
        id: mp.participant.slug,
        name: mp.participant.name,
        email: mp.participant.email,
        avatarUrl: mp.participant.avatar_url,
        role: mp.participant.role,
        company: mp.participant.company,
        isHost: Boolean(mp.is_host),
      }));

    // Transcript turns ordered by start_time
    const transcript: TranscriptTurn[] = transcriptRows
      .filter((t) => t.meeting_id === meetingUuid)
      .sort((a, b) => Number(a.start_time) - Number(b.start_time))
      .map((t) => ({
        id: t.segment_key || t.id,
        speakerId: t.speaker_slug,
        startTime: Number(t.start_time),
        endTime: Number(t.end_time),
        text: t.text,
        ...(t.words ? { words: t.words } : {}),
      }));

    // Summaries keyed by template_id
    const summaries: Record<string, MeetingSummary> = {};
    summaryRows
      .filter((s) => s.meeting_id === meetingUuid)
      .forEach((s) => {
        summaries[s.template_id] = {
          templateId: s.template_id,
          templateName: s.template_name,
          overview: s.overview,
          keyTakeaways: Array.isArray(s.key_takeaways) ? s.key_takeaways : [],
          nextSteps: Array.isArray(s.next_steps) ? s.next_steps : [],
          ...(s.chapters ? { chapters: s.chapters } : {}),
          ...(s.metrics ? { metrics: s.metrics } : {}),
          sentiment: s.sentiment || 'positive',
        };
      });

    // Action items ordered by timestamp
    const actionItems: ActionItem[] = actionRows
      .filter((a) => a.meeting_id === meetingUuid)
      .sort((a, b) => Number(a.timestamp) - Number(b.timestamp))
      .map((a) => ({
        id: a.item_key || a.id,
        text: a.text,
        assigneeId: a.assignee_slug,
        completed: Boolean(a.completed),
        timestamp: Number(a.timestamp),
        contextQuote: a.context_quote || '',
        confidence: Number(a.confidence ?? 0.95),
        category: a.category || 'Follow-up',
      }));

    // Highlights ordered by start_time
    const highlights: Highlight[] = highlightRows
      .filter((h) => h.meeting_id === meetingUuid)
      .sort((a, b) => Number(a.start_time) - Number(b.start_time))
      .map((h) => ({
        id: h.highlight_key || h.id,
        meetingId: meetingSlug,
        title: h.title,
        startTime: Number(h.start_time),
        endTime: Number(h.end_time),
        color: h.color || 'amber',
        category: h.category || 'Key Decision',
        ...(h.quote ? { quote: h.quote } : {}),
      }));

    // Clips ordered newest first
    const clips: Clip[] = clipRows
      .filter((c) => c.meeting_id === meetingUuid)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .map((c) => ({
        id: c.clip_key || c.id,
        meetingId: meetingSlug,
        title: c.title,
        startTime: Number(c.start_time),
        endTime: Number(c.end_time),
        speakerIds: Array.isArray(c.speaker_ids) ? c.speaker_ids : [],
        ...(c.quote ? { quote: c.quote } : {}),
        shareId: c.share_id,
        createdAt: c.created_at,
      }));

    return {
      id: meetingSlug,
      title: mRow.title,
      date: mRow.meeting_date,
      durationSeconds: Number(mRow.duration_seconds),
      category: mRow.category,
      participants,
      mediaUrl: mRow.media_url,
      ...(mRow.thumbnail_url ? { thumbnailUrl: mRow.thumbnail_url } : {}),
      activeTemplateId: mRow.active_template_id,
      availableTemplateIds: Array.isArray(mRow.available_template_ids)
        ? mRow.available_template_ids
        : ['executive'],
      summaries,
      actionItems,
      chapters: Array.isArray(mRow.chapters) ? mRow.chapters : [],
      transcript,
      clips,
      highlights,
      tags: Array.isArray(mRow.tags) ? mRow.tags : [],
    };
  });
}

/**
 * Loads the demo workspace, admin profile, and all relational meeting data from Supabase.
 */
export async function fetchWorkspaceBootstrap(): Promise<WorkspaceBootstrapData> {
  ensureConfigured();

  const [wsRes, profRes, meetingsRes] = await Promise.all([
    supabase
      .from('workspaces')
      .select('*')
      .eq('id', DEMO_WORKSPACE_ID)
      .maybeSingle(),
    supabase
      .from('profiles')
      .select('*')
      .eq('workspace_id', DEMO_WORKSPACE_ID)
      .limit(1)
      .maybeSingle(),
    supabase
      .from('meetings')
      .select('*')
      .eq('workspace_id', DEMO_WORKSPACE_ID)
      .order('meeting_date', { ascending: false }),
  ]);

  if (wsRes.error) throw new Error('Unable to load workspace from database.');
  if (profRes.error) throw new Error('Unable to load profile from database.');
  if (meetingsRes.error) throw new Error('Unable to load meetings from database.');

  const meetingRows = meetingsRes.data || [];
  const meetingUuids = meetingRows.map((m) => m.id);

  let mpRows: any[] = [];
  let transcriptRows: any[] = [];
  let summaryRows: any[] = [];
  let actionRows: any[] = [];
  let highlightRows: any[] = [];
  let clipRows: any[] = [];

  if (meetingUuids.length > 0) {
    const [mpRes, tsRes, sumRes, actRes, hlRes, clipRes] = await Promise.all([
      supabase
        .from('meeting_participants')
        .select('meeting_id, is_host, display_order, participant:participants(*)')
        .in('meeting_id', meetingUuids),
      supabase
        .from('transcript_segments')
        .select('*')
        .in('meeting_id', meetingUuids)
        .order('start_time', { ascending: true }),
      supabase
        .from('summaries')
        .select('*')
        .in('meeting_id', meetingUuids),
      supabase
        .from('action_items')
        .select('*')
        .in('meeting_id', meetingUuids)
        .order('timestamp', { ascending: true }),
      supabase
        .from('highlights')
        .select('*')
        .in('meeting_id', meetingUuids)
        .order('start_time', { ascending: true }),
      supabase
        .from('clips')
        .select('*')
        .in('meeting_id', meetingUuids)
        .order('created_at', { ascending: false }),
    ]);

    if (mpRes.error) throw new Error('Unable to load meeting participants.');
    if (tsRes.error) throw new Error('Unable to load transcript segments.');
    if (sumRes.error) throw new Error('Unable to load meeting summaries.');
    if (actRes.error) throw new Error('Unable to load action items.');
    if (hlRes.error) throw new Error('Unable to load highlights.');
    if (clipRes.error) throw new Error('Unable to load clips.');

    mpRows = mpRes.data || [];
    transcriptRows = tsRes.data || [];
    summaryRows = sumRes.data || [];
    actionRows = actRes.data || [];
    highlightRows = hlRes.data || [];
    clipRows = clipRes.data || [];
  }

  const workspace: Workspace = wsRes.data
    ? {
        id: wsRes.data.id,
        slug: wsRes.data.slug,
        name: wsRes.data.name,
        plan: wsRes.data.plan,
      }
    : {
        id: DEMO_WORKSPACE_ID,
        slug: 'fanthom-intelligence-hq',
        name: 'Fanthom Intelligence',
        plan: 'Pro',
      };

  const profile: UserProfile = profRes.data
    ? {
        id: profRes.data.id,
        workspaceId: profRes.data.workspace_id,
        slug: profRes.data.slug,
        name: profRes.data.name,
        email: profRes.data.email,
        roleTitle: profRes.data.role_title,
        avatarUrl: profRes.data.avatar_url,
        isActive: Boolean(profRes.data.is_active),
      }
    : {
        id: '',
        workspaceId: DEMO_WORKSPACE_ID,
        slug: 'sarah-lin-admin',
        name: 'Sarah Lin',
        email: 'sarah.lin@cloudscale.ai',
        roleTitle: 'Workspace Admin',
        avatarUrl:
          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=64&h=64&fit=crop&crop=face',
        isActive: true,
      };

  const meetings = assembleMeetings(
    meetingRows,
    mpRows,
    transcriptRows,
    summaryRows,
    actionRows,
    highlightRows,
    clipRows
  );

  return { workspace, profile, meetings };
}

/**
 * Fetches a single meeting and all of its child records from Supabase by slug.
 */
export async function fetchMeetingBySlug(slug: string): Promise<Meeting | null> {
  ensureConfigured();

  const { data: mRow, error: mErr } = await supabase
    .from('meetings')
    .select('*')
    .eq('workspace_id', DEMO_WORKSPACE_ID)
    .eq('slug', slug)
    .maybeSingle();

  if (mErr) throw new Error('Unable to load this meeting.');
  if (!mRow) return null;

  const meetingUuid = mRow.id;
  const [mpRes, tsRes, sumRes, actRes, hlRes, clipRes] = await Promise.all([
    supabase
      .from('meeting_participants')
      .select('meeting_id, is_host, display_order, participant:participants(*)')
      .eq('meeting_id', meetingUuid),
    supabase
      .from('transcript_segments')
      .select('*')
      .eq('meeting_id', meetingUuid)
      .order('start_time', { ascending: true }),
    supabase.from('summaries').select('*').eq('meeting_id', meetingUuid),
    supabase
      .from('action_items')
      .select('*')
      .eq('meeting_id', meetingUuid)
      .order('timestamp', { ascending: true }),
    supabase
      .from('highlights')
      .select('*')
      .eq('meeting_id', meetingUuid)
      .order('start_time', { ascending: true }),
    supabase
      .from('clips')
      .select('*')
      .eq('meeting_id', meetingUuid)
      .order('created_at', { ascending: false }),
  ]);

  if (
    mpRes.error ||
    tsRes.error ||
    sumRes.error ||
    actRes.error ||
    hlRes.error ||
    clipRes.error
  ) {
    throw new Error('Unable to load meeting details.');
  }

  const assembled = assembleMeetings(
    [mRow],
    mpRes.data || [],
    tsRes.data || [],
    sumRes.data || [],
    actRes.data || [],
    hlRes.data || [],
    clipRes.data || []
  );

  return assembled[0] || null;
}

/**
 * Updates an action item's completion status in Supabase.
 */
export async function updateActionItemStatus(
  itemKey: string,
  completed: boolean
): Promise<void> {
  ensureConfigured();

  const { error } = await supabase
    .from('action_items')
    .update({
      completed,
      updated_at: new Date().toISOString(),
    })
    .eq('item_key', itemKey);

  if (error) {
    throw new Error('Unable to update the action item.');
  }
}

/**
 * Updates a meeting's active summary template in Supabase.
 */
export async function updateMeetingTemplate(
  meetingSlug: string,
  templateId: string
): Promise<void> {
  ensureConfigured();

  const { error } = await supabase
    .from('meetings')
    .update({
      active_template_id: templateId,
      updated_at: new Date().toISOString(),
    })
    .eq('workspace_id', DEMO_WORKSPACE_ID)
    .eq('slug', meetingSlug);

  if (error) {
    throw new Error('Unable to update summary perspective.');
  }
}

/**
 * Inserts a new highlight record into Supabase.
 */
export async function createHighlightRecord(
  meetingSlug: string,
  highlight: Highlight
): Promise<Highlight> {
  ensureConfigured();

  const { data: mRow, error: mErr } = await supabase
    .from('meetings')
    .select('id')
    .eq('workspace_id', DEMO_WORKSPACE_ID)
    .eq('slug', meetingSlug)
    .single();

  if (mErr || !mRow) {
    throw new Error('Unable to create the highlight.');
  }

  const { data, error } = await supabase
    .from('highlights')
    .insert({
      highlight_key: highlight.id,
      meeting_id: mRow.id,
      title: highlight.title,
      start_time: highlight.startTime,
      end_time: highlight.endTime,
      color: highlight.color,
      category: highlight.category,
      quote: highlight.quote || null,
    })
    .select('*')
    .single();

  if (error || !data) {
    throw new Error('Unable to create the highlight.');
  }

  return {
    id: data.highlight_key || data.id,
    meetingId: meetingSlug,
    title: data.title,
    startTime: Number(data.start_time),
    endTime: Number(data.end_time),
    color: data.color,
    category: data.category,
    ...(data.quote ? { quote: data.quote } : {}),
  };
}

/**
 * Inserts a new clip record into Supabase.
 */
export async function createClipRecord(
  meetingSlug: string,
  clip: Clip
): Promise<Clip> {
  ensureConfigured();

  const { data: mRow, error: mErr } = await supabase
    .from('meetings')
    .select('id')
    .eq('workspace_id', DEMO_WORKSPACE_ID)
    .eq('slug', meetingSlug)
    .single();

  if (mErr || !mRow) {
    throw new Error('Unable to save the clip.');
  }

  const { data, error } = await supabase
    .from('clips')
    .insert({
      clip_key: clip.id,
      meeting_id: mRow.id,
      title: clip.title,
      start_time: clip.startTime,
      end_time: clip.endTime,
      speaker_ids: clip.speakerIds,
      quote: clip.quote || null,
      share_id: clip.shareId,
      created_at: clip.createdAt,
    })
    .select('*')
    .single();

  if (error || !data) {
    throw new Error('Unable to save the clip.');
  }

  return {
    id: data.clip_key || data.id,
    meetingId: meetingSlug,
    title: data.title,
    startTime: Number(data.start_time),
    endTime: Number(data.end_time),
    speakerIds: Array.isArray(data.speaker_ids) ? data.speaker_ids : [],
    ...(data.quote ? { quote: data.quote } : {}),
    shareId: data.share_id,
    createdAt: data.created_at,
  };
}

/**
 * Deletes a clip record from Supabase.
 */
export async function deleteClipRecord(clipKey: string): Promise<void> {
  ensureConfigured();

  const { error } = await supabase
    .from('clips')
    .delete()
    .eq('clip_key', clipKey);

  if (error) {
    throw new Error('Unable to delete the clip.');
  }
}

/**
 * Queries a shared clip and its parent meeting directly from Supabase for `/share/:clipId`.
 */
export async function fetchSharedClipFromDatabase(
  clipIdOrShareId: string
): Promise<{ meeting: Meeting; clip: Clip } | null> {
  ensureConfigured();

  const { data: clipRow, error: clipErr } = await supabase
    .from('clips')
    .select('*, meeting:meetings(slug)')
    .or(`share_id.eq.${clipIdOrShareId},clip_key.eq.${clipIdOrShareId}`)
    .maybeSingle();

  if (clipErr) throw new Error('Unable to load shared clip.');
  if (!clipRow || !clipRow.meeting?.slug) return null;

  const meeting = await fetchMeetingBySlug(clipRow.meeting.slug);
  if (!meeting) return null;

  const clip =
    meeting.clips.find(
      (c) => c.shareId === clipIdOrShareId || c.id === clipIdOrShareId
    ) || {
      id: clipRow.clip_key || clipRow.id,
      meetingId: meeting.id,
      title: clipRow.title,
      startTime: Number(clipRow.start_time),
      endTime: Number(clipRow.end_time),
      speakerIds: Array.isArray(clipRow.speaker_ids) ? clipRow.speaker_ids : [],
      ...(clipRow.quote ? { quote: clipRow.quote } : {}),
      shareId: clipRow.share_id,
      createdAt: clipRow.created_at,
    };

  return { meeting, clip };
}

/**
 * Queries Supabase directly for Cmd/Ctrl + K workspace search across meetings,
 * transcript segments, and action items.
 */
export async function searchWorkspaceDatabase(
  rawQuery: string
): Promise<DatabaseSearchResults> {
  ensureConfigured();

  const trimmed = rawQuery.trim();
  if (!trimmed) {
    return { meetings: [], transcriptMoments: [], actionItems: [] };
  }

  const pattern = `%${trimmed}%`;

  const [meetingsRes, tsRes, actRes] = await Promise.all([
    supabase
      .from('meetings')
      .select('slug, title, category, meeting_date, tags')
      .eq('workspace_id', DEMO_WORKSPACE_ID)
      .order('meeting_date', { ascending: false }),
    supabase
      .from('transcript_segments')
      .select(
        'segment_key, speaker_slug, start_time, text, meeting:meetings!inner(slug, title, workspace_id), participant:participants(name)'
      )
      .eq('meeting.workspace_id', DEMO_WORKSPACE_ID)
      .ilike('text', pattern)
      .order('start_time', { ascending: true })
      .limit(8),
    supabase
      .from('action_items')
      .select(
        'item_key, text, timestamp, completed, meeting:meetings!inner(slug, title, workspace_id)'
      )
      .eq('meeting.workspace_id', DEMO_WORKSPACE_ID)
      .ilike('text', pattern)
      .order('timestamp', { ascending: true })
      .limit(5),
  ]);

  if (meetingsRes.error || tsRes.error || actRes.error) {
    throw new Error('Unable to search workspace records.');
  }

  const lower = trimmed.toLowerCase();
  const matchedMeetings = (meetingsRes.data || [])
    .filter(
      (m: any) =>
        m.title.toLowerCase().includes(lower) ||
        (Array.isArray(m.tags) &&
          m.tags.some((t: string) => t.toLowerCase().includes(lower)))
    )
    .slice(0, 3)
    .map((m: any) => ({
      id: m.slug,
      title: m.title,
      category: m.category,
      date: m.meeting_date,
    }));

  const transcriptMoments = (tsRes.data || []).slice(0, 5).map((row: any) => ({
    meetingId: row.meeting?.slug || '',
    meetingTitle: row.meeting?.title || '',
    turnId: row.segment_key,
    speakerName: row.participant?.name || row.speaker_slug,
    text: row.text,
    timestamp: Number(row.start_time),
  }));

  const actionItems = (actRes.data || []).slice(0, 3).map((row: any) => ({
    meetingId: row.meeting?.slug || '',
    meetingTitle: row.meeting?.title || '',
    text: row.text,
    timestamp: Number(row.timestamp),
    completed: Boolean(row.completed),
  }));

  return {
    meetings: matchedMeetings,
    transcriptMoments,
    actionItems,
  };
}

