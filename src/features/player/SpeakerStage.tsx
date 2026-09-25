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
    <div className="relative w-full aspect-video bg-[#101114] rounded-xl overflow-hidden border border-[#23262D] shadow-xl flex flex-col justify-between p-3 select-none">
      {/* Conference Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 h-full">
        {participants.map((participant) => {
          const isSpeaking = isPlaying && activeSpeakerId === participant.id;

          return (
            <div
              key={participant.id}
              className={`relative rounded-lg overflow-hidden bg-[#17191D] border flex flex-col items-center justify-center transition-all duration-200 ${
                isSpeaking
                  ? 'border-cyan-400 ring-1 ring-[#8B7CF6]/60 border-[#8B7CF6] shadow-md shadow-[#8B7CF6]/20'
                  : 'border-[#23262D] opacity-95'
              }`}
            >
              {/* Avatar with active speaker indicator */}
              <div className="relative mb-2">
                <img
                  src={participant.avatarUrl}
                  alt={participant.name}
                  className={`w-13 h-13 md:w-15 md:h-15 rounded-full object-cover transition-all duration-200 ${
                    isSpeaking ? 'ring-2 ring-[#8B7CF6] shadow-[0_0_12px_#8B7CF6]' : 'ring-1 ring-[#2C3039]'
                  }`}
                />

                {isSpeaking && (
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8B7CF6] opacity-75" />
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-[#8B7CF6] items-center justify-center text-[8px] text-white font-bold">
                      ●
                    </span>
                  </span>
                )}
              </div>

              {/* Bottom Info Bar pinned inside tile */}
              <div className="w-full px-2 text-center">
                <p className="text-xs font-semibold text-[#F4F3EF] truncate flex items-center justify-center gap-1.5">
                  <span>{participant.name}</span>
                  {participant.isHost && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#1D2025] text-[#A7A9B0] font-normal border border-[#23262D]">
                      Host
                    </span>
                  )}
                </p>
                <p className="text-[10px] text-[#A7A9B0] truncate mt-0.5">{participant.company}</p>
              </div>

              {/* Top-right speaking badge */}
              {isSpeaking && (
                <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#101114]/90 backdrop-blur-md border border-[#8B7CF6]/50 shadow-sm">
                  <Mic className="w-2.5 h-2.5 text-[#8B7CF6] animate-pulse" />
                  <span className="text-[9px] font-mono text-[#8B7CF6] font-semibold tracking-wider">
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
        <div className="absolute bottom-3 inset-x-3 bg-[#101114]/95 backdrop-blur-md px-3.5 py-2 rounded-lg border border-[#23262D] flex items-center gap-2.5 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-150">
          <Volume2 className="w-4 h-4 text-[#8B7CF6] flex-shrink-0 animate-pulse" />
          <p className="text-xs text-[#F4F3EF] line-clamp-1 italic font-medium leading-relaxed">
            "{activeTurn.text}"
          </p>
        </div>
      )}
    </div>
  );
};

