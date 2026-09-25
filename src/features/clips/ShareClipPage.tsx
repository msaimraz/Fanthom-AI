import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  ExternalLink,
  Quote,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useMeetingsStore } from '../../store/useMeetingsStore';
import { fetchSharedClipFromDatabase } from '../../services/meetingsService';
import { Meeting, Clip } from '../../types';
import { SpeakerStage } from '../player/SpeakerStage';
import { formatTime, formatDate } from '../../utils/formatters';

export const ShareClipPage: React.FC = () => {
  const { clipId } = useParams<{ clipId: string }>();
  const navigate = useNavigate();
  const { meetings, isLoading: storeLoading } = useMeetingsStore();

  const [dbResult, setDbResult] = useState<{ meeting: Meeting; clip: Clip } | null>(null);
  const [isFetchingClip, setIsFetchingClip] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  let targetMeeting: Meeting | undefined = dbResult?.meeting;
  let targetClip: Clip | undefined = dbResult?.clip;

  if (!targetMeeting || !targetClip) {
    for (const m of meetings) {
      const found = m.clips.find((c) => c.shareId === clipId || c.id === clipId);
      if (found) {
        targetMeeting = m;
        targetClip = found;
        break;
      }
    }
  }

  useEffect(() => {
    if (!clipId) return;
    if (targetMeeting && targetClip) return;

    let cancelled = false;
    setIsFetchingClip(true);
    setFetchError(null);

    fetchSharedClipFromDatabase(clipId)
      .then((res) => {
        if (!cancelled) {
          setDbResult(res);
          setIsFetchingClip(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFetchError('Unable to load shared clip.');
          setIsFetchingClip(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [clipId, targetMeeting, targetClip]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(targetClip?.startTime || 0);

  useEffect(() => {
    if (targetClip && audioRef.current) {
      audioRef.current.currentTime = targetClip.startTime;
      setCurrentTime(targetClip.startTime);
    }
  }, [targetClip]);

  if ((storeLoading || isFetchingClip) && (!targetMeeting || !targetClip)) {
    return (
      <div className="min-h-screen bg-[#101114] flex flex-col items-center justify-center p-6 text-center gap-3">
        <Loader2 className="w-7 h-7 text-[#8B7CF6] animate-spin" />
        <h2 className="text-sm font-semibold text-[#F4F3EF]">Loading shared clip...</h2>
        <p className="text-xs text-[#A7A9B0]">Retrieving clip and transcript from workspace database...</p>
      </div>
    );
  }

  if (fetchError && (!targetMeeting || !targetClip)) {
    return (
      <div className="min-h-screen bg-[#101114] flex flex-col items-center justify-center p-6 text-center gap-3">
        <AlertCircle className="w-7 h-7 text-rose-400" />
        <h2 className="text-base font-bold text-[#F4F3EF]">{fetchError}</h2>
        <button
          onClick={() => navigate('/meetings')}
          className="px-3.5 py-1.5 bg-[#8B7CF6] hover:bg-[#9D91FF] text-white text-xs font-semibold rounded-lg transition-colors"
        >
          Explore Fanthom Workspace
        </button>
      </div>
    );
  }

  if (!targetMeeting || !targetClip) {
    return (
      <div className="min-h-screen bg-[#101114] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-base font-bold text-[#F4F3EF] mb-1.5">Clip Not Found</h2>
        <p className="text-xs text-[#A7A9B0] mb-4">
          This shared clip may have expired or been removed.
        </p>
        <button
          onClick={() => navigate('/meetings')}
          className="px-3.5 py-1.5 bg-[#8B7CF6] hover:bg-[#9D91FF] text-white text-xs font-semibold rounded-lg transition-colors"
        >
          Explore Fanthom Workspace
        </button>
      </div>
    );
  }

  const clipDuration = Math.max(1, targetClip.endTime - targetClip.startTime);
  const clipProgress =
    Math.max(
      0,
      Math.min(
        100,
        ((currentTime - targetClip.startTime) / clipDuration) * 100
      )
    ) || 0;

  const handleTimeUpdate = () => {
    if (!audioRef.current || !targetClip) return;
    const time = audioRef.current.currentTime;
    setCurrentTime(time);

    if (time >= targetClip.endTime) {
      audioRef.current.pause();
      setIsPlaying(false);
      audioRef.current.currentTime = targetClip.startTime;
      setCurrentTime(targetClip.startTime);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (currentTime >= targetClip.endTime) {
        audioRef.current.currentTime = targetClip.startTime;
      }
      audioRef.current.play().then(() => setIsPlaying(true));
    }
  };

  const handleReset = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = targetClip.startTime;
    setCurrentTime(targetClip.startTime);
    if (!isPlaying) {
      audioRef.current.play().then(() => setIsPlaying(true));
    }
  };

  const activeTurn = targetMeeting.transcript.find(
    (t) => currentTime >= t.startTime && currentTime <= t.endTime
  ) || null;

  return (
    <div className="min-h-screen bg-[#101114] text-[#F4F3EF] flex flex-col justify-between select-none">
      {/* Top public banner */}
      <header className="h-14 border-b border-[#23262D] bg-[#17191D]/95 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-10">
        <div
          className="flex items-center gap-2.5 cursor-pointer group"
          onClick={() => navigate('/meetings')}
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#8B7CF6] to-[#6355D8] flex items-center justify-center shadow-sm shadow-[#8B7CF6]/20">
            <span className="font-bold text-xs text-white font-mono">F</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-semibold text-sm tracking-tight text-[#F4F3EF]">
              Fanthom
            </span>
          </div>
          <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-[#1D2025] text-[#8B7CF6] ml-1 border border-[#8B7CF6]/25">
            Public Clip
          </span>
        </div>

        <button
          onClick={() =>
            navigate(`/meetings/${targetMeeting.id}?t=${targetClip.startTime}`)
          }
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#8B7CF6] hover:bg-[#9D91FF] text-white text-xs font-semibold shadow-sm shadow-[#8B7CF6]/20 transition-all active:scale-95"
        >
          <span>View Full Meeting</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* Main Clip Container */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-[#17191D] border border-[#23262D] rounded-2xl shadow-2xl p-6 flex flex-col gap-4">
          <audio
            ref={audioRef}
            src={targetMeeting.mediaUrl}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
          />

          {/* Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#23262D] pb-3.5">
            <div>
              <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-[#101114] text-[#8B7CF6] font-semibold border border-[#8B7CF6]/30">
                HIGHLIGHT MOMENT
              </span>
              <h1 className="text-lg font-semibold text-[#F4F3EF] mt-1.5 tracking-tight">
                {targetClip.title}
              </h1>
              <p className="text-xs text-[#A7A9B0] mt-0.5">
                From <span className="text-[#F4F3EF] font-medium">{targetMeeting.title}</span> • {formatDate(targetMeeting.date)}
              </p>
            </div>

            <div className="text-xs font-mono text-[#8B7CF6] bg-[#101114] px-3 py-1 rounded-lg border border-[#8B7CF6]/25 self-start sm:self-auto">
              {formatTime(targetClip.startTime)} – {formatTime(targetClip.endTime)} ({Math.round(clipDuration)}s)
            </div>
          </div>

          {/* Speaker Stage */}
          <SpeakerStage
            participants={targetMeeting.participants}
            activeTurn={activeTurn}
            isPlaying={isPlaying}
          />

          {/* Player controls */}
          <div className="bg-[#101114] border border-[#23262D] rounded-xl p-3.5 flex flex-col gap-2.5">
            {/* Progress bar */}
            <div className="w-full h-1.5 bg-[#23262D] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#8B7CF6] transition-[width] duration-75 shadow-[0_0_6px_#8B7CF6]"
                style={{ width: `${clipProgress}%` }}
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={togglePlay}
                  className="w-9 h-9 rounded-full bg-[#8B7CF6] hover:bg-[#9D91FF] text-white flex items-center justify-center shadow-md shadow-[#8B7CF6]/25 transition-all active:scale-95"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 ml-0.5 fill-white" />}
                </button>

                <button
                  onClick={handleReset}
                  title="Replay clip"
                  className="p-1.5 text-[#A7A9B0] hover:text-[#F4F3EF] hover:bg-[#1D2025] rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <span className="text-xs font-mono text-[#A7A9B0]">
                  {formatTime(currentTime - targetClip.startTime)} / {formatTime(clipDuration)}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-[#A7A9B0]">
                <Volume2 className="w-4 h-4 text-[#8B7CF6]" />
                <span>Audio Playback</span>
              </div>
            </div>
          </div>

          {/* Quote */}
          {targetClip.quote && (
            <div className="p-3.5 rounded-xl bg-[#101114] border border-[#23262D] text-xs text-[#A7A9B0] italic flex items-start gap-2.5">
              <Quote className="w-3.5 h-3.5 text-[#8B7CF6] flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">"{targetClip.quote}"</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="py-4 text-center text-xs text-[#6F737D] border-t border-[#23262D] bg-[#101114]">
        Captured with <span className="text-[#F4F3EF] font-semibold">Fanthom</span>. Conversation intelligence workspace.
      </footer>
    </div>
  );
};

