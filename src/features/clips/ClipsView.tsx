import React, { useState } from 'react';
import {
  Play,
  Share2,
  Trash2,
  Plus,
  Bookmark,
  Check,
  X,
} from 'lucide-react';
import { Meeting, Clip, Highlight } from '../../types';
import { useMeetingsStore } from '../../store/useMeetingsStore';
import { usePlaybackStore } from '../../store/usePlaybackStore';
import { formatTime } from '../../utils/formatters';

interface ClipsViewProps {
  meeting: Meeting;
  onOpenCreateClip: () => void;
  onOpenShareClip: (clip: Clip) => void;
}

const SEEDED_CLIP_KEYS = new Set([
  'clip-hero-1',
  'clip-hero-2',
  'clip-inc-1',
  'clip-prod-1',
  'clip-1on1-1',
]);

export const ClipsView: React.FC<ClipsViewProps> = ({
  meeting,
  onOpenCreateClip,
  onOpenShareClip,
}) => {
  const { deleteClip, addHighlight } = useMeetingsStore();
  const { seek, play, currentTime } = usePlaybackStore();

  const [isAddingHighlight, setIsAddingHighlight] = useState(false);
  const [hlTitle, setHlTitle] = useState('');
  const [hlCategory, setHlCategory] = useState<Highlight['category']>('Key Decision');
  const [hlStartTime, setHlStartTime] = useState<number>(0);
  const [isSavingHighlight, setIsSavingHighlight] = useState(false);

  const speakerMap = meeting.participants.reduce((acc, p) => {
    acc[p.id] = p;
    return acc;
  }, {} as Record<string, (typeof meeting.participants)[0]>);

  const handleOpenAddHighlight = () => {
    setHlTitle('Key Customer Commitment');
    setHlCategory('Key Decision');
    setHlStartTime(Math.max(25, Math.floor(currentTime || 35)));
    setIsAddingHighlight(true);
  };

  const handleSaveHighlight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hlTitle.trim() || isSavingHighlight) return;
    setIsSavingHighlight(true);
    try {
      const start = Math.max(0, Math.min(hlStartTime, meeting.durationSeconds - 2));
      const end = Math.min(meeting.durationSeconds, start + 15);
      const newHighlight: Highlight = {
        id: `hl-${Date.now()}`,
        meetingId: meeting.id,
        title: hlTitle.trim(),
        startTime: start,
        endTime: end,
        color: 'amber',
        category: hlCategory,
      };
      await addHighlight(meeting.id, newHighlight);
      setIsAddingHighlight(false);
      setHlTitle('');
    } catch {
      // mutationError is handled by store
    } finally {
      setIsSavingHighlight(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#121417] border border-[#1E2127] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-[#1E2127] bg-[#121417] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#C7F36B]" />
          <span className="text-xs font-mono uppercase tracking-[0.12em] font-semibold text-[#F2EFE8]">
            Highlights & Clips
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#0B0C0E] text-[#969AA3] border border-[#1E2127]">
            {meeting.clips.length} clips
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAddHighlight}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono bg-[#0B0C0E] hover:bg-[#191C20] text-[#F0B449] border border-[#F0B449]/40 transition-colors"
          >
            <Bookmark className="w-3 h-3" />
            <span>Add Highlight</span>
          </button>

          <button
            onClick={onOpenCreateClip}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-semibold bg-[#C7F36B] hover:bg-[#d4f788] text-[#0B0C0E] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Clip</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Inline Add Highlight Form */}
        {isAddingHighlight && (
          <form
            onSubmit={handleSaveHighlight}
            className="p-3.5 bg-[#0B0C0E] border border-[#F0B449]/50 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider font-semibold text-[#F0B449]">
                Create Moment Highlight
              </span>
              <button
                type="button"
                onClick={() => setIsAddingHighlight(false)}
                className="text-[#969AA3] hover:text-[#F2EFE8]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <input
                type="text"
                value={hlTitle}
                onChange={(e) => setHlTitle(e.target.value)}
                placeholder="Highlight title..."
                className="sm:col-span-2 bg-[#121417] border border-[#1E2127] px-3 py-1.5 text-xs text-[#F2EFE8] placeholder-[#5E626B] focus:outline-none focus:border-[#C7F36B]"
              />
              <select
                value={hlCategory}
                onChange={(e) => setHlCategory(e.target.value as Highlight['category'])}
                className="bg-[#121417] border border-[#1E2127] px-2.5 py-1.5 text-xs text-[#F2EFE8] focus:outline-none focus:border-[#C7F36B]"
              >
                <option value="Key Decision">Key Decision</option>
                <option value="Product Request">Product Request</option>
                <option value="Pricing">Pricing</option>
                <option value="Objection">Objection</option>
                <option value="Action">Action</option>
              </select>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2 text-[11px] text-[#969AA3] font-mono">
                <span>Timestamp (s):</span>
                <input
                  type="number"
                  min={0}
                  max={Math.floor(meeting.durationSeconds)}
                  step="1"
                  value={hlStartTime}
                  onChange={(e) => setHlStartTime(Number(e.target.value) || 0)}
                  className="w-16 bg-[#121417] border border-[#1E2127] px-2 py-0.5 text-xs text-[#F2EFE8]"
                />
                <span className="text-[#F0B449]">({formatTime(hlStartTime)})</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingHighlight(false)}
                  className="px-2.5 py-1 text-xs font-mono text-[#969AA3] hover:text-[#F2EFE8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingHighlight}
                  className="flex items-center gap-1 px-3 py-1 bg-[#C7F36B] hover:bg-[#d4f788] text-[#0B0C0E] text-xs font-mono font-semibold transition-colors disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSavingHighlight ? 'Saving...' : 'Save Highlight'}</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Highlights Section */}
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#969AA3] mb-2 block">
            Highlights ({meeting.highlights?.length || 0})
          </span>
          {meeting.highlights && meeting.highlights.length > 0 ? (
            <div className="divide-y divide-[#1E2127] border border-[#1E2127]">
              {[...meeting.highlights]
                .sort((a, b) => {
                  const aSeed = a.id.startsWith('hl-hero') ? 0 : 1;
                  const bSeed = b.id.startsWith('hl-hero') ? 0 : 1;
                  if (aSeed !== bSeed) return aSeed - bSeed;
                  return a.startTime - b.startTime;
                })
                .map((hl) => {
                const dotColor =
                  hl.category === 'Objection'
                    ? 'bg-[#F26464]'
                    : hl.category === 'Action'
                    ? 'bg-[#47D18C]'
                    : hl.category === 'Product Request'
                    ? 'bg-[#5BA3F5]'
                    : 'bg-[#F0B449]';

                return (
                  <div
                    key={hl.id}
                    onClick={() => {
                      seek(hl.startTime);
                      play();
                    }}
                    className="p-2 rounded-lg bg-[#13141b] bg-[#0B0C0E] hover:bg-[#191C20] cursor-pointer flex items-center justify-between group transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-1.5 h-1.5 flex-shrink-0 ${dotColor}`} />
                      <span className="text-xs font-medium text-[#F2EFE8] group-hover:text-[#C7F36B] truncate">
                        {hl.title}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 bg-[#121417] text-[#969AA3] font-mono border border-[#1E2127] uppercase">
                        {hl.category}
                      </span>
                    </div>

                    <span className="flex items-center gap-1 text-[10px] font-mono text-[#969AA3] group-hover:text-[#C7F36B]">
                      <Play className="w-2.5 h-2.5 fill-current" />
                      {formatTime(hl.startTime)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-6 text-center text-xs font-mono text-[#969AA3] bg-[#0B0C0E] border border-[#1E2127]">
              No highlights recorded yet. Click "Add Highlight" to mark a moment.
            </div>
          )}
        </div>

        {/* Saved Clips Section */}
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#969AA3] mb-2 block">
            Saved Clips ({meeting.clips.length})
          </span>

          <div className="divide-y divide-[#1E2127] border border-[#1E2127]">
            {meeting.clips.map((clip) => {
              const durationSecs = Math.round(clip.endTime - clip.startTime);

              return (
                <div
                  key={clip.id}
                  className="p-3.5 bg-[#0B0C0E] hover:bg-[#191C20]/50 flex flex-col gap-2.5 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-semibold text-[#F2EFE8] line-clamp-1">
                        {clip.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-[#969AA3] font-mono mt-1">
                        <span className="text-[#C7F36B] bg-[#121417] px-1.5 py-0.5 border border-[#1E2127]">
                          {formatTime(clip.startTime)} – {formatTime(clip.endTime)}
                        </span>
                        <span className="text-[#5E626B]">·</span>
                        <span>{durationSecs}s</span>
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
                        className="p-1.5 bg-[#121417] hover:bg-[#C7F36B] text-[#969AA3] hover:text-[#0B0C0E] transition-colors border border-[#1E2127]"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>

                      <button
                        onClick={() => onOpenShareClip(clip)}
                        title="Share clip"
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-semibold bg-[#C7F36B] hover:bg-[#d4f788] text-[#0B0C0E] transition-colors"
                      >
                        <Share2 className="w-3 h-3" />
                        <span>Share</span>
                      </button>

                      {!SEEDED_CLIP_KEYS.has(clip.id) && (
                        <button
                          onClick={() => deleteClip(meeting.id, clip.id)}
                          title="Delete clip"
                          className="p-1.5 text-[#969AA3] hover:text-[#F26464] hover:bg-[#121417] border border-transparent hover:border-[#1E2127] transition-colors ml-0.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {clip.quote && (
                    <div className="pl-2.5 border-l border-[#272B33] text-xs text-[#969AA3] leading-relaxed">
                      <span className="line-clamp-2">"{clip.quote}"</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1 font-mono text-[10px]">
                    <span className="text-[#5E626B] uppercase">Speakers:</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {clip.speakerIds.map((sid) => {
                        const speaker = speakerMap[sid];
                        return (
                          <span
                            key={sid}
                            className="px-1.5 py-0.5 bg-[#121417] text-[#F2EFE8] border border-[#1E2127]"
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
              <div className="py-16 text-center text-xs font-mono text-[#969AA3]">
                No clips saved yet. Click "New Clip" to extract a segment.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
