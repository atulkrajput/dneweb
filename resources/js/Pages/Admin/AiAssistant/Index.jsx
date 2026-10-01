import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Sparkles, Loader2, Link as LinkIcon, ClipboardList, BarChart3, Check, AlertTriangle } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

const IMPACT_COLORS = {
  high: 'bg-green-500/10 text-green-400',
  medium: 'bg-blue-500/10 text-blue-400',
  low: 'bg-amber-500/10 text-amber-500',
  none: 'bg-gray-500/10 text-gray-400',
};

const toast = async (options) => {
  const { default: Swal } = await import('sweetalert2');
  return Swal.fire({ toast: true, position: 'top-end', showConfirmButton: false, timerProgressBar: true, background: 'var(--color-card)', color: 'var(--color-foreground)', ...options });
};

export default function AiAssistant({ defaultProject, projects, goals, groqConfigured }) {
  const monthNow = new Date().toISOString().slice(0, 7);

  // --- Daily task drafting ---
  const [desc, setDesc] = useState('');
  const [drafting, setDrafting] = useState(false);
  const [drafts, setDrafts] = useState([]);
  const [projectId, setProjectId] = useState(defaultProject?.id || (projects[0]?.id ?? ''));
  const [creating, setCreating] = useState(false);

  const goalTitle = (id) => goals.find((g) => String(g.id) === String(id))?.title || null;

  const draft = async () => {
    if (!desc.trim()) return;
    setDrafting(true);
    setDrafts([]);
    try {
      const { data } = await window.axios.post('/admin/ai/draft-tasks', { text: desc });
      setDrafts((data.tasks || []).map((t) => ({ ...t, _accept: true })));
      if (!data.tasks?.length) await toast({ icon: 'info', title: 'No tasks found', text: 'Try describing your work in more detail.', timer: 3000 });
    } catch (e) {
      await toast({ icon: 'error', title: 'AI error', text: e?.response?.data?.message || 'Could not draft tasks.', timer: 4000 });
    } finally {
      setDrafting(false);
    }
  };

  const updateDraft = (i, field, value) => {
    setDrafts((d) => d.map((t, idx) => (idx === i ? { ...t, [field]: value } : t)));
  };

  const createAccepted = () => {
    const accepted = drafts.filter((d) => d._accept);
    if (!accepted.length || !projectId) {
      toast({ icon: 'info', title: 'Nothing to create', text: 'Select a project and at least one task.', timer: 3000 });
      return;
    }
    setCreating(true);
    // Create tasks sequentially via the existing task store endpoint.
    let remaining = accepted.length;
    accepted.forEach((t) => {
      router.post('/admin/tasks', {
        project_id: projectId,
        title: t.title,
        goal_id: t.goal_id || '',
        impact_level: t.impact_level || 'low',
        expected_impact: t.expected_impact || '',
        estimated_hours: t.estimated_hours || '',
        priority: 'medium',
        status: 'todo',
      }, {
        preserveScroll: true,
        preserveState: true,
        onFinish: () => {
          remaining -= 1;
          if (remaining <= 0) {
            setCreating(false);
            setDrafts([]);
            setDesc('');
            toast({ icon: 'success', title: 'Tasks created', text: `${accepted.length} task(s) added to the project.`, timer: 3000 });
          }
        },
      });
    });
  };

  // --- Close task by link ---
  const [link, setLink] = useState('');
  const [closeNote, setCloseNote] = useState('');
  const [closing, setClosing] = useState(false);
  const [closeResult, setCloseResult] = useState(null);

  const closeByLink = async () => {
    if (!link.trim()) return;
    setClosing(true);
    setCloseResult(null);
    try {
      const { data } = await window.axios.post('/admin/ai/close-by-link', { link, note: closeNote });
      setCloseResult(data);
      if (data.matched) {
        await toast({ icon: 'success', title: 'Task closed', text: data.message, timer: 3500 });
        setLink('');
        setCloseNote('');
      }
    } catch (e) {
      await toast({ icon: 'error', title: 'AI error', text: e?.response?.data?.message || 'Could not match a task.', timer: 4000 });
    } finally {
      setClosing(false);
    }
  };

  // --- Performance analysis ---
  const [month, setMonth] = useState(monthNow);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const analyze = async () => {
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const { data } = await window.axios.post('/admin/ai/performance-analysis', { month });
      setAnalysis(data.analysis);
    } catch (e) {
      await toast({ icon: 'error', title: 'AI error', text: e?.response?.data?.message || 'Could not analyze.', timer: 4000 });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <AdminLayout title="AI Assistant">
      <Head title="AI Assistant" />

      {!groqConfigured && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-xl p-4 mb-6 text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" /> Groq API key is not configured. Add it under Settings → Integrations to use these features.
        </div>
      )}

      <div className="space-y-6">
        {/* Daily task drafting */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-1"><ClipboardList className="h-4 w-4 text-primary" /> Describe your work → AI drafts goal-first tasks</h2>
          <p className="text-xs text-muted-foreground mb-4">Tell the AI what you did or plan to do. It drafts tasks, links each to a company goal, and flags anything with low or no business impact.</p>
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={4} className="form-input w-full resize-y" placeholder="e.g. Posted 8 social updates, fixed the Ahrefs SEO issues, started the WhatsApp bulk-messaging tool, and had a QuickBooks integration call." />
          <div className="flex items-center justify-between mt-3 gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground">Add to project</label>
              <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="form-input text-sm">
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <button onClick={draft} disabled={drafting || !desc.trim()} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
              {drafting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Draft tasks
            </button>
          </div>

          {drafts.length > 0 && (
            <div className="mt-4 space-y-2">
              {drafts.map((t, i) => (
                <div key={i} className={`border rounded-lg p-3 ${t._accept ? 'border-border' : 'border-border/40 opacity-50'}`}>
                  <div className="flex items-start gap-3">
                    <input type="checkbox" checked={t._accept} onChange={(e) => updateDraft(i, '_accept', e.target.checked)} className="mt-1 rounded border-border" />
                    <div className="flex-1 min-w-0">
                      <input type="text" value={t.title} onChange={(e) => updateDraft(i, 'title', e.target.value)} className="form-input text-sm w-full mb-2" />
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <select value={t.goal_id || ''} onChange={(e) => updateDraft(i, 'goal_id', e.target.value || null)} className="form-input text-xs py-1">
                          <option value="">No goal (unaligned)</option>
                          {goals.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}
                        </select>
                        <select value={t.impact_level} onChange={(e) => updateDraft(i, 'impact_level', e.target.value)} className="form-input text-xs py-1">
                          <option value="high">High impact</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                          <option value="none">None</option>
                        </select>
                        <span className={`px-1.5 py-0.5 rounded ${IMPACT_COLORS[t.impact_level] || ''}`}>{t.impact_level}</span>
                        {t.estimated_hours != null && <span className="text-muted-foreground">~{t.estimated_hours}h</span>}
                        {!t.aligned && <span className="text-amber-500">unaligned</span>}
                      </div>
                      {t.expected_impact && <p className="text-xs text-muted-foreground mt-1">Expected: {t.expected_impact}</p>}
                      {t.note && <p className="text-xs text-amber-500/80 mt-1">{t.note}</p>}
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex justify-end">
                <button onClick={createAccepted} disabled={creating} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Create selected tasks
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Close by link */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-1"><LinkIcon className="h-4 w-4 text-primary" /> Close a task with a proof link</h2>
          <p className="text-xs text-muted-foreground mb-4">Paste a post or deliverable URL. The AI finds the matching open task, closes it, and attaches the link as proof.</p>
          <div className="flex gap-2 flex-wrap">
            <input type="url" value={link} onChange={(e) => setLink(e.target.value)} className="form-input flex-1 min-w-[240px]" placeholder="https://..." />
            <input type="text" value={closeNote} onChange={(e) => setCloseNote(e.target.value)} className="form-input flex-1 min-w-[200px]" placeholder="Optional: measurable impact" />
            <button onClick={closeByLink} disabled={closing || !link.trim()} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
              {closing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Match & close
            </button>
          </div>
          {closeResult && !closeResult.matched && (
            <div className="mt-3 text-sm text-amber-500">{closeResult.message}</div>
          )}
          {closeResult?.matched && (
            <div className="mt-3 text-sm text-green-400">
              Closed “{closeResult.task.title}” ({Math.round(closeResult.confidence * 100)}% match).
              {closeResult.needs_impact && <span className="text-amber-500"> Add the measurable impact on the task when you can.</span>}
            </div>
          )}
        </div>

        {/* Performance analysis */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> AI performance analysis</h2>
            <div className="flex items-center gap-2">
              <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="form-input text-sm" />
              <button onClick={analyze} disabled={analyzing} className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
                {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Analyze
              </button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-4">An Amazon-style review judged against goals and outcomes — not activity volume.</p>

          {analysis && (
            <div className="space-y-4 text-sm">
              <div className="flex items-start justify-between gap-4">
                <p className="text-foreground font-medium">{analysis.headline}</p>
                {analysis.score_out_of_10 != null && (
                  <span className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-bold">{analysis.score_out_of_10}/10</span>
                )}
              </div>

              {Array.isArray(analysis.goal_progress) && analysis.goal_progress.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Goal progress</h3>
                  <div className="space-y-1">
                    {analysis.goal_progress.map((g, i) => (
                      <div key={i} className="flex items-center justify-between bg-muted/40 rounded px-3 py-1.5">
                        <span className="text-foreground">{g.goal}</span>
                        <span className="text-xs text-muted-foreground">{g.actual || '—'} / {g.target || '—'} · {g.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {[['Wins', analysis.wins, 'text-green-400'], ['Concerns', analysis.concerns, 'text-amber-500'], ['Effort without impact', analysis.effort_without_impact, 'text-red-400']].map(([label, items, color]) => (
                Array.isArray(items) && items.length > 0 && (
                  <div key={label}>
                    <h3 className={`text-xs font-semibold uppercase tracking-wider mb-1 ${color}`}>{label}</h3>
                    <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                      {items.map((it, i) => <li key={i}>{it}</li>)}
                    </ul>
                  </div>
                )
              ))}

              {Array.isArray(analysis.recommendations) && analysis.recommendations.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Recommendations</h3>
                  <div className="space-y-1">
                    {analysis.recommendations.map((r, i) => (
                      <div key={i} className="bg-muted/40 rounded px-3 py-2">
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded mr-2 ${r.decision === 'stop' ? 'bg-red-500/10 text-red-400' : r.decision === 'change' ? 'bg-amber-500/10 text-amber-500' : 'bg-green-500/10 text-green-400'}`}>{r.decision}</span>
                        <span className="text-foreground">{r.area}</span>
                        <span className="text-muted-foreground"> — {r.why}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {Array.isArray(analysis.questions_for_leadership) && analysis.questions_for_leadership.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Questions for leadership</h3>
                  <ul className="list-disc list-inside space-y-0.5 text-muted-foreground italic">
                    {analysis.questions_for_leadership.map((q, i) => <li key={i}>{q}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
