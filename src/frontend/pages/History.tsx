import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import client from '../api/client';

function History() {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selectedEmail, setSelectedEmail] = useState<any>(null);

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        setLoading(true);
        const data = await client.get('/emails/sent');
        setEmails(data.data || []);
      } catch (err) {
        console.error('Failed to fetch emails:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmails();
  }, []);

  const filteredEmails = emails.filter((email) =>
    email.email.toLowerCase().includes(filter.toLowerCase()) ||
    email.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Email History</h2>
          <p className="text-sm text-slate-600">{filteredEmails.length} emails</p>
        </div>

        <input
          type="text"
          placeholder="Filter by email or name..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input-field mb-4"
        />

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : filteredEmails.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No emails found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-600">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600">Subject</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600">Sent At</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmails.map((email, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                    onClick={() => setSelectedEmail(email)}
                  >
                    <td className="py-3 px-4 text-slate-900 font-medium">{email.email}</td>
                    <td className="py-3 px-4 text-slate-900">{email.name}</td>
                    <td className="py-3 px-4 text-slate-600 truncate max-w-xs">{email.subject}</td>
                    <td className="py-3 px-4 text-slate-500 text-xs">
                      {new Date(email.sent_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                        Sent
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Email Preview Modal */}
      {selectedEmail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{selectedEmail.subject}</h2>
                <p className="text-sm text-slate-600 mt-1">
                  To: {selectedEmail.email} ({selectedEmail.name})
                </p>
              </div>
              <button
                onClick={() => setSelectedEmail(null)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <p className="text-sm text-slate-600 mb-2">Email Body:</p>
                <p className="text-slate-900 whitespace-pre-wrap font-normal leading-relaxed">
                  {selectedEmail.body || 'No body content available'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <p className="text-xs text-slate-600 mb-1">Sent At:</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {new Date(selectedEmail.sent_at).toLocaleString()}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <p className="text-xs text-green-600 mb-1">Status:</p>
                  <p className="text-sm font-semibold text-green-700">Sent</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 p-4 flex justify-end">
              <button
                onClick={() => setSelectedEmail(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default History;
