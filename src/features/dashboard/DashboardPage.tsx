import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  Send,
  ArrowRight,
  CornerDownLeft,
  Bookmark,
  Loader2,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMeetingsStore } from '../../store/useMeetingsStore';
import { MeetingCard } from './MeetingCard';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    meetings,
    profile,
    isLoading,
    error,
    loadWorkspaceData,
    categoryFilter,
    setCategoryFilter,
  } = useMeetingsStore();
  const [localSearch, setLocalSearch] = useState('');
  const [assistantInput, setAssistantInput] = useState('');
  const [assistantAnswer, setAssistantAnswer] = useState<{
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
  const totalHighlights = meetings.reduce(
    (acc, m) => acc + (m.highlights?.length || 0) + (m.clips?.length || 0),
    0
  );

  const handleAskAssistant = (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const q = (customQuery || assistantInput).trim();
    if (!q) return;

    if (q.toLowerCase().includes('latency') || q.toLowerCase().includes('david')) {
      setAssistantAnswer({
        text: `David Chen at Acme Corp requires sub-80ms p99 latency at 10,000 RPM for their real-time telemetry pipeline. Sarah confirmed CloudScale averages 42ms p99 on AWS us-east-1 and can run a private benchmark.`,
        meetingId: 'enterprise-sales-discovery-acme',
        timestamp: 22.7,
      });
    } else if (q.toLowerCase().includes('security') || q.toLowerCase().includes('elena') || q.toLowerCase().includes('soc2')) {
      setAssistantAnswer({
        text: `Elena Rostova confirmed procurement will review vendor security in OneTrust. Sarah Lin agreed to provide the SOC2 Type II packet, penetration test report, and DPA addendum by Wednesday.`,
        meetingId: 'enterprise-sales-discovery-acme',
        timestamp: 68.4,
      });
    } else if (q.toLowerCase().includes('action') || q.toLowerCase().includes('task')) {
      setAssistantAnswer({
        text: `You have ${pendingActions} open follow-up items across ${meetings.length} meetings, including: Benchmark latency at 10k RPM (Sarah), Send SOC2 packet & DPA (Sarah), and Schedule architecture deep-dive (Elena).`,
        meetingId: 'enterprise-sales-discovery-acme',
        timestamp: 105.0,
      });
    } else {
      setAssistantAnswer({
        text: `From your workspace: David Chen at Acme Corp requires sub-80ms p99 latency at 10,000 RPM. Elena confirmed procurement will review vendor security in OneTrust once Sarah sends the SOC2 Type II packet by Wednesday.`,
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
    <div className="max-w-5xl mx-auto px-6 py-7 space-y-6">
      {/* Editorial Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-1">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-wider text-[#8B7CF6] mb-1 font-medium">
            Your conversation workspace
          </p>
          <h1 className="text-[22px] font-semibold text-[#F4F3EF] tracking-tight">
            Good evening, {profile?.name?.split(' ')[0] || 'Sarah'}
          </h1>
          <p className="text-[13px] text-[#A7A9B0] mt-1">
            Review recorded conversations, key decisions, and open follow-ups across your team.
          </p>
        </div>

        {/* Workspace Stat Pills */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#17191D] border border-[#23262D] rounded-lg text-xs">
            <Layers className="w-3.5 h-3.5 text-[#8B7CF6]" />
            <span className="font-semibold text-[#F4F3EF] font-mono text-[11px]">{meetings.length}</span>
            <span className="text-[#A7A9B0] text-[11px]">Meetings</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#17191D] border border-[#23262D] rounded-lg text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#55C89A]" />
            <span className="font-semibold text-[#F4F3EF] font-mono text-[11px]">{pendingActions}</span>
            <span className="text-[#A7A9B0] text-[11px]">Follow-ups</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#17191D] border border-[#23262D] rounded-lg text-xs">
            <Bookmark className="w-3.5 h-3.5 text-[#E7B45C]" />
            <span className="font-semibold text-[#F4F3EF] font-mono text-[11px]">{totalHighlights}</span>
            <span className="text-[#A7A9B0] text-[11px]">Highlights</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#17191D] border border-[#23262D] rounded-lg text-xs">
            <Clock className="w-3.5 h-3.5 text-[#A7A9B0]" />
            <span className="font-semibold text-[#F4F3EF] font-mono text-[11px]">{totalDurationMinutes}m</span>
          </div>
        </div>
      </div>

      {/* Meeting Assistant Query Box */}
      <div className="p-4 rounded-xl bg-[#17191D] border border-[#23262D] flex flex-col gap-3 shadow-sm">
        <form onSubmit={(e) => handleAskAssistant(e)} className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 text-[#F4F3EF] font-semibold text-xs flex-shrink-0">
            <div className="w-6 h-6 rounded-md bg-[#8B7CF6]/15 border border-[#8B7CF6]/30 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-[#8B7CF6]" />
            </div>
            <span className="hidden sm:inline">Meeting Assistant</span>
          </div>
          <input
            type="text"
            placeholder="Ask anything across your meetings (e.g. 'What were David's latency requirements?')"
            value={assistantInput}
            onChange={(e) => setAssistantInput(e.target.value)}
            className="flex-1 bg-[#101114] border border-[#23262D] rounded-lg px-3.5 py-2 text-xs text-[#F4F3EF] placeholder-[#6F737D] focus:outline-none focus:border-[#8B7CF6] transition-all"
          />
          <button
            type="submit"
            className="px-3.5 py-2 bg-[#8B7CF6] hover:bg-[#9D91FF] text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 shadow-sm shadow-[#8B7CF6]/20 active:scale-95 flex-shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ask</span>
          </button>
        </form>

        {/* Prompt Suggestion Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto select-none pt-0.5">
          <span className="text-[10px] text-[#6F737D] uppercase font-mono tracking-wider flex-shrink-0 mr-1">
            Prompts:
          </span>
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => {
                setAssistantInput(suggestion);
                handleAskAssistant(undefined, suggestion);
              }}
              className="px-2.5 py-1 rounded-md bg-[#101114] hover:bg-[#1D2025] text-[#A7A9B0] hover:text-[#F4F3EF] border border-[#23262D] hover:border-[#8B7CF6]/40 text-[11px] whitespace-nowrap transition-all flex items-center gap-1.5"
            >
              <span>{suggestion}</span>
              <CornerDownLeft className="w-2.5 h-2.5 opacity-60" />
            </button>
          ))}
        </div>

        {/* Assistant Answer Card */}
        {assistantAnswer && (
          <div className="p-3.5 bg-[#101114] border border-[#8B7CF6]/35 rounded-lg text-xs text-[#F4F3EF] leading-relaxed animate-in fade-in duration-150 flex flex-col gap-2.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#8B7CF6] flex-shrink-0 mt-0.5" />
                <p className="text-[#F4F3EF] text-xs leading-relaxed">{assistantAnswer.text}</p>
              </div>
              <button
                onClick={() => setAssistantAnswer(null)}
                className="text-[#6F737D] hover:text-[#F4F3EF] text-[10px] font-mono flex-shrink-0 px-1.5 py-0.5 rounded hover:bg-[#1D2025]"
              >
                Dismiss
              </button>
            </div>

            {assistantAnswer.meetingId && (
              <div className="flex items-center justify-between pt-2 border-t border-[#23262D]">
                <span className="text-[10px] text-[#6F737D] font-mono">
                  Source: Acme Corp Discovery Call
                </span>
                <button
                  onClick={() =>
                    navigate(
                      `/meetings/${assistantAnswer.meetingId}?t=${assistantAnswer.timestamp}&tab=transcript`
                    )
                  }
                  className="flex items-center gap-1 text-[11px] text-[#8B7CF6] hover:text-[#9D91FF] font-medium group"
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-[#23262D]">
        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#17191D] p-1 rounded-lg border border-[#23262D] overflow-x-auto">
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
                    ? 'bg-[#8B7CF6] text-white font-semibold shadow-sm'
                    : 'text-[#A7A9B0] hover:text-[#F4F3EF] hover:bg-[#1D2025]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#6F737D] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter calls or attendees..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full bg-[#17191D] border border-[#23262D] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#F4F3EF] placeholder-[#6F737D] focus:outline-none focus:border-[#8B7CF6] transition-colors"
          />
        </div>
      </div>

      {/* Section Header: Recorded Conversations */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6F737D] font-mono">
          Recorded Conversations
        </span>
        <span className="text-[11px] font-mono text-[#6F737D]">
          Showing {filteredMeetings.length} of {meetings.length}
        </span>
      </div>

      {/* Editorial Conversation Timeline List */}
      {isLoading && meetings.length === 0 ? (
        <div className="py-20 text-center border border-[#23262D] rounded-xl p-6 bg-[#17191D] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 text-[#8B7CF6] animate-spin" />
          <p className="text-xs font-semibold text-[#F4F3EF]">Loading meetings...</p>
          <p className="text-[11px] text-[#A7A9B0]">
            Fetching recorded conversations and insights from workspace database.
          </p>
        </div>
      ) : error && meetings.length === 0 ? (
        <div className="py-16 text-center border border-[#23262D] rounded-xl p-6 bg-[#17191D] flex flex-col items-center justify-center gap-3">
          <AlertCircle className="w-7 h-7 text-rose-400" />
          <p className="text-xs font-semibold text-[#F4F3EF]">
            Unable to load workspace meetings.
          </p>
          <p className="text-[11px] text-[#A7A9B0] max-w-md">
            Please verify your connection and workspace database configuration.
          </p>
          <button
            onClick={() => loadWorkspaceData()}
            className="mt-1 flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#8B7CF6] hover:bg-[#9D91FF] rounded-lg transition-colors shadow-sm shadow-[#8B7CF6]/20"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      ) : meetings.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-[#23262D] rounded-xl p-6 bg-[#17191D]">
          <Layers className="w-8 h-8 text-[#6F737D] mx-auto mb-2" />
          <p className="text-xs font-semibold text-[#F4F3EF]">No meetings in this workspace yet</p>
          <p className="text-[11px] text-[#A7A9B0] mt-1">
            Run the workspace seed script to populate your initial recorded conversations.
          </p>
        </div>
      ) : filteredMeetings.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filteredMeetings.map((meeting) => (
            <MeetingCard key={meeting.id} meeting={meeting} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center border border-dashed border-[#23262D] rounded-xl p-6 bg-[#17191D]">
          <Layers className="w-8 h-8 text-[#6F737D] mx-auto mb-2" />
          <p className="text-xs font-semibold text-[#F4F3EF]">No conversations match your filter</p>
          <button
            onClick={() => {
              setCategoryFilter('all');
              setLocalSearch('');
            }}
            className="mt-3 px-3 py-1.5 text-xs font-medium text-[#8B7CF6] bg-[#8B7CF6]/10 hover:bg-[#8B7CF6]/20 rounded-md transition-colors border border-[#8B7CF6]/25"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

