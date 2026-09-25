import { create } from 'zustand';
import {
  Meeting,
  Clip,
  Highlight,
  Workspace,
  UserProfile,
} from '../types';
import {
  fetchWorkspaceBootstrap,
  fetchMeetingBySlug,
  updateActionItemStatus,
  updateMeetingTemplate,
  createHighlightRecord,
  createClipRecord,
  deleteClipRecord,
} from '../services/meetingsService';

interface MeetingsState {
  workspace: Workspace | null;
  profile: UserProfile | null;
  meetings: Meeting[];
  activeMeetingId: string | null;
  categoryFilter: 'all' | 'customer' | 'team' | 'one_on_one';
  searchQuery: string;
  isLoading: boolean;
  hasLoaded: boolean;
  error: string | null;
  mutationError: string | null;

  // Actions
  loadWorkspaceData: () => Promise<void>;
  refreshMeeting: (slug: string) => Promise<Meeting | null>;
  setActiveMeetingId: (id: string | null) => void;
  setCategoryFilter: (filter: 'all' | 'customer' | 'team' | 'one_on_one') => void;
  setSearchQuery: (query: string) => void;
  toggleActionItem: (meetingId: string, actionItemId: string) => Promise<void>;
  setMeetingTemplate: (meetingId: string, templateId: string) => Promise<void>;
  addHighlight: (meetingId: string, highlight: Highlight) => Promise<Highlight>;
  addClip: (meetingId: string, clip: Clip) => Promise<Clip>;
  deleteClip: (meetingId: string, clipId: string) => Promise<void>;
  resetToDefaultSeed: () => Promise<void>;
  clearMutationError: () => void;
  getMeetingById: (id: string) => Meeting | undefined;
}

export const useMeetingsStore = create<MeetingsState>()((set, get) => ({
  workspace: null,
  profile: null,
  meetings: [],
  activeMeetingId: 'enterprise-sales-discovery-acme',
  categoryFilter: 'all',
  searchQuery: '',
  isLoading: true,
  hasLoaded: false,
  error: null,
  mutationError: null,

  loadWorkspaceData: async () => {
    set({ isLoading: true, error: null });
    try {
      // Ensure legacy localStorage mock keys are purged
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('fanthom-meetings-storage-v2');
        window.localStorage.removeItem('fathom-meetings-storage-v1');
      }

      const data = await fetchWorkspaceBootstrap();
      set({
        workspace: data.workspace,
        profile: data.profile,
        meetings: data.meetings,
        isLoading: false,
        hasLoaded: true,
        error: null,
      });
    } catch (err: any) {
      set({
        isLoading: false,
        hasLoaded: true,
        error: err?.message || 'Unable to load workspace meetings.',
      });
    }
  },

  refreshMeeting: async (slug: string) => {
    try {
      const freshMeeting = await fetchMeetingBySlug(slug);
      if (!freshMeeting) return null;
      set((state) => {
        const exists = state.meetings.some((m) => m.id === slug);
        return {
          meetings: exists
            ? state.meetings.map((m) => (m.id === slug ? freshMeeting : m))
            : [...state.meetings, freshMeeting],
          error: null,
        };
      });
      return freshMeeting;
    } catch {
      return null;
    }
  },

  setActiveMeetingId: (id: string | null) => set({ activeMeetingId: id }),

  setCategoryFilter: (categoryFilter) => set({ categoryFilter }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  clearMutationError: () => set({ mutationError: null }),

  toggleActionItem: async (meetingId: string, actionItemId: string) => {
    const currentMeeting = get().meetings.find((m) => m.id === meetingId);
    const currentItem = currentMeeting?.actionItems.find(
      (a) => a.id === actionItemId
    );
    if (!currentItem) return;

    const nextCompleted = !currentItem.completed;

    // Optimistic UI update
    set((state) => ({
      mutationError: null,
      meetings: state.meetings.map((meeting) => {
        if (meeting.id !== meetingId) return meeting;
        return {
          ...meeting,
          actionItems: meeting.actionItems.map((item) =>
            item.id === actionItemId
              ? { ...item, completed: nextCompleted }
              : item
          ),
        };
      }),
    }));

    try {
      await updateActionItemStatus(actionItemId, nextCompleted);
    } catch {
      // Roll back on error
      set((state) => ({
        mutationError: 'Unable to update the action item.',
        meetings: state.meetings.map((meeting) => {
          if (meeting.id !== meetingId) return meeting;
          return {
            ...meeting,
            actionItems: meeting.actionItems.map((item) =>
              item.id === actionItemId
                ? { ...item, completed: !nextCompleted }
                : item
            ),
          };
        }),
      }));
    }
  },

  setMeetingTemplate: async (meetingId: string, templateId: string) => {
    const previousTemplate =
      get().meetings.find((m) => m.id === meetingId)?.activeTemplateId ||
      'executive';

    set((state) => ({
      mutationError: null,
      meetings: state.meetings.map((meeting) => {
        if (meeting.id !== meetingId) return meeting;
        return { ...meeting, activeTemplateId: templateId };
      }),
    }));

    try {
      await updateMeetingTemplate(meetingId, templateId);
    } catch {
      set((state) => ({
        mutationError: 'Unable to update summary perspective.',
        meetings: state.meetings.map((meeting) => {
          if (meeting.id !== meetingId) return meeting;
          return { ...meeting, activeTemplateId: previousTemplate };
        }),
      }));
    }
  },

  addHighlight: async (meetingId: string, highlight: Highlight) => {
    set({ mutationError: null });
    try {
      const savedHighlight = await createHighlightRecord(meetingId, highlight);
      set((state) => ({
        meetings: state.meetings.map((meeting) => {
          if (meeting.id !== meetingId) return meeting;
          const updated = [...meeting.highlights, savedHighlight].sort(
            (a, b) => a.startTime - b.startTime
          );
          return { ...meeting, highlights: updated };
        }),
      }));
      return savedHighlight;
    } catch (err) {
      set({ mutationError: 'Unable to create the highlight.' });
      throw err;
    }
  },

  addClip: async (meetingId: string, clip: Clip) => {
    set({ mutationError: null });
    try {
      const savedClip = await createClipRecord(meetingId, clip);
      set((state) => ({
        meetings: state.meetings.map((meeting) => {
          if (meeting.id !== meetingId) return meeting;
          return { ...meeting, clips: [savedClip, ...meeting.clips] };
        }),
      }));
      return savedClip;
    } catch (err) {
      set({ mutationError: 'Unable to create the clip.' });
      throw err;
    }
  },

  deleteClip: async (meetingId: string, clipId: string) => {
    const prevClips =
      get().meetings.find((m) => m.id === meetingId)?.clips || [];

    set((state) => ({
      mutationError: null,
      meetings: state.meetings.map((meeting) => {
        if (meeting.id !== meetingId) return meeting;
        return {
          ...meeting,
          clips: meeting.clips.filter((c) => c.id !== clipId),
        };
      }),
    }));

    try {
      await deleteClipRecord(clipId);
    } catch {
      set((state) => ({
        mutationError: 'Unable to delete the clip.',
        meetings: state.meetings.map((meeting) => {
          if (meeting.id !== meetingId) return meeting;
          return { ...meeting, clips: prevClips };
        }),
      }));
    }
  },

  resetToDefaultSeed: async () => {
    set({
      activeMeetingId: 'enterprise-sales-discovery-acme',
      categoryFilter: 'all',
      searchQuery: '',
    });
    await get().loadWorkspaceData();
  },

  getMeetingById: (id: string) => {
    return get().meetings.find((m) => m.id === id);
  },
}));
