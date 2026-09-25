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
  Loader2,
  AlertCircle,
  RotateCcw,
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

  const {
    getMeetingById,
    setActiveMeetingId,
    isLoading,
    error,
    mutationError,
    clearMutationError,
    loadWorkspaceData,
  } = useMeetingsStore();
  const { seek, play, resetPlayback } = usePlaybackStore();

  const meeting = id ? getMeetingById(id) : undefined;
  const hasMeeting = Boolean(meeting);
  const [activeTab, setActiveTab] = useState<'transcript' | 'summary' | 'actions' | 'clips'>(
    (searchParams.get('tab') as any) || 'transcript'
  );

  const [isCreateClipOpen, setIsCreateClipOpen] = useState(false);
  const [selectedShareClip, setSelectedShareClip] = useState<Clip | null>(null);

  useEffect(() => {
    const tabParam = searchParams.get('tab') as any;
    if (tabParam && ['transcript', 'summary', 'actions', 'clips'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (id) {
      setActiveMeetingId(id);
      resetPlayback();
    }
  }, [id, setActiveMeetingId, resetPlayback]);

  useEffect(() => {
    if (id && hasMeeting) {
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
  }, [id, hasMeeting, searchParams, seek, play]);

  if (isLoading && !meeting) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-7 h-7 text-[#8B7CF6] animate-spin" />
        <h2 className="text-sm font-semibold text-[#F4F3EF]">Loading meeting insights...</h2>
        <p className="text-xs text-[#A7A9B0]">
          Loading transcript, AI summary, and follow-up items from workspace database...
        </p>
      </div>
    );
  }

  if (error && !meeting) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center flex flex-col items-center justify-center gap-3">
        <AlertCircle className="w-8 h-8 text-rose-400" />
        <h2 className="text-base font-bold text-[#F4F3EF]">Unable to load this meeting.</h2>
        <p className="text-xs text-[#A7A9B0] max-w-md">
          There was a problem retrieving this meeting from the database.
        </p>
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => loadWorkspaceData()}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#8B7CF6] hover:bg-[#9D91FF] text-white text-xs font-semibold rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
          <button
            onClick={() => navigate('/meetings')}
            className="px-4 py-2 bg-[#17191D] hover:bg-[#1D2025] text-[#F4F3EF] border border-[#23262D] text-xs font-medium rounded-lg transition-colors"
          >
            Return to Library
          </button>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-lg font-bold text-[#F4F3EF] mb-2">Meeting Not Found</h2>
        <p className="text-xs text-[#A7A9B0] mb-6">
          The requested recording does not exist or has been removed.
        </p>
        <button
          onClick={() => navigate('/meetings')}
          className="px-4 py-2 bg-[#8B7CF6] hover:bg-[#9D91FF] text-white text-xs font-semibold rounded-lg transition-colors"
        >
          Return to Library
        </button>
      </div>
    );
  }

  const pendingActions = meeting.actionItems.filter((a) => !a.completed).length;

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col overflow-hidden bg-[#101114]">
      {mutationError && (
        <div className="px-5 py-2 bg-rose-500/10 border-b border-rose-500/30 flex items-center justify-between text-xs text-rose-300">
          <span>{mutationError}</span>
          <button
            onClick={clearMutationError}
            className="text-[11px] font-mono underline hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}
      {/* Meeting Header Bar */}
      <div className="px-5 py-3 border-b border-[#23262D] bg-[#17191D]/95 backdrop-blur-md flex-shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/meetings')}
            className="p-1.5 text-[#A7A9B0] hover:text-[#F4F3EF] hover:bg-[#1D2025] rounded-lg transition-colors border border-transparent hover:border-[#23262D]"
            title="Back to meetings library"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-sm md:text-base font-semibold text-[#F4F3EF] tracking-tight">
                {meeting.title}
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#1D2025] text-[#8B7CF6] border border-[#8B7CF6]/25 font-mono font-medium uppercase">
                {meeting.category}
              </span>
            </div>

            {/* Sub-metadata */}
            <div className="flex items-center gap-3 text-[11px] text-[#A7A9B0] mt-1">
              <span className="flex items-center gap-1.5 font-mono">
                <Calendar className="w-3.5 h-3.5 text-[#6F737D]" />
                {formatDate(meeting.date)}
              </span>
              <span className="flex items-center gap-1.5 font-mono">
                <Clock className="w-3.5 h-3.5 text-[#6F737D]" />
                {formatDuration(meeting.durationSeconds)}
              </span>
              <span className="hidden sm:inline text-[#6F737D]">•</span>
              <div className="hidden sm:flex items-center gap-2">
                <div className="flex -space-x-2">
                  {meeting.participants.map((p) => (
                    <img
                      key={p.id}
                      src={p.avatarUrl}
                      alt={p.name}
                      title={`${p.name} (${p.company})`}
                      className="w-4.5 h-4.5 rounded-full border-2 border-[#17191D] object-cover"
                    />
                  ))}
                </div>
                <span className="text-[#A7A9B0] font-medium">
                  {meeting.participants.map((p) => p.name.split(' ')[0]).join(', ')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Tab Switcher */}
        <div className="flex items-center gap-1 bg-[#101114] p-1 rounded-lg border border-[#23262D] overflow-x-auto">
          <button
            onClick={() => setActiveTab('transcript')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
              activeTab === 'transcript'
                ? 'bg-[#8B7CF6] text-white font-semibold shadow-sm'
                : 'text-[#A7A9B0] hover:text-[#F4F3EF] hover:bg-[#1D2025]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Transcript</span>
            <span className="text-[10px] font-mono px-1 rounded bg-black/25">
              {meeting.transcript.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('summary')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
              activeTab === 'summary'
                ? 'bg-[#8B7CF6] text-white font-semibold shadow-sm'
                : 'text-[#A7A9B0] hover:text-[#F4F3EF] hover:bg-[#1D2025]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Summary</span>
          </button>

          <button
            onClick={() => setActiveTab('actions')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
              activeTab === 'actions'
                ? 'bg-[#8B7CF6] text-white font-semibold shadow-sm'
                : 'text-[#A7A9B0] hover:text-[#F4F3EF] hover:bg-[#1D2025]'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Tasks</span>
            {pendingActions > 0 && (
              <span className="text-[10px] font-mono px-1 rounded bg-black/25 font-semibold">
                {pendingActions}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('clips')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
              activeTab === 'clips'
                ? 'bg-[#8B7CF6] text-white font-semibold shadow-sm'
                : 'text-[#A7A9B0] hover:text-[#F4F3EF] hover:bg-[#1D2025]'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Clips</span>
            <span className="text-[10px] font-mono px-1 rounded bg-black/25">
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
