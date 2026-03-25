import React, { useEffect, useState } from 'react';
import { useConfig } from '../hooks/useConfig';
import { Save, Tag, Settings, Wrench, AlertCircle, KeyRound } from 'lucide-react';

function Configuration() {
  const { config, loading, error, updateConfig } = useConfig();
  const [formData, setFormData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (config) {
      setFormData({ ...config, llmApiKeys: '' });
    }
  }, [config]);

  const handleSave = async () => {
    if (!formData) return;

    setSaving(true);
    setSuccess(false);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { emailService: _es, llmApiKey: _lk, ...editable } = formData;

    if (editable.llmApiKeys?.includes('*')) delete editable.llmApiKeys;

    const result = await updateConfig(editable);

    setSaving(false);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent mb-3"></div>
          <p className="text-gray-500 text-sm">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error || !formData) {
    return (
      <div className="card" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
        <p className="text-red-700 text-sm font-medium">{error || 'Failed to load configuration'}</p>
      </div>
    );
  }

  const inputCls = 'input-field';
  const sectionHeaderCls = 'flex items-center gap-2 mb-4 pb-3';

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="card">
        <div className="mb-6">
          <h2 className="text-base font-bold text-gray-900">Settings</h2>
          <p className="text-xs text-gray-400 mt-0.5">Manage your campaign configuration</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className={sectionHeaderCls} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <div className="p-1.5 rounded-lg" style={{ background: '#f5f5ff' }}>
                <Tag className="w-3.5 h-3.5" style={{ color: '#6366f1' }} />
              </div>
              <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">Brand</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Brand Name</label>
                <input
                  type="text"
                  value={formData.brandName}
                  onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                  className={inputCls}
                  placeholder="ArtNovaAI"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Brand URL</label>
                <input
                  type="url"
                  value={formData.brandUrl}
                  onChange={(e) => setFormData({ ...formData, brandUrl: e.target.value })}
                  className={inputCls}
                  placeholder="https://www.artnovaai.com"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Sender Name</label>
                <input
                  type="text"
                  value={formData.senderName}
                  onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                  className={inputCls}
                  placeholder="Aayushi"
                />
              </div>
            </div>
          </div>

          {/* Email Settings */}
          <div className="space-y-4">
            <div className={sectionHeaderCls} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <div className="p-1.5 rounded-lg" style={{ background: '#f5f5ff' }}>
                <Settings className="w-3.5 h-3.5" style={{ color: '#6366f1' }} />
              </div>
              <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">Email Settings</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Poll Interval (minutes)</label>
                <input
                  type="number"
                  value={formData.pollIntervalMinutes}
                  onChange={(e) => setFormData({ ...formData, pollIntervalMinutes: parseInt(e.target.value) })}
                  className={inputCls}
                  min="5"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Max Emails Per Batch</label>
                <input
                  type="number"
                  value={formData.maxEmailsPerBatch}
                  onChange={(e) => setFormData({ ...formData, maxEmailsPerBatch: parseInt(e.target.value) })}
                  className={inputCls}
                  min="1"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Delay Between Emails (ms)</label>
                <input
                  type="number"
                  value={formData.delayBetweenEmailsMs}
                  onChange={(e) => setFormData({ ...formData, delayBetweenEmailsMs: parseInt(e.target.value) })}
                  className={inputCls}
                  min="1000"
                  step="1000"
                />
              </div>
            </div>
          </div>

          {/* API Keys */}
          <div className="md:col-span-2 space-y-4">
            <div className={sectionHeaderCls} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <div className="p-1.5 rounded-lg" style={{ background: '#f5f5ff' }}>
                <KeyRound className="w-3.5 h-3.5" style={{ color: '#6366f1' }} />
              </div>
              <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">API Keys</h3>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Groq API Keys
                <span className="ml-2 text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  one per line · auto-rotates on rate limit
                </span>
              </label>
              <textarea
                value={formData.llmApiKeys || ''}
                onChange={(e) => setFormData({ ...formData, llmApiKeys: e.target.value })}
                rows={3}
                className="input-field font-mono text-sm resize-none"
                placeholder={'gsk_key_one\ngsk_key_two\ngsk_key_three'}
              />
              <p className="text-xs text-gray-400 mt-1.5">
                {config?.llmApiKeys
                  ? `${config.llmApiKeys.split('\n').filter(Boolean).length} key(s) configured. Paste new keys to replace.`
                  : 'No keys configured yet.'}{' '}
                Get free keys at{' '}
                <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="underline text-indigo-500 hover:text-indigo-700">
                  console.groq.com
                </a>
              </p>
            </div>
          </div>

          {/* Advanced */}
          <div className="md:col-span-2 space-y-4">
            <div className={sectionHeaderCls} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <div className="p-1.5 rounded-lg" style={{ background: '#f5f5ff' }}>
                <Wrench className="w-3.5 h-3.5" style={{ color: '#6366f1' }} />
              </div>
              <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">Advanced</h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                CSV Sender Email Filter
                <span className="ml-2 text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Optional</span>
              </label>
              <input
                type="email"
                value={formData.csvSenderEmail}
                onChange={(e) => setFormData({ ...formData, csvSenderEmail: e.target.value })}
                className={`${inputCls} max-w-md`}
                placeholder="Leave empty to accept CSVs from all senders"
              />
              <p className="text-xs text-gray-400 mt-1.5">
                Only process CSVs from this email address. Leave empty to accept all.
              </p>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {success && (
          <div className="mt-6 animate-slide-in-up rounded-xl px-4 py-3 flex items-center gap-3"
            style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></span>
            <p className="text-sm font-semibold text-green-700">Settings saved successfully</p>
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-xl px-4 py-3 flex items-center gap-3"
            style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-6 pt-5" style={{ borderTop: '1px solid #f0f0f0' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Configuration;
