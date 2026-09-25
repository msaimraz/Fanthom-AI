import React, { useState } from 'react';
import {
  Copy,
  Check,
  TrendingUp,
  Briefcase,
  Terminal,
  UserCheck,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { Meeting } from '../../types';
import { useMeetingsStore } from '../../store/useMeetingsStore';
import { SUMMARY_TEMPLATES } from '../../data/templates';

interface SummaryViewProps {
  meeting: Meeting;
}

export const SummaryView: React.FC<SummaryViewProps> = ({ meeting }) => {
  const { setMeetingTemplate } = useMeetingsStore();
  const [copied, setCopied] = useState(false);

  const activeTemplateId = meeting.activeTemplateId || meeting.availableTemplateIds[0];
  const summary = meeting.summaries[activeTemplateId] || Object.values(meeting.summaries)[0];

  const handleCopy = () => {
    if (!summary) return;
    const textToCopy = `### ${meeting.title} — ${summary.templateName}\n\n**Overview:**\n${summary.overview}\n\n**Key Takeaways:**\n${summary.keyTakeaways.map((t) => `- ${t}`).join('\n')}\n\n${summary.nextSteps ? `**Next Steps:**\n${summary.nextSteps.map((s) => `- ${s}`).join('\n')}` : ''}`;

    navigator.clipboard?.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTemplateIcon = (id: string) => {
    switch (id) {
      case 'sales':
        return <TrendingUp className="w-3.5 h-3.5" />;
      case 'executive':
        return <Briefcase className="w-3.5 h-3.5" />;
      case 'engineering':
        return <Terminal className="w-3.5 h-3.5" />;
      case 'one_on_one':
        return <UserCheck className="w-3.5 h-3.5" />;
      default:
        return <Layers className="w-3.5 h-3.5" />;
    }
  };

  if (!summary) {
    return (
      <div className="p-8 text-center text-xs text-[#6F737D]">
        No summary generated for this meeting.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#17191D] border border-[#23262D] rounded-xl overflow-hidden">
      {/* Top Header & Template Selector */}
      <div className="p-3.5 border-b border-[#23262D] bg-[#17191D] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Template switcher pill group */}
        <div className="flex items-center gap-1.5 overflow-x-auto select-none">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6F737D] font-mono mr-1">
            Perspective:
          </span>
          {meeting.availableTemplateIds.map((templateId) => {
            const templateMeta = SUMMARY_TEMPLATES[templateId] || {
              id: templateId,
              name: templateId,
            };
            const isSelected = activeTemplateId === templateId;

            return (
              <button
                key={templateId}
                onClick={() => setMeetingTemplate(meeting.id, templateId)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#8B7CF6] text-white font-semibold shadow-sm shadow-[#8B7CF6]/20'
                    : 'bg-[#101114] text-[#A7A9B0] hover:text-[#F4F3EF] hover:bg-[#1D2025] border border-[#23262D]'
                }`}
              >
                {getTemplateIcon(templateId)}
                <span>{templateMeta.name}</span>
              </button>
            );
          })}
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#101114] hover:bg-[#1D2025] text-[#A7A9B0] hover:text-[#F4F3EF] rounded-lg transition-colors border border-[#23262D] ml-auto"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#55C89A] stroke-[2.5]" />
              <span className="text-[#55C89A] font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-[#6F737D]" />
              <span>Copy Notes</span>
            </>
          )}
        </button>
      </div>

      {/* Summary Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Executive / Meeting Overview */}
        <div className="p-4 rounded-xl bg-[#14161f] bg-[#101114] border border-[#23262D] shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-[#F4F3EF] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8B7CF6] inline-block" />
              {summary.templateName}
            </span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#17191D] text-[#8B7CF6] border border-[#8B7CF6]/25 font-medium">
              {summary.sentiment}
            </span>
          </div>
          <p className="text-[13px] text-[#A7A9B0] leading-relaxed font-normal">{summary.overview}</p>
        </div>

        {/* Metrics Grid (if present) */}
        {summary.metrics && (
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6F737D] font-mono mb-2 block">
              Conversation Metrics
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {Object.entries(summary.metrics).map(([key, val]) => (
                <div
                  key={key}
                  className="bg-[#101114] border border-[#23262D] rounded-lg p-2.5 text-center"
                >
                  <p className="text-[10px] text-[#6F737D] truncate uppercase font-mono">{key}</p>
                  <p className="text-xs font-bold text-[#F4F3EF] mt-1 font-mono">{val}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Discussion Takeaways */}
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6F737D] font-mono mb-2 block">
            Key Decisions & Takeaways
          </span>
          <ul className="space-y-2">
            {summary.keyTakeaways.map((takeaway, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 p-3 rounded-lg bg-[#101114] border border-[#23262D] text-xs text-[#F4F3EF] leading-relaxed"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#8B7CF6] mt-1.5 flex-shrink-0" />
                <span className="text-[13px] text-[#F4F3EF] leading-relaxed">{takeaway}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Next Steps */}
        {summary.nextSteps && summary.nextSteps.length > 0 && (
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6F737D] font-mono mb-2 block">
              Agreed Next Steps
            </span>
            <div className="space-y-2">
              {summary.nextSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 p-3 rounded-lg bg-[#101114] border border-[#23262D] text-xs text-[#A7A9B0]"
                >
                  <ArrowUpRight className="w-4 h-4 text-[#55C89A] flex-shrink-0" />
                  <span className="text-[13px] text-[#F4F3EF]">{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
