import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, Volume2, ArrowRight, Play, Calendar } from 'lucide-react';
import { Meeting } from '../../types';
import { formatDate, formatDuration } from '../../utils/formatters';

interface MeetingCardProps {
  meeting: Meeting;
}

export const MeetingCard: React.FC<MeetingCardProps> = ({ meeting }) => {
  const navigate = useNavigate();
  const isHero = meeting.id === 'enterprise-sales-discovery-acme';
  const pendingActions = meeting.actionItems.filter((a) => !a.completed).length;
  const currentSummary = meeting.summaries[meeting.activeTemplateId] || Object.values(meeting.summaries)[0];

  const categoryLabels: Record<string, { label: string; color: string }> = {
    customer: { label: 'Customer', color: 'bg-[#8B7CF6]/10 text-[#8B7CF6] border-[#8B7CF6]/25' },
    team: { label: 'Engineering', color: 'bg-[#E7B45C]/10 text-[#E7B45C] border-[#E7B45C]/25' },
    one_on_one: { label: '1-on-1', color: 'bg-[#55C89A]/10 text-[#55C89A] border-[#55C89A]/25' },
    executive: { label: 'Executive', color: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/25' },
  };

  const categoryMeta = categoryLabels[meeting.category] || {
    label: meeting.category,
    color: 'bg-[#23262D] text-[#A7A9B0] border-[#2C3039]',
  };

  return (
    <div
      onClick={() => navigate(`/meetings/${meeting.id}`)}
      className={`group relative cursor-pointer bg-[#17191D] hover:bg-[#1D2025] border rounded-xl p-4.5 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:shadow-md ${
        isHero
          ? 'border-[#8B7CF6]/40 hover:border-[#8B7CF6]/80 ring-1 ring-[#8B7CF6]/20 shadow-[#8B7CF6]/5'
          : 'border-[#23262D] hover:border-[#2C3039]'
      }`}
    >
      {/* Left / Middle: Details & Snippet */}
      <div className="flex-1 min-w-0 flex items-start gap-4">
        {/* Play / Duration badge container */}
        <div className="w-12 h-12 rounded-xl bg-[#101114] border border-[#23262D] group-hover:border-[#8B7CF6]/40 flex-shrink-0 flex flex-col items-center justify-center transition-colors">
          <Play className="w-4 h-4 text-[#A7A9B0] group-hover:text-[#8B7CF6] ml-0.5 fill-current transition-colors" />
          <span className="text-[9px] font-mono text-[#6F737D] mt-0.5">
            {formatDuration(meeting.durationSeconds)}
          </span>
        </div>

        {/* Text information */}
        <div className="flex-1 min-w-0">
          {/* Metadata badges row */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider font-mono ${categoryMeta.color}`}
            >
              {categoryMeta.label}
            </span>

            {isHero && (
              <span className="flex items-center gap-1 text-[9px] font-medium px-2 py-0.5 rounded-full bg-[#8B7CF6]/15 text-[#8B7CF6] border border-[#8B7CF6]/30 font-mono">
                <Volume2 className="w-2.5 h-2.5" />
                Featured Audio
              </span>
            )}

            <span className="text-[11px] text-[#6F737D] font-mono flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#6F737D]" />
              {formatDate(meeting.date)}
            </span>

            {meeting.chapters && (
              <span className="text-[10px] text-[#6F737D] font-mono hidden sm:inline">
                • {meeting.chapters.length} chapters
              </span>
            )}
          </div>

          {/* Meeting Title */}
          <h3 className="text-sm md:text-[15px] font-semibold text-[#F4F3EF] group-hover:text-[#8B7CF6] transition-colors truncate mb-1">
            {meeting.title}
          </h3>

          {/* Summary Preview */}
          <p className="text-xs text-[#A7A9B0] leading-relaxed line-clamp-2 md:line-clamp-1 max-w-2xl">
            {currentSummary?.overview || 'Meeting transcript captured and analyzed.'}
          </p>
        </div>
      </div>

      {/* Right: Attendees, Tasks, and Arrow */}
      <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-[#23262D]/60 flex-shrink-0">
        {/* Attendees */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {meeting.participants.map((p) => (
              <img
                key={p.id}
                src={p.avatarUrl}
                alt={p.name}
                title={`${p.name} (${p.company})`}
                className="w-6 h-6 rounded-full border-2 border-[#17191D] object-cover"
              />
            ))}
          </div>
          <span className="text-xs text-[#A7A9B0] hidden xl:inline font-medium">
            {meeting.participants.map((p) => p.name.split(' ')[0]).join(', ')}
          </span>
        </div>

        {/* Task Metric */}
        <div className="flex items-center gap-1.5 text-xs bg-[#101114] px-2.5 py-1 rounded-lg border border-[#23262D]">
          <CheckSquare className="w-3.5 h-3.5 text-[#55C89A]" />
          <span className="font-mono text-[11px] text-[#A7A9B0]">
            {meeting.actionItems.length - pendingActions}/{meeting.actionItems.length}
          </span>
        </div>

        {/* Chevron arrow */}
        <div className="w-7 h-7 rounded-lg bg-[#101114] group-hover:bg-[#8B7CF6]/15 border border-[#23262D] group-hover:border-[#8B7CF6]/30 flex items-center justify-center transition-colors">
          <ArrowRight className="w-3.5 h-3.5 text-[#6F737D] group-hover:text-[#8B7CF6] group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </div>
  );
};

