import React from 'react';
import { Volume2, Mic } from 'lucide-react';
import { Participant, TranscriptTurn } from '../../types';

interface SpeakerStageProps {
  participants: Participant[];
  activeTurn: TranscriptTurn | null;
  isPlaying: boolean;
}

export const SpeakerStage: React.FC<SpeakerStageProps> = ({
  participants,
  activeTurn,
  isPlaying,
}) => {
  const activeSpeakerId = activeTurn?.speakerId;

  return (
    <div className="relative w-full aspect-video bg-[#07080b] rounded-xl overflow-hidden border border-[#181a24] shadow-2xl flex flex-col justify-between p-3 select-none">
      {/* Conference Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 h-full">
        {participants.map((participant) => {
          const isSpeaking = isPlaying && activeSpeakerId === participant.id;

          return (
            <div
              key={participant.id}
              className={`relative rounded-lg overflow-hidden bg-gradient-to-b from-[#101118] to-[#0c0d12] border flex flex-col items-center justify-center transition-all duration-200 ${
                isSpeaking
                  ? 'border-cyan-400 ring-1 ring-cyan-400/50 shadow-md shadow-cyan-950/60'
                  : 'border-[#1b1e2a] opacity-95'
              }`}
            >
              {/* Avatar with active speaker indicator */}
              <div className="relative mb-2">
                <img
                  src={participant.avatarUrl}
                  alt={participant.name}
                  className={`w-13 h-13 md:w-15 md:h-15 rounded-full object-cover transition-all duration-200 ${
                    isSpeaking ? 'ring-2 ring-cyan-400 shadow-[0_0_12px_#00d2ee]' : 'ring-1 ring-[#242738]'
                  }`}
                />

                {isSpeaking && (
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-400 items-center justify-center text-[8px] text-black font-bold">
                      ●
                    </span>
                  </span>
                )}
              </div>

              {/* Bottom Info Bar pinned inside tile */}
              <div className="w-full px-2 text-center">
                <p className="text-xs font-semibold text-zinc-200 truncate flex items-center justify-center gap-1.5">
                  <span>{participant.name}</span>
                  {participant.isHost && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#181a26] text-zinc-400 font-normal border border-[#222638]">
                      Host
                    </span>
                  )}
                </p>
                <p className="text-[10px] text-zinc-500 truncate mt-0.5">{participant.company}</p>
              </div>

              {/* Top-right speaking badge */}
              {isSpeaking && (
                <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/85 backdrop-blur-md border border-cyan-400/50 shadow-sm">
                  <Mic className="w-2.5 h-2.5 text-cyan-400 animate-pulse" />
                  <span className="text-[9px] font-mono text-cyan-300 font-semibold tracking-wider">
                    SPEAKING
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Live subtitle bar at bottom */}
      {activeTurn && isPlaying && (
        <div className="absolute bottom-3 inset-x-3 bg-black/90 backdrop-blur-md px-3.5 py-2 rounded-lg border border-[#262a3c] flex items-center gap-2.5 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-150">
          <Volume2 className="w-4 h-4 text-cyan-400 flex-shrink-0 animate-pulse" />
          <p className="text-xs text-zinc-100 line-clamp-1 italic font-medium leading-relaxed">
            "{activeTurn.text}"
          </p>
        </div>
      )}
    </div>
  );
};

