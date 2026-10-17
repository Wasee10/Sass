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
        <main
          className="dashboard-main-area"
          style={{ flex: 1, padding: '1.75rem 2rem', maxWidth: '1440px', width: '100%', margin: '0 auto' }}
        >
          {children}
        </main>
      </div>
      <style jsx global>{`
        @media (max-width: 1024px) {
          .dashboard-main-content {
            margin-left: 0 !important;
          }
        }
        @media (max-width: 768px) {
          .dashboard-main-area {
            padding: 1.25rem 1rem !important;
          }
        }
        @media (max-width: 480px) {
          .dashboard-main-area {
            padding: 1rem 0.75rem !important;
          }
        }
      `}</style>
    </div>
  );
}
