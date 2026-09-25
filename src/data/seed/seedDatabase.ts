import { SupabaseClient } from '@supabase/supabase-js';
import { INITIAL_MEETINGS } from './index';
import { DEMO_WORKSPACE_ID, DEMO_PROFILE_ID } from '../../lib/supabase';

/**
 * Generates a valid deterministic UUID v4 string from any stable string key.
 * Safe to run in Node.js (seed script).
 */
export function deterministicUuid(key: string): string {
  const hashChunk = (str: string, seed: number): number => {
    let h = seed >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h >>> 0;
  };

  const h1 = hashChunk(key, 0x811c9dc5).toString(16).padStart(8, '0');
  const h2 = hashChunk(key + ':2', 0x9e3779b9).toString(16).padStart(8, '0');
  const h3 = hashChunk(key + ':3', 0x85ebca6b).toString(16).padStart(8, '0');
  const h4 = hashChunk(key + ':4', 0xc2b2ae35).toString(16).padStart(8, '0');

  return `${h1}-${h2.slice(0, 4)}-4${h2.slice(5, 8)}-8${h3.slice(1, 4)}-${h3.slice(4, 8)}${h4}`;
}

/**
 * Safe, non-destructive idempotent seed function.
 * Uses `ignoreDuplicates: true` (ON CONFLICT DO NOTHING) across all tables so:
 *   1. Re-running the seed script never creates duplicate records.
 *   2. Existing completed action items are never overwritten.
 *   3. User-created highlights and clips are never deleted.
 */
export async function seedDatabaseWithClient(client: SupabaseClient): Promise<{
  workspaces: number;
  profiles: number;
  meetings: number;
  participants: number;
  meetingParticipants: number;
  transcriptSegments: number;
  summaries: number;
  actionItems: number;
  highlights: number;
  clips: number;
}> {
  // 1. Seed Demo Workspace (non-destructive)
  const workspaceRow = {
    id: DEMO_WORKSPACE_ID,
    slug: 'fanthom-intelligence-hq',
    name: 'Fanthom Intelligence',
    plan: 'Pro',
  };

  const { error: wsError } = await client
    .from('workspaces')
    .upsert(workspaceRow, { onConflict: 'id', ignoreDuplicates: true });
  if (wsError) throw new Error(`Failed to seed workspace: ${wsError.message}`);

  // 2. Seed Demo Admin Profile (Sarah Lin, non-destructive)
  const profileRow = {
    id: DEMO_PROFILE_ID,
    workspace_id: DEMO_WORKSPACE_ID,
    slug: 'sarah-lin-admin',
    name: 'Sarah Lin',
    email: 'sarah.lin@cloudscale.ai',
    role_title: 'Workspace Admin',
    avatar_url:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=64&h=64&fit=crop&crop=face',
    is_active: true,
  };

  const { error: profError } = await client
    .from('profiles')
    .upsert(profileRow, { onConflict: 'id', ignoreDuplicates: true });
  if (profError) throw new Error(`Failed to seed profile: ${profError.message}`);

  // Collect relational rows across all 4 meetings
  const participantMap = new Map<
    string,
    {
      id: string;
      workspace_id: string;
      slug: string;
      name: string;
      email: string;
      avatar_url: string;
      role: string;
      company: string;
    }
  >();

  const meetingRows: any[] = [];
  const meetingParticipantRows: any[] = [];
  const transcriptRows: any[] = [];
  const summaryRows: any[] = [];
  const actionItemRows: any[] = [];
  const highlightRows: any[] = [];
  const clipRows: any[] = [];

  for (const meeting of INITIAL_MEETINGS) {
    const meetingUuid = deterministicUuid(`meeting:${meeting.id}`);

    meetingRows.push({
      id: meetingUuid,
      workspace_id: DEMO_WORKSPACE_ID,
      slug: meeting.id,
      title: meeting.title,
      meeting_date: meeting.date,
      duration_seconds: meeting.durationSeconds,
      category: meeting.category,
      media_url: meeting.mediaUrl,
      thumbnail_url: meeting.thumbnailUrl || null,
      active_template_id: meeting.activeTemplateId,
      available_template_ids: meeting.availableTemplateIds,
      tags: meeting.tags,
      chapters: meeting.chapters || [],
    });

    // Participants & meeting_participants
    meeting.participants.forEach((p, idx) => {
      const participantUuid = deterministicUuid(`participant:${p.id}`);
      if (!participantMap.has(p.id)) {
        participantMap.set(p.id, {
          id: participantUuid,
          workspace_id: DEMO_WORKSPACE_ID,
          slug: p.id,
          name: p.name,
          email: p.email,
          avatar_url: p.avatarUrl,
          role: p.role,
          company: p.company,
        });
      }

      meetingParticipantRows.push({
        id: deterministicUuid(`mp:${meeting.id}:${p.id}`),
        meeting_id: meetingUuid,
        participant_id: participantUuid,
        is_host: Boolean(p.isHost),
        display_order: idx,
      });
    });

    // Transcript segments
    meeting.transcript.forEach((turn) => {
      const participantUuid = participantMap.get(turn.speakerId)?.id || null;
      transcriptRows.push({
        id: deterministicUuid(`turn:${meeting.id}:${turn.id}`),
        segment_key: turn.id,
        meeting_id: meetingUuid,
        participant_id: participantUuid,
        speaker_slug: turn.speakerId,
        start_time: turn.startTime,
        end_time: turn.endTime,
        text: turn.text,
        words: turn.words || null,
      });
    });

    // Summaries
    Object.entries(meeting.summaries).forEach(([templateKey, sum]) => {
      summaryRows.push({
        id: deterministicUuid(`summary:${meeting.id}:${templateKey}`),
        meeting_id: meetingUuid,
        template_id: sum.templateId,
        template_name: sum.templateName,
        overview: sum.overview,
        key_takeaways: sum.keyTakeaways,
        next_steps: sum.nextSteps || [],
        chapters: sum.chapters || null,
        metrics: sum.metrics || null,
        sentiment: sum.sentiment,
      });
    });

    // Action items (ignoreDuplicates ensures completed state is preserved)
    meeting.actionItems.forEach((item) => {
      const participantUuid = participantMap.get(item.assigneeId)?.id || null;
      actionItemRows.push({
        id: deterministicUuid(`action:${meeting.id}:${item.id}`),
        item_key: item.id,
        meeting_id: meetingUuid,
        participant_id: participantUuid,
        assignee_slug: item.assigneeId,
        text: item.text,
        completed: item.completed,
        timestamp: item.timestamp,
        context_quote: item.contextQuote,
        confidence: item.confidence,
        category: item.category || 'Follow-up',
      });
    });

    // Highlights (ignoreDuplicates ensures user-created highlights are preserved)
    meeting.highlights.forEach((hl) => {
      highlightRows.push({
        id: deterministicUuid(`highlight:${meeting.id}:${hl.id}`),
        highlight_key: hl.id,
        meeting_id: meetingUuid,
        title: hl.title,
        start_time: hl.startTime,
        end_time: hl.endTime,
        color: hl.color,
        category: hl.category,
        quote: hl.quote || null,
      });
    });

    // Clips (ignoreDuplicates ensures user-created clips are preserved)
    meeting.clips.forEach((clip) => {
      clipRows.push({
        id: deterministicUuid(`clip:${meeting.id}:${clip.id}`),
        clip_key: clip.id,
        meeting_id: meetingUuid,
        title: clip.title,
        start_time: clip.startTime,
        end_time: clip.endTime,
        speaker_ids: clip.speakerIds,
        quote: clip.quote || null,
        share_id: clip.shareId,
        created_at: clip.createdAt,
      });
    });
  }

  const participantRows = Array.from(participantMap.values());

  // 3. Seed Participants (non-destructive)
  const { error: partErr } = await client
    .from('participants')
    .upsert(participantRows, { onConflict: 'slug', ignoreDuplicates: true });
  if (partErr) throw new Error(`Failed to seed participants: ${partErr.message}`);

  // 4. Seed Meetings (non-destructive)
  const { error: meetErr } = await client
    .from('meetings')
    .upsert(meetingRows, { onConflict: 'slug', ignoreDuplicates: true });
  if (meetErr) throw new Error(`Failed to seed meetings: ${meetErr.message}`);

  // 5. Seed Meeting Participants (non-destructive)
  const { error: mpErr } = await client
    .from('meeting_participants')
    .upsert(meetingParticipantRows, {
      onConflict: 'meeting_id,participant_id',
      ignoreDuplicates: true,
    });
  if (mpErr) throw new Error(`Failed to seed meeting_participants: ${mpErr.message}`);

  // 6. Seed Transcript Segments (non-destructive)
  const { error: tsErr } = await client
    .from('transcript_segments')
    .upsert(transcriptRows, { onConflict: 'segment_key', ignoreDuplicates: true });
  if (tsErr) throw new Error(`Failed to seed transcript_segments: ${tsErr.message}`);

  // 7. Seed Summaries (non-destructive)
  const { error: sumErr } = await client
    .from('summaries')
    .upsert(summaryRows, {
      onConflict: 'meeting_id,template_id',
      ignoreDuplicates: true,
    });
  if (sumErr) throw new Error(`Failed to seed summaries: ${sumErr.message}`);

  // 8. Seed Action Items (non-destructive — never overwrites completed status)
  const { error: actErr } = await client
    .from('action_items')
    .upsert(actionItemRows, { onConflict: 'item_key', ignoreDuplicates: true });
  if (actErr) throw new Error(`Failed to seed action_items: ${actErr.message}`);

  // 9. Seed Highlights (non-destructive — never deletes user-created highlights)
  const { error: hlErr } = await client
    .from('highlights')
    .upsert(highlightRows, { onConflict: 'highlight_key', ignoreDuplicates: true });
  if (hlErr) throw new Error(`Failed to seed highlights: ${hlErr.message}`);

  // 10. Seed Clips (non-destructive — never deletes user-created clips)
  const { error: clipErr } = await client
    .from('clips')
    .upsert(clipRows, { onConflict: 'clip_key', ignoreDuplicates: true });
  if (clipErr) throw new Error(`Failed to seed clips: ${clipErr.message}`);

  return {
    workspaces: 1,
    profiles: 1,
    meetings: meetingRows.length,
    participants: participantRows.length,
    meetingParticipants: meetingParticipantRows.length,
    transcriptSegments: transcriptRows.length,
    summaries: summaryRows.length,
    actionItems: actionItemRows.length,
    highlights: highlightRows.length,
    clips: clipRows.length,
  };
}
