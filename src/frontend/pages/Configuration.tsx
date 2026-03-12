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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error || !formData) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error || 'Failed to load configuration'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-lg font-bold text-slate-900 mb-6">Configuration Settings</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Brand Settings */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-4 uppercase">Brand</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Brand Name</label>
                <input
                  type="text"
                  value={formData.brandName}
                  onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Brand URL</label>
                <input
                  type="url"
                  value={formData.brandUrl}
                  onChange={(e) => setFormData({ ...formData, brandUrl: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sender Name</label>
                <input
                  type="text"
                  value={formData.senderName}
                  onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Email Settings */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-4 uppercase">Email Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
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
                <label className="block text-sm font-medium text-slate-700 mb-1">
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
                <label className="block text-sm font-medium text-slate-700 mb-1">
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
            <h3 className="text-sm font-semibold text-slate-700 mb-4 uppercase">Advanced</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                CSV Sender Email Filter (optional)
              </label>
              <input
                type="email"
                value={formData.csvSenderEmail}
                onChange={(e) => setFormData({ ...formData, csvSenderEmail: e.target.value })}
                className="input-field"
                placeholder="Leave empty to accept all senders"
              />
              <p className="text-xs text-slate-500 mt-1">
                Only process CSVs from this email address. Leave empty to accept all.
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        {success && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-green-700 text-sm font-medium">✓ Configuration saved successfully</p>
          </div>
        )}

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm font-medium">✗ {error}</p>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
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
