import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Settings({ settings }) {
  const [activeTab, setActiveTab] = useState('general');

  const settingsConfig = {
    general: [
      { key: 'footer_tagline', label: 'Footer Tagline', type: 'text' },
    ],
    contact: [
      { key: 'contact_email', label: 'Contact Email', type: 'email' },
      { key: 'company_location', label: 'Company Location', type: 'text' },
    ],
    social: [
      { key: 'facebook_url', label: 'Facebook URL', type: 'url' },
      { key: 'instagram_url', label: 'Instagram URL', type: 'url' },
      { key: 'linkedin_url', label: 'LinkedIn URL', type: 'url' },
      { key: 'twitter_url', label: 'Twitter/X URL', type: 'url' },
    ],
    tracking: [
      { key: 'ga4_id', label: 'Google Analytics 4 ID', type: 'text', placeholder: 'G-XXXXXXXXXX' },
      { key: 'gtm_id', label: 'Google Tag Manager ID', type: 'text', placeholder: 'GTM-XXXXXXX' },
      { key: 'meta_pixel', label: 'Meta Pixel ID', type: 'text', placeholder: '123456789' },
      { key: 'header_scripts', label: 'Custom Header Scripts', type: 'textarea', placeholder: '<script>...</script>' },
      { key: 'footer_scripts', label: 'Custom Footer Scripts', type: 'textarea', placeholder: '<script>...</script>' },
    ],
  };

  const { data, setData, put, processing } = useForm({
    settings: Object.entries(settingsConfig).flatMap(([group, fields]) =>
      fields.map(field => ({
        key: field.key,
        value: settings[field.key] || '',
        group,
      }))
    ),
  });

  const updateValue = (key, value) => {
    setData('settings', data.settings.map(s => s.key === key ? { ...s, value } : s));
  };

  const getValue = (key) => data.settings.find(s => s.key === key)?.value || '';

  const handleSubmit = (e) => {
    e.preventDefault();
    put('/admin/settings');
  };

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'contact', label: 'Contact' },
    { id: 'social', label: 'Social Media' },
    { id: 'tracking', label: 'Tracking & Analytics' },
  ];

  return (
    <AdminLayout title="Site Settings">
      <Head title="Settings" />

      <form onSubmit={handleSubmit}>
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:text-foreground border border-border'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
          {settingsConfig[activeTab]?.map(field => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-foreground mb-2">{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea
                  value={getValue(field.key)}
                  onChange={(e) => updateValue(field.key, e.target.value)}
                  className="form-input min-h-[100px] resize-y"
                  placeholder={field.placeholder || ''}
                  rows={4}
                />
              ) : (
                <input
                  type={field.type}
                  value={getValue(field.key)}
                  onChange={(e) => updateValue(field.key, e.target.value)}
                  className="form-input"
                  placeholder={field.placeholder || ''}
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={processing}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {processing ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
