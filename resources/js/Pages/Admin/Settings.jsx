import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Settings({ settings }) {
  const [activeTab, setActiveTab] = useState('general');
  const [visibleFields, setVisibleFields] = useState({});

  const toggleVisibility = (key) => {
    setVisibleFields(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const settingsConfig = {
    general: [
      { key: 'footer_tagline', label: 'Footer Tagline', type: 'text' },
    ],
    pages: [
      { key: 'about_show_team', label: 'Show Team Section on About Page', type: 'toggle' },
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
    integrations: [
      { key: 'groq_api_key', label: 'Groq API Key', type: 'password', placeholder: 'gsk_...' },
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
    { id: 'pages', label: 'Pages' },
    { id: 'contact', label: 'Contact' },
    { id: 'social', label: 'Social Media' },
    { id: 'tracking', label: 'Tracking & Analytics' },
    { id: 'integrations', label: 'Integrations' },
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
              {field.type === 'toggle' ? (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={getValue(field.key) === '1' || getValue(field.key) === 'true'}
                    onChange={(e) => updateValue(field.key, e.target.checked ? '1' : '0')}
                    className="rounded border-input text-primary focus:ring-primary h-5 w-5"
                  />
                  <span className="text-sm font-medium text-foreground">{field.label}</span>
                </label>
              ) : (
                <>
                  <label className="block text-sm font-medium text-foreground mb-2">{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={getValue(field.key)}
                      onChange={(e) => updateValue(field.key, e.target.value)}
                      className="form-input min-h-[100px] resize-y"
                      placeholder={field.placeholder || ''}
                      rows={4}
                    />
                  ) : field.type === 'password' ? (
                    <div className="relative">
                      <input
                        type={visibleFields[field.key] ? 'text' : 'password'}
                        value={getValue(field.key)}
                        onChange={(e) => updateValue(field.key, e.target.value)}
                        className="form-input pr-10"
                        placeholder={field.placeholder || ''}
                        autoComplete="off"
                      />
                      <button
                        type="button"
                        onClick={() => toggleVisibility(field.key)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground focus:outline-none"
                        aria-label={visibleFields[field.key] ? 'Hide value' : 'Show value'}
                        tabIndex={-1}
                      >
                        {visibleFields[field.key] ? (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  ) : (
                    <input
                      type={field.type}
                      value={getValue(field.key)}
                      onChange={(e) => updateValue(field.key, e.target.value)}
                      className="form-input"
                      placeholder={field.placeholder || ''}
                    />
                  )}
                </>
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
