import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Share2,
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-lg bg-[#17191D] border border-[#23262D] rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-3.5 border-b border-[#23262D] flex items-center justify-between bg-[#17191D]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#8B7CF6]/15 text-[#8B7CF6] flex items-center justify-center">
              <Share2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#F4F3EF] uppercase tracking-wider">Share Clip</h3>
              <p className="text-[10px] text-[#A7A9B0] font-mono">
                {formatTime(clip.startTime)} – {formatTime(clip.endTime)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#A7A9B0] hover:text-[#F4F3EF] rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3.5">
          {/* Clip preview title */}
          <div className="p-2.5 bg-[#101114] border border-[#23262D] rounded-lg">
            <h4 className="text-xs font-semibold text-[#F4F3EF] mb-0.5">{clip.title}</h4>
            {clip.quote && (
              <p className="text-[11px] text-[#A7A9B0] italic line-clamp-2">
                "{clip.quote}"
              </p>
            )}
          </div>

          {/* Share Link Row */}
          <div>
            <label className="block text-xs font-semibold text-[#F4F3EF] mb-1">
              Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-[#101114] border border-[#23262D] rounded-lg px-3 py-1.5 text-xs font-mono text-[#A7A9B0] select-all focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#8B7CF6] hover:bg-[#9D91FF] text-white rounded-lg text-xs font-semibold transition-all shadow-sm shadow-[#8B7CF6]/20"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
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

          {/* Permissions Selector */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6F737D] mb-1">
              Access
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setAccessLevel('public')}
                className={`p-2.5 rounded-lg border text-left flex items-start gap-2 transition-all ${
                  accessLevel === 'public'
                    ? 'bg-[#8B7CF6]/15 border-[#8B7CF6]/40 text-[#F4F3EF]'
                    : 'bg-[#101114] border-[#23262D] text-[#A7A9B0] hover:text-[#F4F3EF]'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-[#8B7CF6] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold">Anyone with link</p>
                  <p className="text-[10px] text-[#6F737D]">Public web preview</p>
                </div>
              </button>

              <button
                onClick={() => setAccessLevel('workspace')}
                className={`p-2.5 rounded-lg border text-left flex items-start gap-2 transition-all ${
                  accessLevel === 'workspace'
                    ? 'bg-[#8B7CF6]/15 border-[#8B7CF6]/40 text-[#F4F3EF]'
                    : 'bg-[#101114] border-[#23262D] text-[#A7A9B0] hover:text-[#F4F3EF]'
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-[#E7B45C] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold">Workspace only</p>
                  <p className="text-[10px] text-[#6F737D]">Requires login</p>
                </div>
              </button>
            </div>
          </div>

          {/* Embed Option */}
          <div className="pt-2 border-t border-[#23262D] flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-[#A7A9B0]">
              <Code className="w-3 h-3 text-[#6F737D]" />
              <span>HTML Video Embed</span>
            </div>
            <button
              onClick={handleCopyEmbed}
              className="text-xs text-[#8B7CF6] hover:text-[#9D91FF] transition-colors font-medium"
            >
              {embedCopied ? 'Embed Copied!' : 'Copy Embed Code'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-[#23262D] bg-[#17191D] flex items-center justify-between">
          <button
            onClick={handleOpenPage}
            className="flex items-center gap-1 text-xs font-medium text-[#8B7CF6] hover:text-[#9D91FF] transition-colors"
          >
            <span>Open Public Clip Page</span>
            <ExternalLink className="w-3 h-3" />
          </button>

          <button
            onClick={onClose}
            className="px-3 py-1 text-xs font-semibold bg-[#1D2025] hover:bg-[#23262D] text-[#F4F3EF] rounded-md transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
