import React from 'react';
import { useStats } from '../hooks/useStats';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Mail, CheckCircle, Calendar } from 'lucide-react';

function Dashboard() {
  const { stats, loading, error } = useStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-indigo-500 border-t-transparent mb-3"></div>
          <p className="text-gray-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card border-red-100 bg-red-50">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Sent',
      value: stats?.totalSent || 0,
      sub: 'All time',
      Icon: Mail,
      iconBg: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      iconColor: '#fff',
    },
    {
      label: 'Last 24h',
      value: stats?.lastDay.count || 0,
      sub: `${stats?.lastDay.percentage ?? 0}% of total`,
      Icon: TrendingUp,
      iconBg: '#f0fdf4',
      iconColor: '#16a34a',
    },
    {
      label: 'Last 7 days',
      value: stats?.lastWeek.count || 0,
      sub: `${stats?.lastWeek.percentage ?? 0}% of total`,
      Icon: CheckCircle,
      iconBg: '#fffbeb',
      iconColor: '#d97706',
    },
    {
      label: 'Last 30 days',
      value: stats?.lastMonth.count || 0,
      sub: `${stats?.lastMonth.percentage ?? 0}% of total`,
      Icon: Calendar,
      iconBg: '#f5f5ff',
      iconColor: '#6366f1',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, sub, Icon, iconBg, iconColor }) => (
          <div key={label} className="stat-card">
            <div className="flex items-start justify-between mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
              <div
                className="p-2 rounded-xl flex-shrink-0"
                style={{ background: iconBg }}
              >
                <Icon className="w-4 h-4" style={{ color: iconColor }} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
            <p className="text-xs text-gray-400 mt-1.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      {stats && stats.chartData.length > 0 && (
        <div className="card">
          <div className="mb-6">
            <h2 className="text-base font-bold text-gray-900">Emails Sent Over Time</h2>
            <p className="text-xs text-gray-400 mt-0.5">Track your campaign performance</p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={stats.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="date" stroke="#ccc" tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
              <YAxis stroke="#ccc" tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} width={30} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ebebeb',
                  borderRadius: '10px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  fontSize: 13,
                }}
                labelStyle={{ color: '#111', fontWeight: 600 }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={{ fill: '#6366f1', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#6366f1' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Emails */}
      <div className="card">
        <div className="mb-5">
          <h2 className="text-base font-bold text-gray-900">Recent Emails</h2>
          <p className="text-xs text-gray-400 mt-0.5">Latest sent emails from your campaigns</p>
        </div>
        {stats && stats.recentEmails.length > 0 ? (
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Subject</th>
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Sent At</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentEmails.map((email, idx) => (
                  <tr key={idx} className="table-row-hover" style={{ borderBottom: '1px solid #f7f7f8' }}>
                    <td className="py-3 px-3 font-medium text-gray-900">{email.email}</td>
                    <td className="py-3 px-3 text-gray-600">{email.name}</td>
                    <td className="py-3 px-3 text-gray-500 truncate max-w-xs">{email.subject}</td>
                    <td className="py-3 px-3 text-gray-400 text-xs">
                      {new Date(email.sent_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-14">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{ background: '#f5f5ff' }}>
              <Mail className="w-6 h-6" style={{ color: '#6366f1' }} />
            </div>
            <p className="text-gray-600 font-medium text-sm">No emails sent yet</p>
            <p className="text-gray-400 text-xs mt-1">Start by uploading a CSV to send emails</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
