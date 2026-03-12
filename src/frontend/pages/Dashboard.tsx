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
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card flex items-start justify-between">
          <div>
            <p className="text-slate-600 text-sm">Total Sent</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{stats?.totalSent || 0}</p>
          </div>
          <Mail className="w-8 h-8 text-orange-500" />
        </div>

        <div className="card flex items-start justify-between">
          <div>
            <p className="text-slate-600 text-sm">Last 24 Hours</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{stats?.lastDay.count || 0}</p>
            <p className="text-slate-500 text-xs mt-1">{stats?.lastDay.percentage}% of total</p>
          </div>
          <TrendingUp className="w-8 h-8 text-blue-500" />
        </div>

        <div className="card flex items-start justify-between">
          <div>
            <p className="text-slate-600 text-sm">Last 7 Days</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{stats?.lastWeek.count || 0}</p>
            <p className="text-slate-500 text-xs mt-1">{stats?.lastWeek.percentage}% of total</p>
          </div>
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>

        <div className="card flex items-start justify-between">
          <div>
            <p className="text-slate-600 text-sm">Last 30 Days</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{stats?.lastMonth.count || 0}</p>
            <p className="text-slate-500 text-xs mt-1">{stats?.lastMonth.percentage}% of total</p>
          </div>
          <AlertCircle className="w-8 h-8 text-purple-500" />
        </div>
      </div>

      {/* Chart */}
      {stats && stats.chartData.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Emails Sent Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#f97316" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Emails */}
      <div className="card">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Emails</h2>
        {stats && stats.recentEmails.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-4 font-semibold text-slate-600">Email</th>
                  <th className="text-left py-2 px-4 font-semibold text-slate-600">Name</th>
                  <th className="text-left py-2 px-4 font-semibold text-slate-600">Subject</th>
                  <th className="text-left py-2 px-4 font-semibold text-slate-600">Sent At</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentEmails.map((email, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-900">{email.email}</td>
                    <td className="py-3 px-4 text-slate-900">{email.name}</td>
                    <td className="py-3 px-4 text-slate-600 truncate">{email.subject}</td>
                    <td className="py-3 px-4 text-slate-500 text-xs">
                      {new Date(email.sent_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-500 text-center py-8">No emails sent yet</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
