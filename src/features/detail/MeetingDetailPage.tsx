import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
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
import { ConversationMap } from './ConversationMap';
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
        <Loader2 className="w-6 h-6 text-[#C7F36B] animate-spin" />
        <h2 className="text-sm font-mono uppercase tracking-wider text-[#F2EFE8]">
          Loading conversation workspace...
        </h2>
        <p className="text-xs text-[#969AA3]">
          Retrieving transcript, conversation map, decisions, and follow-ups from database.
        </p>
      </div>
    );
  }

  if (error && !meeting) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center flex flex-col items-center justify-center gap-3">
        <AlertCircle className="w-7 h-7 text-[#F26464]" />
        <h2 className="text-base font-semibold text-[#F2EFE8]">
          Unable to load this conversation.
        </h2>
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => loadWorkspaceData()}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#C7F36B] text-[#0B0C0E] text-xs font-mono font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
          <button
            onClick={() => navigate('/meetings')}
            className="px-4 py-1.5 bg-[#121417] text-[#F2EFE8] border border-[#1E2127] text-xs font-mono"
          >
            Return to Timeline
          </button>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-lg font-semibold text-[#F2EFE8] mb-2">Conversation Not Found</h2>
        <p className="text-xs text-[#969AA3] mb-6">
          The requested conversation record does not exist in this workspace.
        </p>
        <button
          onClick={() => navigate('/meetings')}
          className="px-4 py-1.5 bg-[#C7F36B] text-[#0B0C0E] text-xs font-mono font-semibold"
        >
          Return to Timeline
        </button>
      </div>
    );
  }

  const pendingActions = meeting.actionItems.filter((a) => !a.completed).length;

  return (
    <div className="h-[calc(100vh-3rem)] flex flex-col overflow-hidden bg-[#0B0C0E]">
      {mutationError && (
        <div className="px-5 py-2 bg-[#F26464]/10 border-b border-[#F26464]/40 flex items-center justify-between text-xs text-[#F26464] font-mono">
          <span>{mutationError}</span>
          <button
            onClick={clearMutationError}
            className="text-[11px] underline hover:text-[#F2EFE8]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Architectural Meeting Header Bar */}
      <div className="px-5 py-2.5 border-b border-[#1E2127] bg-[#121417] flex-shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate('/meetings')}
            className="p-1.5 text-[#969AA3] hover:text-[#F2EFE8] hover:bg-[#191C20] border border-[#1E2127] transition-colors flex-shrink-0"
            title="Back to conversation timeline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-sm md:text-base font-semibold text-[#F2EFE8] tracking-tight truncate">
                {meeting.title}
              </h1>
              <span className="text-[10px] px-1.5 py-0.5 bg-[#0B0C0E] text-[#C7F36B] border border-[#C7F36B]/40 font-mono uppercase">
                {meeting.category}
              </span>
            </div>

            {/* Tabular Sub-metadata */}
            <div className="flex items-center gap-3 text-[11px] text-[#969AA3] font-mono mt-0.5">
              <span>{formatDate(meeting.date)}</span>
              <span className="text-[#5E626B]">·</span>
              <span>{formatDuration(meeting.durationSeconds)}</span>
              <span className="hidden sm:inline text-[#5E626B]">·</span>
              <span className="hidden sm:inline text-[#F2EFE8]">
                {meeting.participants.map((p) => p.name).join(', ')}
              </span>
            </div>
          </div>
        </div>

        {/* Right Mode Switcher (Product-oriented labels preserving QA selectors) */}
        <div className="flex items-center gap-1 bg-[#0B0C0E] p-1 border border-[#1E2127] rounded-md overflow-x-auto">
          <button
            onClick={() => setActiveTab('transcript')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded transition-colors ${
              activeTab === 'transcript'
                ? 'bg-[#C7F36B] text-[#0B0C0E] font-semibold'
                : 'text-[#969AA3] hover:text-[#F2EFE8] hover:bg-[#191C20]'
            }`}
          >
            <span>Transcript</span>
            <span className="text-[10px] font-mono opacity-80">
              [{meeting.transcript.length}]
            </span>
          </button>

          <button
            onClick={() => setActiveTab('summary')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded transition-colors ${
              activeTab === 'summary'
                ? 'bg-[#C7F36B] text-[#0B0C0E] font-semibold'
                : 'text-[#969AA3] hover:text-[#F2EFE8] hover:bg-[#191C20]'
            }`}
          >
            <span>Summary</span>
          </button>

          <button
            onClick={() => setActiveTab('actions')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded transition-colors ${
              activeTab === 'actions'
                ? 'bg-[#C7F36B] text-[#0B0C0E] font-semibold'
                : 'text-[#969AA3] hover:text-[#F2EFE8] hover:bg-[#191C20]'
            }`}
          >
            <span>Follow-ups / Tasks</span>
            {pendingActions > 0 && (
              <span className="text-[10px] font-mono opacity-90">
                [{pendingActions}]
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('clips')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded transition-colors ${
              activeTab === 'clips'
                ? 'bg-[#C7F36B] text-[#0B0C0E] font-semibold'
                : 'text-[#969AA3] hover:text-[#F2EFE8] hover:bg-[#191C20]'
            }`}
          >
            <span>Highlights / Clips</span>
            <span className="text-[10px] font-mono opacity-80">
              [{meeting.clips.length}]
            </span>
          </button>
        </div>
      </div>

      {/* Signature Conversation Map (Always visible above workspace split) */}
      <div className="px-4 pt-3 flex-shrink-0">
        <ConversationMap meeting={meeting} />
      </div>

      {/* Main Split Workspace */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 p-4 pt-3">
        {/* Left Column: Audio & Speaker Monitor (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col justify-start overflow-y-auto">
          <MediaPlayer meeting={meeting} />
        </div>

        {/* Right Column: Active Analysis Surface (7 cols on lg) */}
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

