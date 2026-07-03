import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { ArrowLeft, Trash2, Edit3, Save, X, MessageSquare, Calendar, Clock, User } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import NotesSection from '@/Components/NotesSection';

const STATUS_LABELS = {
  todo: 'To Do',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done',
};

const STATUS_COLORS = {
  todo: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  in_progress: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  review: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  done: 'bg-green-500/10 text-green-400 border-green-500/20',
};

const PRIORITY_COLORS = {
  low: 'text-muted-foreground',
  medium: 'text-blue-400',
  high: 'text-orange-400',
  urgent: 'text-red-400',
};

export default function TaskShow({ task, team, internalNotes }) {
  const [editing, setEditing] = useState(false);

  const { data, setData, put, processing, errors } = useForm({
    title: task.title,
    description: task.description || '',
    assignee_id: task.assignee_id || '',
    priority: task.priority,
    due_date: task.due_date ? task.due_date.split('T')[0] : '',
    status: task.status,
    estimated_hours: task.estimated_hours || '',
    actual_hours: task.actual_hours || '',
    checklist: task.checklist || [],
  });

  const commentForm = useForm({ body: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    put(`/admin/tasks/${task.id}`, {
      onSuccess: () => setEditing(false),
    });
  };

  const handleDelete = () => {
    if (confirm('Delete this task?')) {
      router.delete(`/admin/tasks/${task.id}`);
    }
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    commentForm.post(`/admin/tasks/${task.id}/comments`, {
      onSuccess: () => commentForm.reset('body'),
      preserveScroll: true,
    });
  };

  // Checklist management
  const addChecklistItem = () => {
    setData('checklist', [...data.checklist, { text: '', done: false }]);
  };

  const updateChecklistItem = (index, field, value) => {
    const updated = [...data.checklist];
    updated[index] = { ...updated[index], [field]: value };
    setData('checklist', updated);
  };

  const removeChecklistItem = (index) => {
    setData('checklist', data.checklist.filter((_, i) => i !== index));
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';

  return (
    <AdminLayout title="Task Details">
      <Head title={`Task - ${task.title}`} />

      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Link href="/admin/tasks" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Tasks
          </Link>
          <div className="flex items-center gap-2">
            {!editing && (
              <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors">
                <Edit3 className="h-4 w-4" /> Edit
              </button>
            )}
            <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-xl p-6">
              {editing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="form-label">Title <span className="text-primary">*</span></label>
                    <input type="text" value={data.title} onChange={(e) => setData('title', e.target.value)} className={`form-input ${errors.title ? 'border-destructive' : ''}`} />
                  </div>
                  <div>
                    <label className="form-label">Description</label>
                    <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} rows="4" className="form-input resize-y" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Status</label>
                      <select value={data.status} onChange={(e) => setData('status', e.target.value)} className="form-input">
                        {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Priority</label>
                      <select value={data.priority} onChange={(e) => setData('priority', e.target.value)} className="form-input">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Assignee</label>
                      <select value={data.assignee_id} onChange={(e) => setData('assignee_id', e.target.value)} className="form-input">
                        <option value="">Unassigned</option>
                        {Object.entries(team).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Due Date</label>
                      <input type="date" value={data.due_date} onChange={(e) => setData('due_date', e.target.value)} className="form-input" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Estimated Hours</label>
                      <input type="number" step="0.5" value={data.estimated_hours} onChange={(e) => setData('estimated_hours', e.target.value)} className="form-input" />
                    </div>
                    <div>
                      <label className="form-label">Actual Hours</label>
                      <input type="number" step="0.5" value={data.actual_hours} onChange={(e) => setData('actual_hours', e.target.value)} className="form-input" />
                    </div>
                  </div>

                  {/* Checklist */}
                  <div>
                    <label className="form-label">Checklist</label>
                    <div className="space-y-2">
                      {data.checklist.map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input type="checkbox" checked={item.done} onChange={(e) => updateChecklistItem(i, 'done', e.target.checked)} className="rounded border-border" />
                          <input type="text" value={item.text} onChange={(e) => updateChecklistItem(i, 'text', e.target.value)} className="form-input flex-1 text-sm" placeholder="Checklist item" />
                          <button type="button" onClick={() => removeChecklistItem(i)} className="text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={addChecklistItem} className="mt-2 text-sm text-primary hover:text-primary/80">+ Add item</button>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                    <button type="button" onClick={() => setEditing(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" /> Cancel
                    </button>
                    <button type="submit" disabled={processing} className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
                      <Save className="h-4 w-4" /> {processing ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <h2 className="text-xl font-semibold text-foreground">{task.title}</h2>
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[task.status]}`}>
                      {STATUS_LABELS[task.status]}
                    </span>
                  </div>

                  {task.project && (
                    <p className="text-sm text-muted-foreground">
                      Project: <Link href={`/admin/projects/${task.project.id}`} className="text-primary hover:text-primary/80">{task.project.name}</Link>
                      {task.project.client && <> • Client: <Link href={`/admin/clients/${task.project.client.id}`} className="text-primary hover:text-primary/80">{task.project.client.company}</Link></>}
                    </p>
                  )}

                  {task.description && (
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wider">Description</label>
                      <p className="text-foreground mt-2 whitespace-pre-wrap bg-muted/50 p-4 rounded-lg">{task.description}</p>
                    </div>
                  )}

                  {task.checklist && task.checklist.length > 0 && (
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wider">Checklist</label>
                      <div className="mt-2 space-y-2">
                        {task.checklist.map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className={`text-sm ${item.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                              {item.done ? '☑' : '☐'} {item.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Comments */}
            {!editing && (
              <div className="bg-card border border-border rounded-xl p-6 mt-6">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" /> Comments
                </h3>
                <form onSubmit={handleAddComment} className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={commentForm.data.body}
                    onChange={(e) => commentForm.setData('body', e.target.value)}
                    className="form-input flex-1"
                    placeholder="Add a comment..."
                  />
                  <button type="submit" disabled={commentForm.processing || !commentForm.data.body.trim()} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
                    Post
                  </button>
                </form>
                {task.comments && task.comments.length > 0 ? (
                  <div className="space-y-3">
                    {task.comments.map((comment) => (
                      <div key={comment.id} className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-foreground">{comment.body}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {comment.user?.name || 'System'} • {new Date(comment.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No comments yet.</p>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          {!editing && (
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-card border border-border rounded-xl p-4 space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Priority</label>
                  <p className={`text-sm font-medium capitalize mt-1 ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Assignee</label>
                  <p className="text-sm text-foreground mt-1 flex items-center gap-1">
                    <User className="h-3 w-3 text-muted-foreground" />
                    {task.assignee?.name || 'Unassigned'}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Due Date</label>
                  <p className={`text-sm mt-1 flex items-center gap-1 ${isOverdue ? 'text-red-400 font-medium' : 'text-foreground'}`}>
                    <Calendar className="h-3 w-3" />
                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : '—'}
                    {isOverdue && ' (Overdue)'}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Hours</label>
                  <p className="text-sm text-foreground mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    {task.actual_hours || 0}h / {task.estimated_hours || 0}h est.
                  </p>
                </div>
              </div>
              <NotesSection notableType="task" notableId={task.id} notes={internalNotes || []} />
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
