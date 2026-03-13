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
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-black transition-colors duration-300">
          <div className="w-full">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide">Total Sent</p>
              <div className="p-2 rounded-lg bg-black text-white">
                <Mail className="w-5 h-5" />
              </div>
            </div>
            <p className="text-4xl font-bold text-black">{stats?.totalSent || 0}</p>
            <p className="text-gray-500 text-xs mt-2">All time</p>
          </div>
        </div>

        {/* Last 24 Hours Card */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-black transition-colors duration-300">
          <div className="w-full">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide">Last 24h</p>
              <div className="p-2 rounded-lg bg-gray-100">
                <TrendingUp className="w-5 h-5 text-black" />
              </div>
            </div>
            <p className="text-4xl font-bold text-black">{stats?.lastDay.count || 0}</p>
            <p className="text-gray-500 text-xs mt-2">{stats?.lastDay.percentage}% of total</p>
          </div>
        </div>

        {/* Last 7 Days Card */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-black transition-colors duration-300">
          <div className="w-full">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide">Last 7 days</p>
              <div className="p-2 rounded-lg bg-gray-100">
                <CheckCircle className="w-5 h-5 text-black" />
              </div>
            </div>
            <p className="text-4xl font-bold text-black">{stats?.lastWeek.count || 0}</p>
            <p className="text-gray-500 text-xs mt-2">{stats?.lastWeek.percentage}% of total</p>
          </div>
        </div>

        {/* Last 30 Days Card */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-black transition-colors duration-300">
          <div className="w-full">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide">Last 30 days</p>
              <div className="p-2 rounded-lg bg-gray-100">
                <AlertCircle className="w-5 h-5 text-black" />
              </div>
            </div>
            <p className="text-4xl font-bold text-black">{stats?.lastMonth.count || 0}</p>
            <p className="text-gray-500 text-xs mt-2">{stats?.lastMonth.percentage}% of total</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      {stats && stats.chartData.length > 0 && (
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-black">Emails Sent Over Time</h2>
            <p className="text-gray-500 text-sm mt-1">Track your campaign performance</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '2px solid #000000',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#000000"
                strokeWidth={3}
                dot={{ fill: '#000000', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Emails */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-black">Recent Emails</h2>
          <p className="text-gray-500 text-sm mt-1">Latest sent emails from your campaigns</p>
        </div>
        {stats && stats.recentEmails.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-gray-300">
            <table className="w-full text-sm">
              <thead className="bg-black text-white border-b border-gray-300">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold">Email</th>
                  <th className="text-left py-3 px-4 font-semibold">Name</th>
                  <th className="text-left py-3 px-4 font-semibold">Subject</th>
                  <th className="text-left py-3 px-4 font-semibold">Sent At</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentEmails.map((email, idx) => (
                  <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50 transition-colors last:border-b-0">
                    <td className="py-4 px-4 text-black font-medium">{email.email}</td>
                    <td className="py-4 px-4 text-gray-700">{email.name}</td>
                    <td className="py-4 px-4 text-gray-600 truncate max-w-xs">{email.subject}</td>
                    <td className="py-4 px-4 text-gray-500 text-xs">
                      {new Date(email.sent_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No emails sent yet</p>
            <p className="text-gray-400 text-sm mt-1">Start by uploading a CSV to send emails</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
