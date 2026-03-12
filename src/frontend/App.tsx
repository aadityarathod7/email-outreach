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
      <div className="flex h-screen bg-slate-100">
        {/* Sidebar */}
        <div
          className={`${
            sidebarOpen ? 'w-64' : 'w-20'
          } bg-slate-900 text-white transition-all duration-300 flex flex-col`}
        >
          {/* Logo */}
          <div className="p-4 flex items-center justify-between border-b border-slate-700">
            {sidebarOpen && (
              <div className="flex items-center gap-2">
                <Mail className="w-6 h-6 text-orange-500" />
                <span className="font-bold text-lg">OutReach</span>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 hover:bg-slate-800 rounded"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
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
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <span className="text-lg">{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            ))}
          </nav>

          {/* Footer */}
          {sidebarOpen && (
            <div className="p-4 border-t border-slate-700 text-xs text-slate-400">
              <p>Email Outreach</p>
              <p>v1.0.0</p>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white shadow px-6 py-4">
            <h1 className="text-2xl font-bold text-slate-900">Email Outreach Dashboard</h1>
            <p className="text-slate-600 text-sm">Manage your personalized email campaigns</p>
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
