import React, { useState } from 'react';
import { useEmails } from '../hooks/useEmails';
import { Upload, Send, Eye, CheckCircle, AlertCircle, RotateCcw, Trash2, FlaskConical, Sparkles } from 'lucide-react';

function EmailSender() {
  const [csvContent, setCsvContent] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [preview, setPreview] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [editedDetails, setEditedDetails] = useState<{[key: number]: any}>({});
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<'sent' | 'failed' | null>(null);
  const { sendEmails, sending } = useEmails();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileContents: string[] = new Array(files.length);
    let processedFiles = 0;

    Array.from(files).forEach((file, fileIndex) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        fileContents[fileIndex] = event.target?.result as string;
        processedFiles++;

        if (processedFiles === files.length) {
          let combined = '';
          fileContents.forEach((content, idx) => {
            const lines = content.split('\n').filter((l) => l.trim() !== '');
            if (idx === 0) {
              combined = lines.join('\n');
            } else {
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

  const handleTestEmail = async () => {
    if (!testEmailAddress.trim() || !results?.details?.length) return;
    const first = results.details.find((d: any) => d.status === 'ready' || d.status === 'sent');
    if (!first) return;
    setTestSending(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/emails/send-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmailAddress.trim(),
          subject: `[TEST] ${first.subject}`,
          body: first.body,
        }),
      });
      const data = await res.json();
      setTestResult(data.error ? 'failed' : 'sent');
    } catch {
      setTestResult('failed');
    } finally {
      setTestSending(false);
    }
  };

  const handleSend = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Send emails to all users in the CSV?')) return;

    const finalDetails = results.details.map((detail: any, idx: number) => {
      return editedDetails[idx] && editedDetails[idx] !== null ? editedDetails[idx] : detail;
    });

    setPreview(false);

    try {
      const sendResults: any[] = [];

      const sendableIndices: number[] = finalDetails
        .map((d: any, i: number) => ({ d, i }))
        .filter(({ d }: { d: any }) => d.status !== 'skipped' && d.status !== 'failed')
        .map(({ i }: { i: number }) => i);

      for (let si = 0; si < sendableIndices.length; si++) {
        const i = sendableIndices[si];
        const detail = finalDetails[i];

        setResults((prev: any) => ({
          ...prev,
          dryRun: false,
          details: prev.details.map((d: any, j: number) => ({
            ...d,
            status: sendableIndices.slice(0, si).includes(j)
              ? (sendResults[j]?.error ? 'failed' : 'sent')
              : j === i ? 'sending' : d.status,
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

        sendResults[i] = result;

        if (si < sendableIndices.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 2 * 60 * 1000));
        }
      }

      setResults((prev: any) => ({
        ...prev,
        dryRun: false,
        details: finalDetails.map((detail: any, idx: number) => {
          if (detail.status === 'skipped') return detail;
          const r = sendResults[idx];
          if (!r) return detail;
          return { ...detail, status: r.error ? 'failed' : 'sent', reason: r.error };
        }),
        sent: sendableIndices.filter((i) => sendResults[i] && !sendResults[i].error).length,
        failed: sendableIndices.filter((i) => sendResults[i] && sendResults[i].error).length,
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
      const updatedDetails = [...results.details];
      updatedDetails[idx] = { ...detail, isReloading: true };
      setResults({ ...results, details: updatedDetails });

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
        updatedDetails[idx] = { ...detail, isReloading: false, reason: 'Retry failed' };
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
    <div className="space-y-5 animate-fade-in">
      {/* Custom Prompt */}
      <div className="card">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4" style={{ color: '#6366f1' }} />
          <h2 className="text-sm font-bold text-gray-900">Custom AI Prompt</h2>
          {customPrompt.trim() && (
            <span className="badge badge-info ml-auto">AI active</span>
          )}
        </div>
        <p className="text-xs text-gray-400 mb-3">
          Describe the email style and tone. Leave blank to use the default template.
        </p>
        <textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder={`e.g. "Write a friendly Day 1 cold outreach introducing ArtNovaAI..."`}
          rows={3}
          className="input-field text-sm resize-none"
        />
        {customPrompt.trim() && (
          <button
            onClick={() => setCustomPrompt('')}
            className="mt-2 text-xs text-gray-400 hover:text-gray-700 transition-colors"
          >
            Clear prompt
          </button>
        )}
      </div>

      {/* Upload + Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Upload */}
        <div className="card">
          <h2 className="text-sm font-bold text-gray-900 mb-1">Upload CSV</h2>
          <p className="text-xs text-gray-400 mb-4">Add your email list</p>

          <label
            htmlFor="csv-upload"
            className="block border border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 group"
            style={{ borderColor: '#ddd' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#6366f1'; (e.currentTarget as HTMLElement).style.background = '#f5f5ff'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#ddd'; (e.currentTarget as HTMLElement).style.background = ''; }}
          >
            <input
              type="file"
              accept=".csv"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
            />
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3 transition-all" style={{ background: '#f5f5ff' }}>
              <Upload className="w-5 h-5" style={{ color: '#6366f1' }} />
            </div>
            <p className="text-sm font-semibold text-gray-700">Click to upload CSV</p>
            <p className="text-xs text-gray-400 mt-1">Multiple files supported</p>
          </label>

          {csvContent && (
            <div className="mt-4 animate-slide-in-up rounded-xl p-4" style={{ background: '#f5f5ff', border: '1px solid #e0e0ff' }}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                <p className="text-sm font-semibold text-indigo-700">CSV Loaded</p>
              </div>
              <p className="text-xs text-indigo-500 mt-1">
                {csvContent.split('\n').length - 1} records ready
              </p>
            </div>
          )}
        </div>

        {/* Campaign Control */}
        <div className="card lg:col-span-2 flex flex-col">
          <div className="mb-5">
            <h2 className="text-sm font-bold text-gray-900 mb-1">Campaign Control</h2>
            <div className="flex items-center gap-2">
              <span className={`badge ${preview ? 'badge-info' : 'badge-success'}`}>
                {preview ? 'Preview Mode' : 'Ready to Send'}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              {preview
                ? 'Emails shown below will NOT be sent. Review and click Send Now.'
                : 'Upload a CSV, then click Preview to review emails before sending.'}
            </p>
          </div>

          <div className="mt-auto flex flex-col sm:flex-row gap-3">
            {!results ? (
              <button
                onClick={handlePreview}
                disabled={!csvContent || previewLoading || sending}
                className="btn-primary flex-1 justify-center"
                type="button"
              >
                <Eye className="w-4 h-4" />
                {previewLoading ? 'Generating Preview...' : 'Preview Emails'}
              </button>
            ) : (
              <>
                <button
                  onClick={handlePreview}
                  disabled={!csvContent || previewLoading || sending}
                  className="btn-secondary flex-1 justify-center"
                  type="button"
                >
                  <Eye className="w-4 h-4" />
                  {previewLoading ? 'Regenerating...' : 'Regenerate'}
                </button>
                <button
                  onClick={handleSend}
                  disabled={previewLoading || sending}
                  className="btn-primary flex-1 justify-center"
                  type="button"
                >
                  <Send className="w-4 h-4" />
                  {sending ? 'Sending...' : 'Send Now'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="animate-slide-in-up space-y-5">
          {/* Results Header */}
          <div className="card" style={{ background: 'linear-gradient(135deg, #111 0%, #1a1a2e 100%)', border: 'none' }}>
            <div className="flex items-center gap-3 mb-2">
              {results.dryRun ? (
                <Eye className="w-5 h-5 text-indigo-400" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-400" />
              )}
              <h2 className="text-lg font-bold text-white">
                {results.dryRun ? 'Preview Results' : 'Send Results'}
              </h2>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              {results.dryRun
                ? 'Review the emails below before sending'
                : 'All emails have been processed'}
            </p>
            {results.dryRun && (
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={testEmailAddress}
                  onChange={(e) => setTestEmailAddress(e.target.value)}
                  placeholder="your@email.com — send test"
                  className="flex-1 px-3 py-2 rounded-lg text-sm text-gray-900 bg-white border-0 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <button
                  onClick={handleTestEmail}
                  disabled={!testEmailAddress.trim() || testSending}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                  <FlaskConical className="w-4 h-4" />
                  {testSending ? 'Sending...' : 'Send Test'}
                </button>
                {testResult && (
                  <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 rounded-lg ${testResult === 'sent' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {testResult === 'sent' ? '✓ Test sent!' : '✗ Test failed'}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total', value: results.total, cls: '' },
              { label: results.dryRun ? 'Ready' : 'Sent', value: results.sent, cls: 'badge-success' },
              { label: 'Skipped', value: results.skipped, cls: 'badge-warning' },
              { label: 'Failed', value: results.failed, cls: 'badge-error' },
            ].map(({ label, value, cls }) => (
              <div key={label} className="card text-center py-4">
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className={`text-xs font-semibold mt-1 ${cls ? '' : 'text-gray-500'}`}>
                  {cls ? <span className={`badge ${cls}`}>{label}</span> : label}
                </p>
              </div>
            ))}
          </div>

          {/* Email Cards */}
          <div className="space-y-3">
            {results.details.map((detail: any, idx: number) => {
              const isEdited = editedDetails[idx];
              const displayDetail = isEdited || detail;
              const isEditing = !!editedDetails[idx];

              const statusCls =
                detail.status === 'sent' || detail.status === 'ready'
                  ? 'badge-success'
                  : detail.status === 'skipped'
                  ? 'badge-warning'
                  : detail.status === 'sending'
                  ? 'badge-info'
                  : 'badge-error';

              return (
                <div key={idx} className="card overflow-hidden p-0">
                  {/* Card Header */}
                  <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3"
                    style={{ borderBottom: '1px solid #f0f0f0', background: '#fafafa' }}>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm break-all">{detail.email}</p>
                      <div className="mt-1.5">
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
                            className="input-field text-xs"
                          />
                        ) : (
                          <p className="text-xs text-gray-500">
                            <span className="font-medium">Subject:</span> {displayDetail.subject}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {results.dryRun && (
                        <button
                          onClick={() => {
                            const updatedDetails = results.details.filter((_: any, i: number) => i !== idx);
                            setResults({
                              ...results,
                              details: updatedDetails,
                              total: updatedDetails.length,
                              sent: updatedDetails.filter((d: any) => d.status === 'ready' || d.status === 'sent').length,
                            });
                          }}
                          className="btn-icon text-gray-400 hover:text-red-500"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {results.dryRun && (detail.status === 'ready' || detail.status === 'sent') && (
                        <button
                          onClick={() => {
                            if (isEditing) {
                              const updatedDetails = [...results.details];
                              updatedDetails[idx] = editedDetails[idx];
                              setResults({ ...results, details: updatedDetails });
                              setEditedDetails({ ...editedDetails, [idx]: null });
                            } else {
                              setEditedDetails({ ...editedDetails, [idx]: { ...detail } });
                            }
                          }}
                          className="btn-secondary text-xs py-1 px-3"
                        >
                          {isEditing ? 'Done' : 'Edit'}
                        </button>
                      )}
                      <span className={`badge ${statusCls}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {detail.status.charAt(0).toUpperCase() + detail.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Email Body */}
                  {displayDetail.body && (
                    <div className="p-5">
                      {isEditing ? (
                        <div>
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {[
                              { label: '↕ Spacing', fn: (b: string) => b.replace(/\n\n+/g, '\n\n\n') },
                              { label: '↔ Compact', fn: (b: string) => b.replace(/\n{3,}/g, '\n\n') },
                              { label: '→ Indent', fn: (b: string) => b.split('\n').map((l) => (l.trim() ? '    ' + l : l)).join('\n') },
                              { label: '← Unindent', fn: (b: string) => b.split('\n').map((l) => l.replace(/^ {1,4}/, '')).join('\n') },
                            ].map(({ label, fn }) => (
                              <button
                                key={label}
                                type="button"
                                onClick={() =>
                                  setEditedDetails({
                                    ...editedDetails,
                                    [idx]: { ...displayDetail, body: fn(displayDetail.body) },
                                  })
                                }
                                className="px-2.5 py-1 text-xs font-mono rounded-lg border transition-colors hover:bg-gray-100"
                                style={{ borderColor: '#e5e5e5', color: '#555' }}
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
                            className="input-field text-xs font-mono min-h-[140px]"
                          />
                        </div>
                      ) : (
                        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #ebebeb' }}>
                          <div className="px-4 py-2.5" style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                            <p className="text-xs text-gray-500">
                              <span className="font-medium">From:</span> Aayushi &lt;aayushi@artnovaai.com&gt;
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              <span className="font-medium">To:</span> {detail.email}
                            </p>
                          </div>
                          <div className="px-5 py-4 font-sans text-sm text-gray-800 leading-7 bg-white">
                            {displayDetail.body.split('\n\n').map((paragraph: string, pi: number) => (
                              <p key={pi} className="mb-4 last:mb-0 whitespace-pre-wrap">
                                {paragraph}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Error / Reason */}
                  {detail.reason && (
                    <div className="px-5 py-4" style={{ background: '#fef2f2', borderTop: '1px solid #fecaca' }}>
                      <div className="flex items-start gap-2 mb-3">
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-red-700">
                          <span className="font-semibold">Error:</span> {detail.reason}
                        </p>
                      </div>
                      {results.dryRun && (
                        <button
                          onClick={() => handleReloadFailed(idx, detail)}
                          disabled={detail.isReloading}
                          className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
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
  );
}

export default EmailSender;
