import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Video,
  CheckSquare,
  Search,
  RotateCcw,
  Sparkles,
  Zap,
  FolderOpen,
  Users,
  ShieldAlert,
} from 'lucide-react';
import { useMeetingsStore } from '../../store/useMeetingsStore';

interface SidebarProps {
  onOpenSearch?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenSearch }) => {
  const navigate = useNavigate();
  const { meetings, resetToDefaultSeed, setCategoryFilter } = useMeetingsStore();

  const pendingActionCount = meetings.reduce(
    (acc, m) => acc + m.actionItems.filter((a) => !a.completed).length,
    0
  );

  const handleReset = () => {
    if (window.confirm('Reset meetings to default seed data?')) {
      resetToDefaultSeed();
      navigate('/meetings');
    }
  };

  const handleFilterNavigate = (category: any) => {
    setCategoryFilter(category);
    navigate('/meetings');
  };

  return (
    <aside className="w-56 flex-shrink-0 bg-[#090a0e] border-r border-[#161822] flex flex-col justify-between h-screen select-none">
      {/* Brand & Search */}
      <div className="flex flex-col">
        {/* Fathom Brand Header */}
        <div className="h-13 flex items-center justify-between px-4 border-b border-[#161822]">
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => {
              setCategoryFilter('all');
              navigate('/meetings');
            }}
          >
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-sm shadow-cyan-500/25 transition-transform group-hover:scale-105">
              <Sparkles className="w-3.5 h-3.5 text-black fill-black" />
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="font-bold text-sm tracking-tight text-white font-sans">
                fathom
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block shadow-[0_0_6px_#00d2ee]" />
            </div>
          </div>

          <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#13151f] text-cyan-400 border border-cyan-500/20">
            PRO
          </span>
        </div>

        {/* Quick Search Trigger */}
        <div className="px-3 pt-3">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium text-zinc-400 bg-[#0f1016] hover:bg-[#141620] border border-[#1b1e2a] hover:border-[#282d3e] rounded-lg transition-all group shadow-inner"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Search className="w-3.5 h-3.5 text-zinc-500 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
              <span className="text-[11px] text-zinc-400 truncate">Search calls...</span>
            </div>
            <kbd className="text-[10px] bg-[#171924] text-zinc-400 px-1 py-0.5 rounded font-mono border border-[#222636] flex-shrink-0">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Main Nav Links */}
        <nav className="p-3 space-y-1">
          <div className="px-1 pb-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
              Main
            </span>
          </div>

          <NavLink
            to="/meetings"
            end
            onClick={() => setCategoryFilter('all')}
            className={({ isActive }) =>
              `flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-300 font-semibold border border-cyan-500/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#12131b]'
              }`
            }
          >
            <div className="flex items-center gap-2">
              <Video className="w-3.5 h-3.5 text-zinc-400" />
              <span>All Meetings</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#161822] text-zinc-400 font-mono">
              {meetings.length}
            </span>
          </NavLink>

          <button
            onClick={() => {
              navigate('/meetings');
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-[#12131b] rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <CheckSquare className="w-3.5 h-3.5 text-zinc-400" />
              <span>Action Items</span>
            </div>
            {pendingActionCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/30 font-mono">
                {pendingActionCount}
              </span>
            )}
          </button>

          {/* Smart Views / Categories */}
          <div className="pt-3 px-1 pb-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
              Smart Views
            </span>
          </div>

          <button
            onClick={() => handleFilterNavigate('customer')}
            className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-[#12131b] rounded-lg transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <FolderOpen className="w-3.5 h-3.5 text-cyan-400/80" />
              <span className="truncate">Customer Deals</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">1</span>
          </button>

          <button
            onClick={() => handleFilterNavigate('team')}
            className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-[#12131b] rounded-lg transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400/80" />
              <span className="truncate">Engineering & Ops</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">2</span>
          </button>

          <button
            onClick={() => handleFilterNavigate('one_on_one')}
            className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-[#12131b] rounded-lg transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-emerald-400/80" />
              <span className="truncate">1-on-1 Reviews</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">1</span>
          </button>

          {/* Hero Recording Pin */}
          <div className="pt-3 px-1 pb-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
              Featured Hero
            </span>
          </div>

          <button
            onClick={() => navigate('/meetings/enterprise-sales-discovery-acme')}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-[#10121a] hover:bg-[#151824] border border-[#1b1e2c] hover:border-cyan-500/30 rounded-lg transition-all group text-left shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 animate-pulse" />
            <span className="truncate text-[11px] font-medium text-zinc-200 group-hover:text-cyan-300">
              Acme Sales Demo
            </span>
            <span className="ml-auto text-[8px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 font-mono border border-cyan-500/30 flex-shrink-0">
              AUDIO
            </span>
          </button>
        </nav>
      </div>

      {/* Footer Profile & Reset */}
      <div className="p-3 border-t border-[#161822] space-y-2 bg-[#08090d]">
        <button
          onClick={handleReset}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-medium text-zinc-500 hover:text-zinc-300 hover:bg-[#12131b] rounded-md transition-all border border-transparent hover:border-[#1d202d]"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Demo Data</span>
        </button>

        {/* User Profile Tile */}
        <div className="flex items-center gap-2.5 pt-1 px-1">
          <img
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=64&h=64&fit=crop&crop=face"
            alt="Sarah Lin"
            className="w-7 h-7 rounded-full border border-cyan-500/40 object-cover shadow-sm"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-zinc-200 truncate leading-tight">Sarah Lin</p>
            <p className="text-[10px] text-zinc-500 truncate leading-tight">CloudScale HQ</p>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] flex-shrink-0" title="Online" />
        </div>
      </div>
    </aside>
  );
};

