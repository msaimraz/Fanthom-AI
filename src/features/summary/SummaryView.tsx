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
      <div className="p-8 text-center text-xs text-zinc-500">
        No summary generated for this meeting.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#111217] border border-[#1d1f28] rounded-xl overflow-hidden">
      {/* Top Header & Template Selector */}
      <div className="p-3 border-b border-[#181a24] bg-[#0e0f15] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Template switcher pill group */}
        <div className="flex items-center gap-1.5 overflow-x-auto select-none">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono mr-1">
            Template:
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
                    ? 'bg-cyan-400 text-black font-semibold shadow-sm shadow-cyan-500/20'
                    : 'bg-[#141620] text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1d2c] border border-[#1f2334]'
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
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#141620] hover:bg-[#1c1f2e] text-zinc-300 hover:text-white rounded-lg transition-colors border border-[#222638] ml-auto shadow-sm"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-cyan-400 stroke-[2.5]" />
              <span className="text-cyan-300 font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-zinc-400" />
              <span>Copy Summary</span>
            </>
          )}
        </button>
      </div>

      {/* Summary Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Executive / Meeting Overview */}
        <div className="p-4 rounded-xl bg-[#14161f] border border-[#202332] shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-zinc-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
              {summary.templateName}
            </span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#101118] text-cyan-300 border border-cyan-500/25 font-semibold">
              {summary.sentiment}
            </span>
          </div>
          <p className="text-[13px] text-zinc-300 leading-relaxed font-normal">{summary.overview}</p>
        </div>

        {/* Metrics Grid (if present) */}
        {summary.metrics && (
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono mb-2 block">
              Meeting Metrics & Data
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {Object.entries(summary.metrics).map(([key, val]) => (
                <div
                  key={key}
                  className="bg-[#10121a] border border-[#1d202d] rounded-lg p-2.5 text-center shadow-inner"
                >
                  <p className="text-[10px] text-zinc-400 truncate uppercase font-mono">{key}</p>
                  <p className="text-xs font-bold text-zinc-100 mt-1 font-mono">{val}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Discussion Takeaways */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono mb-2 block">
            Key Discussion Points
          </span>
          <ul className="space-y-2">
            {summary.keyTakeaways.map((takeaway, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 p-3 rounded-lg bg-[#10121a] border border-[#1b1e2c] text-xs text-zinc-200 leading-relaxed shadow-sm"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0 shadow-[0_0_6px_#00d2ee]" />
                <span className="text-[13px] text-zinc-200 leading-relaxed">{takeaway}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Next Steps */}
        {summary.nextSteps && summary.nextSteps.length > 0 && (
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono mb-2 block">
              Next Steps & Commitments
            </span>
            <div className="space-y-2">
              {summary.nextSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 p-3 rounded-lg bg-[#10121a] border border-[#1b1e2c] text-xs text-zinc-300 shadow-sm"
                >
                  <ArrowUpRight className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span className="text-[13px] text-zinc-200">{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
