'use client';

import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';

export default function DashboardShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div
        className="dashboard-main-content"
        style={{
          marginLeft: 'var(--sidebar-width)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          transition: 'margin-left 0.25s ease',
        }}
      >
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main style={{ flex: 1, padding: '1.75rem 2rem', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
          {children}
        </main>
      </div>
      <style jsx global>{`
        @media (max-width: 1024px) {
          .dashboard-main-content {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
