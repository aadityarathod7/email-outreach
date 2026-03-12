import React, { useEffect, useState } from 'react';
import { useConfig } from '../hooks/useConfig';
import { Save } from 'lucide-react';

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
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mb-3 mx-auto"></div>
          <p className="text-slate-600 font-medium">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error || !formData) {
    return (
      <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-300 rounded-xl p-6">
        <p className="text-red-700 font-semibold">{error || 'Failed to load configuration'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card-elevated">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
          <p className="text-slate-600 text-sm mt-1">Manage your campaign configuration</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Brand Settings */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
              <span className="text-lg">🏷️</span>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Brand</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Brand Name</label>
                <input
                  type="text"
                  value={formData.brandName}
                  onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                  className="input-field"
                  placeholder="ArtNovaAI"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Brand URL</label>
                <input
                  type="url"
                  value={formData.brandUrl}
                  onChange={(e) => setFormData({ ...formData, brandUrl: e.target.value })}
                  className="input-field"
                  placeholder="https://www.artnovaai.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Sender Name</label>
                <input
                  type="text"
                  value={formData.senderName}
                  onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                  className="input-field"
                  placeholder="Aayushi"
                />
              </div>
            </div>
          </div>

          {/* Email Settings */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
              <span className="text-lg">⚙️</span>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Email Settings</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Poll Interval (minutes)
                </label>
                <input
                  type="number"
                  value={formData.pollIntervalMinutes}
                  onChange={(e) =>
                    setFormData({ ...formData, pollIntervalMinutes: parseInt(e.target.value) })
                  }
                  className="input-field"
                  min="5"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Max Emails Per Batch
                </label>
                <input
                  type="number"
                  value={formData.maxEmailsPerBatch}
                  onChange={(e) =>
                    setFormData({ ...formData, maxEmailsPerBatch: parseInt(e.target.value) })
                  }
                  className="input-field"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Delay Between Emails (ms)
                </label>
                <input
                  type="number"
                  value={formData.delayBetweenEmailsMs}
                  onChange={(e) =>
                    setFormData({ ...formData, delayBetweenEmailsMs: parseInt(e.target.value) })
                  }
                  className="input-field"
                  min="1000"
                  step="1000"
                />
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200 mb-5">
              <span className="text-lg">🔧</span>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Advanced</h3>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                CSV Sender Email Filter
                <span className="ml-2 text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Optional</span>
              </label>
              <input
                type="email"
                value={formData.csvSenderEmail}
                onChange={(e) => setFormData({ ...formData, csvSenderEmail: e.target.value })}
                className="input-field max-w-md"
                placeholder="Leave empty to accept CSVs from all senders"
              />
              <p className="text-xs text-slate-500 mt-2">
                Only process CSVs from this email address. Leave empty to accept all.
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        {success && (
          <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-xl p-4 animate-slide-in-up">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <p className="text-green-700 text-sm font-semibold">Settings saved successfully</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-8 bg-gradient-to-r from-red-50 to-rose-50 border border-red-300 rounded-xl p-4">
            <p className="text-red-700 text-sm font-semibold">✗ {error}</p>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 btn-primary disabled:opacity-50 disabled:cursor-not-allowed px-8"
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
