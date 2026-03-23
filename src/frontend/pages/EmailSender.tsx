import React, { useState } from 'react';
import { useEmails } from '../hooks/useEmails';
import { Upload, Send, Eye, CheckCircle, Mail, AlertCircle, RotateCcw } from 'lucide-react';

function EmailSender() {
  const [csvContent, setCsvContent] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [preview, setPreview] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [editedDetails, setEditedDetails] = useState<{[key: number]: any}>({});
  const { sendEmails, sending } = useEmails();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Store file contents in order using indexed array (handles async FileReader correctly)
    const fileContents: string[] = new Array(files.length);
    let processedFiles = 0;

    Array.from(files).forEach((file, fileIndex) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        fileContents[fileIndex] = event.target?.result as string;
        processedFiles++;

        // Only combine after ALL files are read, preserving order
        if (processedFiles === files.length) {
          let combined = '';
          fileContents.forEach((content, idx) => {
            const lines = content.split('\n').filter((l) => l.trim() !== '');
            if (idx === 0) {
              combined = lines.join('\n');
            } else {
              // Skip header row for subsequent files
              combined += '\n' + lines.slice(1).join('\n');
            }
          });
          setCsvContent(combined);
          setResults(null);
        }
      };
      reader.readAsText(file);
    });
  };

  const handlePreview = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setPreviewLoading(true);
    setPreview(true);
    const result = await sendEmails(csvContent, true, customPrompt);
    if (result) {
      setResults({ ...result, dryRun: true });
    }
    setPreviewLoading(false);
  };

  const handleSend = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Send emails to all users in the CSV?')) return;

    // Apply any remaining edits to results before sending
    const finalDetails = results.details.map((detail: any, idx: number) => {
      return editedDetails[idx] && editedDetails[idx] !== null ? editedDetails[idx] : detail;
    });

    setPreview(false);

    try {
      // Send emails sequentially with 3-minute delay between each
      const sendResults: any[] = [];
      const updatedDetails = [...finalDetails];

      for (let i = 0; i < finalDetails.length; i++) {
        const detail = finalDetails[i];

        // Update UI to show which email is currently sending
        setResults((prev: any) => ({
          ...prev,
          dryRun: false,
          details: updatedDetails.map((d, j) => ({
            ...d,
            status: j < i ? (sendResults[j]?.error ? 'failed' : 'sent') : j === i ? 'sending' : d.status,
          })),
        }));

        const result = await fetch('/api/emails/send-single', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: detail.email,
            subject: detail.subject,
            body: detail.body,
          }),
        })
          .then((res) => res.json())
          .catch((err) => ({ error: err.message }));

        sendResults.push(result);

        // Wait 2 minutes before next email (skip after last one)
        if (i < finalDetails.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 2 * 60 * 1000));
        }
      }

      // Final update showing all results
      setResults((prev: any) => ({
        ...prev,
        dryRun: false,
        details: finalDetails.map((detail: any, idx: number) => ({
          ...detail,
          status: sendResults[idx]?.error ? 'failed' : 'sent',
          reason: sendResults[idx]?.error,
        })),
        sent: sendResults.filter((r) => !r.error).length,
        failed: sendResults.filter((r) => r.error).length,
      }));
    } catch (err) {
      console.error('Error sending emails:', err);
      alert('Failed to send emails');
    }

    setCsvContent('');
    setEditedDetails({});
  };

  const handleReloadFailed = async (idx: number, detail: any) => {
    try {
      // Retry generating email for this specific user
      const updatedDetails = [...results.details];
      updatedDetails[idx] = { ...detail, isReloading: true };
      setResults({ ...results, details: updatedDetails });

      // Call the API to regenerate this email
      const response = await fetch('/api/emails/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: detail.email,
          name: detail.name || 'User',
          plan: detail.plan || 'Gold',
          totalImages: detail.totalImages || 0,
          prompts: detail.prompts || [],
          customPrompt: customPrompt || undefined,
        }),
      });

      const data = await response.json();
      if (data.subject && data.body) {
        updatedDetails[idx] = {
          email: detail.email,
          status: results.dryRun ? 'ready' : 'sent',
          subject: data.subject,
          body: data.body,
        };
        results.sent += 1;
        results.failed -= 1;
      } else {
        updatedDetails[idx] = {
          ...detail,
          isReloading: false,
          reason: 'Retry failed',
        };
      }
      setResults({ ...results, details: updatedDetails });
    } catch (err) {
      const updatedDetails = [...results.details];
      updatedDetails[idx] = {
        ...detail,
        isReloading: false,
        reason: err instanceof Error ? err.message : 'Reload failed',
      };
      setResults({ ...results, details: updatedDetails });
    }
  };

  return (
    <div>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Custom Prompt */}
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 sm:p-8 mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-black mb-1">Custom Email Prompt</h2>
          <p className="text-gray-500 text-sm mb-4">
            Describe the email style, tone, and context. Leave blank to use the default Day 3 urgency template.
          </p>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder={`e.g. "Write a friendly Day 1 cold outreach email introducing ArtNovaAI. The user hasn't heard of us before. Mention we generate images in 4-5 seconds and they get 2 free credits to try."`}
            rows={4}
            className="w-full border-2 border-gray-200 rounded-lg p-3 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black resize-none transition-colors"
          />
          {customPrompt.trim() && (
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black text-white text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                AI generation active
              </span>
              <button
                onClick={() => setCustomPrompt('')}
                className="text-xs text-gray-500 hover:text-black underline transition-colors"
              >
                Clear
              </button>
            </div>
          )}
        </div>

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
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="csv-upload"
                />
                <label htmlFor="csv-upload" className="cursor-pointer block">
                  <div className="inline-block p-3 rounded-lg bg-gray-100 group-hover:bg-black group-hover:text-white transition-all duration-300 mb-3">
                    <Upload className="w-6 h-6 text-black group-hover:text-white transition-colors" />
                  </div>
                  <p className="text-black font-semibold text-sm sm:text-base">Click to upload CSV</p>
                  <p className="text-gray-600 text-xs sm:text-sm mt-1">or drag and drop (multiple files)</p>
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
              {results.details.map((detail: any, idx: number) => {
                const isEdited = editedDetails[idx];
                const displayDetail = isEdited || detail;
                const isEditing = !!editedDetails[idx];

                return (
                  <div key={idx} className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:border-black transition-colors duration-300">
                    {/* Header */}
                    <div className="bg-gray-50 p-4 sm:p-6 border-b-2 border-gray-200">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-black text-sm sm:text-base break-all">{detail.email}</p>
                          <div className="mt-2">
                            {isEditing ? (
                              <input
                                type="text"
                                value={displayDetail.subject}
                                onChange={(e) =>
                                  setEditedDetails({
                                    ...editedDetails,
                                    [idx]: { ...displayDetail, subject: e.target.value },
                                  })
                                }
                                className="input-field text-xs sm:text-sm"
                              />
                            ) : (
                              <p className="text-gray-700 text-xs sm:text-sm break-words">
                                <span className="font-semibold">Subject:</span> {displayDetail.subject}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {results.dryRun && (detail.status === 'ready' || detail.status === 'sent') && (
                            <button
                              onClick={() => {
                                if (isEditing) {
                                  // Save edits to results and clear edit state
                                  const updatedDetails = [...results.details];
                                  updatedDetails[idx] = editedDetails[idx];
                                  setResults({ ...results, details: updatedDetails });
                                  setEditedDetails({
                                    ...editedDetails,
                                    [idx]: null,
                                  });
                                } else {
                                  // Enter edit mode
                                  setEditedDetails({
                                    ...editedDetails,
                                    [idx]: { ...detail },
                                  });
                                }
                              }}
                              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-black rounded text-xs font-semibold transition-colors"
                            >
                              {isEditing ? 'Done' : 'Edit'}
                            </button>
                          )}
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
                    </div>

                    {/* Email Body Preview */}
                    {displayDetail.body && (
                      <div className="p-4 sm:p-6 bg-white">
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Email Body</p>
                        {isEditing ? (
                          <div>
                            {/* Formatting toolbar */}
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {[
                                {
                                  label: '↕ Add spacing',
                                  title: 'Add blank line between paragraphs',
                                  fn: (body: string) => body.replace(/\n\n+/g, '\n\n\n'),
                                },
                                {
                                  label: '↔ Compact',
                                  title: 'Remove extra blank lines',
                                  fn: (body: string) => body.replace(/\n{3,}/g, '\n\n'),
                                },
                                {
                                  label: '→ Indent',
                                  title: 'Indent each paragraph',
                                  fn: (body: string) =>
                                    body
                                      .split('\n')
                                      .map((l) => (l.trim() ? '    ' + l : l))
                                      .join('\n'),
                                },
                                {
                                  label: '← Unindent',
                                  title: 'Remove leading spaces',
                                  fn: (body: string) =>
                                    body
                                      .split('\n')
                                      .map((l) => l.replace(/^ {1,4}/, ''))
                                      .join('\n'),
                                },
                              ].map(({ label, title, fn }) => (
                                <button
                                  key={label}
                                  title={title}
                                  type="button"
                                  onClick={() =>
                                    setEditedDetails({
                                      ...editedDetails,
                                      [idx]: { ...displayDetail, body: fn(displayDetail.body) },
                                    })
                                  }
                                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-black rounded text-xs font-mono transition-colors border border-gray-200"
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                            <textarea
                              value={displayDetail.body}
                              onChange={(e) =>
                                setEditedDetails({
                                  ...editedDetails,
                                  [idx]: { ...displayDetail, body: e.target.value },
                                })
                              }
                              className="input-field text-xs sm:text-sm font-mono min-h-[150px]"
                            />
                          </div>
                        ) : (
                          <div className="text-xs sm:text-sm text-gray-800 whitespace-pre-wrap leading-relaxed bg-gray-50 p-4 rounded border border-gray-200 font-mono">
                            {displayDetail.body}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Error/Reason if any */}
                    {detail.reason && (
                      <div className="p-4 sm:p-6 bg-red-50 border-t-2 border-red-200">
                        <div className="flex items-start gap-3 mb-3">
                          <AlertCircle className="w-4 h-4 text-red-700 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-red-700"><span className="font-semibold">Reason:</span> {detail.reason}</p>
                        </div>
                        {results.dryRun && (
                          <button
                            onClick={() => handleReloadFailed(idx, detail)}
                            disabled={detail.isReloading}
                            className="flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-800 disabled:bg-red-600 text-white rounded text-sm font-semibold transition-colors"
                          >
                            <RotateCcw className="w-4 h-4" />
                            {detail.isReloading ? 'Retrying...' : 'Retry'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmailSender;
