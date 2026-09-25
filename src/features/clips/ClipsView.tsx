import React, { useState } from 'react';
import {
  Scissors,
  Play,
  Share2,
  Trash2,
  Clock,
  Quote,
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
    setHlStartTime(Math.floor(currentTime || 15));
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
    <div className="flex flex-col h-full bg-[#17191D] border border-[#23262D] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-3.5 border-b border-[#23262D] bg-[#17191D] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Scissors className="w-4 h-4 text-[#8B7CF6]" />
          <span className="text-xs font-semibold text-[#F4F3EF]">Highlights & Saved Clips</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#101114] text-[#A7A9B0] border border-[#23262D]">
            {meeting.clips.length} clips
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAddHighlight}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-[#101114] hover:bg-[#1D2025] text-[#E7B45C] border border-[#E7B45C]/30 rounded-lg transition-all active:scale-95"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Add Highlight</span>
          </button>

          <button
            onClick={onOpenCreateClip}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#8B7CF6] hover:bg-[#9D91FF] text-white rounded-lg transition-all shadow-sm shadow-[#8B7CF6]/20 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Clip</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Inline Add Highlight Form */}
        {isAddingHighlight && (
          <form
            onSubmit={handleSaveHighlight}
            className="p-3.5 rounded-xl bg-[#101114] border border-[#E7B45C]/40 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#F4F3EF] flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-[#E7B45C]" />
                Create Moment Highlight
              </span>
              <button
                type="button"
                onClick={() => setIsAddingHighlight(false)}
                className="text-[#6F737D] hover:text-[#F4F3EF]"
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
                className="sm:col-span-2 bg-[#17191D] border border-[#23262D] rounded-lg px-3 py-1.5 text-xs text-[#F4F3EF] placeholder-[#6F737D] focus:outline-none focus:border-[#8B7CF6]"
              />
              <select
                value={hlCategory}
                onChange={(e) => setHlCategory(e.target.value as Highlight['category'])}
                className="bg-[#17191D] border border-[#23262D] rounded-lg px-2.5 py-1.5 text-xs text-[#F4F3EF] focus:outline-none focus:border-[#8B7CF6]"
              >
                <option value="Key Decision">Key Decision</option>
                <option value="Product Request">Product Request</option>
                <option value="Pricing">Pricing</option>
                <option value="Objection">Objection</option>
                <option value="Action">Action</option>
              </select>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2 text-[11px] text-[#A7A9B0] font-mono">
                <span>Timestamp (s):</span>
                <input
                  type="number"
                  min={0}
                  max={Math.floor(meeting.durationSeconds)}
                  step="1"
                  value={hlStartTime}
                  onChange={(e) => setHlStartTime(Number(e.target.value) || 0)}
                  className="w-16 bg-[#17191D] border border-[#23262D] rounded px-2 py-0.5 text-xs text-[#F4F3EF]"
                />
                <span className="text-[#E7B45C]">({formatTime(hlStartTime)})</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingHighlight(false)}
                  className="px-2.5 py-1 text-xs text-[#A7A9B0] hover:text-[#F4F3EF]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingHighlight}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[#8B7CF6] hover:bg-[#9D91FF] text-white text-xs font-semibold transition-all disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSavingHighlight ? 'Saving...' : 'Save Highlight'}</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Pinned Highlights Section */}
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6F737D] font-mono mb-2 flex items-center gap-1.5">
            <Bookmark className="w-3.5 h-3.5 text-[#E7B45C]" />
            Key Moments & Markers ({meeting.highlights?.length || 0})
          </span>
          {meeting.highlights && meeting.highlights.length > 0 ? (
            <div className="space-y-1.5">
              {meeting.highlights.map((hl) => (
                <div
                  key={hl.id}
                  onClick={() => {
                    seek(hl.startTime);
                    play();
                  }}
                  className="p-2 rounded-lg bg-[#13141b] bg-[#101114] hover:bg-[#1D2025] border border-[#23262D] hover:border-[#8B7CF6]/35 cursor-pointer flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-[#E7B45C] flex-shrink-0" />
                    <span className="text-xs font-semibold text-[#F4F3EF] group-hover:text-[#8B7CF6] truncate">
                      {hl.title}
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#17191D] text-[#A7A9B0] font-mono border border-[#23262D]">
                      {hl.category}
                    </span>
                  </div>

                  <span className="flex items-center gap-1 text-[10px] font-mono text-[#A7A9B0] group-hover:text-[#8B7CF6]">
                    <Play className="w-2.5 h-2.5 fill-current" />
                    {formatTime(hl.startTime)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-[#6F737D] bg-[#101114] border border-[#23262D] rounded-lg">
              No highlights recorded yet. Click "Add Highlight" to mark a key moment.
            </div>
          )}
        </div>

        {/* Saved Clips Section */}
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6F737D] font-mono mb-2.5 flex items-center gap-1.5">
            <Scissors className="w-3.5 h-3.5 text-[#8B7CF6]" />
            Saved Clips ({meeting.clips.length})
          </span>

          <div className="space-y-3">
            {meeting.clips.map((clip) => {
              const durationSecs = Math.round(clip.endTime - clip.startTime);

              return (
                <div
                  key={clip.id}
                  className="p-3.5 rounded-xl bg-[#101114] border border-[#23262D] hover:border-[#2C3039] flex flex-col gap-2.5 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-semibold text-[#F4F3EF] line-clamp-1">
                        {clip.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-[#A7A9B0] font-mono mt-1">
                        <span className="flex items-center gap-1 text-[#8B7CF6] bg-[#17191D] px-1.5 py-0.5 rounded border border-[#8B7CF6]/25">
                          <Clock className="w-3 h-3 text-[#8B7CF6]" />
                          {formatTime(clip.startTime)} – {formatTime(clip.endTime)}
                        </span>
                        <span>•</span>
                        <span className="text-[#6F737D]">{durationSecs}s duration</span>
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
                        className="p-1.5 rounded-lg bg-[#17191D] hover:bg-[#8B7CF6] hover:text-white text-[#A7A9B0] transition-colors border border-[#23262D]"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>

                      <button
                        onClick={() => onOpenShareClip(clip)}
                        title="Share clip"
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-[#8B7CF6] hover:bg-[#9D91FF] text-white rounded-lg transition-all shadow-sm shadow-[#8B7CF6]/20"
                      >
                        <Share2 className="w-3 h-3" />
                        <span>Share</span>
                      </button>

                      {!SEEDED_CLIP_KEYS.has(clip.id) && (
                        <button
                          onClick={() => deleteClip(meeting.id, clip.id)}
                          title="Delete clip"
                          className="p-1.5 text-[#6F737D] hover:text-rose-400 hover:bg-[#17191D] rounded-lg transition-colors ml-0.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Quote preview */}
                  {clip.quote && (
                    <div className="p-2.5 rounded-lg bg-[#17191D] border border-[#23262D] text-xs text-[#A7A9B0] italic flex items-start gap-2">
                      <Quote className="w-3 h-3 text-[#6F737D] flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2 leading-relaxed">"{clip.quote}"</span>
                    </div>
                  )}

                  {/* Speaker chips */}
                  <div className="flex items-center gap-2 pt-1.5 border-t border-[#23262D]/60">
                    <span className="text-[10px] text-[#6F737D] font-mono uppercase tracking-wider">
                      Speakers:
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {clip.speakerIds.map((sid) => {
                        const speaker = speakerMap[sid];
                        return (
                          <span
                            key={sid}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-[#17191D] text-[#A7A9B0] border border-[#23262D] font-medium"
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
              <div className="py-16 text-center text-xs text-[#6F737D]">
                No clips created yet. Click "New Clip" to create a highlight moment.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

