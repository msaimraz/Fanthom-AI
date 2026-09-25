import React from 'react';
import {
  CheckSquare,
  Square,
  Play,
} from 'lucide-react';
import { Meeting } from '../../types';
import { useMeetingsStore } from '../../store/useMeetingsStore';
import { usePlaybackStore } from '../../store/usePlaybackStore';
import { formatTime } from '../../utils/formatters';

interface ActionItemsViewProps {
  meeting: Meeting;
}

export const ActionItemsView: React.FC<ActionItemsViewProps> = ({ meeting }) => {
  const { toggleActionItem } = useMeetingsStore();
  const { seek, play } = usePlaybackStore();

  const completedCount = meeting.actionItems.filter((a) => a.completed).length;
  const totalCount = meeting.actionItems.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const speakerMap = meeting.participants.reduce((acc, p) => {
    acc[p.id] = p;
    return acc;
  }, {} as Record<string, (typeof meeting.participants)[0]>);

  return (
    <div className="flex flex-col h-full bg-[#121417] border border-[#1E2127] overflow-hidden">
      {/* Header with completion status */}
      <div className="px-4 py-2.5 border-b border-[#1E2127] bg-[#121417] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#47D18C]" />
          <span className="text-xs font-mono uppercase tracking-[0.12em] font-semibold text-[#F2EFE8]">
            Follow-ups & Action Items
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#0B0C0E] text-[#47D18C] border border-[#1E2127]">
            {completedCount}/{totalCount}
          </span>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-2.5 w-32">
          <div className="flex-1 h-1 bg-[#0B0C0E] border border-[#1E2127] overflow-hidden">
            <div
              className="h-full bg-[#47D18C] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-[#47D18C] font-semibold">
            {Math.round(progressPercent)}%
          </span>
        </div>
      </div>

      {/* Follow-up Ledger Rows */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#1E2127]">
        {meeting.actionItems.map((action) => {
          const assignee = speakerMap[action.assigneeId];

          return (
            <div
              key={action.id}
              className={`p-4 transition-colors flex flex-col gap-2 ${
                action.completed
                  ? 'bg-[#0B0C0E]/60 opacity-60'
                  : 'bg-[#0B0C0E] hover:bg-[#191C20]/60'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleActionItem(meeting.id, action.id)}
                  title={action.completed ? 'Mark as incomplete' : 'Mark as completed'}
                  className="mt-0.5 flex-shrink-0 text-[#969AA3] hover:text-[#C7F36B] transition-colors"
                >
                  {action.completed ? (
                    <CheckSquare className="w-4 h-4 text-[#47D18C]" />
                  ) : (
                    <Square className="w-4 h-4 text-[#969AA3] hover:text-[#C7F36B]" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-[13px] leading-relaxed ${
                      action.completed
                        ? 'line-through text-[#5E626B]'
                        : 'text-[#F2EFE8] font-medium'
                    }`}
                  >
                    {action.text}
                  </p>
                </div>
              </div>

              {action.contextQuote && (
                <div className="ml-7 pl-2.5 border-l border-[#272B33] text-xs text-[#969AA3] leading-snug">
                  <span className="line-clamp-1">"{action.contextQuote}"</span>
                </div>
              )}

              <div className="ml-7 flex flex-wrap items-center justify-between gap-2 pt-1 font-mono text-[10px]">
                <div className="flex items-center gap-2">
                  {assignee && (
                    <span className="px-2 py-0.5 bg-[#121417] text-[#F2EFE8] border border-[#1E2127]">
                      {assignee.name}
                    </span>
                  )}

                  {action.category && (
                    <span className="px-2 py-0.5 bg-[#121417] text-[#47D18C] border border-[#47D18C]/30 uppercase">
                      {action.category}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => {
                    seek(action.timestamp);
                    play();
                  }}
                  title={`Seek to ${formatTime(action.timestamp)}`}
                  className="flex items-center gap-1.5 px-2 py-0.5 bg-[#121417] hover:bg-[#C7F36B] text-[#969AA3] hover:text-[#0B0C0E] border border-[#1E2127] transition-colors ml-auto"
                >
                  <Play className="w-2.5 h-2.5 fill-current" />
                  <span>Jump [{formatTime(action.timestamp)}]</span>
                </button>
              </div>
            </div>
          );
        })}

        {meeting.actionItems.length === 0 && (
          <div className="py-16 text-center text-xs font-mono text-[#969AA3]">
            No follow-up items recorded for this conversation.
          </div>
        )}
      </div>
    </div>
  );
};

