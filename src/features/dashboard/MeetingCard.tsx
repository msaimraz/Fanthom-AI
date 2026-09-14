import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, Volume2, ArrowRight, Play } from 'lucide-react';
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
    customer: { label: 'Customer', color: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/25' },
    team: { label: 'Engineering', color: 'bg-[#181a24] text-zinc-300 border-[#242738]' },
    one_on_one: { label: '1-on-1', color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25' },
    executive: { label: 'Executive', color: 'bg-amber-500/10 text-amber-300 border-amber-500/25' },
  };

  const categoryMeta = categoryLabels[meeting.category] || {
    label: meeting.category,
    color: 'bg-zinc-800 text-zinc-300 border-zinc-700',
  };

  return (
    <div
      onClick={() => navigate(`/meetings/${meeting.id}`)}
      className={`group relative bg-[#0f1016] hover:bg-[#13151f] border rounded-xl p-4 cursor-pointer transition-all duration-200 flex flex-col justify-between shadow-sm hover:shadow-md ${
        isHero
          ? 'border-cyan-500/35 hover:border-cyan-400/80 shadow-cyan-950/20 ring-1 ring-cyan-500/20 hover:ring-cyan-400/40'
          : 'border-[#191b26] hover:border-[#2a2e40]'
      }`}
    >
      <div>
        {/* Top media thumbnail preview container */}
        <div className="relative w-full h-24 rounded-lg bg-gradient-to-br from-[#0c0d12] to-[#141622] border border-[#1b1e2c] mb-3 overflow-hidden flex items-center justify-center group-hover:border-cyan-500/30 transition-colors">
          {/* Subtle audio waveform illustration */}
          <div className="flex items-center gap-1 opacity-25 group-hover:opacity-45 transition-opacity">
            {[24, 40, 60, 32, 55, 75, 45, 80, 50, 65, 30, 70, 48, 85, 40, 20, 50, 35].map((h, idx) => (
              <div
                key={idx}
                className="w-1 bg-cyan-400 rounded-full"
                style={{ height: `${h * 0.5}px` }}
              />
            ))}
          </div>

          {/* Hover Play indicator */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <div className="w-9 h-9 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-lg shadow-cyan-500/30 transform group-hover:scale-105 transition-transform">
              <Play className="w-4 h-4 ml-0.5 fill-black" />
            </div>
          </div>

          {/* Top badges on thumbnail */}
          <div className="absolute top-2 left-2 flex items-center gap-1.5">
            <span
              className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border backdrop-blur-md ${categoryMeta.color}`}
            >
              {categoryMeta.label}
            </span>
            {isHero && (
              <span className="flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full bg-cyan-400 text-black shadow-sm font-mono">
                <Volume2 className="w-2.5 h-2.5" />
                Hero Audio
              </span>
            )}
          </div>

          {/* Duration badge in bottom-right */}
          <span className="absolute bottom-2 right-2 font-mono text-[10px] bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-zinc-200 border border-white/10 shadow-sm">
            {formatDuration(meeting.durationSeconds)}
          </span>
        </div>

        {/* Date and Metadata */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[11px] text-zinc-500 font-mono">
            {formatDate(meeting.date)}
          </span>
          {meeting.chapters && (
            <span className="text-[10px] text-zinc-500 font-mono">
              {meeting.chapters.length} chapters
            </span>
          )}
        </div>

        {/* Meeting Title */}
        <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-cyan-300 transition-colors line-clamp-1 mb-1.5">
          {meeting.title}
        </h3>

        {/* Summary Snippet */}
        <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2 mb-3">
          {currentSummary?.overview || 'Meeting transcript captured and analyzed.'}
        </p>
      </div>

      {/* Footer Attendees & Task Metrics */}
      <div className="pt-3 border-t border-[#181a24] flex items-center justify-between">
        {/* Participants Avatars */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {meeting.participants.map((p) => (
              <img
                key={p.id}
                src={p.avatarUrl}
                alt={p.name}
                title={`${p.name} (${p.company})`}
                className="w-5 h-5 rounded-full border-2 border-[#0f1016] object-cover"
              />
            ))}
          </div>
          <span className="text-[11px] text-zinc-400 font-medium">
            {meeting.participants.map((p) => p.name.split(' ')[0]).join(', ')}
          </span>
        </div>

        {/* Tasks & Chevron */}
        <div className="flex items-center gap-2.5 text-xs text-zinc-400">
          <div className="flex items-center gap-1.5 text-[11px] bg-[#141620] px-2 py-0.5 rounded border border-[#1e2230]">
            <CheckSquare className="w-3 h-3 text-cyan-400" />
            <span className="font-mono">
              {meeting.actionItems.length - pendingActions}/{meeting.actionItems.length}
            </span>
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </div>
  );
};

