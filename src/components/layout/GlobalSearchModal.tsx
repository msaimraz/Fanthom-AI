import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Play,
  ArrowRight,
  X,
  Loader2,
  CheckSquare,
} from 'lucide-react';
import { useMeetingsStore } from '../../store/useMeetingsStore';
import {
  searchWorkspaceDatabase,
  DatabaseSearchResults,
} from '../../services/meetingsService';
import { formatTime } from '../../utils/formatters';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const { meetings } = useMeetingsStore();
  const [query, setQuery] = useState('');
  const [dbResults, setDbResults] = useState<DatabaseSearchResults | null>(null);
  const [isSearchingDb, setIsSearchingDb] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setDbResults(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setDbResults(null);
      setIsSearchingDb(false);
      return;
    }

    let cancelled = false;
    setIsSearchingDb(true);

    searchWorkspaceDatabase(trimmed)
      .then((res) => {
        if (!cancelled) {
          setDbResults(res);
          setIsSearchingDb(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIsSearchingDb(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return { meetings: [], transcriptMoments: [], actionItems: [] };

    if (dbResults) {
      return dbResults;
    }

    const matchedMeetings: { id: string; title: string }[] = [];
    const matchedMoments: {
      meetingId: string;
      meetingTitle: string;
      turnId: string;
      speakerName: string;
      text: string;
      timestamp: number;
    }[] = [];
    const matchedActions: {
      meetingId: string;
      meetingTitle: string;
      text: string;
      timestamp: number;
      completed: boolean;
    }[] = [];

    meetings.forEach((meeting) => {
      if (
        meeting.title.toLowerCase().includes(trimmed) ||
        meeting.tags.some((t) => t.toLowerCase().includes(trimmed))
      ) {
        matchedMeetings.push({ id: meeting.id, title: meeting.title });
      }

      const speakerMap = meeting.participants.reduce((acc, p) => {
        acc[p.id] = p.name;
        return acc;
      }, {} as Record<string, string>);

      meeting.transcript.forEach((turn) => {
        if (turn.text.toLowerCase().includes(trimmed)) {
          matchedMoments.push({
            meetingId: meeting.id,
            meetingTitle: meeting.title,
            turnId: turn.id,
            speakerName: speakerMap[turn.speakerId] || turn.speakerId,
            text: turn.text,
            timestamp: turn.startTime,
          });
        }
      });

      meeting.actionItems.forEach((action) => {
        if (action.text.toLowerCase().includes(trimmed)) {
          matchedActions.push({
            meetingId: meeting.id,
            meetingTitle: meeting.title,
            text: action.text,
            timestamp: action.timestamp,
            completed: action.completed,
          });
        }
      });
    });

    return {
      meetings: matchedMeetings.slice(0, 3),
      transcriptMoments: matchedMoments.slice(0, 5),
      actionItems: matchedActions.slice(0, 3),
    };
  }, [query, meetings, dbResults]);

  if (!isOpen) return null;

  const handleSelectMoment = (meetingId: string, timestamp: number) => {
    onClose();
    navigate(`/meetings/${meetingId}?t=${timestamp}&tab=transcript`);
  };

  const handleSelectMeeting = (meetingId: string) => {
    onClose();
    navigate(`/meetings/${meetingId}`);
  };

  const hasResults =
    results.meetings.length > 0 ||
    results.transcriptMoments.length > 0 ||
    results.actionItems.length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-start justify-center pt-16 px-4 select-none">
      <div className="w-full max-w-2xl bg-[#121417] border border-[#272B33] overflow-hidden flex flex-col max-h-[78vh]">
        {/* Fanthom Command Top Bar */}
        <div className="px-4 py-2 bg-[#0B0C0E] border-b border-[#1E2127] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#C7F36B]" />
            <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#C7F36B] font-semibold">
              Fanthom Command
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#969AA3]">
            Find across conversations, speakers, decisions & timestamps
          </span>
        </div>

        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#1E2127] flex items-center gap-3 bg-[#121417]">
          <Search className="w-4 h-4 text-[#C7F36B] flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search meetings, transcript statements, decisions, follow-ups..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[#F2EFE8] placeholder-[#5E626B] focus:outline-none"
          />
          {isSearchingDb && (
            <Loader2 className="w-3.5 h-3.5 text-[#C7F36B] animate-spin flex-shrink-0" />
          )}
          {query && (
            <button
              onClick={() => setQuery('')}
              className="px-1.5 py-0.5 text-[#969AA3] hover:text-[#F2EFE8] text-[11px] font-mono border border-[#1E2127]"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-[#969AA3] hover:text-[#F2EFE8] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {query.trim() === '' ? (
            <div className="py-8 text-center text-xs text-[#969AA3] space-y-3">
              <p className="text-[#F2EFE8] font-medium">
                Jump directly to any spoken moment, decision, question, or follow-up.
              </p>
              <div className="flex items-center justify-center gap-2 text-[11px] text-[#969AA3] flex-wrap font-mono">
                <span className="text-[#5E626B]">QUERY:</span>
                {['latency', 'SOC2', 'Redis', 'roadmap'].map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-2.5 py-1 bg-[#0B0C0E] hover:bg-[#191C20] text-[#C7F36B] border border-[#1E2127] transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : !hasResults ? (
            <div className="py-14 text-center text-xs text-[#969AA3] font-mono">
              No matching moments found for "{query}".
            </div>
          ) : (
            <>
              {/* Transcript Moments (Primary — shows Meeting, Speaker, Timestamp, Matching Text) */}
              {results.transcriptMoments.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#969AA3]">
                      Transcript Moments ({results.transcriptMoments.length})
                    </span>
                    <span className="text-[10px] font-mono text-[#5E626B]">
                      Click to open & seek audio
                    </span>
                  </div>
                  <div className="divide-y divide-[#1E2127] border border-[#1E2127]">
                    {results.transcriptMoments.map((mom, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectMoment(mom.meetingId, mom.timestamp)}
                        className="p-2.5 rounded-lg bg-[#0d0e13] bg-[#0B0C0E] hover:bg-[#191C20] cursor-pointer flex flex-col gap-1.5 group transition-colors"
                      >
                        <div className="flex items-center justify-between text-[11px] gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-mono text-[10px] px-1.5 py-0.5 bg-[#121417] text-[#C7F36B] border border-[#1E2127] flex-shrink-0">
                              {formatTime(mom.timestamp)}
                            </span>
                            <span className="font-semibold text-[#F2EFE8] flex-shrink-0">
                              {mom.speakerName}
                            </span>
                            <span className="text-[#5E626B]">—</span>
                            <span className="text-[#969AA3] truncate font-mono text-[11px]">
                              {mom.meetingTitle}
                            </span>
                          </div>
                          <span className="flex items-center gap-1 font-mono text-[#969AA3] group-hover:text-[#C7F36B] transition-colors text-[10px] flex-shrink-0">
                            <Play className="w-2.5 h-2.5 fill-current" />
                            <span>Seek</span>
                          </span>
                        </div>
                        <p className="text-xs text-[#F2EFE8] line-clamp-1 leading-relaxed pl-1 border-l border-[#272B33] group-hover:border-[#C7F36B]">
                          "{mom.text}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Conversations */}
              {results.meetings.length > 0 && (
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#969AA3] mb-2 block">
                    Conversations
                  </span>
                  <div className="divide-y divide-[#1E2127] border border-[#1E2127]">
                    {results.meetings.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => handleSelectMeeting(m.id)}
                        className="p-2.5 bg-[#0B0C0E] hover:bg-[#191C20] cursor-pointer flex items-center justify-between group transition-colors"
                      >
                        <span className="text-xs font-medium text-[#F2EFE8] group-hover:text-[#C7F36B] truncate">
                          {m.title}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#969AA3] group-hover:text-[#C7F36B] transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Follow-up Items */}
              {results.actionItems.length > 0 && (
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#969AA3] mb-2 block">
                    Follow-ups
                  </span>
                  <div className="divide-y divide-[#1E2127] border border-[#1E2127]">
                    {results.actionItems.map((act, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectMoment(act.meetingId, act.timestamp)}
                        className="p-2.5 bg-[#0B0C0E] hover:bg-[#191C20] cursor-pointer flex items-center justify-between group transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <CheckSquare className="w-3.5 h-3.5 text-[#47D18C] flex-shrink-0" />
                          <span
                            className={`text-xs truncate ${
                              act.completed ? 'line-through text-[#5E626B]' : 'text-[#F2EFE8]'
                            }`}
                          >
                            {act.text}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-[#C7F36B]">
                          [{formatTime(act.timestamp)}]
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-[#1E2127] bg-[#0B0C0E] flex items-center justify-between text-[11px] font-mono text-[#969AA3]">
          <span>Select any result to open conversation & seek audio</span>
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-[#121417] text-[#969AA3] text-[10px] border border-[#1E2127]">
              ESC
            </kbd>
            <span>close</span>
          </div>
        </div>
      </div>
    </div>
  );
};

