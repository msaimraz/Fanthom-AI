import React from 'react';
import {
  Scissors,
  Play,
  Share2,
  Trash2,
  Clock,
  Quote,
  Plus,
  Bookmark,
} from 'lucide-react';
import { Meeting, Clip } from '../../types';
import { useMeetingsStore } from '../../store/useMeetingsStore';
import { usePlaybackStore } from '../../store/usePlaybackStore';
import { formatTime } from '../../utils/formatters';

interface ClipsViewProps {
  meeting: Meeting;
  onOpenCreateClip: () => void;
  onOpenShareClip: (clip: Clip) => void;
}

export const ClipsView: React.FC<ClipsViewProps> = ({
  meeting,
  onOpenCreateClip,
  onOpenShareClip,
}) => {
  const { deleteClip } = useMeetingsStore();
  const { seek, play } = usePlaybackStore();

  const speakerMap = meeting.participants.reduce((acc, p) => {
    acc[p.id] = p;
    return acc;
  }, {} as Record<string, (typeof meeting.participants)[0]>);

  return (
    <div className="flex flex-col h-full bg-[#111217] border border-[#1d1f28] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-[#181a24] bg-[#0e0f15] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Scissors className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-zinc-200">Clips & Highlights</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#161822] text-zinc-400 border border-[#202330]">
            {meeting.clips.length} clips
          </span>
        </div>

        <button
          onClick={onOpenCreateClip}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-cyan-400 hover:bg-cyan-300 text-black rounded-lg transition-all shadow-sm shadow-cyan-500/20 active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Clip</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Pinned Highlights Section */}
        {meeting.highlights && meeting.highlights.length > 0 && (
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono mb-2 flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
              Key Moments & Markers
            </span>
            <div className="space-y-1.5">
              {meeting.highlights.map((hl) => (
                <div
                  key={hl.id}
                  onClick={() => {
                    seek(hl.startTime);
                    play();
                  }}
                  className="p-2 rounded-lg bg-[#13141b] hover:bg-[#181a26] border border-[#1e212d] hover:border-cyan-500/30 cursor-pointer flex items-center justify-between group transition-all shadow-sm"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0 shadow-[0_0_6px_#00d2ee]" />
                    <span className="text-xs font-semibold text-zinc-200 group-hover:text-cyan-300 truncate">
                      {hl.title}
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#161824] text-zinc-400 font-mono border border-[#222638]">
                      {hl.category}
                    </span>
                  </div>

                  <span className="flex items-center gap-1 text-[10px] font-mono text-zinc-400 group-hover:text-cyan-300">
                    <Play className="w-2.5 h-2.5 fill-current" />
                    {formatTime(hl.startTime)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Saved Clips Section */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono mb-2.5 flex items-center gap-1.5">
            <Scissors className="w-3.5 h-3.5 text-cyan-400" />
            Saved Clips ({meeting.clips.length})
          </span>

          <div className="space-y-3">
            {meeting.clips.map((clip) => {
              const durationSecs = Math.round(clip.endTime - clip.startTime);

              return (
                <div
                  key={clip.id}
                  className="p-3.5 rounded-xl bg-[#10121a] border border-[#1e212e] hover:border-[#2b2f42] shadow-sm flex flex-col gap-2.5 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-semibold text-zinc-100 line-clamp-1">
                        {clip.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono mt-1">
                        <span className="flex items-center gap-1 text-cyan-300 bg-[#151824] px-1.5 py-0.5 rounded border border-cyan-500/20">
                          <Clock className="w-3 h-3 text-cyan-400" />
                          {formatTime(clip.startTime)} – {formatTime(clip.endTime)}
                        </span>
                        <span>•</span>
                        <span className="text-zinc-500">{durationSecs}s duration</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          seek(clip.startTime);
                          play();
                        }}
                        title="Play clip"
                        className="p-1.5 rounded-lg bg-[#161824] hover:bg-cyan-400 hover:text-black text-zinc-300 transition-colors border border-[#222638]"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>

                      <button
                        onClick={() => onOpenShareClip(clip)}
                        title="Share clip"
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-cyan-400 hover:bg-cyan-300 text-black rounded-lg transition-all shadow-sm shadow-cyan-500/20"
                      >
                        <Share2 className="w-3 h-3" />
                        <span>Share</span>
                      </button>

                      <button
                        onClick={() => deleteClip(meeting.id, clip.id)}
                        title="Delete clip"
                        className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-[#1a1c28] rounded-lg transition-colors ml-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Quote preview */}
                  {clip.quote && (
                    <div className="p-2.5 rounded-lg bg-[#0a0b0e] border border-[#1b1e2a] text-xs text-zinc-300 italic flex items-start gap-2 shadow-inner">
                      <Quote className="w-3 h-3 text-zinc-600 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2 leading-relaxed">"{clip.quote}"</span>
                    </div>
                  )}

                  {/* Speaker chips */}
                  <div className="flex items-center gap-2 pt-1.5 border-t border-[#181a24]">
                    <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
                      Speakers:
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {clip.speakerIds.map((sid) => {
                        const speaker = speakerMap[sid];
                        return (
                          <span
                            key={sid}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-[#161824] text-zinc-300 border border-[#202434] font-medium"
                          >
                            {speaker?.name || sid}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}

            {meeting.clips.length === 0 && (
              <div className="py-16 text-center text-xs text-zinc-500">
                No clips created yet. Click "New Clip" to create a highlight moment.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

