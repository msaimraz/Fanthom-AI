import React from 'react';
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
    <div className="relative w-full aspect-video bg-[#0B0C0E] border border-[#1E2127] flex flex-col justify-between p-3 select-none">
      {/* Studio Participant Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 h-full">
        {participants.map((participant) => {
          const isSpeaking = isPlaying && activeSpeakerId === participant.id;

          return (
            <div
              key={participant.id}
              style={isSpeaking ? { borderColor: '#C7F36B' } : undefined}
              className={`relative bg-[#121417] border flex flex-col items-center justify-center transition-colors p-2 ${
                isSpeaking
                  ? 'border-cyan-400 ring-1 ring-[#C7F36B]/60 bg-[#191C20]'
                  : 'border-[#1E2127]'
              }`}
            >
              {/* Avatar */}
              <div className="relative mb-2">
                <img
                  src={participant.avatarUrl}
                  alt={participant.name}
                  className={`w-12 h-12 md:w-14 md:h-14 rounded-sm object-cover border ${
                    isSpeaking ? 'border-[#C7F36B]' : 'border-[#272B33]'
                  }`}
                />
              </div>

              {/* Participant Identity */}
              <div className="w-full px-1.5 text-center">
                <p className="text-xs font-semibold text-[#F2EFE8] truncate flex items-center justify-center gap-1.5">
                  <span>{participant.name}</span>
                  {participant.isHost && (
                    <span className="text-[9px] font-mono uppercase px-1 py-0.2 bg-[#0B0C0E] text-[#969AA3] border border-[#1E2127]">
                      Host
                    </span>
                  )}
                </p>
                <p className="text-[10px] font-mono text-[#969AA3] truncate mt-0.5">
                  {participant.company}
                </p>
              </div>

              {/* Active Channel Indicator */}
              {isSpeaking && (
                <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 bg-[#0B0C0E] border border-[#C7F36B]">
                  <span className="w-1.5 h-1.5 bg-[#C7F36B]" />
                  <span className="text-[9px] font-mono text-[#C7F36B] font-semibold tracking-wider">
                    SPEAKING
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Live Caption Readout */}
      {activeTurn && isPlaying && (
        <div className="absolute bottom-2.5 inset-x-2.5 bg-[#0B0C0E]/95 px-3 py-2 border-l-2 border-l-[#C7F36B] border border-[#1E2127] flex items-center gap-2">
          <span className="text-[9px] font-mono uppercase tracking-wider text-[#C7F36B] flex-shrink-0">
            LIVE
          </span>
          <p className="text-xs text-[#F2EFE8] line-clamp-1 leading-relaxed">
            "{activeTurn.text}"
          </p>
        </div>
      )}
    </div>
  );
};
