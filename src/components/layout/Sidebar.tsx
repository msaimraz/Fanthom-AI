import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Compass,
  MessagesSquare,
  Bookmark,
  Search,
  RotateCcw,
  PanelLeftOpen,
  PanelLeftClose,
} from 'lucide-react';
import { useMeetingsStore } from '../../store/useMeetingsStore';

interface SidebarProps {
  onOpenSearch?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenSearch }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    meetings,
    profile,
    workspace,
    categoryFilter,
    setCategoryFilter,
  } = useMeetingsStore();

  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isExpanded = isPinned || isHovered;

  const totalHighlights = meetings.reduce(
    (acc, m) => acc + (m.highlights?.length || 0) + (m.clips?.length || 0),
    0
  );

  const isWorkspaceRoute = location.pathname === '/meetings' && categoryFilter === 'all';
  const isConversationsActive =
    location.pathname.startsWith('/meetings/') ||
    (location.pathname === '/meetings' && categoryFilter !== 'all');
  const isHighlightsActive = location.search.includes('tab=clips');

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Primary Navigation Rail"
      className={`${
        isExpanded ? 'w-56' : 'w-14'
      } flex-shrink-0 bg-[#121417] border-r border-[#1E2127] flex flex-col justify-between h-screen select-none transition-[width] duration-150 ease-out z-30 overflow-hidden`}
    >
      {/* Top Section: Brand + Primary Navigation */}
      <div className="flex flex-col">
        {/* Brand Masthead */}
        <div className="h-12 flex items-center justify-between px-3.5 border-b border-[#1E2127]">
          <button
            onClick={() => {
              setCategoryFilter('all');
              navigate('/meetings');
            }}
            className="flex items-center gap-3 min-w-0 text-left group"
            title="Fanthom — Conversation OS"
          >
            <div className="w-7 h-7 bg-[#C7F36B] text-[#0B0C0E] flex items-center justify-center flex-shrink-0 font-mono font-bold text-xs tracking-tighter">
              F
            </div>
            {isExpanded && (
              <div className="flex flex-col min-w-0">
                <span className="font-mono font-semibold text-xs tracking-[0.14em] uppercase text-[#F2EFE8] leading-none">
                  FANTHOM
                </span>
                <span className="text-[10px] font-mono text-[#969AA3] tracking-tight mt-0.5 truncate">
                  Conversation OS
                </span>
              </div>
            )}
          </button>

          {isExpanded && (
            <button
              onClick={() => setIsPinned((prev) => !prev)}
              title={isPinned ? 'Collapse navigation rail' : 'Pin navigation rail'}
              className="p-1 text-[#969AA3] hover:text-[#F2EFE8] transition-colors flex-shrink-0"
            >
              {isPinned ? (
                <PanelLeftClose className="w-3.5 h-3.5 text-[#C7F36B]" />
              ) : (
                <PanelLeftOpen className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>

        {/* Primary Rail Items: Workspace, Conversations, Highlights, Search */}
        <nav className="py-3 px-2 space-y-1">
          {/* 1. Workspace */}
          <button
            onClick={() => {
              setCategoryFilter('all');
              navigate('/meetings');
            }}
            title="Workspace Timeline"
            className={`w-full flex items-center gap-3 px-2.5 py-2 text-xs font-medium transition-colors relative ${
              isWorkspaceRoute
                ? 'bg-[#191C20] text-[#F2EFE8] border-l-2 border-[#C7F36B]'
                : 'text-[#969AA3] hover:text-[#F2EFE8] hover:bg-[#191C20]/60 border-l-2 border-transparent'
            }`}
          >
            <Compass
              className={`w-4 h-4 flex-shrink-0 ${
                isWorkspaceRoute ? 'text-[#C7F36B]' : 'text-[#969AA3]'
              }`}
            />
            {isExpanded && (
              <>
                <span className="truncate">Workspace</span>
                <span className="ml-auto text-[10px] font-mono text-[#969AA3]">
                  {meetings.length}
                </span>
              </>
            )}
          </button>

          {/* 2. Conversations */}
          <button
            onClick={() => {
              navigate('/meetings/enterprise-sales-discovery-acme');
            }}
            title="Conversations"
            className={`w-full flex items-center gap-3 px-2.5 py-2 text-xs font-medium transition-colors relative ${
              isConversationsActive && !isHighlightsActive
                ? 'bg-[#191C20] text-[#F2EFE8] border-l-2 border-[#C7F36B]'
                : 'text-[#969AA3] hover:text-[#F2EFE8] hover:bg-[#191C20]/60 border-l-2 border-transparent'
            }`}
          >
            <MessagesSquare
              className={`w-4 h-4 flex-shrink-0 ${
                isConversationsActive && !isHighlightsActive
                  ? 'text-[#C7F36B]'
                  : 'text-[#969AA3]'
              }`}
            />
            {isExpanded && (
              <>
                <span className="truncate">Conversations</span>
                <span className="ml-auto text-[10px] font-mono text-[#C7F36B]">
                  LIVE
                </span>
              </>
            )}
          </button>

          {/* 3. Highlights */}
          <button
            onClick={() => {
              navigate('/meetings/enterprise-sales-discovery-acme?tab=clips');
            }}
            title="Highlights & Clips"
            className={`w-full flex items-center gap-3 px-2.5 py-2 text-xs font-medium transition-colors relative ${
              isHighlightsActive
                ? 'bg-[#191C20] text-[#F2EFE8] border-l-2 border-[#C7F36B]'
                : 'text-[#969AA3] hover:text-[#F2EFE8] hover:bg-[#191C20]/60 border-l-2 border-transparent'
            }`}
          >
            <Bookmark
              className={`w-4 h-4 flex-shrink-0 ${
                isHighlightsActive ? 'text-[#C7F36B]' : 'text-[#969AA3]'
              }`}
            />
            {isExpanded && (
              <>
                <span className="truncate">Highlights</span>
                <span className="ml-auto text-[10px] font-mono text-[#969AA3]">
                  {totalHighlights}
                </span>
              </>
            )}
          </button>

          {/* 4. Search (Fanthom Command) */}
          <button
            onClick={onOpenSearch}
            title="Fanthom Command (Ctrl/Cmd+K)"
            className="w-full flex items-center gap-3 px-2.5 py-2 text-xs font-medium text-[#969AA3] hover:text-[#F2EFE8] hover:bg-[#191C20]/60 border-l-2 border-transparent transition-colors"
          >
            <Search className="w-4 h-4 flex-shrink-0 text-[#969AA3]" />
            {isExpanded && (
              <>
                <span className="truncate">Search</span>
                <kbd className="ml-auto text-[10px] font-mono text-[#969AA3] bg-[#0B0C0E] px-1.5 py-0.5 border border-[#1E2127]">
                  ⌘K
                </kbd>
              </>
            )}
          </button>
        </nav>

        {/* Expanded Section: Streams / Direct Jump */}
        {isExpanded && (
          <div className="px-3 pt-4 border-t border-[#1E2127] space-y-1">
            <div className="px-1.5 pb-1 flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-[#5E626B]">
                Streams
              </span>
              <span className="text-[9px] font-mono text-[#5E626B]">
                {workspace?.plan || 'PRO'}
              </span>
            </div>

            {[
              { id: 'all', label: 'All Streams', dot: 'bg-[#C7F36B]' },
              { id: 'customer', label: 'Customer Deals', dot: 'bg-[#F0B449]' },
              { id: 'team', label: 'Engineering & Ops', dot: 'bg-[#5BA3F5]' },
              { id: 'one_on_one', label: '1-on-1 Reviews', dot: 'bg-[#47D18C]' },
            ].map((stream) => {
              const active =
                location.pathname === '/meetings' && categoryFilter === stream.id;
              return (
                <button
                  key={stream.id}
                  onClick={() => {
                    setCategoryFilter(stream.id as any);
                    navigate('/meetings');
                  }}
                  className={`w-full flex items-center gap-2.5 px-2 py-1.5 text-xs transition-colors text-left ${
                    active
                      ? 'text-[#F2EFE8] bg-[#191C20] font-medium'
                      : 'text-[#969AA3] hover:text-[#F2EFE8]'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${stream.dot}`} />
                  <span className="truncate">{stream.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Operator Footer */}
      <div className="p-2.5 border-t border-[#1E2127] bg-[#121417] space-y-2">
        {isExpanded && (
          <button
            disabled
            title="Database reset is disabled in the public shared demo workspace"
            className="w-full flex items-center justify-center gap-1.5 py-1 text-[10px] font-mono text-[#5E626B] bg-[#0B0C0E] border border-[#1E2127] cursor-not-allowed"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo Data (Protected)</span>
          </button>
        )}

        <div className="flex items-center gap-2.5 px-1">
          <img
            src={
              profile?.avatarUrl ||
              'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=64&h=64&fit=crop&crop=face'
            }
            alt={profile?.name || 'Sarah Lin'}
            className="w-7 h-7 rounded-sm border border-[#272B33] object-cover flex-shrink-0"
          />
          {isExpanded && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-[#F2EFE8] truncate leading-tight">
                {profile?.name || 'Sarah Lin'}
              </p>
              <p className="text-[10px] font-mono text-[#969AA3] truncate leading-tight">
                {profile?.roleTitle || 'Workspace Admin'}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

