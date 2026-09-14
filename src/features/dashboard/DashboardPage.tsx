import React, { useState } from 'react';
import { Search, CheckCircle2, Clock, Video, Sparkles, Send, ArrowRight, CornerDownLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMeetingsStore } from '../../store/useMeetingsStore';
import { MeetingCard } from './MeetingCard';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { meetings, categoryFilter, setCategoryFilter } = useMeetingsStore();
  const [localSearch, setLocalSearch] = useState('');
  const [askFathomInput, setAskFathomInput] = useState('');
  const [askFathomAnswer, setAskFathomAnswer] = useState<{
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

  const handleAskFathom = (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const q = (customQuery || askFathomInput).trim();
    if (!q) return;

    if (q.toLowerCase().includes('latency') || q.toLowerCase().includes('david')) {
      setAskFathomAnswer({
        text: `David Chen at Acme Corp requires sub-80ms p99 latency at 10,000 RPM for their real-time telemetry pipeline. Sarah confirmed CloudScale averages 42ms p99 on AWS us-east-1 and can run a private benchmark.`,
        meetingId: 'enterprise-sales-discovery-acme',
        timestamp: 22.7,
      });
    } else if (q.toLowerCase().includes('security') || q.toLowerCase().includes('elena') || q.toLowerCase().includes('soc2')) {
      setAskFathomAnswer({
        text: `Elena Rostova confirmed procurement will review vendor security in OneTrust. Sarah Lin agreed to provide the SOC2 Type II packet, penetration test report, and DPA addendum by Wednesday.`,
        meetingId: 'enterprise-sales-discovery-acme',
        timestamp: 68.4,
      });
    } else if (q.toLowerCase().includes('action') || q.toLowerCase().includes('task')) {
      setAskFathomAnswer({
        text: `You have 4 total open action items across 4 meetings, including: Benchmark latency at 10k RPM (Sarah), Send SOC2 packet & DPA (Sarah), and Schedule architecture deep-dive (Elena).`,
        meetingId: 'enterprise-sales-discovery-acme',
        timestamp: 105.0,
      });
    } else {
      setAskFathomAnswer({
        text: `From your calls: David Chen at Acme Corp requires sub-80ms p99 latency at 10,000 RPM. Elena confirmed procurement will review vendor security in OneTrust once Sarah sends the SOC2 Type II packet by Wednesday.`,
        meetingId: 'enterprise-sales-discovery-acme',
        timestamp: 22.7,
      });
    }
  };

  const suggestions = [
    "What were David Chen's latency requirements?",
    "Show Elena's security & procurement next steps",
    "List all uncompleted action items",
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            Meetings
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#13151f] text-zinc-400 border border-[#202332] font-mono">
              {meetings.length} calls
            </span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Recorded video & audio with synchronized transcripts and AI summaries.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0e0f14] border border-[#191b24] rounded-lg text-xs shadow-inner">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-zinc-400 text-[11px]">Recorded:</span>
            <span className="font-semibold text-zinc-200 font-mono text-[11px]">{totalDurationMinutes}m</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0e0f14] border border-[#191b24] rounded-lg text-xs shadow-inner">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-zinc-400 text-[11px]">Tasks:</span>
            <span className="font-semibold text-cyan-300 font-mono text-[11px]">{pendingActions} open</span>
          </div>
        </div>
      </div>

      {/* Ask Fathom AI Search Box */}
      <div className="p-4 rounded-xl bg-gradient-to-b from-[#10121b] to-[#0c0d13] border border-cyan-500/25 shadow-lg shadow-cyan-950/20 flex flex-col gap-3">
        <form onSubmit={(e) => handleAskFathom(e)} className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-cyan-400 font-semibold text-xs flex-shrink-0">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Ask Fathom:</span>
          </div>
          <input
            type="text"
            placeholder="Ask anything across your meetings (e.g. 'What were David's latency requirements?')"
            value={askFathomInput}
            onChange={(e) => setAskFathomInput(e.target.value)}
            className="flex-1 bg-[#07080c] border border-[#1d202d] rounded-lg px-3.5 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-400/70 focus:ring-1 focus:ring-cyan-400/30 transition-all"
          />
          <button
            type="submit"
            className="px-3 py-2 bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 shadow-sm shadow-cyan-500/25 active:scale-95 flex-shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ask</span>
          </button>
        </form>

        {/* Suggestion Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto select-none pt-0.5">
          <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider flex-shrink-0 mr-1">
            Try:
          </span>
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => {
                setAskFathomInput(suggestion);
                handleAskFathom(undefined, suggestion);
              }}
              className="px-2.5 py-1 rounded-md bg-[#131520] hover:bg-[#191c2c] text-zinc-400 hover:text-cyan-300 border border-[#1f2232] hover:border-cyan-500/30 text-[11px] whitespace-nowrap transition-all flex items-center gap-1.5"
            >
              <span>{suggestion}</span>
              <CornerDownLeft className="w-2.5 h-2.5 opacity-60" />
            </button>
          ))}
        </div>

        {/* AI Answer Card */}
        {askFathomAnswer && (
          <div className="p-3.5 bg-[#090a0f] border border-cyan-500/35 rounded-lg text-xs text-zinc-300 leading-relaxed animate-in fade-in duration-150 flex flex-col gap-2.5 shadow-inner">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <p className="text-zinc-200 text-xs leading-relaxed">{askFathomAnswer.text}</p>
              </div>
              <button
                onClick={() => setAskFathomAnswer(null)}
                className="text-zinc-500 hover:text-zinc-300 text-[10px] font-mono flex-shrink-0 px-1 py-0.5 rounded hover:bg-[#141622]"
              >
                Dismiss
              </button>
            </div>

            {askFathomAnswer.meetingId && (
              <div className="flex items-center justify-between pt-2 border-t border-[#181a24]">
                <span className="text-[10px] text-zinc-500 font-mono">
                  Source: Acme Corp Discovery Call
                </span>
                <button
                  onClick={() =>
                    navigate(
                      `/meetings/${askFathomAnswer.meetingId}?t=${askFathomAnswer.timestamp}&tab=transcript`
                    )
                  }
                  className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-medium group"
                >
                  <span>Jump to moment in call</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-[#161822]">
        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#0c0d12] p-1 rounded-lg border border-[#191b24] overflow-x-auto">
          {[
            { id: 'all', label: 'All Meetings' },
            { id: 'customer', label: 'Customer Deals' },
            { id: 'team', label: 'Engineering & Ops' },
            { id: 'one_on_one', label: '1-on-1s' },
          ].map((tab) => {
            const isActive = categoryFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCategoryFilter(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-400 text-black font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#141620]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-60">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter calls or attendees..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full bg-[#0c0d12] border border-[#191b24] rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-400/60 transition-colors shadow-inner"
          />
        </div>
      </div>

      {/* Section Header: Recent Recordings */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
          Recent Recordings
        </span>
        <span className="text-[11px] font-mono text-zinc-500">
          {filteredMeetings.length} of {meetings.length} calls
        </span>
      </div>

      {/* Meetings Grid */}
      {filteredMeetings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMeetings.map((meeting) => (
            <MeetingCard key={meeting.id} meeting={meeting} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center border border-dashed border-[#1c1e27] rounded-xl p-6 bg-[#0c0d12]">
          <Video className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <p className="text-xs font-semibold text-zinc-300">No calls match your filter</p>
          <button
            onClick={() => {
              setCategoryFilter('all');
              setLocalSearch('');
            }}
            className="mt-3 px-3 py-1.5 text-xs font-medium text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-md transition-colors border border-cyan-500/20"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

