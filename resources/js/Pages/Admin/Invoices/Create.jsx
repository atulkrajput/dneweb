import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, X } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function InvoiceCreate({ clients, projects, nextNumber }) {
  const { data, setData, post, processing, errors } = useForm({
    number: nextNumber,
    client_id: '',
    project_id: '',
    items: [{ description: '', qty: 1, rate: 0 }],
    tax_rate: 0,
    discount: 0,
    issue_date: new Date().toISOString().split('T')[0],
    due_date: '',
    status: 'draft',
    notes: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/admin/invoices');
  };

  const addItem = () => {
    setData('items', [...data.items, { description: '', qty: 1, rate: 0 }]);
  };

  const updateItem = (index, field, value) => {
    const updated = [...data.items];
    updated[index] = { ...updated[index], [field]: value };
    setData('items', updated);
  };

  const removeItem = (index) => {
    if (data.items.length > 1) {
      setData('items', data.items.filter((_, i) => i !== index));
    }
  };

  // Calculations
  const subtotal = data.items.reduce((sum, item) => sum + (item.qty * item.rate), 0);
  const taxAmount = subtotal * (data.tax_rate / 100);
  const total = subtotal + taxAmount - (data.discount || 0);

  const clientProjects = data.client_id ? projects.filter(p => String(p.client_id) === String(data.client_id)) : projects;

  return (
    <AdminLayout title="New Invoice">
      <Head title="New Invoice" />

      <div className="max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/invoices" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Invoices
          </Link>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="form-label">Invoice Number</label>
                <input type="text" value={data.number} onChange={(e) => setData('number', e.target.value)} className={`form-input ${errors.number ? 'border-destructive' : ''}`} />
                {errors.number && <p className="mt-1 text-sm text-destructive">{errors.number}</p>}
              </div>
              <div>
                <label className="form-label">Client <span className="text-primary">*</span></label>
                <select value={data.client_id} onChange={(e) => setData('client_id', e.target.value)} className={`form-input ${errors.client_id ? 'border-destructive' : ''}`}>
                  <option value="">Select client...</option>
                  {Object.entries(clients).map(([id, company]) => <option key={id} value={id}>{company}</option>)}
                </select>
                {errors.client_id && <p className="mt-1 text-sm text-destructive">{errors.client_id}</p>}
              </div>
              <div>
                <label className="form-label">Project</label>
                <select value={data.project_id} onChange={(e) => setData('project_id', e.target.value)} className="form-input">
                  <option value="">None</option>
                  {clientProjects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="form-label">Issue Date <span className="text-primary">*</span></label>
                <input type="date" value={data.issue_date} onChange={(e) => setData('issue_date', e.target.value)} className="form-input" />
              </div>
              <div>
                <label className="form-label">Due Date <span className="text-primary">*</span></label>
                <input type="date" value={data.due_date} onChange={(e) => setData('due_date', e.target.value)} className={`form-input ${errors.due_date ? 'border-destructive' : ''}`} />
                {errors.due_date && <p className="mt-1 text-sm text-destructive">{errors.due_date}</p>}
              </div>
              <div>
                <label className="form-label">Status</label>
                <select value={data.status} onChange={(e) => setData('status', e.target.value)} className="form-input">
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                </select>
              </div>
            </div>

            {/* Line Items */}
            <div>
              <label className="form-label">Items <span className="text-primary">*</span></label>
              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-2 text-xs text-muted-foreground font-medium">
                  <div className="col-span-5">Description</div>
                  <div className="col-span-2">Qty</div>
                  <div className="col-span-2">Rate</div>
                  <div className="col-span-2">Amount</div>
                  <div className="col-span-1"></div>
                </div>
                {data.items.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-5">
                      <input type="text" value={item.description} onChange={(e) => updateItem(i, 'description', e.target.value)} className="form-input text-sm" placeholder="Service description" />
                    </div>
                    <div className="col-span-2">
                      <input type="number" step="0.01" min="0.01" value={item.qty} onChange={(e) => updateItem(i, 'qty', parseFloat(e.target.value) || 0)} className="form-input text-sm" />
                    </div>
                    <div className="col-span-2">
                      <input type="number" step="0.01" min="0" value={item.rate} onChange={(e) => updateItem(i, 'rate', parseFloat(e.target.value) || 0)} className="form-input text-sm" />
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm text-foreground">${(item.qty * item.rate).toFixed(2)}</span>
                    </div>
                    <div className="col-span-1">
                      {data.items.length > 1 && (
                        <button type="button" onClick={() => removeItem(i)} className="text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addItem} className="mt-3 text-sm text-primary hover:text-primary/80 flex items-center gap-1">
                <Plus className="h-3 w-3" /> Add line item
              </button>
              {errors.items && <p className="mt-1 text-sm text-destructive">{errors.items}</p>}
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-72 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Tax (%)</span>
                  <input type="number" step="0.01" min="0" max="100" value={data.tax_rate} onChange={(e) => setData('tax_rate', parseFloat(e.target.value) || 0)} className="form-input w-20 text-sm text-right" />
                  <span className="text-foreground w-20 text-right">${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Discount</span>
                  <input type="number" step="0.01" min="0" value={data.discount} onChange={(e) => setData('discount', parseFloat(e.target.value) || 0)} className="form-input w-20 text-sm text-right" />
                  <span className="text-foreground w-20 text-right">-${(data.discount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-bold text-foreground text-lg">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="form-label">Notes</label>
              <textarea value={data.notes} onChange={(e) => setData('notes', e.target.value)} rows="2" className="form-input resize-y" placeholder="Payment terms or notes..." />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Link href="/admin/invoices" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</Link>
              <button type="submit" disabled={processing} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                {processing ? 'Creating...' : 'Create Invoice'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
