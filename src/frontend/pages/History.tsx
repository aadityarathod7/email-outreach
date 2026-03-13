import React, { useState, useEffect } from 'react';
import { X, Mail } from 'lucide-react';
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
    email.name.toLowerCase().includes(filter.toLowerCase()) ||
    email.subject.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card-elevated">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-black">Email History</h2>
            <p className="text-gray-600 text-sm mt-1">Review all sent emails</p>
          </div>
          <div className="bg-gray-100 px-4 py-2 rounded-lg border border-gray-200">
            <p className="text-black font-semibold text-lg">{filteredEmails.length}</p>
            <p className="text-gray-600 text-xs">emails found</p>
          </div>
        </div>

        <input
          type="text"
          placeholder="Search by email, name, or subject..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input-field mb-6"
        />

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-black mb-3"></div>
            <p className="text-gray-600 font-medium">Loading email history...</p>
          </div>
        ) : filteredEmails.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No emails found</p>
            <p className="text-gray-500 text-sm mt-1">{filter ? 'Try adjusting your search filters' : 'Start sending emails to see them here'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-black text-white border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-white">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-white">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-white">Subject</th>
                  <th className="text-left py-3 px-4 font-semibold text-white">Sent At</th>
                  <th className="text-left py-3 px-4 font-semibold text-white">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmails.map((email, idx) => (
                  <tr
                    key={idx}
                    className="table-row-hover border-b border-gray-100 last:border-b-0"
                    onClick={() => setSelectedEmail(email)}
                  >
                    <td className="py-4 px-4 text-black font-medium">{email.email}</td>
                    <td className="py-4 px-4 text-gray-700">{email.name}</td>
                    <td className="py-4 px-4 text-gray-600 truncate max-w-xs">{email.subject}</td>
                    <td className="py-4 px-4 text-gray-500 text-xs">
                      {new Date(email.sent_at).toLocaleString()}
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-black">{selectedEmail.subject}</h2>
                <div className="flex items-center gap-2 mt-3">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <p className="text-sm text-gray-600">
                    To: <span className="font-semibold">{selectedEmail.email}</span> • {selectedEmail.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmail(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-4"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-6">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-3">Email Body</p>
                <p className="text-black whitespace-pre-wrap font-normal leading-relaxed text-base">
                  {selectedEmail.body || 'No body content available'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-2">Sent At</p>
                  <p className="text-sm font-semibold text-black">
                    {new Date(selectedEmail.sent_at).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(selectedEmail.sent_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <p className="text-xs text-green-600 font-semibold uppercase tracking-wide mb-2">Status</p>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <p className="text-sm font-semibold text-green-700">Delivered</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-8 py-4 flex justify-end gap-3">
              <button
                onClick={() => setSelectedEmail(null)}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all font-semibold text-sm shadow-md hover:shadow-lg"
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
