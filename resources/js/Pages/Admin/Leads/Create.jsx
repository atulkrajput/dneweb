import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function LeadCreate({ services }) {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    company: '',
    email: '',
    phone: '',
    country: '',
    interested_service: '',
    notes: '',
    status: 'new',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/admin/leads');
  };

  return (
    <AdminLayout title="New Lead">
      <Head title="New Lead" />

      <div className="max-w-3xl">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/leads" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Leads
          </Link>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Name <span className="text-primary">*</span></label>
                <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className={`form-input ${errors.name ? 'border-destructive' : ''}`} placeholder="John Doe" />
                {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
              </div>
              <div>
                <label className="form-label">Email <span className="text-primary">*</span></label>
                <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className={`form-input ${errors.email ? 'border-destructive' : ''}`} placeholder="john@company.com" />
                {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Company</label>
                <input type="text" value={data.company} onChange={(e) => setData('company', e.target.value)} className="form-input" placeholder="Company Name" />
              </div>
              <div>
                <label className="form-label">Phone</label>
                <input type="text" value={data.phone} onChange={(e) => setData('phone', e.target.value)} className="form-input" placeholder="+1 234 567 890" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Country</label>
                <input type="text" value={data.country} onChange={(e) => setData('country', e.target.value)} className="form-input" placeholder="USA" />
              </div>
              <div>
                <label className="form-label">Interested Service</label>
                <select value={data.interested_service} onChange={(e) => setData('interested_service', e.target.value)} className="form-input">
                  <option value="">Select a service...</option>
                  {Object.entries(services).map(([slug, title]) => (
                    <option key={slug} value={slug}>{title}</option>
                  ))}
                  <option value="not-sure">Not sure yet</option>
                </select>
              </div>
            </div>

            <div>
              <label className="form-label">Notes</label>
              <textarea value={data.notes} onChange={(e) => setData('notes', e.target.value)} rows="4" className="form-input resize-y" placeholder="Additional notes about this lead..." />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Link href="/admin/leads" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</Link>
              <button type="submit" disabled={processing} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                {processing ? 'Creating...' : 'Create Lead'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
