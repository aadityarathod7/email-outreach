import React, { useState } from 'react';
import { useEmails } from '../hooks/useEmails';
import { Upload, Send, Eye, CheckCircle, Mail } from 'lucide-react';

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

  const handlePreview = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setPreviewLoading(true);
    setPreview(true);
    const result = await sendEmails(csvContent, true);
    if (result) {
      setResults({ ...result, dryRun: true });
    }
    setPreviewLoading(false);
  };

  const handleSend = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
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
        <div className="lg:col-span-1 card-elevated">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Upload CSV</h2>
          <p className="text-slate-600 text-sm mb-6">Add your email list</p>

          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-orange-500 hover:bg-orange-50 transition-all duration-300 cursor-pointer group">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer block">
              <div className="inline-block p-3 rounded-lg bg-slate-100 group-hover:bg-orange-100 transition-all duration-300 mb-3">
                <Upload className="w-6 h-6 text-slate-600 group-hover:text-orange-600 transition-colors" />
              </div>
              <p className="text-slate-700 font-semibold">Click to upload</p>
              <p className="text-slate-500 text-sm mt-1">or drag and drop your CSV file</p>
            </label>
          </div>

          {csvContent && (
            <div className="mt-4 animate-slide-in-up">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <p className="text-green-700 text-sm font-semibold">CSV Successfully Loaded</p>
                </div>
                <p className="text-green-600 text-xs">
                  {csvContent.split('\n').length - 1} records ready to process
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="lg:col-span-2">
          <div className="card-elevated space-y-6 h-full flex flex-col">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">Email Campaign</h2>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mt-3 ${
                preview
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-slate-100 text-slate-700'
              }`}>
                {preview && <Eye className="w-3 h-3" />}
                {!preview && <Mail className="w-3 h-3" />}
                {preview ? 'Preview Mode' : 'Ready to Send'}
              </div>
              <p className="text-slate-600 text-sm mt-4">
                {preview
                  ? 'Preview mode is active. Emails shown in results will NOT be sent.'
                  : 'Generate a preview first to review emails before sending.'}
              </p>
            </div>

            {!results ? (
              <button
                onClick={handlePreview}
                disabled={!csvContent || previewLoading || sending}
                className="flex items-center gap-2 btn-secondary disabled:opacity-50 disabled:cursor-not-allowed w-full justify-center mt-auto"
                type="button"
              >
                <Eye className="w-4 h-4" />
                {previewLoading ? 'Generating Preview...' : 'Preview Emails'}
              </button>
            ) : (
              <div className="flex gap-3 mt-auto">
                <button
                  onClick={handlePreview}
                  disabled={!csvContent || previewLoading || sending}
                  className="flex items-center gap-2 btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex-1 justify-center"
                  type="button"
                >
                  <Eye className="w-4 h-4" />
                  {previewLoading ? 'Regenerating...' : 'Regenerate'}
                </button>
                <button
                  onClick={handleSend}
                  disabled={previewLoading || sending}
                  className="flex items-center gap-2 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex-1 justify-center"
                  type="button"
                >
                  <Send className="w-4 h-4" />
                  {sending ? 'Sending Emails...' : 'Send Now'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="card-elevated animate-slide-in-up">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
              {results.dryRun ? (
                <>
                  <Eye className="w-6 h-6" />
                  Preview Results
                </>
              ) : (
                <>
                  <CheckCircle className="w-6 h-6" />
                  Send Results
                </>
              )}
            </h2>
            <p className="text-slate-600 text-sm">
              {results.dryRun
                ? 'Review the emails below before sending'
                : 'Emails have been processed successfully'}
            </p>
          </div>

          {results.dryRun && (
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-300 rounded-lg p-4 mb-6">
              <p className="text-blue-700 text-sm font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Preview Mode Active
              </p>
              <p className="text-blue-600 text-xs mt-2">
                These emails will be generated. Click "Send" to proceed with actual sending.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
              <p className="text-slate-600 text-xs font-semibold uppercase tracking-wide">Total</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{results.total}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
              <p className="text-green-600 text-xs font-semibold uppercase tracking-wide">{results.dryRun ? 'Ready' : 'Sent'}</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{results.sent}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-4 border border-yellow-200">
              <p className="text-yellow-600 text-xs font-semibold uppercase tracking-wide">Skipped</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{results.skipped}</p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-4 border border-red-200">
              <p className="text-red-600 text-xs font-semibold uppercase tracking-wide">Failed</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{results.failed}</p>
            </div>
          </div>

          {/* Email Preview Cards */}
          <div className="space-y-4">
            {results.details.map((detail: any, idx: number) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-4 border-b border-slate-200">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 text-lg">{detail.email}</p>
                      <p className="text-sm text-slate-600 mt-2">
                        <span className="font-medium">Subject:</span> {detail.subject}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                        detail.status === 'sent' || detail.status === 'ready'
                          ? 'bg-green-100 text-green-700'
                          : detail.status === 'skipped'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      {detail.status.charAt(0).toUpperCase() + detail.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Email Body Preview */}
                {detail.body && (
                  <div className="p-4 bg-white">
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Email Preview</p>
                    <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 p-4 rounded border border-slate-200 font-sans">
                      {detail.body}
                    </div>
                  </div>
                )}

                {/* Error/Reason if any */}
                {detail.reason && (
                  <div className="p-4 bg-red-50 border-t border-red-200">
                    <p className="text-sm text-red-700"><span className="font-semibold">Reason:</span> {detail.reason}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default EmailSender;
