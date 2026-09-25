import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Layers,
  CheckSquare,
  Play,
  ArrowRight,
  X,
  Loader2,
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-16 px-4 select-none animate-in fade-in duration-100">
      <div className="w-full max-w-2xl bg-[#17191D] border border-[#23262D] rounded-2xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[78vh] animate-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#23262D] flex items-center gap-3 bg-[#17191D]">
          <Search className="w-4 h-4 text-[#8B7CF6] flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search meetings, transcript statements, action items..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[#F4F3EF] placeholder-[#6F737D] focus:outline-none"
          />
          {isSearchingDb && (
            <Loader2 className="w-3.5 h-3.5 text-[#8B7CF6] animate-spin flex-shrink-0" />
          )}
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[#6F737D] hover:text-[#F4F3EF] rounded text-xs font-mono"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-[#A7A9B0] hover:text-[#F4F3EF] rounded-lg hover:bg-[#1D2025] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {query.trim() === '' ? (
            <div className="py-10 text-center text-xs text-[#6F737D] space-y-3">
              <p className="text-[#A7A9B0]">Search across spoken transcript utterances, meeting titles, and follow-up items.</p>
              <div className="flex items-center justify-center gap-2 text-[11px] text-[#A7A9B0] flex-wrap">
                <span>Try searching:</span>
                <button
                  onClick={() => setQuery('latency')}
                  className="px-2.5 py-1 rounded-md bg-[#101114] hover:bg-[#1D2025] text-[#8B7CF6] font-mono border border-[#23262D] transition-colors"
                >
                  "latency"
                </button>
                <button
                  onClick={() => setQuery('SOC2')}
                  className="px-2.5 py-1 rounded-md bg-[#101114] hover:bg-[#1D2025] text-[#8B7CF6] font-mono border border-[#23262D] transition-colors"
                >
                  "SOC2"
                </button>
                <button
                  onClick={() => setQuery('Redis')}
                  className="px-2.5 py-1 rounded-md bg-[#101114] hover:bg-[#1D2025] text-[#8B7CF6] font-mono border border-[#23262D] transition-colors"
                >
                  "Redis"
                </button>
              </div>
            </div>
          ) : !hasResults ? (
            <div className="py-16 text-center text-xs text-[#6F737D]">
              No results found for "{query}".
            </div>
          ) : (
            <>
              {/* Meetings results */}
              {results.meetings.length > 0 && (
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6F737D] font-mono mb-2 block">
                    Conversations
                  </span>
                  <div className="space-y-1.5">
                    {results.meetings.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => handleSelectMeeting(m.id)}
                        className="p-2.5 rounded-lg hover:bg-[#1D2025] cursor-pointer flex items-center justify-between group transition-colors border border-transparent hover:border-[#23262D]"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Layers className="w-4 h-4 text-[#8B7CF6] flex-shrink-0" />
                          <span className="text-xs font-semibold text-[#F4F3EF] group-hover:text-[#8B7CF6] truncate">
                            {m.title}
                          </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#6F737D] group-hover:text-[#8B7CF6] group-hover:translate-x-0.5 transition-all" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transcript moments */}
              {results.transcriptMoments.length > 0 && (
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6F737D] font-mono mb-2 block">
                    Spoken Transcript Moments (Deep-Linkable)
                  </span>
                  <div className="space-y-2">
                    {results.transcriptMoments.map((mom, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectMoment(mom.meetingId, mom.timestamp)}
                        className="p-2.5 rounded-lg bg-[#0d0e13] bg-[#101114] hover:bg-[#1D2025] border border-[#23262D] hover:border-[#8B7CF6]/40 cursor-pointer flex flex-col gap-1.5 group transition-colors"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#8B7CF6]">
                              {mom.speakerName}
                            </span>
                            <span className="text-[#6F737D]">•</span>
                            <span className="text-[#A7A9B0] truncate max-w-[220px]">
                              {mom.meetingTitle}
                            </span>
                          </div>
                          <span className="flex items-center gap-1 font-mono text-[#A7A9B0] px-2 py-0.5 bg-[#17191D] rounded group-hover:bg-[#8B7CF6] group-hover:text-white transition-colors font-medium text-[10px]">
                            <Play className="w-2.5 h-2.5 fill-current" />
                            {formatTime(mom.timestamp)}
                          </span>
                        </div>
                        <p className="text-xs text-[#F4F3EF] line-clamp-1 italic leading-relaxed">
                          "{mom.text}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action items */}
              {results.actionItems.length > 0 && (
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6F737D] font-mono mb-2 block">
                    Follow-up Items
                  </span>
                  <div className="space-y-1.5">
                    {results.actionItems.map((act, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectMoment(act.meetingId, act.timestamp)}
                        className="p-2.5 rounded-lg hover:bg-[#1D2025] cursor-pointer flex items-center justify-between group transition-colors border border-transparent hover:border-[#23262D]"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <CheckSquare className="w-4 h-4 text-[#55C89A] flex-shrink-0" />
                          <span
                            className={`text-xs truncate ${
                              act.completed ? 'line-through text-[#6F737D]' : 'text-[#F4F3EF]'
                            }`}
                          >
                            {act.text}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-[#6F737D]">
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
        <div className="p-3 border-t border-[#23262D] bg-[#101114] flex items-center justify-between text-xs text-[#6F737D]">
          <span>Click any moment to jump directly to that second in the call.</span>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-0.5 rounded bg-[#17191D] text-[#A7A9B0] font-mono text-[10px] border border-[#23262D]">
              ESC
            </kbd>
            <span>to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};
