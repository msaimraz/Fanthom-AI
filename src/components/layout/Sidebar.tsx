import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Layers,
  CheckSquare,
  Search,
  RotateCcw,
  Zap,
  FolderOpen,
  Users,
  Terminal,
} from 'lucide-react';
import { useMeetingsStore } from '../../store/useMeetingsStore';

interface SidebarProps {
  onOpenSearch?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenSearch }) => {
  const navigate = useNavigate();
  const {
    meetings,
    profile,
    workspace,
    setCategoryFilter,
  } = useMeetingsStore();

  const pendingActionCount = meetings.reduce(
    (acc, m) => acc + m.actionItems.filter((a) => !a.completed).length,
    0
  );
  const customerCount = meetings.filter((m) => m.category === 'customer').length;
  const teamCount = meetings.filter((m) => m.category === 'team').length;
  const oneOnOneCount = meetings.filter((m) => m.category === 'one_on_one').length;


  const handleFilterNavigate = (category: any) => {
    setCategoryFilter(category);
    navigate('/meetings');
  };

  return (
    <aside className="w-[232px] flex-shrink-0 bg-[#17191D] border-r border-[#23262D] flex flex-col justify-between h-screen select-none">
      {/* Brand & Search */}
      <div className="flex flex-col">
        {/* Fanthom Brand Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-[#23262D]">
          <div
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => {
              setCategoryFilter('all');
              navigate('/meetings');
            }}
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#8B7CF6] to-[#6355D8] flex items-center justify-center shadow-sm shadow-[#8B7CF6]/20 transition-transform group-hover:scale-105">
              <span className="font-bold text-xs text-white font-mono">F</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm tracking-tight text-[#F4F3EF] leading-tight">
                Fanthom
              </span>
              <span className="text-[10px] text-[#A7A9B0] tracking-wide leading-none">
                Intelligence
              </span>
            </div>
          </div>

          <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#1D2025] text-[#8B7CF6] border border-[#8B7CF6]/25 font-medium">
            {workspace?.plan || 'Pro'}
          </span>
        </div>

        {/* Quick Search Trigger */}
        <div className="px-3 pt-3.5 pb-1">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-[#A7A9B0] bg-[#101114] hover:bg-[#1D2025] hover:text-[#F4F3EF] border border-[#23262D] hover:border-[#2C3039] rounded-lg transition-all group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Search className="w-3.5 h-3.5 text-[#6F737D] group-hover:text-[#8B7CF6] transition-colors flex-shrink-0" />
              <span className="text-[11px] truncate">Search workspace...</span>
            </div>
            <kbd className="text-[10px] bg-[#1D2025] text-[#A7A9B0] px-1.5 py-0.5 rounded font-mono border border-[#282B33] flex-shrink-0">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Main Nav Links */}
        <nav className="p-3 space-y-1">
          <div className="px-1.5 pb-1 pt-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6F737D] font-mono">
              Workspace
            </span>
          </div>

          <NavLink
            to="/meetings"
            end
            onClick={() => setCategoryFilter('all')}
            className={({ isActive }) =>
              `flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-[#8B7CF6]/15 text-[#F4F3EF] font-semibold border border-[#8B7CF6]/30'
                  : 'text-[#A7A9B0] hover:text-[#F4F3EF] hover:bg-[#1D2025]'
              }`
            }
          >
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-[#A7A9B0]" />
              <span>All Meetings</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#101114] text-[#A7A9B0] font-mono border border-[#23262D]">
              {meetings.length}
            </span>
          </NavLink>

          <button
            onClick={() => {
              navigate('/meetings');
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium text-[#A7A9B0] hover:text-[#F4F3EF] hover:bg-[#1D2025] rounded-lg transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <CheckSquare className="w-3.5 h-3.5 text-[#A7A9B0]" />
              <span>Follow-ups</span>
            </div>
            {pendingActionCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#8B7CF6]/15 text-[#8B7CF6] font-semibold border border-[#8B7CF6]/30 font-mono">
                {pendingActionCount}
              </span>
            )}
          </button>

          {/* Smart Views / Categories */}
          <div className="pt-3 px-1.5 pb-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6F737D] font-mono">
              Conversations
            </span>
          </div>

          <button
            onClick={() => handleFilterNavigate('customer')}
            className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium text-[#A7A9B0] hover:text-[#F4F3EF] hover:bg-[#1D2025] rounded-lg transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <FolderOpen className="w-3.5 h-3.5 text-[#8B7CF6]/80" />
              <span className="truncate">Customer Deals</span>
            </div>
            <span className="text-[10px] text-[#6F737D] font-mono">{customerCount}</span>
          </button>

          <button
            onClick={() => handleFilterNavigate('team')}
            className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium text-[#A7A9B0] hover:text-[#F4F3EF] hover:bg-[#1D2025] rounded-lg transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-[#E7B45C]/80" />
              <span className="truncate">Engineering & Ops</span>
            </div>
            <span className="text-[10px] text-[#6F737D] font-mono">{teamCount}</span>
          </button>

          <button
            onClick={() => handleFilterNavigate('one_on_one')}
            className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium text-[#A7A9B0] hover:text-[#F4F3EF] hover:bg-[#1D2025] rounded-lg transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-[#55C89A]/80" />
              <span className="truncate">1-on-1 Reviews</span>
            </div>
            <span className="text-[10px] text-[#6F737D] font-mono">{oneOnOneCount}</span>
          </button>

          {/* Hero Recording Pin */}
          <div className="pt-3 px-1.5 pb-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6F737D] font-mono">
              Highlighted Call
            </span>
          </div>

          <button
            onClick={() => navigate('/meetings/enterprise-sales-discovery-acme')}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-[#F4F3EF] bg-[#101114] hover:bg-[#1D2025] border border-[#23262D] hover:border-[#8B7CF6]/40 rounded-lg transition-all group text-left shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 text-[#8B7CF6] flex-shrink-0" />
            <span className="truncate text-[11px] font-medium text-[#F4F3EF] group-hover:text-[#8B7CF6]">
              Acme Discovery
            </span>
            <span className="ml-auto text-[8px] px-1.5 py-0.5 rounded bg-[#8B7CF6]/15 text-[#8B7CF6] font-mono border border-[#8B7CF6]/25 flex-shrink-0">
              AUDIO
            </span>
          </button>
        </nav>
      </div>

      {/* Footer Profile & Reset */}
      <div className="p-3 border-t border-[#23262D] space-y-2 bg-[#17191D]">
        <button
          disabled
          title="Database reset is disabled in the public shared demo workspace"
          className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-medium text-[#6F737D] bg-[#101114]/50 rounded-md border border-[#23262D]/60 cursor-not-allowed opacity-70"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Demo Data (Protected)</span>
        </button>

        {/* User Profile Tile */}
        <div className="flex items-center gap-2.5 pt-1.5 px-1 border-t border-[#23262D]/60">
          <img
            src={
              profile?.avatarUrl ||
              'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=64&h=64&fit=crop&crop=face'
            }
            alt={profile?.name || 'Sarah Lin'}
            className="w-7 h-7 rounded-full border border-[#8B7CF6]/40 object-cover shadow-sm"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-[#F4F3EF] truncate leading-tight">
              {profile?.name || 'Sarah Lin'}
            </p>
            <p className="text-[10px] text-[#A7A9B0] truncate leading-tight">
              {profile?.roleTitle || 'Workspace Admin'}
            </p>
          </div>
          <span
            className="w-2 h-2 rounded-full bg-[#55C89A] shadow-[0_0_6px_#55C89A]"
            title="Active"
          />
        </div>
      </div>
    </aside>
  );
};

