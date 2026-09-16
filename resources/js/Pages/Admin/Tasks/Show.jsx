import React, { useState, useRef } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { ArrowLeft, Trash2, Edit3, Save, X, MessageSquare, Calendar, Clock, User, UserCheck, Timer, Paperclip, Download, Bell, ArrowRightCircle, CheckCircle2 } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import NotesSection from '@/Components/NotesSection';
import RichTextEditor from '@/Components/RichTextEditor';

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

export default function TaskShow({ task, team, sprints, internalNotes }) {
  const [editing, setEditing] = useState(false);

  const fileInputRef = useRef(null);
  const { data, setData, processing, errors } = useForm({
    title: task.title,
    description: task.description || '',
    assignee_id: task.assignee_id || '',
    reviewer_id: task.reviewer_id || '',
    sprint_id: task.sprint_id || '',
    priority: task.priority,
    due_date: task.due_date ? task.due_date.split('T')[0] : '',
    status: task.status,
    estimated_hours: task.estimated_hours || '',
    actual_hours: task.actual_hours || '',
    checklist: task.checklist || [],
    attachment_files: [],
    removed_attachments: [],
  });

  const commentForm = useForm({ body: '' });

  // Attachments already stored on the task, minus any marked for removal.
  const existingAttachments = (task.attachments || []).filter(
    (a) => !data.removed_attachments.includes(a.path)
  );

  const addFiles = (fileList) => {
    setData('attachment_files', [...data.attachment_files, ...Array.from(fileList)]);
  };

  const removeNewFile = (index) => {
    setData('attachment_files', data.attachment_files.filter((_, i) => i !== index));
  };

  const removeExistingAttachment = (path) => {
    setData('removed_attachments', [...data.removed_attachments, path]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    router.post(`/admin/tasks/${task.id}`, {
      _method: 'put',
      ...data,
    }, {
      forceFormData: true,
      onSuccess: () => setEditing(false),
    });
  };

  const handleDelete = () => {
    if (confirm('Delete this task?')) {
      router.delete(`/admin/tasks/${task.id}`);
    }
  };

  const [reminderSending, setReminderSending] = useState(false);
  const handleRemindReviewer = () => {
    setReminderSending(true);
    router.post(`/admin/tasks/${task.id}/remind-reviewer`, {}, {
      preserveScroll: true,
      onFinish: () => setReminderSending(false),
    });
  };

  // Workflow transitions
  const [transitioning, setTransitioning] = useState(false);
  const [reviewReviewerId, setReviewReviewerId] = useState(task.reviewer_id || '');
  // Which transition dialog is open: 'review' | 'done' | 'back' | null
  const [transitionDialog, setTransitionDialog] = useState(null);
  const [transitionComment, setTransitionComment] = useState('');

  const runTransition = (status, extra = {}) => {
    setTransitioning(true);
    router.post(`/admin/tasks/${task.id}/transition`, { status, ...extra }, {
      preserveScroll: true,
      onFinish: () => {
        setTransitioning(false);
        setTransitionDialog(null);
        setTransitionComment('');
      },
    });
  };

  // Sprint switcher
  const handleChangeSprint = (sprintId) => {
    router.patch(`/admin/tasks/${task.id}/sprint`, { sprint_id: sprintId || null }, {
      preserveScroll: true,
    });
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
                    <RichTextEditor content={data.description} onChange={(html) => setData('description', html)} />
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
                      <label className="form-label">Sprint</label>
                      <select value={data.sprint_id} onChange={(e) => setData('sprint_id', e.target.value)} className="form-input">
                        <option value="">Backlog</option>
                        {(sprints || []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Reviewer</label>
                      <select value={data.reviewer_id} onChange={(e) => setData('reviewer_id', e.target.value)} className="form-input">
                        <option value="">No reviewer</option>
                        {Object.entries(team)
                          .filter(([id]) => String(id) !== String(data.assignee_id))
                          .map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
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

                  {/* Attachments */}
                  <div>
                    <label className="form-label">Attachments</label>
                    {existingAttachments.length > 0 && (
                      <ul className="space-y-1 mb-2">
                        {existingAttachments.map((a, i) => (
                          <li key={i} className="flex items-center justify-between gap-2 text-sm bg-muted/50 rounded-md px-3 py-1.5">
                            <a href={a.path} target="_blank" rel="noreferrer" className="truncate flex items-center gap-2 text-foreground hover:text-primary">
                              <Paperclip className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                              {a.name}
                            </a>
                            <button type="button" onClick={() => removeExistingAttachment(a.path)} className="text-muted-foreground hover:text-destructive flex-shrink-0">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={(e) => addFiles(e.target.files)}
                      className="hidden"
                      id="task-edit-attachments"
                    />
                    <label
                      htmlFor="task-edit-attachments"
                      className="inline-flex items-center gap-2 px-3 py-2 border border-dashed border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 cursor-pointer transition-colors"
                    >
                      <Paperclip className="h-4 w-4" /> Add files
                    </label>
                    {data.attachment_files.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {data.attachment_files.map((file, i) => (
                          <li key={i} className="flex items-center justify-between gap-2 text-sm bg-primary/5 rounded-md px-3 py-1.5">
                            <span className="truncate flex items-center gap-2">
                              <Paperclip className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                              {file.name}
                            </span>
                            <button type="button" onClick={() => removeNewFile(i)} className="text-muted-foreground hover:text-destructive flex-shrink-0">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
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

                  {/* Workflow actions */}
                  <div className="bg-muted/40 border border-border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <ArrowRightCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-semibold text-foreground">Workflow</span>
                    </div>

                    {task.status === 'todo' && (
                      <button
                        type="button"
                        disabled={transitioning}
                        onClick={() => runTransition('in_progress')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                      >
                        <ArrowRightCircle className="h-4 w-4" /> Start work (In Progress)
                      </button>
                    )}

                    {task.status === 'in_progress' && (
                      transitionDialog === 'review' ? (
                        <div className="space-y-3">
                          <div>
                            <label className="form-label">Reviewer <span className="text-primary">*</span></label>
                            <select
                              value={reviewReviewerId}
                              onChange={(e) => setReviewReviewerId(e.target.value)}
                              className="form-input"
                            >
                              <option value="">Select a reviewer</option>
                              {Object.entries(team)
                                .filter(([id]) => String(id) !== String(task.assignee_id))
                                .map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="form-label">Comment (optional)</label>
                            <textarea value={transitionComment} onChange={(e) => setTransitionComment(e.target.value)} rows="2" className="form-input resize-y" placeholder="Notes for the reviewer..." />
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={transitioning || !reviewReviewerId}
                              onClick={() => runTransition('review', { reviewer_id: reviewReviewerId, comment: transitionComment })}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                            >
                              <UserCheck className="h-4 w-4" /> Send for review
                            </button>
                            <button type="button" onClick={() => setTransitionDialog(null)} className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => { setReviewReviewerId(task.reviewer_id || ''); setTransitionDialog('review'); }}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
                        >
                          <ArrowRightCircle className="h-4 w-4" /> Send for review
                        </button>
                      )
                    )}

                    {task.status === 'review' && (
                      transitionDialog ? (
                        <div className="space-y-3">
                          <label className="form-label">
                            {transitionDialog === 'done' ? 'Approval comment' : 'Reason for sending back'}
                            {transitionDialog === 'back' && <span className="text-primary"> *</span>}
                          </label>
                          <textarea value={transitionComment} onChange={(e) => setTransitionComment(e.target.value)} rows="2" className="form-input resize-y" placeholder={transitionDialog === 'done' ? 'Looks good...' : 'What needs to change...'} />
                          <div className="flex items-center gap-2">
                            {transitionDialog === 'done' ? (
                              <button
                                type="button"
                                disabled={transitioning}
                                onClick={() => runTransition('done', { comment: transitionComment })}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-600/90 disabled:opacity-50"
                              >
                                <CheckCircle2 className="h-4 w-4" /> Confirm done
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={transitioning || !transitionComment.trim()}
                                onClick={() => runTransition('in_progress', { comment: transitionComment })}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-500/90 disabled:opacity-50"
                              >
                                <ArrowLeft className="h-4 w-4" /> Confirm send back
                              </button>
                            )}
                            <button type="button" onClick={() => { setTransitionDialog(null); setTransitionComment(''); }} className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setTransitionDialog('back')}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-border text-foreground rounded-lg text-sm font-medium hover:bg-muted"
                          >
                            <ArrowLeft className="h-4 w-4" /> Back to In Progress
                          </button>
                          <button
                            type="button"
                            onClick={() => setTransitionDialog('done')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-600/90"
                          >
                            <CheckCircle2 className="h-4 w-4" /> Mark as Done
                          </button>
                        </div>
                      )
                    )}

                    {task.status === 'done' && (
                      <div className="flex items-center gap-2 text-sm text-green-500">
                        <CheckCircle2 className="h-4 w-4" /> This task is done.
                        <button
                          type="button"
                          disabled={transitioning}
                          onClick={() => runTransition('in_progress')}
                          className="ml-2 inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-foreground border border-border rounded-md hover:bg-muted disabled:opacity-50"
                        >
                          <ArrowLeft className="h-3.5 w-3.5" /> Reopen
                        </button>
                      </div>
                    )}
                  </div>

                  {task.description && (
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wider">Description</label>
                      <div
                        className="mt-2 bg-muted/50 p-4 rounded-lg prose prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground prose-li:text-muted-foreground"
                        dangerouslySetInnerHTML={{ __html: task.description }}
                      />
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

                  {task.attachments && task.attachments.length > 0 && (
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wider">Attachments</label>
                      <ul className="mt-2 space-y-1">
                        {task.attachments.map((a, i) => (
                          <li key={i}>
                            <a
                              href={a.path}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-between gap-2 text-sm bg-muted/50 rounded-md px-3 py-2 text-foreground hover:text-primary hover:bg-muted transition-colors"
                            >
                              <span className="truncate flex items-center gap-2">
                                <Paperclip className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                {a.name}
                              </span>
                              <Download className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            </a>
                          </li>
                        ))}
                      </ul>
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
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Reviewer</label>
                  <p className="text-sm text-foreground mt-1 flex items-center gap-1">
                    <UserCheck className="h-3 w-3 text-muted-foreground" />
                    {task.reviewer?.name || 'No reviewer'}
                  </p>
                  {task.reviewer && (
                    <button
                      type="button"
                      onClick={handleRemindReviewer}
                      disabled={reminderSending}
                      className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 border border-border rounded-md transition-colors disabled:opacity-50"
                    >
                      <Bell className="h-3.5 w-3.5" />
                      {reminderSending ? 'Sending...' : 'Send reminder'}
                    </button>
                  )}
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
                  <label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Timer className="h-3 w-3" /> Sprint
                  </label>
                  <select
                    value={task.sprint_id || ''}
                    onChange={(e) => handleChangeSprint(e.target.value)}
                    className="form-input text-sm mt-1"
                  >
                    <option value="">Backlog</option>
                    {(sprints || []).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}{s.status === 'active' ? ' ●' : ''}
                      </option>
                    ))}
                  </select>
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
