import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Play, ArrowDown } from 'lucide-react';
import { Meeting, TranscriptTurn } from '../../types';
import { usePlaybackStore } from '../../store/usePlaybackStore';
import { formatTime } from '../../utils/formatters';
import { SemanticEventType, SEMANTIC_EVENT_COLORS } from '../detail/ConversationMap';

interface TranscriptViewProps {
  meeting: Meeting;
}

interface ThreadBranch {
  id: string;
  timestamp: number;
  speakerName: string;
  summary: string;
  type: SemanticEventType;
}

export const TranscriptView: React.FC<TranscriptViewProps> = ({ meeting }) => {
  const { activeTurnId, seek, play, isPlaying } = usePlaybackStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [semanticFilter, setSemanticFilter] = useState<'all' | SemanticEventType>('all');
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

  const speakerMap = useMemo(() => {
    return meeting.participants.reduce((acc, p) => {
      acc[p.id] = p;
      return acc;
    }, {} as Record<string, (typeof meeting.participants)[0]>);
  }, [meeting.participants]);

  // Classify each turn semantically & build Conversation Threads connecting earlier moments to later outcomes
  const { turnSemantics, turnThreads } = useMemo(() => {
    const semantics: Record<string, SemanticEventType | null> = {};
    const threads: Record<string, ThreadBranch[]> = {};

    meeting.transcript.forEach((turn, idx) => {
      const lower = turn.text.toLowerCase();

      const matchedAction = meeting.actionItems.find(
        (a) => Math.abs(a.timestamp - turn.startTime) <= 6
      );
      const matchedHighlight = meeting.highlights?.find(
        (h) => Math.abs(h.startTime - turn.startTime) <= 6
      );

      if (matchedAction || lower.includes("i'll send") || lower.includes('will schedule') || lower.includes('action item')) {
        semantics[turn.id] = 'Action';
      } else if (
        matchedHighlight?.category === 'Objection' ||
        lower.includes('bottleneck') ||
        lower.includes('losing') ||
        lower.includes('outage') ||
        lower.includes('spike') ||
        lower.includes('blocker') ||
        lower.includes('concern')
      ) {
        semantics[turn.id] = 'Risk';
      } else if (
        matchedHighlight?.category === 'Key Decision' ||
        lower.includes('agreed') ||
        lower.includes('confirmed') ||
        lower.includes('decision') ||
        lower.includes('approve') ||
        lower.includes('let’s lock') ||
        lower.includes("let's lock")
      ) {
        semantics[turn.id] = 'Decision';
      } else if (turn.text.includes('?')) {
        semantics[turn.id] = 'Question';
      } else if (idx === 0 || meeting.chapters?.some((c) => Math.abs(c.startTime - turn.startTime) <= 4)) {
        semantics[turn.id] = 'Topic';
      } else {
        semantics[turn.id] = null;
      }
    });

    // Build Conversation Threads on anchor turns
    const turns = meeting.transcript;
    if (turns.length >= 4) {
      const anchor1 = turns[1];
      const downstream1: ThreadBranch[] = [];
      for (let i = 2; i < Math.min(turns.length, 6); i++) {
        const t = turns[i];
        const sp = speakerMap[t.speakerId]?.name.split(' ')[0] || t.speakerId;
        const sem = semantics[t.id] || (i === turns.length - 1 ? 'Decision' : 'Topic');
        downstream1.push({
          id: `thread-${anchor1.id}-${t.id}`,
          timestamp: t.startTime,
          speakerName: sp,
          summary:
            t.text.length > 70 ? t.text.slice(0, 70).trim() + '…' : t.text,
          type: sem,
        });
      }
      if (meeting.actionItems[0]) {
        const act = meeting.actionItems[0];
        downstream1.push({
          id: `thread-act-${act.id}`,
          timestamp: act.timestamp,
          speakerName: 'Decision / Action',
          summary: act.text,
          type: 'Decision',
        });
      }
      threads[anchor1.id] = downstream1.slice(0, 3);
    }

    if (turns.length >= 6) {
      const anchor2 = turns[4];
      const downstream2: ThreadBranch[] = [];
      for (let i = 5; i < turns.length; i++) {
        const t = turns[i];
        const sp = speakerMap[t.speakerId]?.name.split(' ')[0] || t.speakerId;
        downstream2.push({
          id: `thread-${anchor2.id}-${t.id}`,
          timestamp: t.startTime,
          speakerName: sp,
          summary:
            t.text.length > 70 ? t.text.slice(0, 70).trim() + '…' : t.text,
          type: semantics[t.id] || 'Action',
        });
      }
      if (downstream2.length > 0) {
        threads[anchor2.id] = downstream2.slice(0, 3);
      }
    }

    return { turnSemantics: semantics, turnThreads: threads };
  }, [meeting, speakerMap]);

  const filteredTurns = meeting.transcript.filter((turn: TranscriptTurn) => {
    if (semanticFilter !== 'all' && turnSemantics[turn.id] !== semanticFilter) {
      return false;
    }
    if (!searchTerm.trim()) return true;
    const speaker = speakerMap[turn.speakerId];
    return (
      turn.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      speaker?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="flex flex-col h-full bg-[#121417] border border-[#1E2127] rounded-lg overflow-hidden relative">
      {/* Transcript Toolbar */}
      <div className="px-4 py-2.5 border-b border-[#1E2127] bg-[#121417] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="font-semibold text-[#F2EFE8] mr-1.5">Transcript</span>
          {(['all', 'Question', 'Decision', 'Action', 'Risk'] as const).map((filterKey) => {
            const active = semanticFilter === filterKey;
            return (
              <button
                key={filterKey}
                onClick={() => setSemanticFilter(filterKey)}
                className={`py-0.5 px-2 rounded text-xs transition-colors ${
                  active
                    ? 'bg-[#191C20] text-[#F2EFE8] font-medium'
                    : 'text-[#969AA3] hover:text-[#F2EFE8]'
                }`}
              >
                {filterKey === 'all' ? `All (${meeting.transcript.length})` : filterKey}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-40 sm:w-52">
          <Search className="w-3.5 h-3.5 text-[#5E626B] absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search transcript..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0B0C0E] border border-[#1E2127] rounded pl-7 pr-3 py-1 text-xs text-[#F2EFE8] placeholder-[#5E626B] focus:outline-none focus:border-[#272B33] transition-colors"
          />
        </div>
      </div>

      {/* Transcript Utterances & Unboxed Conversation Threads */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto divide-y divide-[#1E2127]/60"
      >
        {filteredTurns.map((turn) => {
          const isActive = turn.id === activeTurnId;
          const speaker = speakerMap[turn.speakerId];
          const semanticType = turnSemantics[turn.id];
          const semanticStyle = semanticType ? SEMANTIC_EVENT_COLORS[semanticType] : null;
          const connectedBranches = turnThreads[turn.id];

          return (
            <div
              key={turn.id}
              ref={isActive ? activeElementRef : null}
              style={
                isActive
                  ? { backgroundColor: '#16191D', borderLeftColor: '#C7F36B' }
                  : undefined
              }
              className={`pt-2.5 px-4 sm:px-5 py-3.5 transition-colors group ${
                isActive
                  ? 'bg-cyan-950/20 border-cyan-400 bg-[#16191D] border-l-2 border-l-[#C7F36B]'
                  : 'hover:bg-[#16191D]/40 border-l-2 border-transparent'
              }`}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                {/* 1. Monospace Timestamp Button */}
                <button
                  onClick={() => {
                    seek(turn.startTime);
                    play();
                  }}
                  title={`Jump playback to ${formatTime(turn.startTime)}`}
                  className={`mt-0.5 flex items-center gap-1 font-mono text-[11px] px-1 py-0.5 rounded transition-colors flex-shrink-0 ${
                    isActive
                      ? 'text-[#C7F36B] font-semibold'
                      : 'text-[#5E626B] group-hover:text-[#969AA3] hover:text-[#C7F36B]'
                  }`}
                >
                  <Play className="w-2 h-2 fill-current opacity-70" />
                  <span>{formatTime(turn.startTime)}</span>
                </button>

                {/* 2. Speaker, Content & Conversation Thread */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-baseline gap-2">
                      <span
                        className={`text-xs font-semibold ${
                          isActive ? 'text-[#C7F36B]' : 'text-[#F2EFE8]'
                        }`}
                      >
                        {speaker?.name || turn.speakerId}
                      </span>
                      {speaker?.role && (
                        <span className="text-[11px] text-[#5E626B] hidden sm:inline">
                          {speaker.role}
                        </span>
                      )}
                    </div>

                    {/* Unboxed Semantic Label */}
                    {semanticType && semanticStyle && (
                      <span className="inline-flex items-center gap-1 text-[11px]">
                        <span className={`w-1.5 h-1.5 rounded-full ${semanticStyle.dot}`} />
                        <span className={semanticStyle.text}>{semanticType}</span>
                      </span>
                    )}
                  </div>

                  {/* Primary Transcript Content (Editorial & Proportional) */}
                  <p
                    onClick={() => {
                      seek(turn.startTime);
                      play();
                    }}
                    className={`text-[13.5px] leading-relaxed cursor-pointer transition-colors ${
                      isActive
                        ? 'text-[#F2EFE8] font-normal'
                        : 'text-[#C5C7CD] hover:text-[#F2EFE8]'
                    }`}
                  >
                    {turn.text}
                  </p>

                  {/* CONVERSATION THREADS (Unboxed Research Annotation Tree) */}
                  {connectedBranches && connectedBranches.length > 0 && (
                    <div className="mt-2.5 pt-1 border-l-2 border-[#272B33] ml-1 pl-3 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-[#969AA3] pb-0.5">
                        <span className="font-medium text-[#C7F36B]">
                          Connected moments in conversation:
                        </span>
                        <span className="text-[#5E626B] font-mono text-[10px]">
                          {connectedBranches.length} related
                        </span>
                      </div>
                      {connectedBranches.map((branch, bIdx) => {
                        const isLast = bIdx === connectedBranches.length - 1;
                        const bStyle = SEMANTIC_EVENT_COLORS[branch.type];
                        return (
                          <button
                            key={branch.id}
                            onClick={() => {
                              seek(branch.timestamp);
                              play();
                            }}
                            className="w-full flex items-center gap-2 text-left text-xs text-[#969AA3] hover:text-[#F2EFE8] group/branch py-0.5 transition-colors"
                          >
                            <span className="text-[#5E626B] font-mono select-none text-[11px]">
                              {isLast ? '└──' : '├──'}
                            </span>
                            <span className="font-mono text-[11px] text-[#C7F36B] flex-shrink-0">
                              {formatTime(branch.timestamp)}
                            </span>
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${bStyle.dot}`} />
                            <span className="font-medium text-[#F2EFE8] flex-shrink-0">
                              {branch.speakerName}:
                            </span>
                            <span className="truncate text-[#969AA3] group-hover/branch:text-[#F2EFE8]">
                              {branch.summary}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredTurns.length === 0 && (
          <div className="py-16 text-center text-xs text-[#969AA3]">
            No matching transcript segments found.
          </div>
        )}
      </div>

      {/* Floating "Resume Auto-scroll" banner */}
      {autoScrollPaused && isPlaying && (
        <button
          onClick={resumeAutoScroll}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-[#C7F36B] text-[#0B0C0E] text-xs font-semibold rounded-full shadow-lg flex items-center gap-1.5 transition-transform active:scale-95 z-10"
        >
          <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Resume scroll</span>
        </button>
      )}
    </div>
  );
};

