import { create } from 'zustand';

interface PlaybackState {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  playbackRate: number;
  volume: number;
  isMuted: boolean;
  activeTurnId: string | null;
  autoScroll: boolean;
  seekTarget: number | null;

  // Actions
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  skip: (seconds: number) => void;
  setPlaybackRate: (rate: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setCurrentTime: (time: number, activeTurnId?: string | null) => void;
  setDuration: (duration: number) => void;
  setAutoScroll: (enabled: boolean) => void;
  clearSeekTarget: () => void;
  resetPlayback: () => void;
}

export const usePlaybackStore = create<PlaybackState>((set, get) => ({
  currentTime: 0,
  duration: 0,
  isPlaying: false,
  playbackRate: 1,
  volume: 1,
  isMuted: false,
  activeTurnId: null,
  autoScroll: true,
  seekTarget: null,

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  seek: (time: number) => {
    const clamped = Math.max(0, Math.min(time, get().duration || time));
    set({ seekTarget: clamped, currentTime: clamped });
  },
  skip: (seconds: number) => {
    const { currentTime, duration, seek } = get();
    seek(Math.max(0, Math.min(currentTime + seconds, duration)));
  },
  setPlaybackRate: (playbackRate: number) => set({ playbackRate }),
  setVolume: (volume: number) => set({ volume, isMuted: volume === 0 }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  setCurrentTime: (currentTime: number, activeTurnId?: string | null) => {
    set((state) => ({
      currentTime,
      ...(activeTurnId !== undefined && activeTurnId !== state.activeTurnId ? { activeTurnId } : {}),
    }));
  },
  setDuration: (duration: number) => set({ duration }),
  setAutoScroll: (autoScroll: boolean) => set({ autoScroll }),
  clearSeekTarget: () => set({ seekTarget: null }),
  resetPlayback: () =>
    set({
      currentTime: 0,
      isPlaying: false,
      activeTurnId: null,
      seekTarget: 0,
    }),
}));

