import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Copy,
  Check,
  Globe,
  Lock,
  ExternalLink,
  Code,
  X,
} from 'lucide-react';
import { Clip } from '../../types';
import { formatTime } from '../../utils/formatters';

interface ShareClipModalProps {
  clip: Clip | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareClipModal: React.FC<ShareClipModalProps> = ({
  clip,
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);
  const [accessLevel, setAccessLevel] = useState<'public' | 'workspace'>('public');

  if (!isOpen || !clip) return null;

  const shareUrl = `${window.location.origin}/share/${clip.shareId}`;
  const embedSnippet = `<iframe src="${shareUrl}" width="640" height="360" frameborder="0" allowfullscreen></iframe>`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyEmbed = () => {
    navigator.clipboard?.writeText(embedSnippet);
    setEmbedCopied(true);
    setTimeout(() => setEmbedCopied(false), 2000);
  };

  const handleOpenPage = () => {
    onClose();
    navigate(`/share/${clip.shareId}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-lg bg-[#121417] border border-[#272B33] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#1E2127] flex items-center justify-between bg-[#0B0C0E]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#C7F36B]" />
            <div>
              <h3 className="text-xs font-mono font-semibold text-[#F2EFE8] uppercase tracking-[0.14em]">
                Share Clip
              </h3>
              <p className="text-[10px] text-[#969AA3] font-mono">
                {formatTime(clip.startTime)} – {formatTime(clip.endTime)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#969AA3] hover:text-[#F2EFE8]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          <div className="p-3 bg-[#0B0C0E] border-l-2 border-l-[#C7F36B] border border-[#1E2127]">
            <h4 className="text-xs font-semibold text-[#F2EFE8] mb-0.5">{clip.title}</h4>
            {clip.quote && (
              <p className="text-[11px] text-[#969AA3] line-clamp-2">
                "{clip.quote}"
              </p>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-[0.12em] text-[#969AA3] mb-1.5">
              Shareable Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-[#0B0C0E] border border-[#1E2127] px-3 py-1.5 text-xs font-mono text-[#969AA3] select-all focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#C7F36B] hover:bg-[#d4f788] text-[#0B0C0E] text-xs font-mono font-semibold transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-[0.12em] text-[#969AA3] mb-1.5">
              Access Control
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setAccessLevel('public')}
                className={`p-2.5 border text-left flex items-start gap-2 transition-colors ${
                  accessLevel === 'public'
                    ? 'bg-[#191C20] border-[#C7F36B]/50 text-[#F2EFE8]'
                    : 'bg-[#0B0C0E] border-[#1E2127] text-[#969AA3]'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-[#C7F36B] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold">Anyone with link</p>
                  <p className="text-[10px] font-mono text-[#5E626B]">Public playback</p>
                </div>
              </button>

              <button
                onClick={() => setAccessLevel('workspace')}
                className={`p-2.5 border text-left flex items-start gap-2 transition-colors ${
                  accessLevel === 'workspace'
                    ? 'bg-[#191C20] border-[#C7F36B]/50 text-[#F2EFE8]'
                    : 'bg-[#0B0C0E] border-[#1E2127] text-[#969AA3]'
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-[#F0B449] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold">Workspace only</p>
                  <p className="text-[10px] font-mono text-[#5E626B]">Members only</p>
                </div>
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-[#1E2127] flex items-center justify-between font-mono text-xs">
            <div className="flex items-center gap-1.5 text-[#969AA3]">
              <Code className="w-3.5 h-3.5 text-[#5E626B]" />
              <span>Embed Snippet</span>
            </div>
            <button
              onClick={handleCopyEmbed}
              className="text-[#C7F36B] hover:underline"
            >
              {embedCopied ? 'Copied' : 'Copy Iframe'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[#1E2127] bg-[#0B0C0E] flex items-center justify-between font-mono">
          <button
            onClick={handleOpenPage}
            className="flex items-center gap-1 text-xs text-[#C7F36B] hover:underline"
          >
            <span>Open Public Clip Page</span>
            <ExternalLink className="w-3 h-3" />
          </button>

          <button
            onClick={onClose}
            className="px-3 py-1 text-xs font-semibold bg-[#191C20] hover:bg-[#272B33] text-[#F2EFE8] border border-[#1E2127]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

