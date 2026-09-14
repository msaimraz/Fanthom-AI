import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, ChevronRight, Share2, Sparkles, Check } from 'lucide-react';
import { useMeetingsStore } from '../../store/useMeetingsStore';

interface NavbarProps {
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { meetings } = useMeetingsStore();
  const [copiedLink, setCopiedLink] = useState(false);

  const isDetail = location.pathname.startsWith('/meetings/');
  const meetingId = isDetail ? location.pathname.split('/meetings/')[1].split('?')[0] : null;
  const currentMeeting = meetingId ? meetings.find((m) => m.id === meetingId) : null;

  const handleShareMeeting = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <header className="h-13 border-b border-[#161822] bg-[#090a0e]/95 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-20 select-none">
      {/* Breadcrumbs & Location */}
      <div className="flex items-center gap-2 text-xs font-medium text-zinc-400 min-w-0">
        <button
          onClick={() => navigate('/meetings')}
          className="hover:text-zinc-200 transition-colors flex items-center gap-1.5 flex-shrink-0"
        >
          <span>Meetings</span>
        </button>
        {currentMeeting && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
            <span className="text-zinc-100 font-semibold truncate max-w-sm sm:max-w-md md:max-w-lg">
              {currentMeeting.title}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#141620] text-cyan-300 font-mono border border-cyan-500/20 flex-shrink-0 hidden sm:inline">
              {currentMeeting.category.toUpperCase()}
            </span>
          </>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <button
          onClick={onOpenSearch}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 bg-[#111218] border border-[#1e212d] hover:border-[#2b2f40] rounded-lg transition-all shadow-inner"
        >
          <Search className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-[11px]">Search...</span>
          <kbd className="text-[10px] bg-[#171924] px-1.5 py-0.5 rounded text-zinc-400 font-mono border border-[#222534]">
            ⌘K
          </kbd>
        </button>

        {currentMeeting && (
          <button
            onClick={handleShareMeeting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-cyan-400 hover:bg-cyan-300 text-black rounded-lg transition-all shadow-sm shadow-cyan-500/20 active:scale-95"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Link Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </>
            )}
          </button>
        )}

        <div className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span className="hidden md:inline">Fathom AI</span>
        </div>
      </div>
    </header>
  );
};

