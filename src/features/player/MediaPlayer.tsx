import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Gauge,
  Bookmark,
} from 'lucide-react';
import { usePlaybackStore } from '../../store/usePlaybackStore';
import { Meeting, Chapter } from '../../types';
import { formatTime } from '../../utils/formatters';
import { SpeakerStage } from './SpeakerStage';

interface MediaPlayerProps {
  meeting: Meeting;
}

export const MediaPlayer: React.FC<MediaPlayerProps> = ({ meeting }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  const {
    currentTime,
    duration,
    isPlaying,
    playbackRate,
    volume,
    isMuted,
    activeTurnId,
    seekTarget,
    play,
    pause,
    togglePlay,
    seek,
    skip,
    setPlaybackRate,
    setVolume,
    toggleMute,
    setCurrentTime,
    setDuration,
    clearSeekTarget,
  } = usePlaybackStore();

  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPos, setHoverPos] = useState<number>(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch((err) => {
        console.warn('Playback prevented by browser policy:', err);
        pause();
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, pause]);

  useEffect(() => {
    if (seekTarget !== null && audioRef.current) {
      audioRef.current.currentTime = seekTarget;
      clearSeekTarget();
    }
  }, [seekTarget, clearSeekTarget]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Global Spacebar listener for play/pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        skip(-5);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        skip(5);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, skip]);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const time = audio.currentTime;
    const matchedTurn = meeting.transcript.find(
      (turn) => time >= turn.startTime && time <= turn.endTime
    );

    setCurrentTime(time, matchedTurn?.id || null);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      const dur = audioRef.current.duration || meeting.durationSeconds;
      setDuration(dur);
    }
  };

  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !duration) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const targetSeconds = (clickX / rect.width) * duration;
    seek(targetSeconds);
    if (!isPlaying) play();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !duration) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const mouseX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setHoverPos(mouseX);
    setHoverTime((mouseX / rect.width) * duration);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const activeTurn = useMemo(() => {
    return meeting.transcript.find((t) => t.id === activeTurnId) || null;
  }, [meeting.transcript, activeTurnId]);

  return (
    <div className="flex flex-col gap-3">
      {/* Audio element */}
      <audio
        ref={audioRef}
        src={meeting.mediaUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => pause()}
      />

      {/* Speaker Stage */}
      <SpeakerStage
        participants={meeting.participants}
        activeTurn={activeTurn}
        isPlaying={isPlaying}
      />

      {/* Media Player Control Bar */}
      <div className="bg-[#17191D] border border-[#23262D] rounded-xl p-3.5 shadow-md flex flex-col gap-3">
        {/* Scrubber Bar Container */}
        <div
          ref={progressBarRef}
          onClick={handleScrub}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverTime(null)}
          className="relative h-4 group cursor-pointer flex items-center select-none"
        >
          {/* Base track */}
          <div className="w-full h-1.5 bg-[#101114] group-hover:h-2 rounded-full overflow-hidden transition-all relative">
            {/* Iris progress fill */}
            <div
              className="h-full bg-gradient-to-r from-[#8B7CF6] to-[#A79AF8] transition-[width] duration-75 relative shadow-[0_0_8px_#8B7CF6]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Chapter Markers along track */}
          {meeting.chapters?.map((chap: Chapter) => {
            const leftPercent = duration > 0 ? (chap.startTime / duration) * 100 : 0;
            return (
              <div
                key={chap.id}
                title={`${chap.title} (${formatTime(chap.startTime)})`}
                className="absolute top-1/2 -translate-y-1/2 w-1 h-3 bg-[#6F737D] group-hover:bg-[#8B7CF6] rounded-sm pointer-events-none transition-colors"
                style={{ left: `${leftPercent}%` }}
              />
            );
          })}

          {/* Hover time tooltip */}
          {hoverTime !== null && (
            <div
              className="absolute -top-7 -translate-x-1/2 px-2 py-0.5 rounded bg-[#101114] text-[10px] font-mono text-[#8B7CF6] shadow-xl border border-[#23262D] pointer-events-none"
              style={{ left: `${hoverPos}px` }}
            >
              {formatTime(hoverTime)}
            </div>
          )}

          {/* Scrubber thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg border-2 border-[#8B7CF6] scale-0 group-hover:scale-100 transition-transform pointer-events-none"
            style={{ left: `calc(${progressPercent}% - 7px)` }}
          />
        </div>

        {/* Buttons & Time row */}
        <div className="flex items-center justify-between">
          {/* Left: Playback controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => skip(-5)}
              title="Skip back 5 seconds (Left Arrow)"
              className="p-1.5 text-[#A7A9B0] hover:text-[#F4F3EF] hover:bg-[#1D2025] rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={togglePlay}
              title="Play/Pause (Space)"
              className="w-9 h-9 rounded-full bg-[#8B7CF6] hover:bg-[#9D91FF] text-white flex items-center justify-center shadow-md shadow-[#8B7CF6]/25 transition-all active:scale-95 flex-shrink-0"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 ml-0.5 fill-white" />}
            </button>

            <button
              onClick={() => skip(5)}
              title="Skip forward 5 seconds (Right Arrow)"
              className="p-1.5 text-[#A7A9B0] hover:text-[#F4F3EF] hover:bg-[#1D2025] rounded-lg transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            {/* Time readout */}
            <div className="ml-2 text-xs font-mono text-[#A7A9B0] select-none">
              <span className="text-[#F4F3EF] font-semibold">{formatTime(currentTime)}</span>
              <span className="mx-1 text-[#6F737D]">/</span>
              <span>{formatTime(duration || meeting.durationSeconds)}</span>
            </div>
          </div>

          {/* Right: Speed & Volume */}
          <div className="flex items-center gap-3">
            {/* Speed selector */}
            <div className="flex items-center gap-0.5 bg-[#101114] px-2 py-1 rounded-lg border border-[#23262D]">
              <Gauge className="w-3 h-3 text-[#6F737D] mr-1" />
              {[1, 1.25, 1.5, 2].map((rate) => (
                <button
                  key={rate}
                  onClick={() => setPlaybackRate(rate)}
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono transition-colors ${
                    playbackRate === rate
                      ? 'bg-[#8B7CF6] text-white font-semibold shadow-sm'
                      : 'text-[#A7A9B0] hover:text-[#F4F3EF]'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>

            {/* Volume toggle */}
            <div className="flex items-center gap-1.5 text-[#A7A9B0] hover:text-[#F4F3EF]">
              <button onClick={toggleMute} className="p-1 hover:bg-[#1D2025] rounded-md transition-colors">
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-16 h-1 bg-[#23262D] accent-[#8B7CF6] rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Clickable Chapter Pills */}
        {meeting.chapters && meeting.chapters.length > 0 && (
          <div className="pt-2.5 border-t border-[#23262D] flex items-center gap-2 overflow-x-auto select-none">
            <Bookmark className="w-3.5 h-3.5 text-[#8B7CF6] flex-shrink-0" />
            <div className="flex items-center gap-1.5">
              {meeting.chapters.map((chap: Chapter) => {
                const isChapterActive =
                  currentTime >= chap.startTime && currentTime <= chap.endTime;
                return (
                  <button
                    key={chap.id}
                    onClick={() => {
                      seek(chap.startTime);
                      if (!isPlaying) play();
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-all flex items-center gap-1.5 border shadow-sm ${
                      isChapterActive
                        ? 'bg-[#8B7CF6]/15 text-[#8B7CF6] border-[#8B7CF6]/35 font-semibold'
                        : 'bg-[#101114] text-[#A7A9B0] hover:text-[#F4F3EF] border-[#23262D]'
                    }`}
                  >
                    <span>{chap.title}</span>
                    <span className="text-[10px] font-mono text-[#6F737D]">
                      {formatTime(chap.startTime)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
