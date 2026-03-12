import React from 'react';
import { useStats } from '../hooks/useStats';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Mail, CheckCircle, AlertCircle } from 'lucide-react';

function Dashboard() {
  const { stats, loading, error } = useStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="mt-4 text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Sent Card */}
        <div className="stat-card flex flex-col items-start justify-between">
          <div className="w-full">
            <div className="flex items-center justify-between mb-3">
              <p className="text-slate-600 text-xs font-semibold uppercase tracking-wide">Total Sent</p>
              <div className="p-2 rounded-lg bg-orange-100">
                <Mail className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <p className="text-4xl font-bold text-slate-900">{stats?.totalSent || 0}</p>
            <p className="text-slate-500 text-xs mt-2">All time</p>
          </div>
        </div>

        {/* Last 24 Hours Card */}
        <div className="stat-card flex flex-col items-start justify-between">
          <div className="w-full">
            <div className="flex items-center justify-between mb-3">
              <p className="text-slate-600 text-xs font-semibold uppercase tracking-wide">Last 24h</p>
              <div className="p-2 rounded-lg bg-blue-100">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-4xl font-bold text-slate-900">{stats?.lastDay.count || 0}</p>
            <p className="text-slate-500 text-xs mt-2">{stats?.lastDay.percentage}% of total</p>
          </div>
        </div>

        {/* Last 7 Days Card */}
        <div className="stat-card flex flex-col items-start justify-between">
          <div className="w-full">
            <div className="flex items-center justify-between mb-3">
              <p className="text-slate-600 text-xs font-semibold uppercase tracking-wide">Last 7 days</p>
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-4xl font-bold text-slate-900">{stats?.lastWeek.count || 0}</p>
            <p className="text-slate-500 text-xs mt-2">{stats?.lastWeek.percentage}% of total</p>
          </div>
        </div>

        {/* Last 30 Days Card */}
        <div className="stat-card flex flex-col items-start justify-between">
          <div className="w-full">
            <div className="flex items-center justify-between mb-3">
              <p className="text-slate-600 text-xs font-semibold uppercase tracking-wide">Last 30 days</p>
              <div className="p-2 rounded-lg bg-purple-100">
                <AlertCircle className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-4xl font-bold text-slate-900">{stats?.lastMonth.count || 0}</p>
            <p className="text-slate-500 text-xs mt-2">{stats?.lastMonth.percentage}% of total</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      {stats && stats.chartData.length > 0 && (
        <div className="card-elevated">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">Emails Sent Over Time</h2>
            <p className="text-slate-500 text-sm mt-1">Track your campaign performance</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#f97316"
                strokeWidth={3}
                dot={{ fill: '#f97316', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Emails */}
      <div className="card-elevated">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">Recent Emails</h2>
          <p className="text-slate-500 text-sm mt-1">Latest sent emails from your campaigns</p>
        </div>
        {stats && stats.recentEmails.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Subject</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Sent At</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentEmails.map((email, idx) => (
                  <tr key={idx} className="table-row-hover border-b border-slate-100 last:border-b-0">
                    <td className="py-4 px-4 text-slate-900 font-medium">{email.email}</td>
                    <td className="py-4 px-4 text-slate-700">{email.name}</td>
                    <td className="py-4 px-4 text-slate-600 truncate max-w-xs">{email.subject}</td>
                    <td className="py-4 px-4 text-slate-500 text-xs">
                      {new Date(email.sent_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Mail className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No emails sent yet</p>
            <p className="text-slate-400 text-sm mt-1">Start by uploading a CSV to send emails</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
