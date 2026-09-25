import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Share2, Check } from 'lucide-react';
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
    <header className="h-12 border-b border-[#1E2127] bg-[#0B0C0E] px-5 flex items-center justify-between sticky top-0 z-20 select-none">
      {/* Editorial Breadcrumb */}
      <div className="flex items-center gap-2 text-xs min-w-0">
        <button
          onClick={() => navigate('/meetings')}
          className="text-[#969AA3] hover:text-[#F2EFE8] transition-colors font-medium flex-shrink-0"
        >
          Fanthom
        </button>
        <span className="text-[#5E626B]">/</span>
        <button
          onClick={() => navigate('/meetings')}
          className={`transition-colors font-medium flex-shrink-0 ${
            currentMeeting ? 'text-[#969AA3] hover:text-[#F2EFE8]' : 'text-[#F2EFE8]'
          }`}
        >
          Conversations
        </button>

        {currentMeeting && (
          <>
            <span className="text-[#5E626B]">/</span>
            <span className="text-[#F2EFE8] font-semibold truncate max-w-xs sm:max-w-md md:max-w-lg">
              {currentMeeting.title}
            </span>
          </>
        )}
      </div>

      {/* Right Command & Share Actions */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1 text-xs text-[#969AA3] hover:text-[#F2EFE8] bg-[#121417] hover:bg-[#191C20] border border-[#1E2127] rounded transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-[#969AA3]" />
          <span>Search</span>
          <kbd className="text-[10px] bg-[#0B0C0E] px-1.5 py-0.5 text-[#5E626B] font-mono border border-[#1E2127] rounded">
            ⌘K
          </kbd>
        </button>

        {currentMeeting && (
          <button
            onClick={handleShareMeeting}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-[#C7F36B] hover:bg-[#d4f788] text-[#0B0C0E] rounded transition-colors"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </>
            )}
          </button>
        )}
      </div>
    </header>
  );
};
