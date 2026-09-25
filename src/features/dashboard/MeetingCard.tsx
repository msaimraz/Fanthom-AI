import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { Meeting } from '../../types';
import { formatDuration } from '../../utils/formatters';

interface MeetingCardProps {
  meeting: Meeting;
  timeSlot?: string;
  compact?: boolean;
}

export const MeetingCard: React.FC<MeetingCardProps> = ({
  meeting,
  timeSlot,
  compact = false,
}) => {
  const navigate = useNavigate();
  const isHero = meeting.id === 'enterprise-sales-discovery-acme';
  const pendingActions = meeting.actionItems.filter((a) => !a.completed).length;
  const currentSummary =
    meeting.summaries[meeting.activeTemplateId] || Object.values(meeting.summaries)[0];

  const defaultTimeSlots: Record<string, string> = {
    'enterprise-sales-discovery-acme': '09:42',
    'product-sync-mobile-app': '11:18',
    'incident-post-mortem-p0': '14:06',
    'manager-1-on-1-career-growth': '16:30',
  };

  const displayTime = timeSlot || defaultTimeSlots[meeting.id] || '10:15';

  const contextSubtitleMap: Record<string, string> = {
    'enterprise-sales-discovery-acme': 'Acme × CloudScale',
    'product-sync-mobile-app': 'Mobile App × Product Strategy',
    'incident-post-mortem-p0': 'Auth Service × Core SRE',
    'manager-1-on-1-career-growth': 'Platform Architecture × 1:1',
  };

  const contextSubtitle =
    contextSubtitleMap[meeting.id] ||
    Array.from(new Set(meeting.participants.map((p) => p.company))).join(' × ');

  const topicsCount = meeting.chapters?.length || 4;
  const decisionsCount =
    (currentSummary?.keyTakeaways?.length || 0) +
    (meeting.highlights?.filter((h) => h.category === 'Key Decision').length || 0);
  const actionsCount = meeting.actionItems.length;

  return (
    <div
      onClick={() => navigate(`/meetings/${meeting.id}`)}
      className={`group relative cursor-pointer transition-colors border-b border-[#1E2127]/80 hover:bg-[#121417]/80 ${
        compact ? 'py-3.5 px-4' : 'py-4.5 px-4 sm:px-6'
      }`}
    >
      {/* Subtle hairline indicator on left for hero or hover */}
      <div
        className={`absolute left-0 top-3 bottom-3 w-[2px] transition-colors ${
          isHero
            ? 'bg-[#C7F36B]'
            : 'bg-transparent group-hover:bg-[#C7F36B]/60'
        }`}
      />

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 md:gap-6">
        {/* Main Content Area */}
        <div className="min-w-0 flex-1 space-y-1">
          {/* 1. TIME */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[#969AA3] font-medium tracking-tight">
              {displayTime}
            </span>
            {isHero && (
              <span className="text-[10px] text-[#C7F36B] font-medium tracking-tight">
                Featured
              </span>
            )}
          </div>

          {/* 2. Meeting Title */}
          <h3 className="text-[15px] sm:text-base font-semibold text-[#F2EFE8] group-hover:text-[#C7F36B] transition-colors tracking-tight leading-snug">
            {meeting.title}
          </h3>

          {/* 3. Organization */}
          <p className="text-xs text-[#969AA3] font-normal">
            {contextSubtitle}
          </p>

          {/* 4. One-line meeting description */}
          {!compact && currentSummary?.overview && (
            <p className="text-xs sm:text-[13px] text-[#969AA3] leading-relaxed line-clamp-1 pt-0.5 max-w-3xl">
              {currentSummary.overview}
            </p>
          )}

          {/* 5. Small metadata: topics · decisions · actions (unboxed, clean typography) */}
          <div className="flex items-center gap-2 pt-1 text-xs text-[#969AA3] flex-wrap">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C7F36B]" />
              <span>{topicsCount} topics</span>
            </span>

            <span className="text-[#5E626B]">·</span>

            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F0B449]" />
              <span>{decisionsCount} decisions</span>
            </span>

            <span className="text-[#5E626B]">·</span>

            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#47D18C]" />
              <span>
                {actionsCount} actions ({actionsCount - pendingActions}/{actionsCount})
              </span>
            </span>
          </div>
        </div>

        {/* Secondary Info: Participants & Duration (Quiet right column) */}
        <div className="flex items-center justify-between md:justify-end gap-4 pt-1 md:pt-1 flex-shrink-0 text-xs text-[#969AA3]">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {meeting.participants.map((p) => (
                <img
                  key={p.id}
                  src={p.avatarUrl}
                  alt={p.name}
                  title={`${p.name} (${p.company})`}
                  className="w-5 h-5 rounded-full border border-[#0B0C0E] object-cover"
                />
              ))}
            </div>
            <span className="text-[11px] text-[#969AA3] hidden lg:inline">
              {meeting.participants.map((p) => p.name.split(' ')[0]).join(', ')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] text-[#969AA3]">
              {formatDuration(meeting.durationSeconds)}
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#5E626B] group-hover:text-[#C7F36B] transition-colors" />
          </div>
        </div>
      </div>
    </div>
  );
};

