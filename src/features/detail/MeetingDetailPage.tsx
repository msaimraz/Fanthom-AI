import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  Sparkles,
  CheckSquare,
  Scissors,
  Clock,
  ArrowLeft,
  Calendar,
} from 'lucide-react';
import { useMeetingsStore } from '../../store/useMeetingsStore';
import { usePlaybackStore } from '../../store/usePlaybackStore';
import { MediaPlayer } from '../player/MediaPlayer';
import { TranscriptView } from '../transcript/TranscriptView';
import { SummaryView } from '../summary/SummaryView';
import { ActionItemsView } from '../actions/ActionItemsView';
import { ClipsView } from '../clips/ClipsView';
import { CreateClipModal } from '../clips/CreateClipModal';
import { ShareClipModal } from '../clips/ShareClipModal';
import { Clip } from '../../types';
import { formatDate, formatDuration } from '../../utils/formatters';

export const MeetingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { getMeetingById, setActiveMeetingId } = useMeetingsStore();
  const { seek, play, resetPlayback } = usePlaybackStore();

  const meeting = id ? getMeetingById(id) : undefined;
  const [activeTab, setActiveTab] = useState<'transcript' | 'summary' | 'actions' | 'clips'>(
    (searchParams.get('tab') as any) || 'transcript'
  );

  const [isCreateClipOpen, setIsCreateClipOpen] = useState(false);
  const [selectedShareClip, setSelectedShareClip] = useState<Clip | null>(null);

  useEffect(() => {
    if (id) {
      setActiveMeetingId(id);
      resetPlayback();

      const timeParam = searchParams.get('t');
      if (timeParam) {
        const parsedTime = parseFloat(timeParam);
        if (!isNaN(parsedTime)) {
          setTimeout(() => {
            seek(parsedTime);
            play();
          }, 300);
        }
      }
    }
  }, [id, searchParams, setActiveMeetingId, resetPlayback, seek, play]);

  if (!meeting) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-lg font-bold text-zinc-100 mb-2">Meeting Not Found</h2>
        <p className="text-xs text-zinc-400 mb-6">
          The requested recording does not exist or has been removed.
        </p>
        <button
          onClick={() => navigate('/meetings')}
          className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-semibold rounded-lg transition-colors"
        >
          Return to Library
        </button>
      </div>
    );
  }

  const pendingActions = meeting.actionItems.filter((a) => !a.completed).length;

  return (
    <div className="h-[calc(100vh-3.25rem)] flex flex-col overflow-hidden bg-[#0a0b0d]">
      {/* Meeting Header Bar */}
      <div className="px-5 py-3 border-b border-[#161822] bg-[#0c0d12]/90 backdrop-blur-md flex-shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/meetings')}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-[#151722] rounded-lg transition-colors border border-transparent hover:border-[#222534]"
            title="Back to meetings library"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-sm md:text-base font-bold text-white tracking-tight">
                {meeting.title}
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#131520] text-cyan-300 border border-cyan-500/25 font-mono font-semibold">
                {meeting.category.toUpperCase()}
              </span>
            </div>

            {/* Sub-metadata */}
            <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-1">
              <span className="flex items-center gap-1.5 font-mono text-zinc-400">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                {formatDate(meeting.date)}
              </span>
              <span className="flex items-center gap-1.5 font-mono text-zinc-400">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                {formatDuration(meeting.durationSeconds)}
              </span>
              <span className="hidden sm:inline text-zinc-700">•</span>
              <div className="hidden sm:flex items-center gap-2">
                <div className="flex -space-x-2">
                  {meeting.participants.map((p) => (
                    <img
                      key={p.id}
                      src={p.avatarUrl}
                      alt={p.name}
                      title={`${p.name} (${p.company})`}
                      className="w-4.5 h-4.5 rounded-full border-2 border-[#0c0d12] object-cover"
                    />
                  ))}
                </div>
                <span className="text-zinc-400 font-medium">
                  {meeting.participants.map((p) => p.name.split(' ')[0]).join(', ')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Tab Switcher */}
        <div className="flex items-center gap-1 bg-[#121318] p-0.5 rounded-lg border border-[#1e202a] overflow-x-auto">
          <button
            onClick={() => setActiveTab('transcript')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              activeTab === 'transcript'
                ? 'bg-cyan-400 text-black font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#181a24]'
            }`}
          >
            <FileText className="w-3 h-3" />
            <span>Transcript</span>
            <span className="text-[10px] font-mono px-1 rounded bg-black/30">
              {meeting.transcript.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('summary')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              activeTab === 'summary'
                ? 'bg-cyan-400 text-black font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#181a24]'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Summary</span>
          </button>

          <button
            onClick={() => setActiveTab('actions')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              activeTab === 'actions'
                ? 'bg-cyan-400 text-black font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#181a24]'
            }`}
          >
            <CheckSquare className="w-3 h-3" />
            <span>Tasks</span>
            {pendingActions > 0 && (
              <span className="text-[10px] font-mono px-1 rounded bg-cyan-500/20 text-cyan-300 font-semibold">
                {pendingActions}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('clips')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              activeTab === 'clips'
                ? 'bg-cyan-400 text-black font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#181a24]'
            }`}
          >
            <Scissors className="w-3 h-3" />
            <span>Clips</span>
            <span className="text-[10px] font-mono px-1 rounded bg-black/30">
              {meeting.clips.length}
            </span>
          </button>
        </div>
      </div>

      {/* Main Split Body */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4">
        {/* Left Column: Media Player (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col justify-start overflow-y-auto">
          <MediaPlayer meeting={meeting} />
        </div>

        {/* Right Column: Tab View (7 cols on lg) */}
        <div className="lg:col-span-7 h-full min-h-0 flex flex-col">
          {activeTab === 'transcript' && <TranscriptView meeting={meeting} />}
          {activeTab === 'summary' && <SummaryView meeting={meeting} />}
          {activeTab === 'actions' && <ActionItemsView meeting={meeting} />}
          {activeTab === 'clips' && (
            <ClipsView
              meeting={meeting}
              onOpenCreateClip={() => setIsCreateClipOpen(true)}
              onOpenShareClip={(clip) => setSelectedShareClip(clip)}
            />
          )}
        </div>
      </div>

      {/* Clip Modals */}
      <CreateClipModal
        meeting={meeting}
        isOpen={isCreateClipOpen}
        onClose={() => setIsCreateClipOpen(false)}
      />

      <ShareClipModal
        clip={selectedShareClip}
        isOpen={selectedShareClip !== null}
        onClose={() => setSelectedShareClip(null)}
      />
    </div>
  );
};
