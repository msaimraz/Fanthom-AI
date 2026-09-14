import React, { useState, useMemo } from 'react';
import { Scissors, Play, X, Clock, Check } from 'lucide-react';
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

  if (!isOpen) return null;

  const handleSave = () => {
    const randomSlug = Math.random().toString(36).substring(2, 9);
    const newClip: Clip = {
      id: `clip-${Date.now()}`,
      meetingId: meeting.id,
      title: title.trim() || 'Meeting Highlight',
      startTime,
      endTime,
      speakerIds: matchingSpeakers,
      quote: matchingQuotes.slice(0, 200) + (matchingQuotes.length > 200 ? '...' : ''),
      shareId: `fathom-${randomSlug}`,
      createdAt: new Date().toISOString(),
    };

    addClip(meeting.id, newClip);
    onClose();
  };

  const handlePreview = () => {
    seek(startTime);
    play();
  };

  const durationSecs = Math.max(1, Math.round(endTime - startTime));

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-lg bg-[#111217] border border-[#222532] rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-3.5 border-b border-[#1c1e27] flex items-center justify-between bg-[#14161f]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Scissors className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Create Clip</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3.5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Clip Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Latency discussion & contract commitments"
              className="w-full bg-[#0a0b0e] border border-[#222532] rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500/60 transition-colors"
            />
          </div>

          {/* Time Trim Sliders */}
          <div className="bg-[#0e0f14] p-3 rounded-lg border border-[#1e202b] space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Trim Range
              </span>
              <span className="font-mono text-cyan-300">
                {formatTime(startTime)} → {formatTime(endTime)} ({durationSecs}s)
              </span>
            </div>

            {/* Start slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-zinc-500">
                <span>Start Point</span>
                <span className="font-mono text-zinc-300">{formatTime(startTime)}</span>
              </div>
              <input
                type="range"
                min="0"
                max={Math.max(0, endTime - 2)}
                step="0.5"
                value={startTime}
                onChange={(e) => setStartTime(parseFloat(e.target.value))}
                className="w-full h-1 bg-[#1e202b] accent-cyan-400 rounded-lg cursor-pointer"
              />
            </div>

            {/* End slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-zinc-500">
                <span>End Point</span>
                <span className="font-mono text-zinc-300">{formatTime(endTime)}</span>
              </div>
              <input
                type="range"
                min={startTime + 2}
                max={meeting.durationSeconds}
                step="0.5"
                value={endTime}
                onChange={(e) => setEndTime(parseFloat(e.target.value))}
                className="w-full h-1 bg-[#1e202b] accent-cyan-400 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Transcript Quote Preview */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
              Selected Dialogue
            </label>
            <div className="p-2.5 bg-[#0a0b0e] border border-[#1e202b] rounded-lg text-xs text-zinc-300 italic max-h-20 overflow-y-auto leading-relaxed">
              {matchingQuotes ? `"${matchingQuotes}"` : 'No dialogue within selected range.'}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-3.5 border-t border-[#1c1e27] bg-[#14161f] flex items-center justify-between">
          <button
            onClick={handlePreview}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1c1e28] hover:bg-[#252834] text-xs font-medium text-zinc-300 transition-colors"
          >
            <Play className="w-3 h-3" />
            <span>Test Playback</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-semibold transition-all shadow-sm shadow-cyan-500/20"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Clip</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
