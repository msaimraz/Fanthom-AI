import React, { useState, useMemo } from 'react';
import { Play, X, Check } from 'lucide-react';
import { Meeting, Clip } from '../../types';
import { useMeetingsStore } from '../../store/useMeetingsStore';
import { usePlaybackStore } from '../../store/usePlaybackStore';
import { formatTime } from '../../utils/formatters';

interface CreateClipModalProps {
  meeting: Meeting;
  isOpen: boolean;
  onClose: () => void;
}

export const CreateClipModal: React.FC<CreateClipModalProps> = ({
  meeting,
  isOpen,
  onClose,
}) => {
  const { addClip } = useMeetingsStore();
  const { seek, play, currentTime } = usePlaybackStore();

  const [title, setTitle] = useState('Key Meeting Moment');
  const initialStart = Math.max(0, Math.floor(currentTime - 5));
  const [startTime, setStartTime] = useState(initialStart);
  const [endTime, setEndTime] = useState(
    Math.min(initialStart + 30, meeting.durationSeconds)
  );

  const matchingQuotes = useMemo(() => {
    return meeting.transcript
      .filter((t) => t.startTime < endTime && t.endTime > startTime)
      .map((t) => t.text)
      .join(' ');
  }, [meeting.transcript, startTime, endTime]);

  const matchingSpeakers = useMemo(() => {
    const sids = new Set<string>();
    meeting.transcript.forEach((t) => {
      if (t.startTime < endTime && t.endTime > startTime) {
        sids.add(t.speakerId);
      }
    });
    return Array.from(sids);
  }, [meeting.transcript, startTime, endTime]);

  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const randomSlug = Math.random().toString(36).substring(2, 9);
      const newClip: Clip = {
        id: `clip-${Date.now()}`,
        meetingId: meeting.id,
        title: title.trim() || 'Meeting Highlight',
        startTime,
        endTime,
        speakerIds: matchingSpeakers,
        quote: matchingQuotes.slice(0, 200) + (matchingQuotes.length > 200 ? '...' : ''),
        shareId: `fanthom-${randomSlug}`,
        createdAt: new Date().toISOString(),
      };

      await addClip(meeting.id, newClip);
      onClose();
    } catch {
      // mutationError is handled by store
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    seek(startTime);
    play();
  };

  const durationSecs = Math.max(1, Math.round(endTime - startTime));

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-lg bg-[#121417] border border-[#272B33] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#1E2127] flex items-center justify-between bg-[#0B0C0E]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#C7F36B]" />
            <h3 className="text-xs font-mono font-semibold text-[#F2EFE8] uppercase tracking-[0.14em]">
              Create Clip
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#969AA3] hover:text-[#F2EFE8]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-[0.12em] text-[#969AA3] mb-1.5">
              Clip Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Latency discussion & contract commitments"
              className="w-full bg-[#0B0C0E] border border-[#1E2127] px-3 py-1.5 text-xs text-[#F2EFE8] placeholder-[#5E626B] focus:outline-none focus:border-[#C7F36B] transition-colors"
            />
          </div>

          {/* Time Trim Sliders */}
          <div className="bg-[#0B0C0E] p-3 border border-[#1E2127] space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#969AA3] uppercase text-[10px]">
                Timecode Range
              </span>
              <span className="text-[#C7F36B]">
                {formatTime(startTime)} → {formatTime(endTime)} ({durationSecs}s)
              </span>
            </div>

            {/* Start slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-[#5E626B]">
                <span>IN POINT</span>
                <span className="text-[#F2EFE8]">{formatTime(startTime)}</span>
              </div>
              <input
                type="range"
                min="0"
                max={Math.max(0, endTime - 2)}
                step="0.5"
                value={startTime}
                onChange={(e) => setStartTime(parseFloat(e.target.value))}
                className="w-full h-1 bg-[#1E2127] accent-[#C7F36B] cursor-pointer"
              />
            </div>

            {/* End slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-[#5E626B]">
                <span>OUT POINT</span>
                <span className="text-[#F2EFE8]">{formatTime(endTime)}</span>
              </div>
              <input
                type="range"
                min={startTime + 2}
                max={meeting.durationSeconds}
                step="0.5"
                value={endTime}
                onChange={(e) => setEndTime(parseFloat(e.target.value))}
                className="w-full h-1 bg-[#1E2127] accent-[#C7F36B] cursor-pointer"
              />
            </div>
          </div>

          {/* Transcript Quote Preview */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-[0.12em] text-[#969AA3] mb-1.5">
              Captured Transcript Segment
            </label>
            <div className="p-2.5 bg-[#0B0C0E] border border-[#1E2127] text-xs text-[#969AA3] max-h-20 overflow-y-auto leading-relaxed">
              {matchingQuotes ? `"${matchingQuotes}"` : 'No dialogue within selected range.'}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-4 py-3 border-t border-[#1E2127] bg-[#0B0C0E] flex items-center justify-between font-mono">
          <button
            onClick={handlePreview}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#121417] hover:bg-[#191C20] border border-[#1E2127] text-xs text-[#969AA3] hover:text-[#F2EFE8] transition-colors"
          >
            <Play className="w-3 h-3" />
            <span>Preview</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1 text-xs text-[#969AA3] hover:text-[#F2EFE8] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#C7F36B] hover:bg-[#d4f788] text-[#0B0C0E] text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Clip'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

