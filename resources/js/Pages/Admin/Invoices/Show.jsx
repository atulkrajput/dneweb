import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { ArrowLeft, Trash2, Edit3, DollarSign, Building2, Calendar, CreditCard } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import NotesSection from '@/Components/NotesSection';

const STATUS_LABELS = { draft: 'Draft', sent: 'Sent', paid: 'Paid', overdue: 'Overdue', cancelled: 'Cancelled' };
const STATUS_COLORS = {
  draft: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  sent: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  paid: 'bg-green-500/10 text-green-400 border-green-500/20',
  overdue: 'bg-red-500/10 text-red-400 border-red-500/20',
  cancelled: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
};

const METHOD_LABELS = { bank_transfer: 'Bank Transfer', card: 'Card', paypal: 'PayPal', cash: 'Cash', other: 'Other' };

export default function InvoiceShow({ invoice, paidAmount, outstanding, internalNotes }) {
  const [showPayment, setShowPayment] = useState(false);
  const fmt = (val) => '$' + Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const paymentForm = useForm({
    amount: outstanding > 0 ? outstanding.toFixed(2) : '',
    method: 'bank_transfer',
    reference: '',
    payment_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const handlePayment = (e) => {
    e.preventDefault();
    paymentForm.post(`/admin/invoices/${invoice.id}/payments`, {
      onSuccess: () => { paymentForm.reset(); setShowPayment(false); },
      preserveScroll: true,
    });
  };

  const handleDelete = () => {
    if (confirm('Delete this invoice?')) {
      router.delete(`/admin/invoices/${invoice.id}`);
    }
  };

  const isOverdue = invoice.due_date && new Date(invoice.due_date) < new Date() && ['sent', 'overdue'].includes(invoice.status);

  return (
    <AdminLayout title="Invoice Details">
      <Head title={`Invoice - ${invoice.number}`} />

      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Link href="/admin/invoices" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Invoices
          </Link>
          <div className="flex items-center gap-2">
            {outstanding > 0 && invoice.status !== 'cancelled' && (
              <button onClick={() => setShowPayment(!showPayment)} className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors font-medium">
                <CreditCard className="h-4 w-4" /> Record Payment
              </button>
            )}
            <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          </div>
        </div>

        {/* Payment Form */}
        {showPayment && (
          <div className="bg-card border border-green-500/30 rounded-xl p-6 mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Record Payment</h3>
            <form onSubmit={handlePayment} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="form-label">Amount <span className="text-primary">*</span></label>
                <input type="number" step="0.01" value={paymentForm.data.amount} onChange={(e) => paymentForm.setData('amount', e.target.value)} className="form-input" />
              </div>
              <div>
                <label className="form-label">Method</label>
                <select value={paymentForm.data.method} onChange={(e) => paymentForm.setData('method', e.target.value)} className="form-input">
                  {Object.entries(METHOD_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Date <span className="text-primary">*</span></label>
                <input type="date" value={paymentForm.data.payment_date} onChange={(e) => paymentForm.setData('payment_date', e.target.value)} className="form-input" />
              </div>
              <div>
                <label className="form-label">Reference</label>
                <input type="text" value={paymentForm.data.reference} onChange={(e) => paymentForm.setData('reference', e.target.value)} className="form-input" placeholder="TXN-123" />
              </div>
              <div className="flex items-end">
                <button type="submit" disabled={paymentForm.processing} className="w-full px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                  {paymentForm.processing ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Invoice Header */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{invoice.number}</h2>
              {invoice.client && (
                <Link href={`/admin/clients/${invoice.client.id}`} className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mt-1">
                  <Building2 className="h-3 w-3" /> {invoice.client.company}
                </Link>
              )}
              {invoice.project && (
                <Link href={`/admin/projects/${invoice.project.id}`} className="text-xs text-muted-foreground hover:text-primary mt-0.5 block">
                  Project: {invoice.project.name}
                </Link>
              )}
            </div>
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[invoice.status]}`}>
              {STATUS_LABELS[invoice.status]}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div>
              <p className="text-xs text-muted-foreground">Issue Date</p>
              <p className="text-sm font-medium text-foreground">{new Date(invoice.issue_date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Due Date</p>
              <p className={`text-sm font-medium ${isOverdue ? 'text-red-400' : 'text-foreground'}`}>{new Date(invoice.due_date).toLocaleDateString()}{isOverdue && ' (Overdue)'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Paid</p>
              <p className="text-sm font-medium text-green-400">{fmt(paidAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Outstanding</p>
              <p className={`text-sm font-medium ${outstanding > 0 ? 'text-orange-400' : 'text-green-400'}`}>{fmt(outstanding)}</p>
            </div>
          </div>

          {/* Line Items */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Description</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Qty</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Rate</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoice.items?.map((item, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3 text-foreground">{item.description}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{item.qty}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{fmt(item.rate)}</td>
                    <td className="px-4 py-3 text-right text-foreground font-medium">{fmt(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mt-4">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="text-foreground">{fmt(invoice.subtotal)}</span></div>
              {Number(invoice.tax_rate) > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Tax ({invoice.tax_rate}%)</span><span className="text-foreground">{fmt(invoice.tax_amount)}</span></div>}
              {Number(invoice.discount) > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span className="text-foreground">-{fmt(invoice.discount)}</span></div>}
              <div className="flex justify-between pt-2 border-t border-border"><span className="font-semibold text-foreground">Total</span><span className="font-bold text-foreground text-lg">{fmt(invoice.total)}</span></div>
            </div>
          </div>

          {invoice.notes && (
            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Notes</p>
              <p className="text-sm text-foreground whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}
        </div>

        {/* Payment History */}
        {invoice.payments && invoice.payments.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" /> Payment History
            </h3>
            <div className="space-y-3">
              {invoice.payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-foreground">{fmt(payment.amount)}</p>
                    <p className="text-xs text-muted-foreground">
                      {METHOD_LABELS[payment.method] || payment.method} • {new Date(payment.payment_date).toLocaleDateString()}
                      {payment.reference && ` • Ref: ${payment.reference}`}
                    </p>
                  </div>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Internal Notes */}
        <NotesSection notableType="invoice" notableId={invoice.id} notes={internalNotes || []} />
      </div>
    </AdminLayout>
  );
}
