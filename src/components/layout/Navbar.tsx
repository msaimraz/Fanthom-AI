import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, ChevronRight, Share2, Check, Sparkles } from 'lucide-react';
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
    <header className="h-14 border-b border-[#23262D] bg-[#17191D]/90 backdrop-blur-md px-5 flex items-center justify-between sticky top-0 z-20 select-none">
      {/* Breadcrumbs & Location */}
      <div className="flex items-center gap-2 text-xs font-medium text-[#A7A9B0] min-w-0">
        <button
          onClick={() => navigate('/meetings')}
          className="hover:text-[#F4F3EF] transition-colors flex items-center gap-1.5 flex-shrink-0"
        >
          <span>Meetings</span>
        </button>
        {currentMeeting && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-[#6F737D] flex-shrink-0" />
            <span className="text-[#F4F3EF] font-semibold truncate max-w-sm sm:max-w-md md:max-w-lg">
              {currentMeeting.title}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#1D2025] text-[#8B7CF6] font-mono border border-[#8B7CF6]/25 flex-shrink-0 hidden sm:inline uppercase">
              {currentMeeting.category}
            </span>
          </>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <button
          onClick={onOpenSearch}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs text-[#A7A9B0] hover:text-[#F4F3EF] bg-[#101114] border border-[#23262D] hover:border-[#2C3039] rounded-lg transition-all"
        >
          <Search className="w-3.5 h-3.5 text-[#6F737D]" />
          <span className="text-[11px]">Search...</span>
          <kbd className="text-[10px] bg-[#1D2025] px-1.5 py-0.5 rounded text-[#A7A9B0] font-mono border border-[#282B33]">
            ⌘K
          </kbd>
        </button>

        {currentMeeting && (
          <button
            onClick={handleShareMeeting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#8B7CF6] hover:bg-[#9D91FF] text-white rounded-lg transition-all shadow-sm shadow-[#8B7CF6]/25 active:scale-95"
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

        <div className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-[#8B7CF6] bg-[#8B7CF6]/10 border border-[#8B7CF6]/25 rounded-full">
          <Sparkles className="w-3 h-3 text-[#8B7CF6]" />
          <span className="hidden md:inline">Fanthom Workspace</span>
        </div>
      </div>
    </header>
  );
};

