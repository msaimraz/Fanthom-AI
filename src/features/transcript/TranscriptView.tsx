import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Play, ArrowDown } from 'lucide-react';
import { Meeting, TranscriptTurn } from '../../types';
import { usePlaybackStore } from '../../store/usePlaybackStore';
import { formatTime } from '../../utils/formatters';
import { SemanticEventType, SEMANTIC_EVENT_STYLES } from '../detail/ConversationMap';

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

      // Match against highlights & action items first
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

    // Build Conversation Threads on anchor turns (turn index 1 and turn index 3 if available)
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
            t.text.length > 68 ? t.text.slice(0, 68).trim() + '…' : t.text,
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
            t.text.length > 68 ? t.text.slice(0, 68).trim() + '…' : t.text,
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
    <div className="flex flex-col h-full bg-[#121417] border border-[#1E2127] overflow-hidden relative">
      {/* Transcript Analysis Toolbar */}
      <div className="px-4 py-2.5 border-b border-[#1E2127] bg-[#121417] flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 overflow-x-auto font-mono">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#F2EFE8] mr-1">
            Transcript
          </span>
          {(['all', 'Question', 'Decision', 'Action', 'Risk'] as const).map((filterKey) => {
            const active = semanticFilter === filterKey;
            return (
              <button
                key={filterKey}
                onClick={() => setSemanticFilter(filterKey)}
                className={`px-2 py-0.5 text-[10px] uppercase border transition-colors ${
                  active
                    ? 'bg-[#191C20] text-[#C7F36B] border-[#C7F36B]/50 font-semibold'
                    : 'bg-[#0B0C0E] text-[#969AA3] hover:text-[#F2EFE8] border-[#1E2127]'
                }`}
              >
                {filterKey === 'all' ? `All (${meeting.transcript.length})` : filterKey}
              </button>
            );
          })}
        </div>

        {/* In-transcript search */}
        <div className="relative w-44 sm:w-56">
          <Search className="w-3.5 h-3.5 text-[#5E626B] absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search transcript..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0B0C0E] border border-[#1E2127] pl-8 pr-3 py-1 text-xs text-[#F2EFE8] placeholder-[#5E626B] focus:outline-none focus:border-[#C7F36B] transition-colors font-mono"
          />
        </div>
      </div>

      {/* Structured Utterance & Conversation Thread Stream */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto divide-y divide-[#1E2127]"
      >
        {filteredTurns.map((turn) => {
          const isActive = turn.id === activeTurnId;
          const speaker = speakerMap[turn.speakerId];
          const semanticType = turnSemantics[turn.id];
          const semanticStyle = semanticType ? SEMANTIC_EVENT_STYLES[semanticType] : null;
          const connectedBranches = turnThreads[turn.id];

          return (
            <div
              key={turn.id}
              ref={isActive ? activeElementRef : null}
              style={
                isActive
                  ? { backgroundColor: '#191C20', borderLeftColor: '#C7F36B' }
                  : undefined
              }
              className={`pt-2.5 px-4 py-3.5 transition-colors group ${
                isActive
                  ? 'bg-cyan-950/20 border-cyan-400 bg-[#191C20] border-l-2 border-l-[#C7F36B]'
                  : 'hover:bg-[#191C20]/50 border-l-2 border-transparent'
              }`}
            >
              {/* 3-Column Analysis Layout: Time Gutter | Speaker & Semantic Tag | Utterance + Thread */}
              <div className="flex items-start gap-3.5">
                {/* Col 1: Tabular Timestamp Seek Button */}
                <button
                  onClick={() => {
                    seek(turn.startTime);
                    play();
                  }}
                  title={`Jump playback to ${formatTime(turn.startTime)}`}
                  className={`mt-0.5 flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 border transition-colors flex-shrink-0 ${
                    isActive
                      ? 'bg-[#C7F36B] text-[#0B0C0E] border-[#C7F36B] font-semibold'
                      : 'bg-[#0B0C0E] text-[#969AA3] hover:text-[#C7F36B] border-[#1E2127]'
                  }`}
                >
                  <Play className="w-2 h-2 fill-current" />
                  <span>{formatTime(turn.startTime)}</span>
                </button>

                {/* Col 2 & 3: Speaker Header + Utterance + Conversation Thread */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs font-semibold ${
                          isActive ? 'text-[#C7F36B]' : 'text-[#F2EFE8]'
                        }`}
                      >
                        {speaker?.name || turn.speakerId}
                      </span>
                      {speaker?.role && (
                        <span className="text-[10px] font-mono text-[#5E626B]">
                          {speaker.role}
                        </span>
                      )}
                    </div>

                    {/* Semantic Event Badge */}
                    {semanticType && semanticStyle && (
                      <span
                        className={`inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-[0.12em] px-1.5 py-0.5 border ${semanticStyle.bg} ${semanticStyle.text} ${semanticStyle.border}`}
                      >
                        <span className={`w-1.5 h-1.5 ${semanticStyle.dot}`} />
                        {semanticType}
                      </span>
                    )}
                  </div>

                  {/* Spoken Text */}
                  <p
                    onClick={() => {
                      seek(turn.startTime);
                      play();
                    }}
                    className={`text-[13px] leading-relaxed cursor-pointer transition-colors ${
                      isActive
                        ? 'text-[#F2EFE8] font-medium'
                        : 'text-[#969AA3] hover:text-[#F2EFE8]'
                    }`}
                  >
                    {turn.text}
                  </p>

                  {/* CONVERSATION THREADS — Connects initiating moment to downstream decisions & actions */}
                  {connectedBranches && connectedBranches.length > 0 && (
                    <div className="mt-2.5 pl-2 border-l border-[#272B33] space-y-1 bg-[#0B0C0E]/70 py-2 pr-2.5">
                      <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-[0.14em] text-[#C7F36B] mb-1">
                        <span>Conversation Thread · Connected Moments</span>
                        <span className="text-[#5E626B]">{connectedBranches.length} linked</span>
                      </div>
                      {connectedBranches.map((branch, bIdx) => {
                        const isLast = bIdx === connectedBranches.length - 1;
                        const bStyle = SEMANTIC_EVENT_STYLES[branch.type];
                        return (
                          <button
                            key={branch.id}
                            onClick={() => {
                              seek(branch.timestamp);
                              play();
                            }}
                            className="w-full flex items-center gap-2 text-left text-[11px] font-mono text-[#969AA3] hover:text-[#F2EFE8] group/branch py-0.5 transition-colors"
                          >
                            <span className="text-[#5E626B] select-none">
                              {isLast ? '└──' : '├──'}
                            </span>
                            <span className="text-[#C7F36B] flex-shrink-0">
                              {formatTime(branch.timestamp)}
                            </span>
                            <span className={`w-1.5 h-1.5 flex-shrink-0 ${bStyle.dot}`} />
                            <span className="text-[#F2EFE8] font-sans font-medium flex-shrink-0">
                              {branch.speakerName}:
                            </span>
                            <span className="truncate font-sans text-[#969AA3] group-hover/branch:text-[#F2EFE8]">
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
          <div className="py-16 text-center text-xs font-mono text-[#969AA3]">
            No matching transcript segments found.
          </div>
        )}
      </div>

      {/* Floating "Resume Auto-scroll" banner */}
      {autoScrollPaused && isPlaying && (
        <button
          onClick={resumeAutoScroll}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3.5 py-1.5 bg-[#C7F36B] text-[#0B0C0E] text-xs font-mono font-semibold flex items-center gap-1.5 transition-transform active:scale-95 z-10"
        >
          <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Resume scroll</span>
        </button>
      )}
    </div>
  );
};
