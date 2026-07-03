import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function ClientCreate() {
  const { data, setData, post, processing, errors } = useForm({
    company: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    country: '',
    gst_vat: '',
    industry: '',
    notes: '',
    status: 'active',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/admin/clients');
  };

  return (
    <AdminLayout title="New Client">
      <Head title="New Client" />

      <div className="max-w-3xl">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/clients" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Clients
          </Link>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Company <span className="text-primary">*</span></label>
                <input type="text" value={data.company} onChange={(e) => setData('company', e.target.value)} className={`form-input ${errors.company ? 'border-destructive' : ''}`} placeholder="Acme Inc" />
                {errors.company && <p className="mt-1 text-sm text-destructive">{errors.company}</p>}
              </div>
              <div>
                <label className="form-label">Contact Person <span className="text-primary">*</span></label>
                <input type="text" value={data.contact_person} onChange={(e) => setData('contact_person', e.target.value)} className={`form-input ${errors.contact_person ? 'border-destructive' : ''}`} placeholder="John Doe" />
                {errors.contact_person && <p className="mt-1 text-sm text-destructive">{errors.contact_person}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Email <span className="text-primary">*</span></label>
                <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className={`form-input ${errors.email ? 'border-destructive' : ''}`} placeholder="john@company.com" />
                {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email}</p>}
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
                <label className="form-label">Industry</label>
                <input type="text" value={data.industry} onChange={(e) => setData('industry', e.target.value)} className="form-input" placeholder="Technology" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="form-label">GST / VAT</label>
                <input type="text" value={data.gst_vat} onChange={(e) => setData('gst_vat', e.target.value)} className="form-input" placeholder="Tax ID" />
              </div>
              <div>
                <label className="form-label">Status</label>
                <select value={data.status} onChange={(e) => setData('status', e.target.value)} className="form-input">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="churned">Churned</option>
                </select>
              </div>
            </div>

            <div>
              <label className="form-label">Address</label>
              <textarea value={data.address} onChange={(e) => setData('address', e.target.value)} rows="2" className="form-input resize-y" placeholder="Full address" />
            </div>

            <div>
              <label className="form-label">Notes</label>
              <textarea value={data.notes} onChange={(e) => setData('notes', e.target.value)} rows="3" className="form-input resize-y" placeholder="Internal notes about this client..." />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Link href="/admin/clients" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</Link>
              <button type="submit" disabled={processing} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                {processing ? 'Creating...' : 'Create Client'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
