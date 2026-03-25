import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Menu, X, Mail, BarChart3, Send, Clock, Settings, Zap } from 'lucide-react';
import './styles/globals.css';

import Dashboard from './pages/Dashboard';
import EmailSender from './pages/EmailSender';
import EmailPreview from './pages/EmailPreview';
import Configuration from './pages/Configuration';
import History from './pages/History';

const navItems = [
  { path: '/', label: 'Dashboard', Icon: BarChart3, description: 'Overview & stats' },
  { path: '/sender', label: 'Send Emails', Icon: Send, description: 'Launch campaigns' },
  { path: '/history', label: 'History', Icon: Clock, description: 'Sent emails log' },
  { path: '/config', label: 'Settings', Icon: Settings, description: 'Configuration' },
];

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Overview of your campaign performance' },
  '/sender': { title: 'Send Emails', subtitle: 'Generate and send personalized emails' },
  '/preview': { title: 'Email Preview', subtitle: 'Preview a single email before sending' },
  '/history': { title: 'History', subtitle: 'All sent emails and their status' },
  '/config': { title: 'Settings', subtitle: 'Configure your campaign settings' },
};

function Sidebar({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const location = useLocation();

  return (
    <div
      className={`${
        open ? 'w-64' : 'w-20'
      } fixed sm:relative z-40 sm:z-auto h-screen sm:h-auto text-white transition-all duration-300 ease-out flex flex-col shadow-2xl ${
        !open && 'hidden sm:flex'
      }`}
      style={{ background: 'linear-gradient(180deg, #0a0a0a 0%, #111111 50%, #0d0d0d 100%)' }}
    >
      {/* Logo */}
      <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {open && (
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl shadow-lg flex-shrink-0" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight block text-white">OutReach</span>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>AI-Powered Campaigns</span>
            </div>
          </div>
        )}
        {!open && (
          <div className="mx-auto p-2 rounded-xl" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <Zap className="w-4 h-4 text-white" />
          </div>
        )}
        {open && (
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg transition-all duration-200 flex-shrink-0"
            style={{ color: 'rgba(255,255,255,0.4)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 mt-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => window.innerWidth < 640 && onToggle()}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative"
              style={{
                background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
                borderLeft: isActive ? '2px solid #6366f1' : '2px solid transparent',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              <item.Icon
                className="w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                style={{ color: isActive ? '#818cf8' : 'rgba(255,255,255,0.5)' }}
              />
              {open && (
                <div>
                  <span
                    className="text-sm font-medium block leading-tight"
                    style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.7)' }}
                  >
                    {item.label}
                  </span>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{item.description}</span>
                </div>
              )}
              {isActive && !open && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-indigo-400 rounded-r" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {open && (
        <div className="p-4 m-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-green-400" style={{ boxShadow: '0 0 6px #4ade80' }} />
            <span className="text-xs font-semibold text-white">System Online</span>
          </div>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>ArtNovaAI Outreach v1.0</p>
        </div>
      )}
    </div>
  );
}

function Header({ sidebarOpen, onToggle }: { sidebarOpen: boolean; onToggle: () => void }) {
  const location = useLocation();
  const page = pageTitles[location.pathname] || pageTitles['/'];

  return (
    <header className="flex-shrink-0 px-6 py-4 flex items-center justify-between" style={{ background: '#fff', borderBottom: '1px solid #f1f1f1' }}>
      <div className="flex items-center gap-4">
        <button
          onClick={onToggle}
          className="hidden sm:flex p-2 rounded-lg transition-all duration-200 hover:bg-gray-100"
        >
          <Menu className="w-4 h-4 text-gray-500" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 leading-tight">{page.title}</h1>
          <p className="text-xs text-gray-400 mt-0.5">{page.subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium" style={{ background: '#f8f8f8', border: '1px solid #ebebeb', color: '#666' }}>
          <Mail className="w-3 h-3" />
          aayushi@artnovaai.com
        </div>
        <button
          onClick={onToggle}
          className="sm:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {sidebarOpen ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
        </button>
      </div>
    </header>
  );
}

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen" style={{ background: '#f7f7f8' }}>
      {sidebarOpen && (
        <div
          className="fixed sm:hidden inset-0 bg-black/60 z-30 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header sidebarOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-auto p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sender" element={<EmailSender />} />
            <Route path="/preview" element={<EmailPreview />} />
            <Route path="/history" element={<History />} />
            <Route path="/config" element={<Configuration />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
