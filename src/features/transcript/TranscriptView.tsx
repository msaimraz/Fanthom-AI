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
    <div className="flex flex-col h-full bg-[#17191D] border border-[#23262D] rounded-xl overflow-hidden relative">
      {/* Transcript Header with Search */}
      <div className="p-3.5 border-b border-[#23262D] bg-[#17191D] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#F4F3EF]">Conversation Transcript</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#101114] text-[#A7A9B0] border border-[#23262D]">
            {meeting.transcript.length} turns
          </span>
        </div>

        {/* In-transcript search */}
        <div className="relative w-48 sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#6F737D] absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search transcript..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#101114] border border-[#23262D] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#F4F3EF] placeholder-[#6F737D] focus:outline-none focus:border-[#8B7CF6] transition-colors"
          />
        </div>
      </div>

      {/* Utterance List */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-[#23262D]/60"
      >
        {filteredTurns.map((turn) => {
          const isActive = turn.id === activeTurnId;
          const speaker = speakerMap[turn.speakerId];

          return (
            <div
              key={turn.id}
              ref={isActive ? activeElementRef : null}
              className={`pt-2.5 first:pt-0 rounded-lg p-3 transition-all duration-150 group ${
                isActive
                  ? 'bg-cyan-950/20 border-cyan-400 bg-[#1D2025] border-l-2 border-l-[#8B7CF6] pl-3.5 shadow-sm'
                  : 'hover:bg-[#1D2025]/60 border-l-2 border-transparent pl-3.5'
              }`}
            >
              {/* Speaker header row */}
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  {speaker?.avatarUrl ? (
                    <img
                      src={speaker.avatarUrl}
                      alt={speaker.name}
                      className="w-5 h-5 rounded-full object-cover border border-[#2C3039]"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-[#23262D] flex items-center justify-center text-[#A7A9B0]">
                      <User className="w-3 h-3" />
                    </div>
                  )}
                  <span
                    className={`text-xs font-semibold ${
                      isActive ? 'text-[#8B7CF6]' : 'text-[#F4F3EF]'
                    }`}
                  >
                    {speaker?.name || turn.speakerId}
                  </span>
                  {speaker?.role && (
                    <span className="text-[11px] text-[#6F737D] hidden sm:inline">
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
                  className={`flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md transition-all ${
                    isActive
                      ? 'bg-[#8B7CF6] text-white font-semibold shadow-sm'
                      : 'bg-[#101114] text-[#A7A9B0] hover:text-[#F4F3EF] hover:bg-[#1D2025] border border-[#23262D]'
                  }`}
                >
                  <Play className="w-2.5 h-2.5 fill-current" />
                  <span>{formatTime(turn.startTime)}</span>
                </button>
              </div>

              {/* Spoken Text */}
              <p
                className={`text-[13px] leading-relaxed transition-colors cursor-pointer ${
                  isActive ? 'text-[#F4F3EF] font-medium' : 'text-[#A7A9B0] hover:text-[#F4F3EF]'
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
          <div className="py-16 text-center text-xs text-[#6F737D]">
            No matching statements found for "{searchTerm}".
          </div>
        )}
      </div>

      {/* Floating "Resume Auto-scroll" banner */}
      {autoScrollPaused && isPlaying && (
        <button
          onClick={resumeAutoScroll}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3.5 py-1.5 rounded-full bg-[#8B7CF6] hover:bg-[#9D91FF] text-white text-xs font-semibold shadow-xl shadow-[#8B7CF6]/30 flex items-center gap-1.5 transition-all active:scale-95 z-10"
        >
          <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Resume scroll</span>
        </button>
      )}
    </div>
  );
};

