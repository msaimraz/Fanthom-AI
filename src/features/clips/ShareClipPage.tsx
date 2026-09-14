import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Volume2,
  ExternalLink,
  Quote,
} from 'lucide-react';
import { useMeetingsStore } from '../../store/useMeetingsStore';
import { SpeakerStage } from '../player/SpeakerStage';
import { formatTime, formatDate } from '../../utils/formatters';

export const ShareClipPage: React.FC = () => {
  const { clipId } = useParams<{ clipId: string }>();
  const navigate = useNavigate();
  const { meetings } = useMeetingsStore();

  let targetMeeting: (typeof meetings)[0] | undefined;
  let targetClip: (typeof meetings)[0]['clips'][0] | undefined;

  for (const m of meetings) {
    const found = m.clips.find((c) => c.shareId === clipId || c.id === clipId);
    if (found) {
      targetMeeting = m;
      targetClip = found;
      break;
    }
  }

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(targetClip?.startTime || 0);

  useEffect(() => {
    if (targetClip && audioRef.current) {
      audioRef.current.currentTime = targetClip.startTime;
      setCurrentTime(targetClip.startTime);
    }
  }, [targetClip]);

  if (!targetMeeting || !targetClip) {
    return (
      <div className="min-h-screen bg-[#0a0b0d] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-base font-bold text-zinc-100 mb-1.5">Clip Not Found</h2>
        <p className="text-xs text-zinc-400 mb-4">
          This shared clip may have expired or been removed.
        </p>
        <button
          onClick={() => navigate('/meetings')}
          className="px-3.5 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-semibold rounded-lg transition-colors"
        >
          Explore Fathom Meetings
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
    <div className="min-h-screen bg-[#090a0e] text-zinc-100 flex flex-col justify-between select-none">
      {/* Top public banner */}
      <header className="h-13 border-b border-[#161822] bg-[#0c0d12]/95 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-10">
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => navigate('/meetings')}
        >
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-md shadow-cyan-500/25">
            <Sparkles className="w-3.5 h-3.5 text-black fill-black" />
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="font-bold text-sm tracking-tight text-white font-sans">
              fathom
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block shadow-[0_0_6px_#00d2ee]" />
          </div>
          <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-[#151722] text-cyan-300 ml-1.5 border border-cyan-500/25">
            Public Clip
          </span>
        </div>

        <button
          onClick={() =>
            navigate(`/meetings/${targetMeeting.id}?t=${targetClip.startTime}`)
          }
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-semibold shadow-sm shadow-cyan-500/20 transition-all active:scale-95"
        >
          <span>View Full Meeting</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* Main Clip Container */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-[#0e0f15] border border-[#1d202d] rounded-2xl shadow-2xl shadow-black/80 p-6 flex flex-col gap-4">
          <audio
            ref={audioRef}
            src={targetMeeting.mediaUrl}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
          />

          {/* Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#181a24] pb-3.5">
            <div>
              <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-[#161824] text-cyan-300 font-semibold border border-cyan-500/30">
                HIGHLIGHT MOMENT
              </span>
              <h1 className="text-lg font-bold text-white mt-1.5 tracking-tight">
                {targetClip.title}
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                From <span className="text-zinc-200 font-medium">{targetMeeting.title}</span> • {formatDate(targetMeeting.date)}
              </p>
            </div>

            <div className="text-xs font-mono text-cyan-300 bg-[#131520] px-3 py-1 rounded-lg border border-cyan-500/25 self-start sm:self-auto shadow-sm">
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
          <div className="bg-[#090a0f] border border-[#181a25] rounded-xl p-3.5 flex flex-col gap-2.5 shadow-inner">
            {/* Progress bar */}
            <div className="w-full h-1.5 bg-[#181a25] rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400 transition-[width] duration-75 shadow-[0_0_6px_#00d2ee]"
                style={{ width: `${clipProgress}%` }}
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={togglePlay}
                  className="w-9 h-9 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black flex items-center justify-center shadow-md shadow-cyan-500/25 transition-all active:scale-95"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 ml-0.5 fill-black" />}
                </button>

                <button
                  onClick={handleReset}
                  title="Replay clip"
                  className="p-1.5 text-zinc-400 hover:text-white hover:bg-[#161824] rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <span className="text-xs font-mono text-zinc-400">
                  {formatTime(currentTime - targetClip.startTime)} / {formatTime(clipDuration)}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span>Audio Playback</span>
              </div>
            </div>
          </div>

          {/* Quote */}
          {targetClip.quote && (
            <div className="p-3.5 rounded-xl bg-[#090a0f] border border-[#181a25] text-xs text-zinc-300 italic flex items-start gap-2.5 shadow-inner">
              <Quote className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">"{targetClip.quote}"</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="py-4 text-center text-xs text-zinc-500 border-t border-[#161822] bg-[#07080b]">
        Recorded with <span className="text-zinc-200 font-semibold">fathom</span>. Automated meeting intelligence and AI notes.
      </footer>
    </div>
  );
};

