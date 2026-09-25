import React from 'react';
import {
  CheckSquare,
  Square,
  Play,
  Quote,
  CheckCircle2,
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

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'Technical':
        return 'bg-[#8B7CF6]/10 text-[#8B7CF6] border-[#8B7CF6]/25';
      case 'Contract':
        return 'bg-[#E7B45C]/10 text-[#E7B45C] border-[#E7B45C]/25';
      case 'Product':
        return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/25';
      default:
        return 'bg-[#55C89A]/10 text-[#55C89A] border-[#55C89A]/25';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#17191D] border border-[#23262D] rounded-xl overflow-hidden">
      {/* Header with progress */}
      <div className="p-3.5 border-b border-[#23262D] bg-[#17191D] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#55C89A]" />
          <span className="text-xs font-semibold text-[#F4F3EF]">Follow-ups & Action Items</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#101114] text-[#A7A9B0] border border-[#23262D]">
            {completedCount}/{totalCount}
          </span>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2.5 w-32">
          <div className="flex-1 h-1.5 bg-[#101114] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#55C89A] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-[#55C89A] font-semibold">
            {Math.round(progressPercent)}%
          </span>
        </div>
      </div>

      {/* Action Item Cards */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {meeting.actionItems.map((action) => {
          const assignee = speakerMap[action.assigneeId];

          return (
            <div
              key={action.id}
              className={`p-3.5 rounded-xl border transition-all duration-150 flex flex-col gap-2.5 ${
                action.completed
                  ? 'bg-[#101114]/60 border-[#23262D] opacity-65'
                  : 'bg-[#101114] border-[#23262D] hover:border-[#8B7CF6]/40'
              }`}
            >
              {/* Checkbox & Task text */}
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleActionItem(meeting.id, action.id)}
                  title={action.completed ? 'Mark as incomplete' : 'Mark as completed'}
                  className="mt-0.5 flex-shrink-0 text-[#6F737D] hover:text-[#8B7CF6] transition-transform active:scale-90"
                >
                  {action.completed ? (
                    <CheckSquare className="w-4.5 h-4.5 text-[#55C89A] fill-[#55C89A]/20" />
                  ) : (
                    <Square className="w-4.5 h-4.5 text-[#6F737D] hover:text-[#A7A9B0]" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-[13px] leading-relaxed ${
                      action.completed ? 'line-through text-[#6F737D]' : 'text-[#F4F3EF] font-medium'
                    }`}
                  >
                    {action.text}
                  </p>
                </div>
              </div>

              {/* Context quote */}
              {action.contextQuote && (
                <div className="ml-7 pl-2.5 border-l-2 border-[#23262D] text-xs text-[#A7A9B0] italic leading-snug flex items-center gap-1.5">
                  <Quote className="w-3 h-3 text-[#6F737D] flex-shrink-0" />
                  <span className="line-clamp-1">"{action.contextQuote}"</span>
                </div>
              )}

              {/* Meta tags & Jump to quote button */}
              <div className="ml-7 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#23262D]/60">
                {/* Assignee & Category */}
                <div className="flex items-center gap-2">
                  {assignee && (
                    <div className="flex items-center gap-1.5 text-xs text-[#F4F3EF] bg-[#17191D] px-2 py-0.5 rounded-full border border-[#23262D]">
                      <img
                        src={assignee.avatarUrl}
                        alt={assignee.name}
                        className="w-3.5 h-3.5 rounded-full object-cover"
                      />
                      <span className="truncate max-w-[110px] font-medium text-[11px]">
                        {assignee.name}
                      </span>
                    </div>
                  )}

                  {action.category && (
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full border font-medium ${getCategoryColor(
                        action.category
                      )}`}
                    >
                      {action.category}
                    </span>
                  )}

                  <span className="text-[10px] font-mono text-[#6F737D]">
                    {Math.round(action.confidence * 100)}% conf
                  </span>
                </div>

                {/* Jump to Quote button */}
                <button
                  onClick={() => {
                    seek(action.timestamp);
                    play();
                  }}
                  title={`Seek to ${formatTime(action.timestamp)}`}
                  className="flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-0.5 rounded-md bg-[#17191D] hover:bg-[#8B7CF6]/15 hover:text-[#8B7CF6] text-[#A7A9B0] border border-[#23262D] hover:border-[#8B7CF6]/35 transition-colors ml-auto"
                >
                  <Play className="w-2.5 h-2.5 fill-current" />
                  <span>Jump to quote [{formatTime(action.timestamp)}]</span>
                </button>
              </div>
            </div>
          );
        })}

        {meeting.actionItems.length === 0 && (
          <div className="py-16 text-center text-xs text-[#6F737D]">
            No action items recorded for this meeting.
          </div>
        )}
      </div>
    </div>
  );
};

