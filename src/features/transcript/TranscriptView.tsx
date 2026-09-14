import React, { useEffect, useRef, useState } from 'react';
import { Search, Play, ArrowDown, User } from 'lucide-react';
import { Meeting } from '../../types';
import { usePlaybackStore } from '../../store/usePlaybackStore';
import { formatTime } from '../../utils/formatters';

interface TranscriptViewProps {
  meeting: Meeting;
}

export const TranscriptView: React.FC<TranscriptViewProps> = ({ meeting }) => {
  const { activeTurnId, seek, play, isPlaying } = usePlaybackStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [autoScrollPaused, setAutoScrollPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeElementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!autoScrollPaused && activeElementRef.current) {
      activeElementRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [activeTurnId, autoScrollPaused]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    if (isPlaying && !autoScrollPaused) {
      setAutoScrollPaused(true);
    }
  };

  const resumeAutoScroll = () => {
    setAutoScrollPaused(false);
    if (activeElementRef.current) {
      activeElementRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  const speakerMap = meeting.participants.reduce((acc, p) => {
    acc[p.id] = p;
    return acc;
  }, {} as Record<string, (typeof meeting.participants)[0]>);

  const filteredTurns = meeting.transcript.filter((turn) => {
    if (!searchTerm.trim()) return true;
    const speaker = speakerMap[turn.speakerId];
    return (
      turn.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      speaker?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="flex flex-col h-full bg-[#111217] border border-[#1d1f28] rounded-xl overflow-hidden relative">
      {/* Transcript Header with Search */}
      <div className="p-3 border-b border-[#181a24] bg-[#0e0f15] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-200">Transcript</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#161822] text-zinc-400 border border-[#202330]">
            {meeting.transcript.length} turns
          </span>
        </div>

        {/* In-transcript search */}
        <div className="relative w-48 sm:w-60">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search transcript..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#07080b] border border-[#1e202d] rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-400/60 transition-colors shadow-inner"
          />
        </div>
      </div>

      {/* Utterance List */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-2 divide-y divide-[#161822]"
      >
        {filteredTurns.map((turn) => {
          const isActive = turn.id === activeTurnId;
          const speaker = speakerMap[turn.speakerId];

          return (
            <div
              key={turn.id}
              ref={isActive ? activeElementRef : null}
              className={`pt-2.5 first:pt-0 rounded-lg p-2.5 transition-all duration-150 group ${
                isActive
                  ? 'bg-cyan-950/20 border-l-2 border-cyan-400 pl-3 shadow-inner'
                  : 'hover:bg-[#13151f] border-l-2 border-transparent pl-3'
              }`}
            >
              {/* Speaker header row */}
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  {speaker?.avatarUrl ? (
                    <img
                      src={speaker.avatarUrl}
                      alt={speaker.name}
                      className="w-4.5 h-4.5 rounded-full object-cover border border-[#242738]"
                    />
                  ) : (
                    <div className="w-4.5 h-4.5 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                      <User className="w-2.5 h-2.5" />
                    </div>
                  )}
                  <span
                    className={`text-xs font-semibold ${
                      isActive ? 'text-cyan-300' : 'text-zinc-200'
                    }`}
                  >
                    {speaker?.name || turn.speakerId}
                  </span>
                  {speaker?.role && (
                    <span className="text-[10px] text-zinc-500 hidden sm:inline">
                      • {speaker.role}
                    </span>
                  )}
                </div>

                {/* Timestamp Pill */}
                <button
                  onClick={() => {
                    seek(turn.startTime);
                    play();
                  }}
                  title={`Jump playback to ${formatTime(turn.startTime)}`}
                  className={`flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md transition-all shadow-sm ${
                    isActive
                      ? 'bg-cyan-400 text-black font-semibold'
                      : 'bg-[#151722] text-zinc-400 hover:text-cyan-300 hover:bg-[#1d2030] border border-[#202332]'
                  }`}
                >
                  <Play className="w-2.5 h-2.5 fill-current" />
                  <span>{formatTime(turn.startTime)}</span>
                </button>
              </div>

              {/* Spoken Text */}
              <p
                className={`text-[13px] leading-relaxed transition-colors cursor-pointer ${
                  isActive ? 'text-zinc-100 font-medium' : 'text-zinc-300 hover:text-zinc-100'
                }`}
                onClick={() => {
                  seek(turn.startTime);
                  play();
                }}
              >
                {turn.text}
              </p>
            </div>
          );
        })}

        {filteredTurns.length === 0 && (
          <div className="py-16 text-center text-xs text-zinc-500">
            No matching statements found for "{searchTerm}".
          </div>
        )}
      </div>

      {/* Floating "Resume Auto-scroll" banner */}
      {autoScrollPaused && isPlaying && (
        <button
          onClick={resumeAutoScroll}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-semibold shadow-xl shadow-cyan-950/50 flex items-center gap-1.5 transition-all active:scale-95 z-10"
        >
          <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Resume scroll</span>
        </button>
      )}
    </div>
  );
};

