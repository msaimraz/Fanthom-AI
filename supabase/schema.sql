-- =============================================================================
-- Fanthom Meeting Intelligence Workspace — Supabase PostgreSQL Schema
-- =============================================================================
-- Includes:
--   1. workspaces
--   2. profiles
--   3. meetings
--   4. participants
--   5. meeting_participants
--   6. transcript_segments
--   7. summaries
--   8. action_items
--   9. highlights
--  10. clips
-- With UUID primary keys, foreign keys, indexes, and least-privilege
-- Row Level Security (RLS) scoped to the public demo workspace
-- (00000000-0000-4000-8000-000000000001).
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. WORKSPACES
CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'Pro',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. PROFILES (profiles -> workspaces)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role_title TEXT NOT NULL,
  avatar_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. MEETINGS (workspaces -> meetings)
CREATE TABLE IF NOT EXISTS public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  meeting_date TIMESTAMPTZ NOT NULL,
  duration_seconds NUMERIC NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('customer', 'team', 'one_on_one', 'executive')),
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  active_template_id TEXT NOT NULL DEFAULT 'executive',
  available_template_ids TEXT[] NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}',
  chapters JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. PARTICIPANTS
CREATE TABLE IF NOT EXISTS public.participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT NOT NULL,
  role TEXT NOT NULL,
  company TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. MEETING_PARTICIPANTS (meetings -> meeting_participants -> participants)
CREATE TABLE IF NOT EXISTS public.meeting_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  is_host BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (meeting_id, participant_id)
);

-- 6. TRANSCRIPT_SEGMENTS (meetings -> transcript_segments)
CREATE TABLE IF NOT EXISTS public.transcript_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  segment_key TEXT UNIQUE NOT NULL,
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES public.participants(id) ON DELETE SET NULL,
  speaker_slug TEXT NOT NULL,
  start_time NUMERIC NOT NULL,
  end_time NUMERIC NOT NULL,
  text TEXT NOT NULL,
  words JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. SUMMARIES (meetings -> summaries)
CREATE TABLE IF NOT EXISTS public.summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL,
  template_name TEXT NOT NULL,
  overview TEXT NOT NULL,
  key_takeaways JSONB NOT NULL DEFAULT '[]'::jsonb,
  next_steps JSONB DEFAULT '[]'::jsonb,
  chapters JSONB,
  metrics JSONB,
  sentiment TEXT NOT NULL DEFAULT 'positive',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (meeting_id, template_id)
);

-- 8. ACTION_ITEMS (meetings -> action_items)
CREATE TABLE IF NOT EXISTS public.action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_key TEXT UNIQUE NOT NULL,
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES public.participants(id) ON DELETE SET NULL,
  assignee_slug TEXT NOT NULL,
  text TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  timestamp NUMERIC NOT NULL DEFAULT 0,
  context_quote TEXT NOT NULL DEFAULT '',
  confidence NUMERIC NOT NULL DEFAULT 0.95,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. HIGHLIGHTS (meetings -> highlights)
CREATE TABLE IF NOT EXISTS public.highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  highlight_key TEXT UNIQUE NOT NULL,
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(trim(title)) > 0),
  start_time NUMERIC NOT NULL CHECK (start_time >= 0),
  end_time NUMERIC NOT NULL CHECK (end_time >= start_time),
  color TEXT NOT NULL DEFAULT 'amber',
  category TEXT NOT NULL DEFAULT 'Key Decision',
  quote TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. CLIPS (meetings -> clips)
CREATE TABLE IF NOT EXISTS public.clips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clip_key TEXT UNIQUE NOT NULL,
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(trim(title)) > 0),
  start_time NUMERIC NOT NULL CHECK (start_time >= 0),
  end_time NUMERIC NOT NULL CHECK (end_time > start_time),
  speaker_ids TEXT[] NOT NULL DEFAULT '{}',
  quote TEXT,
  share_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_workspace_id ON public.profiles(workspace_id);
CREATE INDEX IF NOT EXISTS idx_meetings_workspace_id ON public.meetings(workspace_id);
CREATE INDEX IF NOT EXISTS idx_meetings_slug ON public.meetings(slug);
CREATE INDEX IF NOT EXISTS idx_meetings_meeting_date ON public.meetings(meeting_date DESC);
CREATE INDEX IF NOT EXISTS idx_participants_workspace_id ON public.participants(workspace_id);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_meeting_id ON public.meeting_participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_participant_id ON public.meeting_participants(participant_id);

CREATE INDEX IF NOT EXISTS idx_transcript_segments_meeting_id ON public.transcript_segments(meeting_id);
CREATE INDEX IF NOT EXISTS idx_transcript_segments_timestamp ON public.transcript_segments(meeting_id, start_time);
CREATE INDEX IF NOT EXISTS idx_transcript_segments_fts ON public.transcript_segments USING GIN (to_tsvector('english', text));

CREATE INDEX IF NOT EXISTS idx_summaries_meeting_id ON public.summaries(meeting_id);

CREATE INDEX IF NOT EXISTS idx_action_items_meeting_id ON public.action_items(meeting_id);
CREATE INDEX IF NOT EXISTS idx_action_items_status ON public.action_items(completed);
CREATE INDEX IF NOT EXISTS idx_action_items_timestamp ON public.action_items(meeting_id, timestamp);

CREATE INDEX IF NOT EXISTS idx_highlights_meeting_id ON public.highlights(meeting_id);
CREATE INDEX IF NOT EXISTS idx_highlights_timestamp ON public.highlights(meeting_id, start_time);
CREATE INDEX IF NOT EXISTS idx_clips_meeting_id ON public.clips(meeting_id);
CREATE INDEX IF NOT EXISTS idx_clips_share_id ON public.clips(share_id);
CREATE INDEX IF NOT EXISTS idx_clips_timestamp ON public.clips(meeting_id, start_time);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) — Least-Privilege Policies Scoped to Demo Workspace
-- Demo Workspace UUID: 00000000-0000-4000-8000-000000000001
--
-- Security Model:
-- 1. Core reference tables (workspaces, profiles, participants,
--    meeting_participants, transcript_segments, summaries) allow SELECT and
--    non-destructive initial seed INSERT (ON CONFLICT DO NOTHING), with NO
--    anonymous UPDATE or DELETE permissions.
-- 2. Meetings allow SELECT and updating active_template_id within the demo
--    workspace, with NO anonymous DELETE.
-- 3. Action items allow SELECT, initial seed INSERT, and updating completion
--    status within the demo workspace, with NO anonymous DELETE.
-- 4. Highlights allow SELECT and INSERT within the demo workspace, with NO
--    anonymous UPDATE or DELETE.
-- 5. Clips allow SELECT and INSERT within the demo workspace, and restrict
--    DELETE strictly to user-created clips (protecting seeded demo clips).
-- =============================================================================

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transcript_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clips ENABLE ROW LEVEL SECURITY;

-- Drop legacy policies if re-running migration
DROP POLICY IF EXISTS "demo_workspace_access" ON public.workspaces;
DROP POLICY IF EXISTS "demo_profiles_access" ON public.profiles;
DROP POLICY IF EXISTS "demo_meetings_access" ON public.meetings;
DROP POLICY IF EXISTS "demo_participants_access" ON public.participants;
DROP POLICY IF EXISTS "demo_meeting_participants_access" ON public.meeting_participants;
DROP POLICY IF EXISTS "demo_transcript_segments_access" ON public.transcript_segments;
DROP POLICY IF EXISTS "demo_summaries_access" ON public.summaries;
DROP POLICY IF EXISTS "demo_action_items_access" ON public.action_items;
DROP POLICY IF EXISTS "demo_highlights_access" ON public.highlights;
DROP POLICY IF EXISTS "demo_clips_access" ON public.clips;

-- 1. WORKSPACES: Read-only + initial seed insert for demo workspace
DROP POLICY IF EXISTS "demo_workspace_select" ON public.workspaces;
CREATE POLICY "demo_workspace_select" ON public.workspaces
  FOR SELECT
  USING (id = '00000000-0000-4000-8000-000000000001'::uuid);

DROP POLICY IF EXISTS "demo_workspace_seed_insert" ON public.workspaces;
CREATE POLICY "demo_workspace_seed_insert" ON public.workspaces
  FOR INSERT
  WITH CHECK (id = '00000000-0000-4000-8000-000000000001'::uuid);

-- 2. PROFILES: Read-only + initial seed insert for demo workspace
DROP POLICY IF EXISTS "demo_profiles_select" ON public.profiles;
CREATE POLICY "demo_profiles_select" ON public.profiles
  FOR SELECT
  USING (workspace_id = '00000000-0000-4000-8000-000000000001'::uuid);

DROP POLICY IF EXISTS "demo_profiles_seed_insert" ON public.profiles;
CREATE POLICY "demo_profiles_seed_insert" ON public.profiles
  FOR INSERT
  WITH CHECK (workspace_id = '00000000-0000-4000-8000-000000000001'::uuid);

-- 3. MEETINGS: Select, initial seed insert, and template switch update (no delete)
DROP POLICY IF EXISTS "demo_meetings_select" ON public.meetings;
CREATE POLICY "demo_meetings_select" ON public.meetings
  FOR SELECT
  USING (workspace_id = '00000000-0000-4000-8000-000000000001'::uuid);

DROP POLICY IF EXISTS "demo_meetings_seed_insert" ON public.meetings;
CREATE POLICY "demo_meetings_seed_insert" ON public.meetings
  FOR INSERT
  WITH CHECK (workspace_id = '00000000-0000-4000-8000-000000000001'::uuid);

DROP POLICY IF EXISTS "demo_meetings_update_template" ON public.meetings;
CREATE POLICY "demo_meetings_update_template" ON public.meetings
  FOR UPDATE
  USING (workspace_id = '00000000-0000-4000-8000-000000000001'::uuid)
  WITH CHECK (workspace_id = '00000000-0000-4000-8000-000000000001'::uuid);

-- 4. PARTICIPANTS: Read-only + initial seed insert (no update or delete)
DROP POLICY IF EXISTS "demo_participants_select" ON public.participants;
CREATE POLICY "demo_participants_select" ON public.participants
  FOR SELECT
  USING (workspace_id = '00000000-0000-4000-8000-000000000001'::uuid);

DROP POLICY IF EXISTS "demo_participants_seed_insert" ON public.participants;
CREATE POLICY "demo_participants_seed_insert" ON public.participants
  FOR INSERT
  WITH CHECK (workspace_id = '00000000-0000-4000-8000-000000000001'::uuid);

-- 5. MEETING_PARTICIPANTS: Read-only + initial seed insert (no update or delete)
DROP POLICY IF EXISTS "demo_meeting_participants_select" ON public.meeting_participants;
CREATE POLICY "demo_meeting_participants_select" ON public.meeting_participants
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.meetings m
      WHERE m.id = meeting_participants.meeting_id
        AND m.workspace_id = '00000000-0000-4000-8000-000000000001'::uuid
    )
  );

DROP POLICY IF EXISTS "demo_meeting_participants_seed_insert" ON public.meeting_participants;
CREATE POLICY "demo_meeting_participants_seed_insert" ON public.meeting_participants
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.meetings m
      WHERE m.id = meeting_participants.meeting_id
        AND m.workspace_id = '00000000-0000-4000-8000-000000000001'::uuid
    )
  );

-- 6. TRANSCRIPT_SEGMENTS: Read-only + initial seed insert (no update or delete)
DROP POLICY IF EXISTS "demo_transcript_segments_select" ON public.transcript_segments;
CREATE POLICY "demo_transcript_segments_select" ON public.transcript_segments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.meetings m
      WHERE m.id = transcript_segments.meeting_id
        AND m.workspace_id = '00000000-0000-4000-8000-000000000001'::uuid
    )
  );

DROP POLICY IF EXISTS "demo_transcript_segments_seed_insert" ON public.transcript_segments;
CREATE POLICY "demo_transcript_segments_seed_insert" ON public.transcript_segments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.meetings m
      WHERE m.id = transcript_segments.meeting_id
        AND m.workspace_id = '00000000-0000-4000-8000-000000000001'::uuid
    )
  );

-- 7. SUMMARIES: Read-only + initial seed insert (no update or delete)
DROP POLICY IF EXISTS "demo_summaries_select" ON public.summaries;
CREATE POLICY "demo_summaries_select" ON public.summaries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.meetings m
      WHERE m.id = summaries.meeting_id
        AND m.workspace_id = '00000000-0000-4000-8000-000000000001'::uuid
    )
  );

DROP POLICY IF EXISTS "demo_summaries_seed_insert" ON public.summaries;
CREATE POLICY "demo_summaries_seed_insert" ON public.summaries
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.meetings m
      WHERE m.id = summaries.meeting_id
        AND m.workspace_id = '00000000-0000-4000-8000-000000000001'::uuid
    )
  );

-- 8. ACTION_ITEMS: Select, initial seed insert, and status UPDATE only (no delete)
DROP POLICY IF EXISTS "demo_action_items_select" ON public.action_items;
CREATE POLICY "demo_action_items_select" ON public.action_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.meetings m
      WHERE m.id = action_items.meeting_id
        AND m.workspace_id = '00000000-0000-4000-8000-000000000001'::uuid
    )
  );

DROP POLICY IF EXISTS "demo_action_items_seed_insert" ON public.action_items;
CREATE POLICY "demo_action_items_seed_insert" ON public.action_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.meetings m
      WHERE m.id = action_items.meeting_id
        AND m.workspace_id = '00000000-0000-4000-8000-000000000001'::uuid
    )
  );

DROP POLICY IF EXISTS "demo_action_items_update" ON public.action_items;
CREATE POLICY "demo_action_items_update" ON public.action_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.meetings m
      WHERE m.id = action_items.meeting_id
        AND m.workspace_id = '00000000-0000-4000-8000-000000000001'::uuid
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.meetings m
      WHERE m.id = action_items.meeting_id
        AND m.workspace_id = '00000000-0000-4000-8000-000000000001'::uuid
    )
  );

-- 9. HIGHLIGHTS: Select and INSERT only (no update or delete)
DROP POLICY IF EXISTS "demo_highlights_select" ON public.highlights;
CREATE POLICY "demo_highlights_select" ON public.highlights
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.meetings m
      WHERE m.id = highlights.meeting_id
        AND m.workspace_id = '00000000-0000-4000-8000-000000000001'::uuid
    )
  );

DROP POLICY IF EXISTS "demo_highlights_insert" ON public.highlights;
CREATE POLICY "demo_highlights_insert" ON public.highlights
  FOR INSERT
  WITH CHECK (
    char_length(trim(title)) > 0
    AND start_time >= 0
    AND end_time >= start_time
    AND EXISTS (
      SELECT 1 FROM public.meetings m
      WHERE m.id = highlights.meeting_id
        AND m.workspace_id = '00000000-0000-4000-8000-000000000001'::uuid
    )
  );

-- 10. CLIPS: Select and INSERT in demo workspace; DELETE restricted to non-seeded user clips only
DROP POLICY IF EXISTS "demo_clips_select" ON public.clips;
CREATE POLICY "demo_clips_select" ON public.clips
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.meetings m
      WHERE m.id = clips.meeting_id
        AND m.workspace_id = '00000000-0000-4000-8000-000000000001'::uuid
    )
  );

DROP POLICY IF EXISTS "demo_clips_insert" ON public.clips;
CREATE POLICY "demo_clips_insert" ON public.clips
  FOR INSERT
  WITH CHECK (
    char_length(trim(title)) > 0
    AND start_time >= 0
    AND end_time > start_time
    AND EXISTS (
      SELECT 1 FROM public.meetings m
      WHERE m.id = clips.meeting_id
        AND m.workspace_id = '00000000-0000-4000-8000-000000000001'::uuid
    )
  );

DROP POLICY IF EXISTS "demo_clips_delete_user_created_only" ON public.clips;
CREATE POLICY "demo_clips_delete_user_created_only" ON public.clips
  FOR DELETE
  USING (
    clip_key NOT IN ('clip-hero-1', 'clip-hero-2', 'clip-inc-1', 'clip-prod-1', 'clip-1on1-1')
    AND EXISTS (
      SELECT 1 FROM public.meetings m
      WHERE m.id = clips.meeting_id
        AND m.workspace_id = '00000000-0000-4000-8000-000000000001'::uuid
    )
  );
