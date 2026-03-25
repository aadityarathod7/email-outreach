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
      setFormData(config);
    }
  }, [config]);

  const handleSave = async () => {
    if (!formData) return;

    setSaving(true);
    setSuccess(false);

    const result = await updateConfig(formData);

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
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black mb-3 mx-auto"></div>
          <p className="text-gray-600 font-medium">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error || !formData) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
        <p className="text-red-700 font-semibold">{error || 'Failed to load configuration'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white border-2 border-gray-200 rounded-lg p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-black">Settings</h2>
          <p className="text-gray-600 text-sm mt-1">Manage your campaign configuration</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Brand Settings */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b-2 border-gray-200">
              <Tag className="w-5 h-5 text-black" />
              <h3 className="text-sm font-bold text-black uppercase tracking-wide">Brand</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-black mb-1.5">Brand Name</label>
                <input
                  type="text"
                  value={formData.brandName}
                  onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none text-black placeholder-gray-500"
                  placeholder="ArtNovaAI"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-1.5">Brand URL</label>
                <input
                  type="url"
                  value={formData.brandUrl}
                  onChange={(e) => setFormData({ ...formData, brandUrl: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none text-black placeholder-gray-500"
                  placeholder="https://www.artnovaai.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-1.5">Sender Name</label>
                <input
                  type="text"
                  value={formData.senderName}
                  onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none text-black placeholder-gray-500"
                  placeholder="Aayushi"
                />
              </div>
            </div>
          </div>

          {/* Email Settings */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b-2 border-gray-200">
              <Settings className="w-5 h-5 text-black" />
              <h3 className="text-sm font-bold text-black uppercase tracking-wide">Email Settings</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-black mb-1.5">
                  Poll Interval (minutes)
                </label>
                <input
                  type="number"
                  value={formData.pollIntervalMinutes}
                  onChange={(e) =>
                    setFormData({ ...formData, pollIntervalMinutes: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none text-black"
                  min="5"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-1.5">
                  Max Emails Per Batch
                </label>
                <input
                  type="number"
                  value={formData.maxEmailsPerBatch}
                  onChange={(e) =>
                    setFormData({ ...formData, maxEmailsPerBatch: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none text-black"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-1.5">
                  Delay Between Emails (ms)
                </label>
                <input
                  type="number"
                  value={formData.delayBetweenEmailsMs}
                  onChange={(e) =>
                    setFormData({ ...formData, delayBetweenEmailsMs: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none text-black"
                  min="1000"
                  step="1000"
                />
              </div>
            </div>
          </div>

          {/* API Keys */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 pb-3 border-b-2 border-gray-200 mb-5">
              <KeyRound className="w-5 h-5 text-black" />
              <h3 className="text-sm font-bold text-black uppercase tracking-wide">API Keys</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-black mb-1.5">
                  Groq API Keys
                  <span className="ml-2 text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded">one per line — rotates automatically on rate limit</span>
                </label>
                <textarea
                  value={formData.llmApiKeys || ''}
                  onChange={(e) => setFormData({ ...formData, llmApiKeys: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none text-black font-mono text-sm resize-none"
                  placeholder={'gsk_key_one\ngsk_key_two\ngsk_key_three'}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Add multiple keys — if one hits its rate limit, the next is used automatically. Get free keys at{' '}
                  <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="underline">console.groq.com</a>
                </p>
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 pb-3 border-b-2 border-gray-200 mb-5">
              <Wrench className="w-5 h-5 text-black" />
              <h3 className="text-sm font-bold text-black uppercase tracking-wide">Advanced</h3>
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-1.5">
                CSV Sender Email Filter
                <span className="ml-2 text-xs font-normal text-gray-600 bg-gray-100 px-2 py-0.5 rounded">Optional</span>
              </label>
              <input
                type="email"
                value={formData.csvSenderEmail}
                onChange={(e) => setFormData({ ...formData, csvSenderEmail: e.target.value })}
                className="w-full max-w-md px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none text-black placeholder-gray-500"
                placeholder="Leave empty to accept CSVs from all senders"
              />
              <p className="text-xs text-gray-600 mt-2">
                Only process CSVs from this email address. Leave empty to accept all.
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        {success && (
          <div className="mt-8 bg-black text-white border-2 border-black rounded-lg p-4 animate-slide-in-up">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white"></span>
              <p className="text-sm font-semibold">Settings saved successfully</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-8 bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-red-700 text-sm font-semibold">{error}</p>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-8 pt-6 border-t-2 border-gray-200">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-black text-white font-semibold py-3 px-8 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving Changes...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Configuration;
