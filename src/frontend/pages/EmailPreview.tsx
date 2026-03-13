import React, { useState } from 'react';
import { useEmails } from '../hooks/useEmails';

function EmailPreview() {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    plan: 'Gold',
    totalImages: 10,
    prompts: ['', '', '', '', ''],
  });

  const [preview, setPreview] = useState<any>(null);
  const { previewEmail } = useEmails();

  const handlePreview = async () => {
    const result = await previewEmail(
      formData.email,
      formData.name,
      formData.plan,
      formData.totalImages,
      formData.prompts.filter((p) => p.trim())
    );
    if (result) {
      setPreview(result);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="card">
          <h2 className="text-lg font-bold text-black mb-4">Generate Preview</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
                placeholder="user@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="John Doe"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                <select
                  value={formData.plan}
                  onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                  className="input-field"
                >
                  <option>Free</option>
                  <option>Gold</option>
                  <option>Platinum</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Images
                </label>
                <input
                  type="number"
                  value={formData.totalImages}
                  onChange={(e) => setFormData({ ...formData, totalImages: parseInt(e.target.value) })}
                  className="input-field"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image Prompts (up to 5)
              </label>
              <div className="space-y-2">
                {formData.prompts.map((prompt, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={prompt}
                    onChange={(e) => {
                      const newPrompts = [...formData.prompts];
                      newPrompts[idx] = e.target.value;
                      setFormData({ ...formData, prompts: newPrompts });
                    }}
                    className="input-field"
                    placeholder={`Prompt ${idx + 1} (optional)`}
                  />
                ))}
              </div>
            </div>

            <button onClick={handlePreview} className="btn-primary w-full">
              Generate Preview
            </button>
          </div>
        </div>

        {/* Preview */}
        {preview && (
          <div className="card">
            <h2 className="text-lg font-bold text-black mb-4">Email Preview</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
                  Subject
                </label>
                <p className="text-black font-medium">{preview.subject}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
                  Body
                </label>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">
                    {preview.body}
                  </p>
                </div>
              </div>

              <button className="btn-primary w-full">Send This Email</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmailPreview;
