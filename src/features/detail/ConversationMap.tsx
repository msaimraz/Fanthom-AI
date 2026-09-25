import React, { useMemo } from 'react';
import { Meeting } from '../../types';
import { usePlaybackStore } from '../../store/usePlaybackStore';
import { formatTime } from '../../utils/formatters';

export type SemanticEventType = 'Topic' | 'Question' | 'Decision' | 'Action' | 'Risk';

export interface ConversationMapEvent {
  id: string;
  stageCode: string;
  label: string;
  type: SemanticEventType;
  timestamp: number;
  endTime: number;
  speakerName?: string;
}

interface ConversationMapProps {
  meeting: Meeting;
}

export const SEMANTIC_EVENT_STYLES: Record<
  SemanticEventType,
  {
    dot: string;
    text: string;
    border: string;
    bg: string;
  }
> = {
  Topic: {
    dot: 'bg-[#C7F36B]',
    text: 'text-[#C7F36B]',
    border: 'border-[#C7F36B]/50',
    bg: 'bg-[#C7F36B]/10',
  },
  Question: {
    dot: 'bg-[#5BA3F5]',
    text: 'text-[#5BA3F5]',
    border: 'border-[#5BA3F5]/50',
    bg: 'bg-[#5BA3F5]/10',
  },
  Decision: {
    dot: 'bg-[#F0B449]',
    text: 'text-[#F0B449]',
    border: 'border-[#F0B449]/50',
    bg: 'bg-[#F0B449]/10',
  },
  Action: {
    dot: 'bg-[#47D18C]',
    text: 'text-[#47D18C]',
    border: 'border-[#47D18C]/50',
    bg: 'bg-[#47D18C]/10',
  },
  Risk: {
    dot: 'bg-[#F26464]',
    text: 'text-[#F26464]',
    border: 'border-[#F26464]/50',
    bg: 'bg-[#F26464]/10',
  },
};

export const ConversationMap: React.FC<ConversationMapProps> = ({ meeting }) => {
  const { currentTime, duration, seek, play } = usePlaybackStore();
  const totalDuration = duration || meeting.durationSeconds || 150;

  const events = useMemo<ConversationMapEvent[]>(() => {
    const speakerMap = meeting.participants.reduce((acc, p) => {
      acc[p.id] = p.name.split(' ')[0];
      return acc;
    }, {} as Record<string, string>);

    const mapped: ConversationMapEvent[] = [];

    // 1. Derive structural spine stages from chapters or transcript turns
    const stageLabels = ['INTRO', 'TOPIC', 'PAIN', 'ARCHITECTURE', 'DECISION', 'FOLLOW-UP'];
    const chapters = meeting.chapters || [];

    chapters.forEach((ch, idx) => {
      const lower = ch.title.toLowerCase();
      let type: SemanticEventType = 'Topic';
      let stageCode = stageLabels[idx] || 'TOPIC';

      if (idx === 0) {
        stageCode = 'INTRO';
        type = 'Topic';
      } else if (lower.includes('pain') || lower.includes('incident') || lower.includes('risk') || lower.includes('root')) {
        stageCode = 'PAIN';
        type = 'Risk';
      } else if (lower.includes('question') || lower.includes('require') || lower.includes('scope')) {
        stageCode = 'QUESTION';
        type = 'Question';
      } else if (lower.includes('decision') || lower.includes('security') || lower.includes('commit')) {
        stageCode = 'DECISION';
        type = 'Decision';
      } else if (lower.includes('next') || lower.includes('action') || lower.includes('follow')) {
        stageCode = 'FOLLOW-UP';
        type = 'Action';
      }

      mapped.push({
        id: `stage-${ch.id}`,
        stageCode,
        label: ch.title,
        type,
        timestamp: ch.startTime,
        endTime: ch.endTime,
      });
    });

    // 2. Enrich with semantic events from highlights & action items so all 5 semantic types are represented
    meeting.highlights?.forEach((hl) => {
      let type: SemanticEventType = 'Decision';
      let stageCode = 'DECISION';
      if (hl.category === 'Objection') {
        type = 'Risk';
        stageCode = 'RISK';
      } else if (hl.category === 'Product Request') {
        type = 'Question';
        stageCode = 'QUESTION';
      } else if (hl.category === 'Action') {
        type = 'Action';
        stageCode = 'ACTION';
      } else if (hl.category === 'Pricing') {
        type = 'Topic';
        stageCode = 'PRICING';
      }

      if (!mapped.some((m) => Math.abs(m.timestamp - hl.startTime) < 4)) {
        mapped.push({
          id: `hl-${hl.id}`,
          stageCode,
          label: hl.title,
          type,
          timestamp: hl.startTime,
          endTime: hl.endTime,
        });
      }
    });

    // 3. Add question turns if none explicitly added yet
    meeting.transcript.forEach((turn) => {
      if (turn.text.includes('?') && !mapped.some((m) => Math.abs(m.timestamp - turn.startTime) < 5)) {
        mapped.push({
          id: `q-${turn.id}`,
          stageCode: 'QUESTION',
          label: turn.text.slice(0, 42) + '...',
          type: 'Question',
          timestamp: turn.startTime,
          endTime: turn.endTime,
          speakerName: speakerMap[turn.speakerId],
        });
      }
    });

    // 4. Add action item timestamps
    meeting.actionItems.slice(0, 2).forEach((act) => {
      if (!mapped.some((m) => Math.abs(m.timestamp - act.timestamp) < 5)) {
        mapped.push({
          id: `act-${act.id}`,
          stageCode: 'FOLLOW-UP',
          label: act.text,
          type: 'Action',
          timestamp: act.timestamp,
          endTime: Math.min(totalDuration, act.timestamp + 12),
          speakerName: speakerMap[act.assigneeId],
        });
      }
    });

    return mapped.sort((a, b) => a.timestamp - b.timestamp);
  }, [meeting, totalDuration]);

  const handleJump = (timestamp: number) => {
    seek(timestamp);
    play();
  };

  return (
    <div className="bg-[#121417] border border-[#1E2127] px-4 py-3 select-none">
      {/* Top Row: Signature Label + Semantic Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#C7F36B]" />
          <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#C7F36B] font-semibold">
            Conversation Map
          </span>
          <span className="text-[10px] font-mono text-[#5E626B] hidden sm:inline">
            — Structural spine & semantic events (click any node to seek audio)
          </span>
        </div>

        {/* Semantic Event Color Legend */}
        <div className="flex items-center gap-3 text-[10px] font-mono text-[#969AA3]">
          {(
            [
              { type: 'Topic', color: 'bg-[#C7F36B]' },
              { type: 'Question', color: 'bg-[#5BA3F5]' },
              { type: 'Decision', color: 'bg-[#F0B449]' },
              { type: 'Action', color: 'bg-[#47D18C]' },
              { type: 'Risk', color: 'bg-[#F26464]' },
            ] as const
          ).map((item) => (
            <span key={item.type} className="inline-flex items-center gap-1">
              <span className={`w-1.5 h-1.5 ${item.color}`} />
              <span>{item.type}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Structural Spine: INTRO ─── TOPIC ───── PAIN ─── DEMO ───── DECISION ─── FOLLOW-UP */}
      <div className="flex items-center overflow-x-auto pb-1 gap-0">
        {events.map((ev, idx) => {
          const style = SEMANTIC_EVENT_STYLES[ev.type];
          const nextEv = events[idx + 1];
          const isCurrent =
            currentTime >= ev.timestamp &&
            (nextEv ? currentTime < nextEv.timestamp : currentTime <= totalDuration);

          return (
            <React.Fragment key={ev.id}>
              <button
                onClick={() => handleJump(ev.timestamp)}
                title={`${ev.type}: ${ev.label} (${formatTime(ev.timestamp)})`}
                className={`group flex flex-col items-start px-2.5 py-1.5 border transition-colors flex-shrink-0 text-left ${
                  isCurrent
                    ? `bg-[#191C20] ${style.border}`
                    : 'bg-[#0B0C0E] border-[#1E2127] hover:bg-[#191C20] hover:border-[#272B33]'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 ${style.dot}`} />
                  <span
                    className={`font-mono text-[10px] font-semibold tracking-[0.12em] uppercase ${
                      isCurrent ? style.text : 'text-[#F2EFE8] group-hover:text-[#C7F36B]'
                    }`}
                  >
                    {ev.stageCode}
                  </span>
                  <span className="font-mono text-[9px] text-[#5E626B] ml-1">
                    {formatTime(ev.timestamp)}
                  </span>
                </div>
                <span className="text-[11px] text-[#969AA3] group-hover:text-[#F2EFE8] truncate max-w-[132px] mt-0.5">
                  {ev.label}
                </span>
              </button>

              {idx < events.length - 1 && (
                <div className="w-4 sm:w-6 h-[1px] bg-[#272B33] flex-shrink-0 relative flex items-center justify-center">
                  <span className="text-[8px] font-mono text-[#5E626B] select-none">─</span>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

