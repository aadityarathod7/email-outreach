import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Menu, X, Mail, BarChart3, Send, Eye, Clock, Settings } from 'lucide-react';
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
      <div className="flex h-screen bg-white">
        {/* Mobile overlay backdrop */}
        {sidebarOpen && (
          <div
            className="fixed sm:hidden inset-0 bg-black/50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar - Overlay on mobile, fixed on larger screens */}
        <div
          className={`${
            sidebarOpen ? 'w-64' : 'w-20'
          } fixed sm:relative z-40 sm:z-auto h-screen sm:h-auto bg-black text-white transition-all duration-300 ease-out flex flex-col border-r border-gray-800 shadow-xl ${
            !sidebarOpen && 'hidden sm:flex -translate-x-full sm:translate-x-0'
          }`}
        >
          {/* Logo */}
          <div className="p-4 flex items-center justify-between border-b border-gray-800">
            {sidebarOpen && (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white shadow-lg">
                  <Mail className="w-5 h-5 text-black" />
                </div>
                <div>
                  <span className="font-bold text-lg block">OutReach</span>
                  <span className="text-xs text-gray-400">v1.0.0</span>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-all duration-200"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1">
            {[
              { path: '/', label: 'Dashboard', Icon: BarChart3 },
              { path: '/sender', label: 'Send Emails', Icon: Send },
              { path: '/history', label: 'History', Icon: Clock },
              { path: '/config', label: 'Settings', Icon: Settings },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-all duration-200 group relative text-white hover:text-white"
              >
                <item.Icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
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
            <div className="p-4 border-t border-gray-800 text-xs text-gray-300 bg-gray-900">
              <p className="font-semibold text-white">Email Outreach</p>
              <p className="mt-1 text-gray-400">Personalized campaigns at scale</p>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden w-full sm:w-auto">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-black">
                  Email Outreach
                </h1>
                <p className="text-gray-600 text-sm mt-1">Manage your personalized email campaigns</p>
              </div>
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="sm:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X className="w-6 h-6 text-black" /> : <Menu className="w-6 h-6 text-black" />}
              </button>
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
