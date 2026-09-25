import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Play } from 'lucide-react';
import { Meeting } from '../../types';
import { formatDate, formatDuration } from '../../utils/formatters';

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
  const risksCount =
    meeting.highlights?.filter((h) => h.category === 'Objection').length ||
    (meeting.id === 'incident-post-mortem-p0' ? 2 : 1);

  return (
    <div
      onClick={() => navigate(`/meetings/${meeting.id}`)}
      className={`group relative cursor-pointer transition-colors border-b border-[#1E2127] hover:bg-[#121417] ${
        compact ? 'py-3 px-4' : 'py-4 px-4 sm:px-5'
      }`}
    >
      {/* Left active indicator bar on hover or featured */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-[2px] transition-colors ${
          isHero
            ? 'bg-[#C7F36B]'
            : 'bg-transparent group-hover:bg-[#C7F36B]/70'
        }`}
      />

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 md:gap-6">
        {/* Left Column: Time Gutter + Primary Editorial Hierarchy */}
        <div className="flex items-start gap-4 sm:gap-6 min-w-0 flex-1">
          {/* Tabular Time Column */}
          <div className="w-14 flex-shrink-0 pt-0.5 flex flex-col">
            <span
              className={`font-mono text-xs font-semibold tracking-tight ${
                isHero ? 'text-[#C7F36B]' : 'text-[#F2EFE8] group-hover:text-[#C7F36B]'
              }`}
            >
              {displayTime}
            </span>
            <span className="font-mono text-[10px] text-[#5E626B] mt-0.5">
              {formatDuration(meeting.durationSeconds)}
            </span>
          </div>

          {/* Conversation Identity & Narrative */}
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2.5 flex-wrap">
              <h3 className="text-sm sm:text-[15px] font-semibold text-[#F2EFE8] group-hover:text-[#C7F36B] transition-colors tracking-tight truncate">
                {meeting.title}
              </h3>
              <span className="text-xs text-[#969AA3] font-medium">
                {contextSubtitle}
              </span>
              {isHero && (
                <span className="inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-[0.12em] px-1.5 py-0.5 bg-[#C7F36B]/15 text-[#C7F36B] border border-[#C7F36B]/40">
                  <Play className="w-2 h-2 fill-current" />
                  Primary Recording
                </span>
              )}
            </div>

            {!compact && currentSummary?.overview && (
              <p className="text-xs text-[#969AA3] leading-relaxed line-clamp-1 mt-1 max-w-3xl">
                {currentSummary.overview}
              </p>
            )}

            {/* Semantic Event Indicators: [topics / decisions / actions / risks] */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap mt-2.5 font-mono text-[10px]">
              {/* Topics (Lime) */}
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#121417] group-hover:bg-[#191C20] border border-[#1E2127] text-[#F2EFE8]">
                <span className="w-1.5 h-1.5 bg-[#C7F36B]" />
                <span>{topicsCount} topics</span>
              </span>

              {/* Decisions (Amber) */}
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#121417] group-hover:bg-[#191C20] border border-[#1E2127] text-[#F2EFE8]">
                <span className="w-1.5 h-1.5 bg-[#F0B449]" />
                <span>{decisionsCount} decisions</span>
              </span>

              {/* Actions (Green) */}
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#121417] group-hover:bg-[#191C20] border border-[#1E2127] text-[#F2EFE8]">
                <span className="w-1.5 h-1.5 bg-[#47D18C]" />
                <span>
                  {actionsCount} actions ({actionsCount - pendingActions}/{actionsCount})
                </span>
              </span>

              {/* Risk / Question marker */}
              {risksCount > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#121417] group-hover:bg-[#191C20] border border-[#1E2127] text-[#969AA3]">
                  <span className="w-1.5 h-1.5 bg-[#F26464]" />
                  <span>{risksCount} risk{risksCount > 1 ? 's' : ''}</span>
                </span>
              )}

              <span className="text-[#5E626B] hidden sm:inline">
                · {formatDate(meeting.date)}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Speakers & Open Action */}
        <div className="flex items-center justify-between md:justify-end gap-4 pt-1 md:pt-0.5 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {meeting.participants.map((p) => (
                <img
                  key={p.id}
                  src={p.avatarUrl}
                  alt={p.name}
                  title={`${p.name} (${p.company})`}
                  className="w-5 h-5 rounded-sm border border-[#0B0C0E] object-cover"
                />
              ))}
            </div>
            <span className="text-[11px] text-[#969AA3] hidden lg:inline font-mono">
              {meeting.participants.map((p) => p.name.split(' ')[0]).join(', ')}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-mono text-[#969AA3] group-hover:text-[#C7F36B] transition-colors">
            <span className="hidden sm:inline">Open</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};

