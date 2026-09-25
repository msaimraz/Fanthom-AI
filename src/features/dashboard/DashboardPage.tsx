import React, { useState } from 'react';
import {
  Search,
  ArrowRight,
  Loader2,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMeetingsStore } from '../../store/useMeetingsStore';
import { MeetingCard } from './MeetingCard';
import { formatDate, formatDuration } from '../../utils/formatters';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    meetings,
    isLoading,
    error,
    loadWorkspaceData,
    categoryFilter,
    setCategoryFilter,
  } = useMeetingsStore();

  const [localSearch, setLocalSearch] = useState('');
  const [queryInput, setQueryInput] = useState('');
  const [queryResult, setQueryResult] = useState<{
    text: string;
    meetingId?: string;
    timestamp?: number;
  } | null>(null);

  const filteredMeetings = meetings.filter((meeting) => {
    const matchesCategory =
      categoryFilter === 'all' || meeting.category === categoryFilter;

    const matchesSearch =
      localSearch.trim() === '' ||
      meeting.title.toLowerCase().includes(localSearch.toLowerCase()) ||
      meeting.participants.some((p) =>
        p.name.toLowerCase().includes(localSearch.toLowerCase())
      ) ||
      meeting.tags.some((t) =>
        t.toLowerCase().includes(localSearch.toLowerCase())
      );

    return matchesCategory && matchesSearch;
  });

  const totalDurationMinutes = Math.round(
    meetings.reduce((acc, m) => acc + m.durationSeconds, 0) / 60
  );
  const pendingActions = meetings.reduce(
    (acc, m) => acc + m.actionItems.filter((a) => !a.completed).length,
    0
  );
  const totalDecisions = meetings.reduce((acc, m) => {
    const sum = m.summaries[m.activeTemplateId] || Object.values(m.summaries)[0];
    return acc + (sum?.keyTakeaways?.length || 0);
  }, 0);
  const totalHighlights = meetings.reduce(
    (acc, m) => acc + (m.highlights?.length || 0) + (m.clips?.length || 0),
    0
  );

  const handleQuerySubmit = (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const q = (customQuery || queryInput).trim();
    if (!q) return;

    if (q.toLowerCase().includes('latency') || q.toLowerCase().includes('david')) {
      setQueryResult({
        text: `David Chen (Acme Corp) requires sub-80ms p99 latency at 10,000 RPM for their telemetry stream. Sarah Lin confirmed CloudScale averages 42ms p99 on AWS us-east-1 and committed to running a dedicated Redis shard benchmark.`,
        meetingId: 'enterprise-sales-discovery-acme',
        timestamp: 22.7,
      });
    } else if (
      q.toLowerCase().includes('security') ||
      q.toLowerCase().includes('elena') ||
      q.toLowerCase().includes('soc2')
    ) {
      setQueryResult({
        text: `Decision: Elena Rostova confirmed procurement will fast-track security review in OneTrust once Sarah Lin delivers the SOC2 Type II packet, pen-test report, and DPA addendum by Wednesday.`,
        meetingId: 'enterprise-sales-discovery-acme',
        timestamp: 68.4,
      });
    } else if (q.toLowerCase().includes('action') || q.toLowerCase().includes('follow')) {
      setQueryResult({
        text: `${pendingActions} open follow-ups across ${meetings.length} conversations: Benchmark latency at 10k RPM (Sarah Lin), Deliver SOC2 packet & DPA (Sarah Lin), and Schedule architecture review (Elena Rostova).`,
        meetingId: 'enterprise-sales-discovery-acme',
        timestamp: 105.0,
      });
    } else {
      setQueryResult({
        text: `Matched in Enterprise Sales Discovery: David Chen requires sub-80ms p99 latency at 10,000 RPM; Elena Rostova approved parallel OneTrust security review upon receipt of SOC2 Type II documentation.`,
        meetingId: 'enterprise-sales-discovery-acme',
        timestamp: 22.7,
      });
    }
  };

  const quickQueries = [
    "David Chen's latency requirements",
    'OneTrust security & SOC2 decision',
    'Open follow-ups across conversations',
  ];

  const todayMeetings = filteredMeetings.slice(0, 3);
  const thisWeekMeetings =
    filteredMeetings.length > 3 ? filteredMeetings.slice(3) : filteredMeetings;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-9">
      {/* Editorial Header */}
      <div className="pb-4 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#C7F36B] rounded-full" />
            <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#C7F36B] font-medium">
              FANTHOM
            </span>
          </div>
          <h1 className="text-2xl sm:text-[28px] font-semibold text-[#F2EFE8] tracking-tight leading-tight">
            Conversation workspace
          </h1>
          <p className="text-sm text-[#969AA3] max-w-xl leading-relaxed">
            A chronological timeline of recorded discussions, decisions, and follow-ups.
          </p>
        </div>

        {/* Secondary quiet metrics line (No boxed cards) */}
        <div className="flex items-center gap-4 text-xs text-[#969AA3] flex-wrap pt-1 md:pt-0">
          <span>
            <strong className="text-[#F2EFE8] font-medium">{meetings.length}</strong> calls{' '}
            <span className="text-[#5E626B]">({totalDurationMinutes}m)</span>
          </span>
          <span className="text-[#5E626B]">·</span>
          <span>
            <strong className="text-[#F0B449] font-medium">{totalDecisions}</strong> decisions
          </span>
          <span className="text-[#5E626B]">·</span>
          <span>
            <strong className="text-[#47D18C] font-medium">{pendingActions}</strong> open tasks
          </span>
          <span className="text-[#5E626B]">·</span>
          <span>
            <strong className="text-[#F2EFE8] font-medium">{totalHighlights}</strong> highlights
          </span>
        </div>
      </div>

      {/* Editorial Search & Query Bar */}
      <div className="space-y-3">
        <form
          onSubmit={(e) => handleQuerySubmit(e)}
          className="flex items-center gap-3 bg-[#121417] border border-[#1E2127] px-3.5 py-2.5 rounded-lg focus-within:border-[#272B33] transition-colors"
        >
          <Search className="w-4 h-4 text-[#969AA3] flex-shrink-0" />
          <input
            type="text"
            placeholder="Search decisions, questions, or follow-ups across conversations..."
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[#F2EFE8] placeholder-[#5E626B] focus:outline-none"
          />
          <button
            type="submit"
            className="px-3 py-1 bg-[#C7F36B] hover:bg-[#d4f788] text-[#0B0C0E] text-xs font-semibold rounded transition-colors flex-shrink-0"
          >
            Ask
          </button>
        </form>

        {/* Quick Question Prompts */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs text-[#969AA3] pl-1">
          <span className="text-[11px] text-[#5E626B] flex-shrink-0">Suggested:</span>
          {quickQueries.map((q) => (
            <button
              key={q}
              onClick={() => {
                setQueryInput(q);
                handleQuerySubmit(undefined, q);
              }}
              className="text-[#969AA3] hover:text-[#F2EFE8] transition-colors whitespace-nowrap"
            >
              "{q}"
            </button>
          ))}
        </div>

        {/* Query Result Panel */}
        {queryResult && (
          <div className="p-4 bg-[#121417] border border-[#1E2127] rounded-lg text-xs text-[#F2EFE8] space-y-2.5">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm leading-relaxed text-[#F2EFE8]">{queryResult.text}</p>
              <button
                onClick={() => setQueryResult(null)}
                className="text-[#969AA3] hover:text-[#F2EFE8] text-xs font-medium"
              >
                Close
              </button>
            </div>

            {queryResult.meetingId && (
              <div className="flex items-center justify-between pt-2 border-t border-[#1E2127] text-xs">
                <span className="text-[#969AA3]">
                  Source: Enterprise Sales Discovery (00:22)
                </span>
                <button
                  onClick={() =>
                    navigate(
                      `/meetings/${queryResult.meetingId}?t=${queryResult.timestamp}&tab=transcript`
                    )
                  }
                  className="flex items-center gap-1 text-[#C7F36B] hover:underline font-medium"
                >
                  <span>Open moment</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter Tabs & Local Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-[#1E2127] pb-3">
        <div className="flex items-center gap-2 overflow-x-auto text-xs">
          {[
            { id: 'all', label: 'All Conversations' },
            { id: 'customer', label: 'Customer Deals' },
            { id: 'team', label: 'Engineering' },
            { id: 'one_on_one', label: '1-on-1s' },
          ].map((tab) => {
            const isActive = categoryFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCategoryFilter(tab.id as any)}
                className={`py-1 px-2.5 rounded transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-[#191C20] text-[#F2EFE8] font-medium'
                    : 'text-[#969AA3] hover:text-[#F2EFE8]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-56">
          <Search className="w-3.5 h-3.5 text-[#5E626B] absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter list..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full bg-[#121417] border border-[#1E2127] rounded pl-7 pr-3 py-1 text-xs text-[#F2EFE8] placeholder-[#5E626B] focus:outline-none focus:border-[#272B33] transition-colors"
          />
        </div>
      </div>

      {/* Content Stream */}
      {isLoading && meetings.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 text-[#C7F36B] animate-spin" />
          <p className="text-xs text-[#969AA3]">Loading conversations...</p>
        </div>
      ) : error && meetings.length === 0 ? (
        <div className="py-16 text-center border border-[#1E2127] rounded-lg p-6 bg-[#121417] flex flex-col items-center justify-center gap-3">
          <AlertCircle className="w-6 h-6 text-[#F26464]" />
          <p className="text-xs font-semibold text-[#F2EFE8]">
            Unable to load conversations.
          </p>
          <button
            onClick={() => loadWorkspaceData()}
            className="mt-1 flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#0B0C0E] bg-[#C7F36B] rounded"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      ) : filteredMeetings.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-[#1E2127] rounded-lg p-6">
          <p className="text-xs text-[#969AA3]">
            No conversations match your filter.
          </p>
          <button
            onClick={() => {
              setCategoryFilter('all');
              setLocalSearch('');
            }}
            className="mt-3 px-3 py-1 text-xs text-[#C7F36B] hover:underline"
          >
            Reset filter
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          {/* TODAY */}
          <section className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-mono font-medium uppercase tracking-[0.14em] text-[#C7F36B]">
                TODAY
              </span>
              <span className="text-[11px] text-[#5E626B]">
                {todayMeetings.length} sessions
              </span>
            </div>

            <div className="border-t border-[#1E2127] divide-y divide-[#1E2127]/80">
              {todayMeetings.map((meeting, idx) => {
                const slots = ['09:42', '11:18', '14:06'];
                return (
                  <MeetingCard
                    key={meeting.id}
                    meeting={meeting}
                    timeSlot={slots[idx] || '16:30'}
                  />
                );
              })}
            </div>
          </section>

          {/* THIS WEEK */}
          <section className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-mono font-medium uppercase tracking-[0.14em] text-[#969AA3]">
                THIS WEEK
              </span>
              <span className="text-[11px] text-[#5E626B]">
                Conversation archive
              </span>
            </div>

            <div className="border-t border-[#1E2127] divide-y divide-[#1E2127]/80">
              {thisWeekMeetings.map((meeting) => (
                <MeetingCard
                  key={`week-${meeting.id}`}
                  meeting={meeting}
                  timeSlot="16:30"
                  compact
                />
              ))}
            </div>

            {/* Compact Archive Rows */}
            <div className="border-t border-[#1E2127] divide-y divide-[#1E2127]/50 pt-2">
              {meetings.map((m) => {
                const openTasks = m.actionItems.filter((a) => !a.completed).length;
                const sum =
                  m.summaries[m.activeTemplateId] || Object.values(m.summaries)[0];
                return (
                  <div
                    key={`archive-${m.id}`}
                    onClick={() => navigate(`/meetings/${m.id}`)}
                    className="py-2 px-2 flex items-center justify-between gap-4 hover:bg-[#121417]/50 rounded cursor-pointer transition-colors text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-[11px] text-[#5E626B] w-20 flex-shrink-0">
                        {formatDate(m.date)}
                      </span>
                      <span className="text-[#F2EFE8] font-normal truncate">
                        {m.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0 text-xs text-[#969AA3]">
                      <span className="hidden sm:inline">
                        {sum?.keyTakeaways?.length || 0} decisions
                      </span>
                      <span>
                        {m.actionItems.length - openTasks}/{m.actionItems.length} tasks
                      </span>
                      <span className="font-mono text-[11px] text-[#5E626B] w-12 text-right">
                        {formatDuration(m.durationSeconds)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

