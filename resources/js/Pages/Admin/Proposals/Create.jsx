import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, X } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function ProposalCreate({ leads, clients, services, nextNumber, preselectedLead }) {
  const { data, setData, post, processing, errors } = useForm({
    number: nextNumber,
    lead_id: preselectedLead || '',
    client_id: '',
    title: '',
    services: [],
    deliverables: [''],
    timeline: '',
    pricing: [{ description: '', amount: 0 }],
    terms: '',
    notes: '',
    status: 'draft',
    valid_until: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Clean empty deliverables
    const cleanData = {
      ...data,
      deliverables: data.deliverables.filter(d => d.trim()),
    };
    post('/admin/proposals', { data: cleanData });
  };

  // Service toggles
  const toggleService = (slug) => {
    if (data.services.includes(slug)) {
      setData('services', data.services.filter(s => s !== slug));
    } else {
      setData('services', [...data.services, slug]);
    }
  };

  // Deliverables
  const addDeliverable = () => setData('deliverables', [...data.deliverables, '']);
  const updateDeliverable = (i, val) => { const d = [...data.deliverables]; d[i] = val; setData('deliverables', d); };
  const removeDeliverable = (i) => setData('deliverables', data.deliverables.filter((_, idx) => idx !== i));

  // Pricing
  const addPricingItem = () => setData('pricing', [...data.pricing, { description: '', amount: 0 }]);
  const updatePricingItem = (i, field, val) => { const p = [...data.pricing]; p[i] = { ...p[i], [field]: val }; setData('pricing', p); };
  const removePricingItem = (i) => { if (data.pricing.length > 1) setData('pricing', data.pricing.filter((_, idx) => idx !== i)); };

  const total = data.pricing.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  return (
    <AdminLayout title="New Proposal">
      <Head title="New Proposal" />

      <div className="max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/proposals" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Proposals
          </Link>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="form-label">Proposal Number</label>
                <input type="text" value={data.number} onChange={(e) => setData('number', e.target.value)} className="form-input" />
              </div>
              <div>
                <label className="form-label">Lead</label>
                <select value={data.lead_id} onChange={(e) => setData('lead_id', e.target.value)} className="form-input">
                  <option value="">None</option>
                  {leads.map((l) => <option key={l.id} value={l.id}>{l.name} {l.company ? `(${l.company})` : ''}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Client</label>
                <select value={data.client_id} onChange={(e) => setData('client_id', e.target.value)} className="form-input">
                  <option value="">None</option>
                  {Object.entries(clients).map(([id, company]) => <option key={id} value={id}>{company}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="form-label">Title <span className="text-primary">*</span></label>
              <input type="text" value={data.title} onChange={(e) => setData('title', e.target.value)} className={`form-input ${errors.title ? 'border-destructive' : ''}`} placeholder="Website Redesign Proposal" />
              {errors.title && <p className="mt-1 text-sm text-destructive">{errors.title}</p>}
            </div>

            {/* Services */}
            <div>
              <label className="form-label">Services</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {Object.entries(services).map(([slug, title]) => (
                  <button key={slug} type="button" onClick={() => toggleService(slug)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${data.services.includes(slug) ? 'bg-primary/10 text-primary border-primary/30' : 'text-muted-foreground border-border hover:border-primary/30'}`}>
                    {title}
                  </button>
                ))}
              </div>
            </div>

            {/* Deliverables */}
            <div>
              <label className="form-label">Deliverables</label>
              <div className="space-y-2">
                {data.deliverables.map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="text" value={d} onChange={(e) => updateDeliverable(i, e.target.value)} className="form-input flex-1 text-sm" placeholder="Deliverable item" />
                    {data.deliverables.length > 1 && <button type="button" onClick={() => removeDeliverable(i)} className="text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>}
                  </div>
                ))}
              </div>
              <button type="button" onClick={addDeliverable} className="mt-2 text-sm text-primary hover:text-primary/80">+ Add deliverable</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Timeline</label>
                <input type="text" value={data.timeline} onChange={(e) => setData('timeline', e.target.value)} className="form-input" placeholder="4-6 weeks" />
              </div>
              <div>
                <label className="form-label">Valid Until</label>
                <input type="date" value={data.valid_until} onChange={(e) => setData('valid_until', e.target.value)} className="form-input" />
              </div>
            </div>

            {/* Pricing */}
            <div>
              <label className="form-label">Pricing</label>
              <div className="space-y-2">
                {data.pricing.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-8">
                      <input type="text" value={item.description} onChange={(e) => updatePricingItem(i, 'description', e.target.value)} className="form-input text-sm" placeholder="Service / phase" />
                    </div>
                    <div className="col-span-3">
                      <input type="number" step="0.01" min="0" value={item.amount} onChange={(e) => updatePricingItem(i, 'amount', parseFloat(e.target.value) || 0)} className="form-input text-sm" />
                    </div>
                    <div className="col-span-1">
                      {data.pricing.length > 1 && <button type="button" onClick={() => removePricingItem(i)} className="text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>}
                    </div>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addPricingItem} className="mt-2 text-sm text-primary hover:text-primary/80 flex items-center gap-1"><Plus className="h-3 w-3" /> Add item</button>
              <p className="mt-2 text-sm font-medium text-foreground">Total: ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>

            <div>
              <label className="form-label">Terms & Conditions</label>
              <textarea value={data.terms} onChange={(e) => setData('terms', e.target.value)} rows="3" className="form-input resize-y" placeholder="Payment terms, IP ownership, etc." />
            </div>

            <div>
              <label className="form-label">Notes</label>
              <textarea value={data.notes} onChange={(e) => setData('notes', e.target.value)} rows="2" className="form-input resize-y" placeholder="Internal notes..." />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Link href="/admin/proposals" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</Link>
              <button type="submit" disabled={processing} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                {processing ? 'Creating...' : 'Create Proposal'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
