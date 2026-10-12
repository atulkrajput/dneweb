import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Plus, Trash2, RefreshCw, Copy, Check, Eye, EyeOff, Globe, Key, Clock, Activity, Send, BookOpen, TestTube, BarChart3, Zap, Shield, Code, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

// Tab components
function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
        active ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

// ─── DOCUMENTATION TAB ───────────────────────────────────────────────────────
function DocumentationTab() {
  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-3">API Overview</h3>
        <p className="text-muted-foreground text-sm mb-4">
          The DNE Lead API allows your external websites to push contact form submissions directly into the DNE lead management system. Each lead is tracked with its source website, enabling you to monitor which sites generate the most leads.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-muted/30 rounded-lg p-4">
            <Shield className="h-5 w-5 text-primary mb-2" />
            <h4 className="text-sm font-medium text-foreground">Authenticated</h4>
            <p className="text-xs text-muted-foreground mt-1">All requests require a valid API key via the X-API-Key header</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-4">
            <Zap className="h-5 w-5 text-primary mb-2" />
            <h4 className="text-sm font-medium text-foreground">Real-time</h4>
            <p className="text-xs text-muted-foreground mt-1">Leads appear instantly in your dashboard with source tracking</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-4">
            <BarChart3 className="h-5 w-5 text-primary mb-2" />
            <h4 className="text-sm font-medium text-foreground">Tracked</h4>
            <p className="text-xs text-muted-foreground mt-1">Full UTM parameter support and usage analytics per API key</p>
          </div>
        </div>
      </div>

      {/* Base URL */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-3">Base URL</h3>
        <code className="block bg-muted/50 rounded-lg p-3 text-sm font-mono text-foreground">
          {window.location.origin}/api
        </code>
      </div>

      {/* Authentication */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-3">Authentication</h3>
        <p className="text-sm text-muted-foreground mb-3">Include your API key in the request header:</p>
        <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm">
          <span className="text-muted-foreground">X-API-Key:</span> <span className="text-primary">dne_your_api_key_here</span>
        </div>
      </div>

      {/* Endpoints */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        <h3 className="text-sm font-semibold text-foreground">Endpoints</h3>

        {/* POST /api/leads */}
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="bg-green-500/10 px-4 py-2 flex items-center gap-2">
            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-bold rounded">POST</span>
            <code className="text-sm font-mono text-foreground">/api/leads</code>
            <span className="text-xs text-muted-foreground ml-auto">Create a new lead</span>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Request Body (JSON)</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 pr-4 text-xs font-medium text-muted-foreground">Field</th>
                      <th className="text-left py-2 pr-4 text-xs font-medium text-muted-foreground">Type</th>
                      <th className="text-left py-2 pr-4 text-xs font-medium text-muted-foreground">Required</th>
                      <th className="text-left py-2 text-xs font-medium text-muted-foreground">Description</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    <tr className="border-b border-border/50"><td className="py-2 pr-4 font-mono text-primary">name</td><td className="pr-4">string</td><td className="pr-4"><span className="text-green-400">Yes</span></td><td className="text-muted-foreground">Full name of the lead</td></tr>
                    <tr className="border-b border-border/50"><td className="py-2 pr-4 font-mono text-primary">email</td><td className="pr-4">string</td><td className="pr-4"><span className="text-green-400">Yes</span></td><td className="text-muted-foreground">Email address</td></tr>
                    <tr className="border-b border-border/50"><td className="py-2 pr-4 font-mono text-primary">phone</td><td className="pr-4">string</td><td className="pr-4"><span className="text-muted-foreground">No</span></td><td className="text-muted-foreground">Phone number</td></tr>
                    <tr className="border-b border-border/50"><td className="py-2 pr-4 font-mono text-primary">company</td><td className="pr-4">string</td><td className="pr-4"><span className="text-muted-foreground">No</span></td><td className="text-muted-foreground">Company name</td></tr>
                    <tr className="border-b border-border/50"><td className="py-2 pr-4 font-mono text-primary">country</td><td className="pr-4">string</td><td className="pr-4"><span className="text-muted-foreground">No</span></td><td className="text-muted-foreground">Country</td></tr>
                    <tr className="border-b border-border/50"><td className="py-2 pr-4 font-mono text-primary">interested_service</td><td className="pr-4">string</td><td className="pr-4"><span className="text-muted-foreground">No</span></td><td className="text-muted-foreground">Service slug (e.g. web-development)</td></tr>
                    <tr className="border-b border-border/50"><td className="py-2 pr-4 font-mono text-primary">message</td><td className="pr-4">string</td><td className="pr-4"><span className="text-muted-foreground">No</span></td><td className="text-muted-foreground">Contact form message (max 5000 chars)</td></tr>
                    <tr className="border-b border-border/50"><td className="py-2 pr-4 font-mono text-primary">landing_url</td><td className="pr-4">string</td><td className="pr-4"><span className="text-muted-foreground">No</span></td><td className="text-muted-foreground">Page URL where form was submitted</td></tr>
                    <tr className="border-b border-border/50"><td className="py-2 pr-4 font-mono text-primary">referrer</td><td className="pr-4">string</td><td className="pr-4"><span className="text-muted-foreground">No</span></td><td className="text-muted-foreground">HTTP referrer URL</td></tr>
                    <tr className="border-b border-border/50"><td className="py-2 pr-4 font-mono text-primary">utm_source</td><td className="pr-4">string</td><td className="pr-4"><span className="text-muted-foreground">No</span></td><td className="text-muted-foreground">UTM source parameter</td></tr>
                    <tr className="border-b border-border/50"><td className="py-2 pr-4 font-mono text-primary">utm_medium</td><td className="pr-4">string</td><td className="pr-4"><span className="text-muted-foreground">No</span></td><td className="text-muted-foreground">UTM medium parameter</td></tr>
                    <tr className="border-b border-border/50"><td className="py-2 pr-4 font-mono text-primary">utm_campaign</td><td className="pr-4">string</td><td className="pr-4"><span className="text-muted-foreground">No</span></td><td className="text-muted-foreground">UTM campaign parameter</td></tr>
                    <tr className="border-b border-border/50"><td className="py-2 pr-4 font-mono text-primary">utm_content</td><td className="pr-4">string</td><td className="pr-4"><span className="text-muted-foreground">No</span></td><td className="text-muted-foreground">UTM content parameter</td></tr>
                    <tr><td className="py-2 pr-4 font-mono text-primary">utm_term</td><td className="pr-4">string</td><td className="pr-4"><span className="text-muted-foreground">No</span></td><td className="text-muted-foreground">UTM term parameter</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Success Response (201)</h4>
              <pre className="bg-muted/50 rounded-lg p-3 text-xs font-mono text-muted-foreground overflow-x-auto">{`{
  "success": true,
  "message": "Lead created successfully.",
  "data": {
    "id": 42,
    "name": "John Doe",
    "email": "john@example.com",
    "status": "new",
    "created_at": "2025-01-15T10:30:00.000Z"
  }
}`}</pre>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Error Responses</h4>
              <div className="space-y-2">
                <pre className="bg-muted/50 rounded-lg p-3 text-xs font-mono text-muted-foreground overflow-x-auto">{`// 401 - Missing or invalid API key
{ "success": false, "message": "API key is required..." }

// 403 - Deactivated key
{ "success": false, "message": "This API key has been deactivated..." }

// 422 - Validation error
{ "message": "The name field is required.", "errors": { "name": [...] } }`}</pre>
              </div>
            </div>
          </div>
        </div>

        {/* GET /api/leads/ping */}
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="bg-blue-500/10 px-4 py-2 flex items-center gap-2">
            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-bold rounded">GET</span>
            <code className="text-sm font-mono text-foreground">/api/leads/ping</code>
            <span className="text-xs text-muted-foreground ml-auto">Test connection</span>
          </div>
          <div className="p-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Success Response (200)</h4>
            <pre className="bg-muted/50 rounded-lg p-3 text-xs font-mono text-muted-foreground overflow-x-auto">{`{
  "success": true,
  "message": "API connection active.",
  "website": "Your Website Name"
}`}</pre>
          </div>
        </div>
      </div>

      {/* Code Examples */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Integration Examples</h3>

        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-2">JavaScript (Fetch)</h4>
          <pre className="bg-muted/50 rounded-lg p-4 text-xs font-mono text-muted-foreground overflow-x-auto">{`const response = await fetch('${window.location.origin}/api/leads', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your_api_key_here',
  },
  body: JSON.stringify({
    name: formData.name,
    email: formData.email,
    phone: formData.phone,
    message: formData.message,
    landing_url: window.location.href,
    referrer: document.referrer,
  }),
});

const result = await response.json();`}</pre>
        </div>

        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-2">PHP (cURL)</h4>
          <pre className="bg-muted/50 rounded-lg p-4 text-xs font-mono text-muted-foreground overflow-x-auto">{`$ch = curl_init('${window.location.origin}/api/leads');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'X-API-Key: your_api_key_here',
    ],
    CURLOPT_POSTFIELDS => json_encode([
        'name' => $_POST['name'],
        'email' => $_POST['email'],
        'phone' => $_POST['phone'],
        'message' => $_POST['message'],
    ]),
]);
$response = curl_exec($ch);
curl_close($ch);`}</pre>
        </div>

        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-2">Python (requests)</h4>
          <pre className="bg-muted/50 rounded-lg p-4 text-xs font-mono text-muted-foreground overflow-x-auto">{`import requests

response = requests.post(
    '${window.location.origin}/api/leads',
    headers={'X-API-Key': 'your_api_key_here'},
    json={
        'name': 'John Doe',
        'email': 'john@example.com',
        'phone': '+1234567890',
        'message': 'Interested in your services',
    }
)
print(response.json())`}</pre>
        </div>
      </div>
    </div>
  );
}

// ─── TEST CONSOLE TAB ────────────────────────────────────────────────────────
function TestConsoleTab({ apiKeys }) {
  const [selectedKey, setSelectedKey] = useState('');
  const [endpoint, setEndpoint] = useState('POST /api/leads');
  const [requestBody, setRequestBody] = useState(JSON.stringify({
    name: 'Test User',
    email: 'test@example.com',
    phone: '+1234567890',
    company: 'Test Company',
    message: 'This is a test lead from the API console.',
  }, null, 2));
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [responseTime, setResponseTime] = useState(null);

  const activeKeys = apiKeys.filter(k => k.is_active);

  const handleSendRequest = async () => {
    if (!selectedKey) {
      setResponse({ status: 0, body: { error: 'Please select an API key first.' } });
      return;
    }

    setLoading(true);
    setResponse(null);
    const startTime = performance.now();

    try {
      const isPing = endpoint === 'GET /api/leads/ping';
      const url = isPing ? '/api/leads/ping' : '/api/leads';
      const method = isPing ? 'GET' : 'POST';

      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-API-Key': selectedKey,
        },
      };

      if (!isPing) {
        try {
          JSON.parse(requestBody);
          options.body = requestBody;
        } catch (e) {
          setResponse({ status: 0, body: { error: 'Invalid JSON in request body.' } });
          setLoading(false);
          return;
        }
      }

      const res = await fetch(url, options);
      const endTime = performance.now();
      setResponseTime(Math.round(endTime - startTime));

      const data = await res.json();
      setResponse({ status: res.status, body: data });
    } catch (error) {
      const endTime = performance.now();
      setResponseTime(Math.round(endTime - startTime));
      setResponse({ status: 0, body: { error: error.message } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-1">API Test Console</h3>
        <p className="text-sm text-muted-foreground mb-6">Test your API integration directly from the browser. Select an active API key and send requests.</p>

        <div className="space-y-4">
          {/* API Key Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">API Key</label>
              <select value={selectedKey} onChange={(e) => setSelectedKey(e.target.value)} className="form-input">
                <option value="">Select an API key...</option>
                {activeKeys.map(k => (
                  <option key={k.id} value={k.key}>{k.website_name} ({k.name})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Endpoint</label>
              <select value={endpoint} onChange={(e) => setEndpoint(e.target.value)} className="form-input">
                <option value="POST /api/leads">POST /api/leads (Create Lead)</option>
                <option value="GET /api/leads/ping">GET /api/leads/ping (Test Connection)</option>
              </select>
            </div>
          </div>

          {/* Request Body */}
          {endpoint === 'POST /api/leads' && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Request Body (JSON)</label>
              <textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                className="form-input font-mono text-sm resize-y"
                rows={10}
                spellCheck={false}
              />
            </div>
          )}

          {/* Send Button */}
          <button
            onClick={handleSendRequest}
            disabled={loading || !selectedKey}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {loading ? 'Sending...' : 'Send Request'}
          </button>
        </div>
      </div>

      {/* Response */}
      {response && (
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              Response
              {response.status >= 200 && response.status < 300 ? (
                <CheckCircle className="h-4 w-4 text-green-400" />
              ) : (
                <XCircle className="h-4 w-4 text-red-400" />
              )}
            </h3>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className={`px-2 py-0.5 rounded font-mono font-bold ${response.status >= 200 && response.status < 300 ? 'bg-green-500/20 text-green-400' : response.status >= 400 ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                {response.status || 'ERR'}
              </span>
              {responseTime !== null && (
                <span>{responseTime}ms</span>
              )}
            </div>
          </div>
          <pre className="bg-muted/50 rounded-lg p-4 text-xs font-mono text-muted-foreground overflow-x-auto max-h-80 overflow-y-auto">
            {JSON.stringify(response.body, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

// ─── KEY MANAGEMENT TAB ──────────────────────────────────────────────────────
function KeyManagementTab({ apiKeys }) {
  const [showForm, setShowForm] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [visibleKeys, setVisibleKeys] = useState({});

  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    website_name: '',
    website_url: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/admin/api-keys', {
      onSuccess: () => { reset(); setShowForm(false); },
    });
  };

  const handleToggle = (id) => {
    if (confirm('Change the status of this API key?')) {
      router.post(`/admin/api-keys/${id}/toggle`);
    }
  };

  const handleRegenerate = (id) => {
    if (confirm('This will invalidate the current key. The external website will need to update their configuration. Continue?')) {
      router.post(`/admin/api-keys/${id}/regenerate`);
    }
  };

  const handleDelete = (id) => {
    if (confirm('Permanently delete this API key? Any website using it will lose access.')) {
      router.delete(`/admin/api-keys/${id}`);
    }
  };

  const copyKey = (id, key) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleKeyVisibility = (id) => {
    setVisibleKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const maskKey = (key) => key.substring(0, 8) + '••••••••••••••••' + key.substring(key.length - 6);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{apiKeys.length} API key{apiKeys.length !== 1 ? 's' : ''} registered</p>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> Generate New Key
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-card border border-primary/30 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Generate New API Key</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Key Label *</label>
                <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className={`form-input ${errors.name ? 'border-destructive' : ''}`} placeholder="e.g. Production Key" />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Website Name *</label>
                <input type="text" value={data.website_name} onChange={(e) => setData('website_name', e.target.value)} className={`form-input ${errors.website_name ? 'border-destructive' : ''}`} placeholder="e.g. Client Portal" />
                {errors.website_name && <p className="text-xs text-destructive mt-1">{errors.website_name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Website URL</label>
                <input type="text" value={data.website_url} onChange={(e) => setData('website_url', e.target.value)} className="form-input" placeholder="https://example.com" />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={processing} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
                {processing ? 'Generating...' : 'Generate Key'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); reset(); }} className="px-4 py-2 border border-border text-foreground rounded-lg text-sm hover:bg-muted">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Keys Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Website</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">API Key</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Requests</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Used</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {apiKeys.map((apiKey) => (
                <tr key={apiKey.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Globe className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{apiKey.website_name}</p>
                        <p className="text-xs text-muted-foreground">{apiKey.name}</p>
                        {apiKey.website_url && <a href={apiKey.website_url} target="_blank" rel="noopener" className="text-xs text-primary hover:underline">{apiKey.website_url}</a>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono text-muted-foreground max-w-[180px] truncate">
                        {visibleKeys[apiKey.id] ? apiKey.key : maskKey(apiKey.key)}
                      </code>
                      <button onClick={() => toggleKeyVisibility(apiKey.id)} className="p-1 text-muted-foreground hover:text-foreground" title={visibleKeys[apiKey.id] ? 'Hide' : 'Show'}>
                        {visibleKeys[apiKey.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                      <button onClick={() => copyKey(apiKey.id, apiKey.key)} className="p-1 text-muted-foreground hover:text-foreground" title="Copy">
                        {copiedId === apiKey.id ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${apiKey.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {apiKey.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-muted-foreground">{apiKey.requests_count}</span>
                  </td>
                  <td className="px-6 py-4">
                    {apiKey.last_used_at ? (
                      <span className="text-xs text-muted-foreground">{new Date(apiKey.last_used_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Never</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleToggle(apiKey.id)} className={`p-2 rounded-lg transition-colors ${apiKey.is_active ? 'text-yellow-400 hover:bg-yellow-500/10' : 'text-green-400 hover:bg-green-500/10'}`} title={apiKey.is_active ? 'Deactivate' : 'Activate'}>
                        {apiKey.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button onClick={() => handleRegenerate(apiKey.id)} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors" title="Regenerate">
                        <RefreshCw className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(apiKey.id)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {apiKeys.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <Key className="h-8 w-8 mx-auto mb-3 text-muted-foreground/30" />
                    <p>No API keys yet. Generate one to start receiving leads.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── USAGE TRACKER TAB ───────────────────────────────────────────────────────
function UsageTrackerTab({ stats, websiteStats, apiKeys }) {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Activity className="h-4 w-4 text-primary" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.totalRequests}</p>
          <p className="text-xs text-muted-foreground">Total API Requests</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Zap className="h-4 w-4 text-green-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.totalLeadsViaApi}</p>
          <p className="text-xs text-muted-foreground">Leads via API</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Key className="h-4 w-4 text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.activeKeys}<span className="text-sm text-muted-foreground font-normal">/{stats.totalKeys}</span></p>
          <p className="text-xs text-muted-foreground">Active Keys</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-yellow-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.leadsToday}</p>
          <p className="text-xs text-muted-foreground">Leads Today</p>
        </div>
      </div>

      {/* Period breakdown */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Leads via API by Period</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <p className="text-3xl font-bold text-foreground">{stats.leadsToday}</p>
            <p className="text-xs text-muted-foreground mt-1">Today</p>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <p className="text-3xl font-bold text-foreground">{stats.leadsThisWeek}</p>
            <p className="text-xs text-muted-foreground mt-1">This Week</p>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <p className="text-3xl font-bold text-foreground">{stats.leadsThisMonth}</p>
            <p className="text-xs text-muted-foreground mt-1">This Month</p>
          </div>
        </div>
      </div>

      {/* Per Website Stats */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Leads by Website</h3>
        {websiteStats.length > 0 ? (
          <div className="space-y-3">
            {websiteStats.map((ws, i) => {
              const percentage = stats.totalLeadsViaApi > 0 ? Math.round((ws.leads_count / stats.totalLeadsViaApi) * 100) : 0;
              return (
                <div key={i} className="flex items-center gap-4">
                  <div className="flex items-center gap-2 min-w-[150px]">
                    <Globe className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-sm font-medium text-foreground truncate">{ws.source_website || 'Unknown'}</span>
                  </div>
                  <div className="flex-1">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                  <div className="text-right min-w-[80px]">
                    <span className="text-sm font-medium text-foreground">{ws.leads_count}</span>
                    <span className="text-xs text-muted-foreground ml-1">({percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-6">No API leads yet. Connect a website to start tracking.</p>
        )}
      </div>

      {/* Per Key Usage */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Usage per API Key</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-xs font-medium text-muted-foreground">Website</th>
                <th className="text-left py-2 text-xs font-medium text-muted-foreground">Key</th>
                <th className="text-right py-2 text-xs font-medium text-muted-foreground">Requests</th>
                <th className="text-right py-2 text-xs font-medium text-muted-foreground">Last Used</th>
                <th className="text-right py-2 text-xs font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {apiKeys.map((k) => (
                <tr key={k.id} className="border-b border-border/50">
                  <td className="py-3 font-medium text-foreground">{k.website_name}</td>
                  <td className="py-3 text-xs font-mono text-muted-foreground">{k.name}</td>
                  <td className="py-3 text-right text-foreground">{k.requests_count}</td>
                  <td className="py-3 text-right text-xs text-muted-foreground">
                    {k.last_used_at ? new Date(k.last_used_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never'}
                  </td>
                  <td className="py-3 text-right">
                    <span className={`inline-flex px-2 py-0.5 text-xs rounded-full ${k.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {k.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────
export default function ApiKeysIndex({ apiKeys, stats, websiteStats }) {
  const [activeTab, setActiveTab] = useState('docs');

  return (
    <AdminLayout title="API Management">
      <Head title="API Management" />

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 p-1 bg-muted/30 rounded-xl border border-border w-fit">
        <TabButton active={activeTab === 'docs'} onClick={() => setActiveTab('docs')} icon={BookOpen} label="Documentation" />
        <TabButton active={activeTab === 'test'} onClick={() => setActiveTab('test')} icon={TestTube} label="Test Console" />
        <TabButton active={activeTab === 'keys'} onClick={() => setActiveTab('keys')} icon={Key} label="API Keys" />
        <TabButton active={activeTab === 'usage'} onClick={() => setActiveTab('usage')} icon={BarChart3} label="Usage Tracker" />
      </div>

      {/* Tab Content */}
      {activeTab === 'docs' && <DocumentationTab />}
      {activeTab === 'test' && <TestConsoleTab apiKeys={apiKeys} />}
      {activeTab === 'keys' && <KeyManagementTab apiKeys={apiKeys} />}
      {activeTab === 'usage' && <UsageTrackerTab stats={stats} websiteStats={websiteStats} apiKeys={apiKeys} />}
    </AdminLayout>
  );
}
