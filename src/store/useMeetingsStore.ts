import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Meeting, Clip } from '../types';
import { INITIAL_MEETINGS } from '../data/seed';

interface MeetingsState {
  meetings: Meeting[];
  activeMeetingId: string | null;
  categoryFilter: 'all' | 'customer' | 'team' | 'one_on_one';
  searchQuery: string;

  // Selectors & Actions
  setActiveMeetingId: (id: string | null) => void;
  setCategoryFilter: (filter: 'all' | 'customer' | 'team' | 'one_on_one') => void;
  setSearchQuery: (query: string) => void;
  toggleActionItem: (meetingId: string, actionItemId: string) => void;
  setMeetingTemplate: (meetingId: string, templateId: string) => void;
  addClip: (meetingId: string, clip: Clip) => void;
  deleteClip: (meetingId: string, clipId: string) => void;
  resetToDefaultSeed: () => void;
  getMeetingById: (id: string) => Meeting | undefined;
}

export const useMeetingsStore = create<MeetingsState>()(
  persist(
    (set, get) => ({
      meetings: INITIAL_MEETINGS,
      activeMeetingId: 'enterprise-sales-discovery-acme',
      categoryFilter: 'all',
      searchQuery: '',

      setActiveMeetingId: (id: string | null) => set({ activeMeetingId: id }),
      
      setCategoryFilter: (categoryFilter) => set({ categoryFilter }),
      
      setSearchQuery: (searchQuery) => set({ searchQuery }),

      toggleActionItem: (meetingId: string, actionItemId: string) => {
        set((state) => ({
          meetings: state.meetings.map((meeting) => {
            if (meeting.id !== meetingId) return meeting;
            return {
              ...meeting,
              actionItems: meeting.actionItems.map((item) =>
                item.id === actionItemId ? { ...item, completed: !item.completed } : item
              ),
            };
          }),
        }));
      },

      setMeetingTemplate: (meetingId: string, templateId: string) => {
        set((state) => ({
          meetings: state.meetings.map((meeting) => {
            if (meeting.id !== meetingId) return meeting;
            return { ...meeting, activeTemplateId: templateId };
          }),
        }));
      },

      addClip: (meetingId: string, clip: Clip) => {
        set((state) => ({
          meetings: state.meetings.map((meeting) => {
            if (meeting.id !== meetingId) return meeting;
            return { ...meeting, clips: [clip, ...meeting.clips] };
          }),
        }));
      },

      deleteClip: (meetingId: string, clipId: string) => {
        set((state) => ({
          meetings: state.meetings.map((meeting) => {
            if (meeting.id !== meetingId) return meeting;
            return {
              ...meeting,
              clips: meeting.clips.filter((c) => c.id !== clipId),
            };
          }),
        }));
      },

      resetToDefaultSeed: () => {
        set({
          meetings: INITIAL_MEETINGS,
          activeMeetingId: 'enterprise-sales-discovery-acme',
          categoryFilter: 'all',
          searchQuery: '',
        });
      },

      getMeetingById: (id: string) => {
        return get().meetings.find((m) => m.id === id);
      },
    }),
    {
      name: 'fathom-meetings-storage-v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

