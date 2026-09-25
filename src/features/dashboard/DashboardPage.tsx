import React, { useState } from 'react';
import {
  Search,
  ArrowRight,
  CornerDownLeft,
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

  // Partition into TODAY (first 3 conversations) and THIS WEEK (remaining / full compact ledger)
  const todayMeetings = filteredMeetings.slice(0, 3);
  const thisWeekMeetings =
    filteredMeetings.length > 3 ? filteredMeetings.slice(3) : filteredMeetings;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      {/* Masthead: FANTHOM / Conversation workspace + Secondary Index Metrics */}
      <div className="border-b border-[#1E2127] pb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 bg-[#C7F36B]" />
            <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#C7F36B] font-semibold">
              FANTHOM
            </span>
          </div>
          <h1 className="text-2xl sm:text-[26px] font-semibold text-[#F2EFE8] tracking-tight leading-tight">
            Conversation workspace
          </h1>
          <p className="text-xs text-[#969AA3] mt-1 font-mono">
            Chronological index of recorded conversations, structural threads, decisions, and follow-ups.
          </p>
        </div>

        {/* Secondary Compact Metrics Ledger (No large SaaS cards) */}
        <div className="flex items-center gap-5 text-xs font-mono border-t lg:border-t-0 pt-3 lg:pt-0 border-[#1E2127] flex-wrap">
          <div>
            <span className="text-[#5E626B] uppercase text-[10px] block">Indexed</span>
            <span className="text-[#F2EFE8] font-semibold">{meetings.length} calls</span>
            <span className="text-[#969AA3] ml-1">({totalDurationMinutes}m)</span>
          </div>
          <div className="h-6 w-[1px] bg-[#1E2127]" />
          <div>
            <span className="text-[#5E626B] uppercase text-[10px] block">Decisions</span>
            <span className="text-[#F0B449] font-semibold">{totalDecisions}</span>
          </div>
          <div className="h-6 w-[1px] bg-[#1E2127]" />
          <div>
            <span className="text-[#5E626B] uppercase text-[10px] block">Follow-ups</span>
            <span className="text-[#47D18C] font-semibold">{pendingActions} open</span>
          </div>
          <div className="h-6 w-[1px] bg-[#1E2127]" />
          <div>
            <span className="text-[#5E626B] uppercase text-[10px] block">Highlights</span>
            <span className="text-[#C7F36B] font-semibold">{totalHighlights}</span>
          </div>
        </div>
      </div>

      {/* Product-Oriented Ask / Find Bar */}
      <div className="bg-[#121417] border border-[#1E2127] p-3.5 space-y-2.5">
        <form onSubmit={(e) => handleQuerySubmit(e)} className="flex items-center gap-2.5">
          <span className="text-[10px] font-mono uppercase tracking-[0.14em] px-2 py-1 bg-[#0B0C0E] text-[#C7F36B] border border-[#1E2127] flex-shrink-0">
            Ask / Find
          </span>
          <input
            type="text"
            placeholder="Find decisions, questions, risks, or follow-ups across conversations..."
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            className="flex-1 bg-[#0B0C0E] border border-[#1E2127] px-3 py-1.5 text-xs text-[#F2EFE8] placeholder-[#5E626B] focus:outline-none focus:border-[#C7F36B] transition-colors"
          />
          <button
            type="submit"
            className="px-3.5 py-1.5 bg-[#C7F36B] hover:bg-[#d4f788] text-[#0B0C0E] text-xs font-mono font-semibold uppercase tracking-wider transition-colors flex-shrink-0"
          >
            Ask
          </button>
        </form>

        {/* Quick Query Triggers */}
        <div className="flex items-center gap-2 overflow-x-auto select-none">
          <span className="text-[10px] text-[#5E626B] uppercase font-mono tracking-wider flex-shrink-0">
            Find:
          </span>
          {quickQueries.map((q) => (
            <button
              key={q}
              onClick={() => {
                setQueryInput(q);
                handleQuerySubmit(undefined, q);
              }}
              className="px-2 py-0.5 bg-[#0B0C0E] hover:bg-[#191C20] text-[#969AA3] hover:text-[#F2EFE8] border border-[#1E2127] hover:border-[#272B33] text-[11px] font-mono whitespace-nowrap transition-colors flex items-center gap-1.5"
            >
              <span>{q}</span>
              <CornerDownLeft className="w-2.5 h-2.5 text-[#5E626B]" />
            </button>
          ))}
        </div>

        {/* Query Response Readout */}
        {queryResult && (
          <div className="p-3 bg-[#0B0C0E] border-l-2 border-[#C7F36B] border border-[#1E2127] text-xs text-[#F2EFE8] space-y-2">
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs leading-relaxed text-[#F2EFE8]">{queryResult.text}</p>
              <button
                onClick={() => setQueryResult(null)}
                className="text-[#969AA3] hover:text-[#F2EFE8] text-[10px] font-mono flex-shrink-0 px-1.5 py-0.5 border border-[#1E2127]"
              >
                Close
              </button>
            </div>

            {queryResult.meetingId && (
              <div className="flex items-center justify-between pt-2 border-t border-[#1E2127] font-mono text-[11px]">
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
                  <span>Open conversation at timestamp</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stream Filter & Local Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-[#1E2127] pb-3">
        <div className="flex items-center gap-1 overflow-x-auto font-mono">
          {[
            { id: 'all', label: 'All Conversations' },
            { id: 'customer', label: 'Customer' },
            { id: 'team', label: 'Engineering' },
            { id: 'one_on_one', label: '1-on-1' },
          ].map((tab) => {
            const isActive = categoryFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCategoryFilter(tab.id as any)}
                className={`px-3 py-1 text-xs transition-colors whitespace-nowrap border ${
                  isActive
                    ? 'bg-[#191C20] text-[#C7F36B] border-[#C7F36B]/50 font-semibold'
                    : 'bg-transparent text-[#969AA3] hover:text-[#F2EFE8] border-transparent hover:border-[#1E2127]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#5E626B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter timeline..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full bg-[#121417] border border-[#1E2127] pl-8 pr-3 py-1 text-xs text-[#F2EFE8] placeholder-[#5E626B] focus:outline-none focus:border-[#C7F36B] transition-colors font-mono"
          />
        </div>
      </div>

      {/* Loading / Error / Empty States */}
      {isLoading && meetings.length === 0 ? (
        <div className="py-20 text-center border border-[#1E2127] p-6 bg-[#121417] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 text-[#C7F36B] animate-spin" />
          <p className="text-xs font-mono uppercase tracking-wider text-[#F2EFE8]">
            Loading conversation timeline...
          </p>
        </div>
      ) : error && meetings.length === 0 ? (
        <div className="py-16 text-center border border-[#1E2127] p-6 bg-[#121417] flex flex-col items-center justify-center gap-3">
          <AlertCircle className="w-6 h-6 text-[#F26464]" />
          <p className="text-xs font-semibold text-[#F2EFE8]">
            Unable to load workspace conversations.
          </p>
          <button
            onClick={() => loadWorkspaceData()}
            className="mt-1 flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-semibold text-[#0B0C0E] bg-[#C7F36B]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      ) : filteredMeetings.length === 0 ? (
        <div className="py-16 text-center border border-[#1E2127] p-6 bg-[#121417]">
          <p className="text-xs font-mono text-[#969AA3]">
            No conversations match the active filter.
          </p>
          <button
            onClick={() => {
              setCategoryFilter('all');
              setLocalSearch('');
            }}
            className="mt-3 px-3 py-1 text-xs font-mono text-[#C7F36B] border border-[#C7F36B]/40 hover:bg-[#191C20]"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* SECTION 1: TODAY — Primary Conversation Timeline */}
          <section className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2.5">
                <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.16em] text-[#C7F36B]">
                  TODAY
                </span>
                <span className="text-[11px] font-mono text-[#5E626B]">
                  — Active Conversation Stream
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-3 text-[10px] font-mono text-[#969AA3]">
                <span className="inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[#C7F36B]" /> Topic
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[#F0B449]" /> Decision
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[#47D18C]" /> Action
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[#F26464]" /> Risk
                </span>
              </div>
            </div>

            <div className="border-t border-l border-r border-[#1E2127] bg-[#0B0C0E]">
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

          {/* SECTION 2: THIS WEEK — Compact Conversation History */}
          <section className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2.5">
                <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.16em] text-[#969AA3]">
                  THIS WEEK
                </span>
                <span className="text-[11px] font-mono text-[#5E626B]">
                  — Compact Conversation History
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#5E626B]">
                {filteredMeetings.length} recorded sessions
              </span>
            </div>

            <div className="border-t border-l border-r border-[#1E2127] bg-[#0B0C0E]">
              {thisWeekMeetings.map((meeting) => (
                <MeetingCard
                  key={`week-${meeting.id}`}
                  meeting={meeting}
                  timeSlot="16:30"
                  compact
                />
              ))}
            </div>

            {/* Compact Weekly Archive Ledger Table */}
            <div className="border border-[#1E2127] bg-[#121417] divide-y divide-[#1E2127]">
              {meetings.map((m) => {
                const openTasks = m.actionItems.filter((a) => !a.completed).length;
                const sum =
                  m.summaries[m.activeTemplateId] || Object.values(m.summaries)[0];
                return (
                  <div
                    key={`ledger-${m.id}`}
                    onClick={() => navigate(`/meetings/${m.id}`)}
                    className="px-4 py-2.5 flex items-center justify-between gap-4 hover:bg-[#191C20] cursor-pointer transition-colors text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-[10px] text-[#5E626B] w-20 flex-shrink-0">
                        {formatDate(m.date)}
                      </span>
                      <span className="text-[#F2EFE8] font-medium truncate">
                        {m.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0 font-mono text-[11px]">
                      <span className="text-[#F0B449] hidden sm:inline">
                        {sum?.keyTakeaways?.length || 0} decisions
                      </span>
                      <span className="text-[#47D18C]">
                        {m.actionItems.length - openTasks}/{m.actionItems.length} follow-ups
                      </span>
                      <span className="text-[#969AA3] w-12 text-right">
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

