import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Menu, X, Mail } from 'lucide-react';
import './styles/globals.css';

// Pages
import Dashboard from './pages/Dashboard';
import EmailSender from './pages/EmailSender';
import EmailPreview from './pages/EmailPreview';
import Configuration from './pages/Configuration';
import History from './pages/History';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Router>
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-orange-50">
        {/* Sidebar */}
        <div
          className={`${
            sidebarOpen ? 'w-64' : 'w-20'
          } bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-all duration-300 ease-out flex flex-col border-r border-slate-700/50 shadow-xl`}
        >
          {/* Logo */}
          <div className="p-4 flex items-center justify-between border-b border-slate-700/50 backdrop-blur-sm">
            {sidebarOpen && (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-bold text-lg block">OutReach</span>
                  <span className="text-xs text-slate-400">v1.0.0</span>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-700 rounded-lg transition-all duration-200"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1">
            {[
              { path: '/', label: 'Dashboard', icon: '📊' },
              { path: '/sender', label: 'Send Emails', icon: '📧' },
              { path: '/preview', label: 'Preview', icon: '👁️' },
              { path: '/history', label: 'History', icon: '📜' },
              { path: '/config', label: 'Settings', icon: '⚙️' },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-700/50 transition-all duration-200 group relative"
              >
                <span className="text-xl group-hover:scale-110 transition-transform duration-200">
                  {item.icon}
                </span>
                {sidebarOpen && (
                  <span className="text-sm font-medium group-hover:translate-x-1 transition-transform duration-200">
                    {item.label}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Footer */}
          {sidebarOpen && (
            <div className="p-4 border-t border-slate-700/50 text-xs text-slate-400 bg-slate-800/30 backdrop-blur-sm">
              <p className="font-semibold text-slate-300">Email Outreach</p>
              <p className="mt-1">Personalized campaigns at scale</p>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 px-6 py-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Email Outreach
                </h1>
                <p className="text-slate-600 text-sm mt-1">Manage your personalized email campaigns</p>
              </div>
            </div>
          </header>

          {/* Content */}
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
    </Router>
  );
}

export default App;
