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
        return 'bg-blue-500/10 text-blue-300 border-blue-500/20';
      case 'Contract':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
      case 'Product':
        return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20';
      default:
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#111217] border border-[#1d1f28] rounded-xl overflow-hidden">
      {/* Header with progress */}
      <div className="p-3 border-b border-[#181a24] bg-[#0e0f15] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-zinc-200">Action Items</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#161822] text-zinc-400 border border-[#202330]">
            {completedCount}/{totalCount}
          </span>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2.5 w-32">
          <div className="flex-1 h-1.5 bg-[#1a1c26] rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-cyan-400 transition-all duration-300 shadow-[0_0_6px_#00d2ee]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-cyan-300 font-semibold">
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
              className={`p-3.5 rounded-xl border transition-all duration-150 flex flex-col gap-2.5 shadow-sm ${
                action.completed
                  ? 'bg-[#0d0e14]/60 border-[#181a24] opacity-65'
                  : 'bg-[#10121a] border-[#1e212e] hover:border-cyan-500/30'
              }`}
            >
              {/* Checkbox & Task text */}
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleActionItem(meeting.id, action.id)}
                  title={action.completed ? 'Mark as incomplete' : 'Mark as completed'}
                  className="mt-0.5 flex-shrink-0 text-zinc-500 hover:text-cyan-400 transition-transform active:scale-90"
                >
                  {action.completed ? (
                    <CheckSquare className="w-4.5 h-4.5 text-cyan-400 fill-cyan-950/40" />
                  ) : (
                    <Square className="w-4.5 h-4.5 text-zinc-600 hover:text-zinc-400" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-[13px] leading-relaxed ${
                      action.completed ? 'line-through text-zinc-500' : 'text-zinc-100 font-medium'
                    }`}
                  >
                    {action.text}
                  </p>
                </div>
              </div>

              {/* Context quote */}
              {action.contextQuote && (
                <div className="ml-7 pl-2.5 border-l-2 border-[#222638] text-xs text-zinc-400 italic leading-snug flex items-center gap-1.5">
                  <Quote className="w-3 h-3 text-zinc-600 flex-shrink-0" />
                  <span className="line-clamp-1">"{action.contextQuote}"</span>
                </div>
              )}

              {/* Meta tags & Jump to quote button */}
              <div className="ml-7 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#181a25]">
                {/* Assignee & Category */}
                <div className="flex items-center gap-2">
                  {assignee && (
                    <div className="flex items-center gap-1.5 text-xs text-zinc-300 bg-[#151722] px-2 py-0.5 rounded-full border border-[#202434]">
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

                  <span className="text-[10px] font-mono text-zinc-500">
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
                  className="flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#161824] hover:bg-cyan-500/20 hover:text-cyan-300 text-zinc-400 border border-[#242838] hover:border-cyan-500/30 transition-colors ml-auto shadow-sm"
                >
                  <Play className="w-2.5 h-2.5 fill-current" />
                  <span>Jump to quote [{formatTime(action.timestamp)}]</span>
                </button>
              </div>
            </div>
          );
        })}

        {meeting.actionItems.length === 0 && (
          <div className="py-16 text-center text-xs text-zinc-500">
            No action items recorded for this meeting.
          </div>
        )}
      </div>
    </div>
  );
};

