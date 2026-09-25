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

export const SEMANTIC_EVENT_COLORS: Record<
  SemanticEventType,
  {
    dot: string;
    text: string;
  }
> = {
  Topic: {
    dot: 'bg-[#C7F36B]',
    text: 'text-[#C7F36B]',
  },
  Question: {
    dot: 'bg-[#5BA3F5]',
    text: 'text-[#5BA3F5]',
  },
  Decision: {
    dot: 'bg-[#F0B449]',
    text: 'text-[#F0B449]',
  },
  Action: {
    dot: 'bg-[#47D18C]',
    text: 'text-[#47D18C]',
  },
  Risk: {
    dot: 'bg-[#F26464]',
    text: 'text-[#F26464]',
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

    // Derive structural spine stages from chapters or transcript
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

    // Enrich with highlights
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

    // Add key questions if needed
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

    // Add action items
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
    <div className="bg-[#121417] border border-[#1E2127] rounded-lg px-4 py-3 select-none">
      {/* Header Label + Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#1E2127]/60 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#F2EFE8]">
            Conversation Map
          </span>
          <span className="text-xs text-[#5E626B] hidden sm:inline">
            — navigation structure & key moments
          </span>
        </div>

        {/* Semantic Color Indicators */}
        <div className="flex items-center gap-3 text-xs text-[#969AA3]">
          {(
            [
              { type: 'Topic', color: 'bg-[#C7F36B]' },
              { type: 'Question', color: 'bg-[#5BA3F5]' },
              { type: 'Decision', color: 'bg-[#F0B449]' },
              { type: 'Action', color: 'bg-[#47D18C]' },
              { type: 'Risk', color: 'bg-[#F26464]' },
            ] as const
          ).map((item) => (
            <span key={item.type} className="inline-flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
              <span className="text-[11px]">{item.type}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Connected Navigation Structure (unboxed, thin rail & event pins) */}
      <div className="flex items-center overflow-x-auto py-1 gap-2 sm:gap-3">
        {events.map((ev, idx) => {
          const style = SEMANTIC_EVENT_COLORS[ev.type];
          const nextEv = events[idx + 1];
          const isCurrent =
            currentTime >= ev.timestamp &&
            (nextEv ? currentTime < nextEv.timestamp : currentTime <= totalDuration);

          return (
            <React.Fragment key={ev.id}>
              <button
                onClick={() => handleJump(ev.timestamp)}
                title={`${ev.type}: ${ev.label} (${formatTime(ev.timestamp)})`}
                className={`group flex items-start gap-2 py-1 px-1.5 rounded transition-colors text-left flex-shrink-0 ${
                  isCurrent ? 'bg-[#191C20]' : 'hover:bg-[#191C20]/60'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${style.dot} ${
                    isCurrent ? 'ring-2 ring-[#C7F36B]/40' : ''
                  }`}
                />
                <div className="flex flex-col min-w-0">
                  <div className="flex items-baseline gap-1.5">
                    <span
                      className={`text-xs font-semibold truncate max-w-[125px] ${
                        isCurrent
                          ? 'text-[#C7F36B]'
                          : 'text-[#F2EFE8] group-hover:text-[#C7F36B]'
                      }`}
                    >
                      {ev.label}
                    </span>
                    <span className="font-mono text-[10px] text-[#5E626B]">
                      {formatTime(ev.timestamp)}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#969AA3] font-normal">
                    {ev.stageCode}
                  </span>
                </div>
              </button>

              {idx < events.length - 1 && (
                <div className="w-3 sm:w-4 h-[1px] bg-[#272B33] flex-shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

