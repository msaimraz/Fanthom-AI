import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
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

      {/* Speaker Stage Monitor */}
      <SpeakerStage
        participants={meeting.participants}
        activeTurn={activeTurn}
        isPlaying={isPlaying}
      />

      {/* Professional Audio Transport Deck */}
      <div className="bg-[#121417] border border-[#1E2127] p-3.5 flex flex-col gap-3">
        {/* Precision Scrubber Bar */}
        <div
          ref={progressBarRef}
          onClick={handleScrub}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverTime(null)}
          className="relative h-5 group cursor-pointer flex items-center select-none"
        >
          {/* Base track */}
          <div className="w-full h-1.5 bg-[#0B0C0E] border border-[#1E2127] overflow-hidden relative">
            {/* Lime progress fill */}
            <div
              className="h-full bg-[#C7F36B] transition-[width] duration-75 relative"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Chapter Tick Markers along track */}
          {meeting.chapters?.map((chap: Chapter) => {
            const leftPercent = duration > 0 ? (chap.startTime / duration) * 100 : 0;
            return (
              <div
                key={chap.id}
                title={`${chap.title} (${formatTime(chap.startTime)})`}
                className="absolute top-1/2 -translate-y-1/2 w-[2px] h-3 bg-[#969AA3] group-hover:bg-[#C7F36B] pointer-events-none transition-colors"
                style={{ left: `${leftPercent}%` }}
              />
            );
          })}

          {/* Hover time tooltip */}
          {hoverTime !== null && (
            <div
              className="absolute -top-6 -translate-x-1/2 px-1.5 py-0.5 bg-[#0B0C0E] text-[10px] font-mono text-[#C7F36B] border border-[#272B33] pointer-events-none"
              style={{ left: `${hoverPos}px` }}
            >
              {formatTime(hoverTime)}
            </div>
          )}

          {/* Playhead cursor */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-2.5 h-3.5 bg-[#C7F36B] border border-[#0B0C0E] pointer-events-none"
            style={{ left: `calc(${progressPercent}% - 5px)` }}
          />
        </div>

        {/* Transport Controls & Timecode Readout */}
        <div className="flex items-center justify-between gap-2">
          {/* Left: Transport */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => skip(-5)}
              title="Skip back 5 seconds (Left Arrow)"
              className="p-1.5 text-[#969AA3] hover:text-[#F2EFE8] hover:bg-[#191C20] border border-[#1E2127] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={togglePlay}
              title="Play/Pause (Space)"
              className="w-8 h-8 bg-[#C7F36B] hover:bg-[#d4f788] text-[#0B0C0E] flex items-center justify-center transition-colors flex-shrink-0"
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />
              )}
            </button>

            <button
              onClick={() => skip(5)}
              title="Skip forward 5 seconds (Right Arrow)"
              className="p-1.5 text-[#969AA3] hover:text-[#F2EFE8] hover:bg-[#191C20] border border-[#1E2127] transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            {/* Tabular Timecode */}
            <div className="ml-1.5 text-xs font-mono text-[#969AA3] select-none bg-[#0B0C0E] px-2 py-1 border border-[#1E2127]">
              <span className="text-[#C7F36B] font-semibold">{formatTime(currentTime)}</span>
              <span className="mx-1 text-[#5E626B]">/</span>
              <span>{formatTime(duration || meeting.durationSeconds)}</span>
            </div>
          </div>

          {/* Right: Speed & Gain */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-0.5 bg-[#0B0C0E] p-0.5 border border-[#1E2127]">
              {[1, 1.25, 1.5, 2].map((rate) => (
                <button
                  key={rate}
                  onClick={() => setPlaybackRate(rate)}
                  className={`text-[10px] px-1.5 py-0.5 font-mono transition-colors ${
                    playbackRate === rate
                      ? 'bg-[#C7F36B] text-[#0B0C0E] font-semibold'
                      : 'text-[#969AA3] hover:text-[#F2EFE8]'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-[#969AA3] hover:text-[#F2EFE8]">
              <button
                onClick={toggleMute}
                className="p-1 hover:bg-[#191C20] transition-colors"
                title="Mute / Unmute"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-3.5 h-3.5 text-[#F26464]" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-14 h-1 bg-[#1E2127] accent-[#C7F36B] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Clickable Chapter Index */}
        {meeting.chapters && meeting.chapters.length > 0 && (
          <div className="pt-2.5 border-t border-[#1E2127] flex items-center gap-1.5 overflow-x-auto select-none">
            <span className="text-[9px] font-mono uppercase tracking-[0.14em] text-[#5E626B] mr-1 flex-shrink-0">
              Chapters:
            </span>
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
                  className={`px-2 py-1 text-[11px] font-mono whitespace-nowrap transition-colors flex items-center gap-1.5 border ${
                    isChapterActive
                      ? 'bg-[#191C20] text-[#C7F36B] border-[#C7F36B]/50 font-semibold'
                      : 'bg-[#0B0C0E] text-[#969AA3] hover:text-[#F2EFE8] border-[#1E2127]'
                  }`}
                >
                  <span>{chap.title}</span>
                  <span className="text-[9px] text-[#5E626B]">
                    {formatTime(chap.startTime)}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

