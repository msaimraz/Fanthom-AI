import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';
import { GlobalSearchModal } from '../components/layout/GlobalSearchModal';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { MeetingDetailPage } from '../features/detail/MeetingDetailPage';
import { ShareClipPage } from '../features/clips/ShareClipPage';

export const App: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <Routes>
      {/* Standalone Public Share View */}
      <Route path="/share/:clipId" element={<ShareClipPage />} />

      {/* Main Workspace Layout */}
      <Route
        path="*"
        element={
          <div className="flex h-screen w-screen bg-[#0a0b0d] text-zinc-100 overflow-hidden font-sans antialiased">
            {/* Sidebar navigation */}
            <Sidebar onOpenSearch={() => setIsSearchOpen(true)} />

            {/* Main content wrapper */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
              <Navbar onOpenSearch={() => setIsSearchOpen(true)} />

              <main className="flex-1 overflow-y-auto min-h-0">
                <Routes>
                  <Route path="/" element={<Navigate to="/meetings" replace />} />
                  <Route path="/meetings" element={<DashboardPage />} />
                  <Route path="/meetings/:id" element={<MeetingDetailPage />} />
                  <Route path="*" element={<Navigate to="/meetings" replace />} />
                </Routes>
              </main>
            </div>

            {/* Global Cmd+K Search Palette */}
            <GlobalSearchModal
              isOpen={isSearchOpen}
              onClose={() => setIsSearchOpen(false)}
            />
          </div>
        }
      />
    </Routes>
  );
};

export default App;

