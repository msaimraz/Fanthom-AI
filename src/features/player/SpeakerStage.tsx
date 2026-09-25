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

  // Active speaker is either current speaker when playing, or host, or first participant
  const activeSpeaker =
    participants.find((p) => p.id === activeSpeakerId) ||
    participants.find((p) => p.isHost) ||
    participants[0];

  const secondarySpeakers = participants.filter((p) => p.id !== activeSpeaker?.id);
  const isSpeaking = Boolean(isPlaying && activeSpeakerId && activeSpeakerId === activeSpeaker?.id);

  return (
    <div className="relative w-full bg-[#121417] border border-[#1E2127] rounded-lg p-3.5 select-none overflow-hidden">
      <div className="flex flex-col sm:flex-row items-stretch gap-3">
        {/* 1. Intentional Spotlight on Active Speaker (Primary Area) */}
        <div
          style={isSpeaking ? { borderColor: '#C7F36B' } : undefined}
          className={`flex-1 flex flex-col justify-between p-3.5 rounded bg-[#0B0C0E] border transition-colors ${
            isSpeaking
              ? 'border-cyan-400 ring-1 ring-[#C7F36B]/60 bg-[#16191D]'
              : 'border-[#1E2127]'
          }`}
        >
          {/* Header of Active Speaker */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative flex-shrink-0">
                <img
                  src={activeSpeaker?.avatarUrl}
                  alt={activeSpeaker?.name}
                  className={`w-11 h-11 rounded-full object-cover border ${
                    isSpeaking ? 'border-[#C7F36B]' : 'border-[#272B33]'
                  }`}
                />
                {isSpeaking && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#C7F36B] ring-2 ring-[#0B0C0E]" />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-sm font-semibold text-[#F2EFE8] truncate">
                    {activeSpeaker?.name}
                  </h4>
                  {activeSpeaker?.isHost && (
                    <span className="text-[10px] font-mono uppercase px-1 py-0.2 text-[#969AA3] bg-[#121417] border border-[#1E2127]">
                      Host
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#969AA3] truncate">
                  {activeSpeaker?.role} · {activeSpeaker?.company}
                </p>
              </div>
            </div>

            {/* Speaking State Badge */}
            {isSpeaking ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono text-[#C7F36B] bg-[#C7F36B]/10 border border-[#C7F36B]/40 flex-shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C7F36B] animate-pulse" />
                SPEAKING
              </span>
            ) : (
              <span className="text-[10px] font-mono text-[#5E626B] hidden sm:inline">
                STAGE
              </span>
            )}
          </div>

          {/* Real-time utterance display */}
          <div className="mt-3 pt-2.5 border-t border-[#1E2127]">
            {activeTurn && isPlaying ? (
              <p className="text-xs text-[#F2EFE8] italic leading-relaxed line-clamp-2">
                "{activeTurn.text}"
              </p>
            ) : (
              <p className="text-xs text-[#5E626B] font-normal">
                Audio playback paused. Use spacebar or player controls to resume.
              </p>
            )}
          </div>
        </div>

        {/* 2. Secondary Participants Rail (Compact, quiet) */}
        {secondarySpeakers.length > 0 && (
          <div className="sm:w-44 flex sm:flex-col justify-start gap-2 pt-1 sm:pt-0">
            {secondarySpeakers.map((participant) => (
              <div
                key={participant.id}
                className="flex-1 sm:flex-initial flex items-center gap-2 p-2 rounded bg-[#0B0C0E] border border-[#1E2127]"
              >
                <img
                  src={participant.avatarUrl}
                  alt={participant.name}
                  className="w-7 h-7 rounded-full object-cover border border-[#272B33] flex-shrink-0"
                />
                <div className="min-w-0 flex-1 hidden sm:block">
                  <p className="text-xs text-[#F2EFE8] font-medium truncate">
                    {participant.name}
                  </p>
                  <p className="text-[10px] text-[#969AA3] truncate">
                    {participant.company}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

