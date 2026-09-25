import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  ExternalLink,
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
      <div className="min-h-screen bg-[#0B0C0E] flex flex-col items-center justify-center p-6 text-center gap-3">
        <Loader2 className="w-6 h-6 text-[#C7F36B] animate-spin" />
        <h2 className="text-sm font-mono uppercase tracking-wider text-[#F2EFE8]">
          Loading shared conversation clip...
        </h2>
      </div>
    );
  }

  if (fetchError && (!targetMeeting || !targetClip)) {
    return (
      <div className="min-h-screen bg-[#0B0C0E] flex flex-col items-center justify-center p-6 text-center gap-3">
        <AlertCircle className="w-6 h-6 text-[#F26464]" />
        <h2 className="text-base font-semibold text-[#F2EFE8]">{fetchError}</h2>
        <button
          onClick={() => navigate('/meetings')}
          className="px-3.5 py-1.5 bg-[#C7F36B] text-[#0B0C0E] text-xs font-mono font-semibold"
        >
          Open Fanthom Workspace
        </button>
      </div>
    );
  }

  if (!targetMeeting || !targetClip) {
    return (
      <div className="min-h-screen bg-[#0B0C0E] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-base font-semibold text-[#F2EFE8] mb-1.5">Clip Not Found</h2>
        <p className="text-xs text-[#969AA3] mb-4">
          This shared conversation clip does not exist.
        </p>
        <button
          onClick={() => navigate('/meetings')}
          className="px-3.5 py-1.5 bg-[#C7F36B] text-[#0B0C0E] text-xs font-mono font-semibold"
        >
          Open Fanthom Workspace
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

  const activeTurn =
    targetMeeting.transcript.find(
      (t) => currentTime >= t.startTime && currentTime <= t.endTime
    ) || null;

  return (
    <div className="min-h-screen bg-[#0B0C0E] text-[#F2EFE8] flex flex-col justify-between select-none">
      {/* Top public banner */}
      <header className="h-12 border-b border-[#1E2127] bg-[#0B0C0E] px-6 flex items-center justify-between sticky top-0 z-10">
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => navigate('/meetings')}
        >
          <div className="w-6 h-6 bg-[#C7F36B] text-[#0B0C0E] flex items-center justify-center font-mono font-bold text-xs">
            F
          </div>
          <span className="font-mono font-semibold text-xs tracking-[0.14em] uppercase text-[#F2EFE8]">
            FANTHOM
          </span>
          <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 bg-[#121417] text-[#C7F36B] border border-[#1E2127]">
            Shared Clip
          </span>
        </div>

        <button
          onClick={() =>
            navigate(`/meetings/${targetMeeting.id}?t=${targetClip.startTime}`)
          }
          className="flex items-center gap-1.5 px-3 py-1 bg-[#C7F36B] hover:bg-[#d4f788] text-[#0B0C0E] text-xs font-mono font-semibold transition-colors"
        >
          <span>Open Full Conversation</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* Main Clip Container */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-[#121417] border border-[#1E2127] p-6 flex flex-col gap-4">
          <audio
            ref={audioRef}
            src={targetMeeting.mediaUrl}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
          />

          {/* Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#1E2127] pb-3.5">
            <div>
              <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 bg-[#0B0C0E] text-[#C7F36B] font-semibold border border-[#C7F36B]/40">
                HIGHLIGHT MOMENT
              </span>
              <h1 className="text-lg font-semibold text-[#F2EFE8] mt-1.5 tracking-tight">
                {targetClip.title}
              </h1>
              <p className="text-xs text-[#969AA3] mt-0.5 font-mono">
                {targetMeeting.title} · {formatDate(targetMeeting.date)}
              </p>
            </div>

            <div className="text-xs font-mono text-[#C7F36B] bg-[#0B0C0E] px-2.5 py-1 border border-[#1E2127] self-start sm:self-auto">
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
          <div className="bg-[#0B0C0E] border border-[#1E2127] p-3.5 flex flex-col gap-2.5">
            {/* Progress bar */}
            <div className="w-full h-1.5 bg-[#121417] border border-[#1E2127] overflow-hidden">
              <div
                className="h-full bg-[#C7F36B] transition-[width] duration-75"
                style={{ width: `${clipProgress}%` }}
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={togglePlay}
                  className="w-8 h-8 bg-[#C7F36B] hover:bg-[#d4f788] text-[#0B0C0E] flex items-center justify-center transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-3.5 h-3.5 fill-current" />
                  ) : (
                    <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />
                  )}
                </button>

                <button
                  onClick={handleReset}
                  title="Replay clip"
                  className="p-1.5 text-[#969AA3] hover:text-[#F2EFE8] hover:bg-[#191C20] border border-[#1E2127] transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <span className="text-xs font-mono text-[#969AA3]">
                  {formatTime(currentTime - targetClip.startTime)} / {formatTime(clipDuration)}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#969AA3]">
                <Volume2 className="w-3.5 h-3.5 text-[#C7F36B]" />
                <span>Synced Audio</span>
              </div>
            </div>
          </div>

          {/* Quote */}
          {targetClip.quote && (
            <div className="p-3 bg-[#0B0C0E] border-l-2 border-l-[#C7F36B] border border-[#1E2127] text-xs text-[#F2EFE8] leading-relaxed">
              "{targetClip.quote}"
            </div>
          )}
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="py-3.5 text-center text-[11px] font-mono text-[#5E626B] border-t border-[#1E2127] bg-[#0B0C0E]">
        FANTHOM — Conversation OS
      </footer>
    </div>
  );
};

