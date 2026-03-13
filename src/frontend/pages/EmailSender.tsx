import React, { useState } from 'react';
import { useEmails } from '../hooks/useEmails';
import { Upload, Send, Eye, CheckCircle, Mail, AlertCircle } from 'lucide-react';

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
    <div>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Upload and Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6 sm:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-black mb-2">Upload CSV</h2>
              <p className="text-gray-600 text-sm mb-6">Add your email list</p>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center hover:border-black hover:bg-gray-50 transition-all duration-300 cursor-pointer group">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="csv-upload"
                />
                <label htmlFor="csv-upload" className="cursor-pointer block">
                  <div className="inline-block p-3 rounded-lg bg-gray-100 group-hover:bg-black group-hover:text-white transition-all duration-300 mb-3">
                    <Upload className="w-6 h-6 text-black group-hover:text-white transition-colors" />
                  </div>
                  <p className="text-black font-semibold text-sm sm:text-base">Click to upload</p>
                  <p className="text-gray-600 text-xs sm:text-sm mt-1">or drag and drop</p>
                </label>
              </div>

              {csvContent && (
                <div className="mt-4 animate-slide-in-up">
                  <div className="bg-black text-white border border-gray-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                      <p className="text-white text-sm font-semibold">CSV Loaded</p>
                    </div>
                    <p className="text-gray-300 text-xs">
                      {csvContent.split('\n').length - 1} records ready
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions Section */}
          <div className="lg:col-span-2">
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6 sm:p-8 h-full flex flex-col">
              <div className="mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-black mb-3">Campaign Control</h2>
                <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold ${
                  preview
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-black'
                }`}>
                  {preview && <Eye className="w-3 h-3" />}
                  {!preview && <Mail className="w-3 h-3" />}
                  {preview ? 'Preview Mode' : 'Ready to Send'}
                </div>
                <p className="text-gray-600 text-sm mt-4">
                  {preview
                    ? 'Emails shown below will NOT be sent. Adjust and click Send Now.'
                    : 'Upload CSV and click Preview to review emails before sending.'}
                </p>
              </div>

              {!results ? (
                <button
                  onClick={handlePreview}
                  disabled={!csvContent || previewLoading || sending}
                  className="flex items-center justify-center gap-2 bg-black text-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 mt-auto"
                  type="button"
                >
                  <Eye className="w-4 h-4" />
                  {previewLoading ? 'Generating Preview...' : 'Preview Emails'}
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                  <button
                    onClick={handlePreview}
                    disabled={!csvContent || previewLoading || sending}
                    className="flex items-center justify-center gap-2 bg-gray-100 text-black font-semibold py-3 px-6 rounded-lg hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 flex-1"
                    type="button"
                  >
                    <Eye className="w-4 h-4" />
                    {previewLoading ? 'Regenerating...' : 'Regenerate'}
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={previewLoading || sending}
                    className="flex items-center justify-center gap-2 bg-black text-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 flex-1"
                    type="button"
                  >
                    <Send className="w-4 h-4" />
                    {sending ? 'Sending...' : 'Send Now'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Section */}
        {results && (
          <div className="animate-slide-in-up">
            {/* Results Header */}
            <div className="bg-black text-white rounded-xl p-6 sm:p-8 mb-6">
              <div className="flex items-center gap-3 mb-3">
                {results.dryRun ? (
                  <Eye className="w-6 h-6" />
                ) : (
                  <CheckCircle className="w-6 h-6" />
                )}
                <h2 className="text-2xl sm:text-3xl font-bold">
                  {results.dryRun ? 'Preview Results' : 'Send Results'}
                </h2>
              </div>
              <p className="text-gray-300 text-sm">
                {results.dryRun
                  ? 'Review the emails below before sending'
                  : 'All emails have been processed'}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                <p className="text-gray-600 text-xs font-semibold uppercase">Total</p>
                <p className="text-2xl sm:text-3xl font-bold text-black mt-2">{results.total}</p>
              </div>
              <div className="bg-white border-2 border-green-200 rounded-lg p-4">
                <p className="text-green-700 text-xs font-semibold uppercase">{results.dryRun ? 'Ready' : 'Sent'}</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-700 mt-2">{results.sent}</p>
              </div>
              <div className="bg-white border-2 border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-700 text-xs font-semibold uppercase">Skipped</p>
                <p className="text-2xl sm:text-3xl font-bold text-yellow-700 mt-2">{results.skipped}</p>
              </div>
              <div className="bg-white border-2 border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-xs font-semibold uppercase">Failed</p>
                <p className="text-2xl sm:text-3xl font-bold text-red-700 mt-2">{results.failed}</p>
              </div>
            </div>

            {/* Email Preview Cards */}
            <div className="space-y-4">
              {results.details.map((detail: any, idx: number) => (
                <div key={idx} className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:border-black transition-colors duration-300">
                  {/* Header */}
                  <div className="bg-gray-50 p-4 sm:p-6 border-b-2 border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-black text-sm sm:text-base break-all">{detail.email}</p>
                        <p className="text-gray-700 text-xs sm:text-sm mt-2 break-words">
                          <span className="font-semibold">Subject:</span> {detail.subject}
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
                    <div className="p-4 sm:p-6 bg-white">
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Email Body</p>
                      <div className="text-xs sm:text-sm text-gray-800 whitespace-pre-wrap leading-relaxed bg-gray-50 p-4 rounded border border-gray-200 font-mono">
                        {detail.body}
                      </div>
                    </div>
                  )}

                  {/* Error/Reason if any */}
                  {detail.reason && (
                    <div className="p-4 sm:p-6 bg-red-50 border-t-2 border-red-200 flex items-start gap-3">
                      <AlertCircle className="w-4 h-4 text-red-700 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700"><span className="font-semibold">Reason:</span> {detail.reason}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmailSender;
