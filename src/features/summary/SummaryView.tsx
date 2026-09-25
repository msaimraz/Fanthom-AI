import React, { useState } from 'react';
import { Copy, Check, ArrowUpRight } from 'lucide-react';
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
    const textToCopy = `### ${meeting.title} — ${summary.templateName}\n\n**Overview:**\n${summary.overview}\n\n**Decisions & Takeaways:**\n${summary.keyTakeaways.map((t) => `- ${t}`).join('\n')}\n\n${summary.nextSteps ? `**Follow-ups:**\n${summary.nextSteps.map((s) => `- ${s}`).join('\n')}` : ''}`;

    navigator.clipboard?.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!summary) {
    return (
      <div className="p-8 text-center text-xs font-mono text-[#969AA3]">
        No structured summary available for this conversation.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#121417] border border-[#1E2127] overflow-hidden">
      {/* Header & Lens Selector */}
      <div className="px-4 py-2.5 border-b border-[#1E2127] bg-[#121417] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto select-none font-mono">
          <span className="text-[10px] uppercase tracking-[0.14em] text-[#5E626B] mr-1">
            Summarize:
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
                className={`px-2.5 py-1 text-xs transition-colors whitespace-nowrap border ${
                  isSelected
                    ? 'bg-[#C7F36B] text-[#0B0C0E] border-[#C7F36B] font-semibold'
                    : 'bg-[#0B0C0E] text-[#969AA3] hover:text-[#F2EFE8] border-[#1E2127]'
                }`}
              >
                <span>{templateMeta.name}</span>
              </button>
            );
          })}
        </div>

        {/* Copy action */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono bg-[#0B0C0E] hover:bg-[#191C20] text-[#969AA3] hover:text-[#F2EFE8] border border-[#1E2127] ml-auto"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#47D18C]" />
              <span className="text-[#47D18C] font-semibold">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-[#5E626B]" />
              <span>Copy Notes</span>
            </>
          )}
        </button>
      </div>

      {/* Editorial Summary Document Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Executive Synopsis */}
        <div className="p-4 bg-[#14161f] bg-[#0B0C0E] border-l-2 border-l-[#C7F36B] border border-[#1E2127]">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-mono uppercase tracking-[0.12em] font-semibold text-[#C7F36B]">
              {summary.templateName}
            </span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-[#121417] text-[#F2EFE8] border border-[#1E2127]">
              {summary.sentiment}
            </span>
          </div>
          <p className="text-[13px] text-[#F2EFE8] leading-relaxed font-normal">
            {summary.overview}
          </p>
        </div>

        {/* Structured Metrics Strip */}
        {summary.metrics && (
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#969AA3] mb-2 block">
              Parameters & Signals
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 border border-[#1E2127] divide-x divide-y sm:divide-y-0 divide-[#1E2127] bg-[#0B0C0E]">
              {Object.entries(summary.metrics).map(([key, val]) => (
                <div key={key} className="p-2.5">
                  <p className="text-[10px] text-[#5E626B] truncate uppercase font-mono">
                    {key}
                  </p>
                  <p className="text-xs font-semibold text-[#F2EFE8] mt-1 font-mono">
                    {val}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Decisions (Semantic Amber #F0B449) */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 bg-[#F0B449]" />
            <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#F0B449] font-semibold">
              Decisions & Key Takeaways
            </span>
          </div>
          <ul className="divide-y divide-[#1E2127] border border-[#1E2127] bg-[#0B0C0E]">
            {summary.keyTakeaways.map((takeaway, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 p-3 text-xs text-[#F2EFE8] leading-relaxed"
              >
                <span className="font-mono text-[10px] text-[#F0B449] mt-0.5 flex-shrink-0">
                  0{idx + 1}
                </span>
                <span className="text-[13px] text-[#F2EFE8] leading-relaxed">
                  {takeaway}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Follow-ups (Semantic Green #47D18C) */}
        {summary.nextSteps && summary.nextSteps.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 bg-[#47D18C]" />
              <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#47D18C] font-semibold">
                Follow-ups & Next Steps
              </span>
            </div>
            <div className="divide-y divide-[#1E2127] border border-[#1E2127] bg-[#0B0C0E]">
              {summary.nextSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 p-3 text-xs text-[#969AA3]"
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#47D18C] flex-shrink-0" />
                  <span className="text-[13px] text-[#F2EFE8]">{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

