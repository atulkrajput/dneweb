import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Plus, Target, Pencil, Trash2, X } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

const CATEGORY_COLORS = {
  revenue: 'bg-green-500/10 text-green-400',
  growth: 'bg-blue-500/10 text-blue-400',
  product: 'bg-purple-500/10 text-purple-400',
  infrastructure: 'bg-orange-500/10 text-orange-400',
  maintenance: 'bg-gray-500/10 text-gray-400',
};

const STATUS_COLORS = {
  active: 'bg-blue-500/10 text-blue-400',
  achieved: 'bg-green-500/10 text-green-400',
  missed: 'bg-red-500/10 text-red-400',
  paused: 'bg-gray-500/10 text-gray-400',
};

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

const blankGoal = {
  id: null,
  title: '',
  description: '',
  category: 'growth',
  measure: '',
  unit: '',
  baseline_value: '',
  target_value: '',
  current_value: '',
  target_date: '',
  owner_id: '',
  status: 'active',
};

function OutcomePanel({ goal, outcomeTypes }) {
  const [open, setOpen] = useState(false);
  const { data, setData, post, processing, reset } = useForm({
    type: 'qualified_lead',
    value: '',
    unit: '',
    note: '',
    occurred_on: new Date().toISOString().split('T')[0],
  });

  const submit = (e) => {
    e.preventDefault();
    post(`/admin/goals/${goal.id}/outcomes`, {
      preserveScroll: true,
      onSuccess: () => reset('value', 'note'),
    });
  };

  const removeOutcome = (o) => {
    if (confirm('Remove this outcome?')) {
      router.delete(`/admin/goals/${goal.id}/outcomes/${o.id}`, { preserveScroll: true });
    }
  };

  return (
    <div className="mt-4 border-t border-border pt-3">
      <button type="button" onClick={() => setOpen(!open)} className="text-xs text-primary hover:underline">
        {open ? 'Hide' : 'Record / view outcomes'} ({goal.outcomes?.length || 0})
      </button>
      {open && (
        <div className="mt-3 space-y-3">
          <form onSubmit={submit} className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-end">
            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs text-muted-foreground">Type</label>
              <select value={data.type} onChange={(e) => setData('type', e.target.value)} className="form-input text-sm">
                {outcomeTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Value</label>
              <input type="number" step="any" value={data.value} onChange={(e) => setData('value', e.target.value)} className="form-input text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Date</label>
              <input type="date" value={data.occurred_on} onChange={(e) => setData('occurred_on', e.target.value)} className="form-input text-sm" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs text-muted-foreground">Note</label>
              <input type="text" value={data.note} onChange={(e) => setData('note', e.target.value)} className="form-input text-sm" placeholder="Optional" />
            </div>
            <div className="col-span-2 sm:col-span-5 flex justify-end">
              <button type="submit" disabled={processing} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 disabled:opacity-50">
                {processing ? 'Saving...' : 'Add outcome'}
              </button>
            </div>
          </form>
          {goal.outcomes?.length > 0 && (
            <ul className="space-y-1">
              {goal.outcomes.map((o) => (
                <li key={o.id} className="flex items-center justify-between text-xs bg-muted/40 rounded px-2 py-1">
                  <span className="text-foreground">
                    {o.type_label}: <strong>{Number(o.value).toLocaleString()}{o.unit ? ` ${o.unit}` : ''}</strong>
                    <span className="text-muted-foreground"> · {o.occurred_on}{o.note ? ` · ${o.note}` : ''}</span>
                  </span>
                  <button onClick={() => removeOutcome(o)} className="text-muted-foreground hover:text-destructive"><X className="h-3 w-3" /></button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default function GoalsIndex({ goals, categories, statuses, outcomeTypes, owners }) {
  const [showForm, setShowForm] = useState(false);
  const { data, setData, post, put, processing, errors, reset } = useForm(blankGoal);

  const openCreate = () => {
    reset();
    setData({ ...blankGoal });
    setShowForm(true);
  };

  const openEdit = (goal) => {
    setData({
      id: goal.id,
      title: goal.title || '',
      description: goal.description || '',
      category: goal.category || 'growth',
      measure: goal.measure || '',
      unit: goal.unit || '',
      baseline_value: goal.baseline_value ?? '',
      target_value: goal.target_value ?? '',
      current_value: goal.current_value ?? '',
      target_date: goal.target_date || '',
      owner_id: owners.find((o) => o.name === goal.owner)?.id || '',
      status: goal.status || 'active',
    });
    setShowForm(true);
  };

  const submit = (e) => {
    e.preventDefault();
    const opts = { preserveScroll: true, onSuccess: () => setShowForm(false) };
    if (data.id) {
      put(`/admin/goals/${data.id}`, opts);
    } else {
      post('/admin/goals', opts);
    }
  };

  const remove = (goal) => {
    if (confirm(`Delete goal "${goal.title}"? Tasks keep their history but lose the goal link.`)) {
      router.delete(`/admin/goals/${goal.id}`, { preserveScroll: true });
    }
  };

  return (
    <AdminLayout title="Goals">
      <Head title="Goals" />

      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          Company goals. Every task should advance one of these — work that doesn't is flagged as low/no impact.
        </p>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> New Goal
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Target className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No goals yet. Define what success looks like before authorizing work.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {goals.map((goal) => (
            <div key={goal.id} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-foreground">{goal.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[goal.category] || ''}`}>{cap(goal.category)}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[goal.status] || ''}`}>{cap(goal.status)}</span>
                  </div>
                  {goal.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{goal.description}</p>}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(goal)} className="p-1.5 text-muted-foreground hover:text-primary" title="Edit"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => remove(goal)} className="p-1.5 text-muted-foreground hover:text-destructive" title="Delete"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>

              {/* Measure + progress */}
              {goal.measure && (
                <p className="text-xs text-muted-foreground mt-3">
                  Measure: <span className="text-foreground">{goal.measure}</span>
                  {goal.target_value != null && (
                    <> — target <span className="text-foreground">{Number(goal.target_value).toLocaleString()}{goal.unit ? ` ${goal.unit}` : ''}</span></>
                  )}
                  {goal.target_date && <> by <span className="text-foreground">{goal.target_date}</span></>}
                </p>
              )}

              {goal.progress != null && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">
                      {Number(goal.current_value).toLocaleString()} / {Number(goal.target_value).toLocaleString()}{goal.unit ? ` ${goal.unit}` : ''}
                    </span>
                    <span className="font-medium text-foreground">{goal.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${goal.progress}%` }} />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                <span>{goal.owner ? `Owner: ${goal.owner}` : 'No owner'}</span>
                <span>{goal.tasks_count} task(s)</span>
              </div>

              <OutcomePanel goal={goal} outcomeTypes={outcomeTypes} />
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-card border border-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold text-foreground">{data.id ? 'Edit Goal' : 'New Goal'}</h3>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={submit} className="p-5 space-y-4">
              <div>
                <label className="form-label">Title <span className="text-primary">*</span></label>
                <input type="text" value={data.title} onChange={(e) => setData('title', e.target.value)} className={`form-input ${errors.title ? 'border-destructive' : ''}`} placeholder="e.g. Secure consulting revenue" />
                {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title}</p>}
              </div>
              <div>
                <label className="form-label">Description</label>
                <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} rows="2" className="form-input resize-y" placeholder="What this goal means and why it matters" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="form-label">Category</label>
                  <select value={data.category} onChange={(e) => setData('category', e.target.value)} className="form-input">
                    {categories.map((c) => <option key={c} value={c}>{cap(c)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Status</label>
                  <select value={data.status} onChange={(e) => setData('status', e.target.value)} className="form-input">
                    {statuses.map((s) => <option key={s} value={s}>{cap(s)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Owner</label>
                  <select value={data.owner_id} onChange={(e) => setData('owner_id', e.target.value)} className="form-input">
                    <option value="">Unassigned</option>
                    {owners.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Measure (what we count)</label>
                  <input type="text" value={data.measure} onChange={(e) => setData('measure', e.target.value)} className="form-input" placeholder="e.g. qualified inquiries" />
                </div>
                <div>
                  <label className="form-label">Unit</label>
                  <input type="text" value={data.unit} onChange={(e) => setData('unit', e.target.value)} className="form-input" placeholder="leads, $, users" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="form-label">Baseline</label>
                  <input type="number" step="any" value={data.baseline_value} onChange={(e) => setData('baseline_value', e.target.value)} className="form-input" />
                </div>
                <div>
                  <label className="form-label">Current</label>
                  <input type="number" step="any" value={data.current_value} onChange={(e) => setData('current_value', e.target.value)} className="form-input" />
                </div>
                <div>
                  <label className="form-label">Target</label>
                  <input type="number" step="any" value={data.target_value} onChange={(e) => setData('target_value', e.target.value)} className="form-input" />
                </div>
                <div>
                  <label className="form-label">Deadline</label>
                  <input type="date" value={data.target_date} onChange={(e) => setData('target_date', e.target.value)} className="form-input" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-border text-muted-foreground rounded-lg text-sm font-medium hover:text-foreground hover:bg-muted">Cancel</button>
                <button type="submit" disabled={processing} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
                  {processing ? 'Saving...' : (data.id ? 'Save Goal' : 'Create Goal')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
