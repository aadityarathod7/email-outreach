import React, { useState } from 'react';
import { useEmails } from '../hooks/useEmails';
import { Upload, Send, Eye } from 'lucide-react';

function EmailSender() {
  const [csvContent, setCsvContent] = useState('');
  const [preview, setPreview] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const { sendEmails, sending } = useEmails();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCsvContent(event.target?.result as string);
      setResults(null);
    };
    reader.readAsText(file);
  };

  const handlePreview = async () => {
    setPreviewLoading(true);
    setPreview(true);
    const result = await sendEmails(csvContent, true);
    if (result) {
      setResults({ ...result, dryRun: true });
    }
    setPreviewLoading(false);
  };

  const handleSend = async () => {
    if (!confirm('Send emails to all users in the CSV?')) return;
    setPreview(false);
    const result = await sendEmails(csvContent, false);
    if (result) {
      setResults({ ...result, dryRun: false });
    }
    setCsvContent('');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Section */}
        <div className="lg:col-span-1 card">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Upload CSV</h2>

          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors cursor-pointer">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer block">
              <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="text-slate-600 font-medium">Click to upload CSV</p>
              <p className="text-slate-500 text-sm">or drag and drop</p>
            </label>
          </div>

          {csvContent && (
            <div className="mt-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-700 text-sm font-medium">✓ CSV loaded</p>
                <p className="text-green-600 text-xs mt-1">
                  {csvContent.split('\n').length - 1} records found
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="lg:col-span-2">
          <div className="card space-y-4 h-full flex flex-col">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4">Actions</h2>
              <p className="text-slate-600 text-sm mb-4">
                {preview
                  ? '✓ Preview mode - emails will NOT be sent'
                  : 'Click Preview to generate a dry-run, or Send to actually send emails.'}
              </p>
            </div>

            <div className="flex gap-3 mt-auto">
              <button
                onClick={handlePreview}
                disabled={!csvContent || previewLoading || sending}
                className="flex items-center gap-2 btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Eye className="w-4 h-4" />
                {previewLoading ? 'Generating...' : 'Preview'}
              </button>
              <button
                onClick={handleSend}
                disabled={!csvContent || previewLoading || sending}
                className="flex items-center gap-2 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                {sending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="card">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            {results.dryRun ? 'Preview Results' : 'Send Results'}
          </h2>

          {results.dryRun && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-blue-700 text-sm font-medium">
                ℹ️ Preview Mode - Emails shown below would be sent. No actual emails sent yet.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-slate-600 text-sm">Total</p>
              <p className="text-2xl font-bold text-slate-900">{results.total}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-green-600 text-sm">{results.dryRun ? 'Ready' : 'Sent'}</p>
              <p className="text-2xl font-bold text-green-600">{results.sent}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-yellow-600 text-sm">Skipped</p>
              <p className="text-2xl font-bold text-yellow-600">{results.skipped}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-red-600 text-sm">Failed</p>
              <p className="text-2xl font-bold text-red-600">{results.failed}</p>
            </div>
          </div>

          {/* Details Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-4 font-semibold text-slate-600">Email</th>
                  <th className="text-left py-2 px-4 font-semibold text-slate-600">Status</th>
                  <th className="text-left py-2 px-4 font-semibold text-slate-600">Details</th>
                </tr>
              </thead>
              <tbody>
                {results.details.map((detail: any, idx: number) => (
                  <tr key={idx} className="border-b border-slate-100">
                    <td className="py-3 px-4 text-slate-900">{detail.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          detail.status === 'sent' || detail.status === 'ready'
                            ? 'bg-green-100 text-green-700'
                            : detail.status === 'skipped'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {detail.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-xs">
                      {detail.subject || detail.reason || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmailSender;
