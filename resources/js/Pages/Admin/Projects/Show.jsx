import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { ArrowLeft, Trash2, Edit3, Save, X, Building2, Calendar, DollarSign, Plus, Play, CheckCircle, Timer } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import NotesSection from '@/Components/NotesSection';

const STATUS_LABELS = {
  planning: 'Planning',
  in_progress: 'In Progress',
  review: 'Review',
  testing: 'Testing',
  completed: 'Completed',
  on_hold: 'On Hold',
  cancelled: 'Cancelled',
};

const STATUS_COLORS = {
  planning: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  in_progress: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  review: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  testing: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  completed: 'bg-green-500/10 text-green-400 border-green-500/20',
  on_hold: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const PRIORITY_COLORS = {
  low: 'text-muted-foreground',
  medium: 'text-blue-400',
  high: 'text-orange-400',
  urgent: 'text-red-400',
};

const SPRINT_STATUS_CONFIG = {
  planning: { label: 'Planning', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  active: { label: 'Active', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  completed: { label: 'Completed', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
};

const DURATION_LABELS = { week: '1 Week', two_weeks: '2 Weeks', month: '1 Month' };

export default function ProjectShow({ project, clients, team, sprints, sprintDurations, sprintDurationLabels, internalNotes }) {
  const [editing, setEditing] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [showSprintCreate, setShowSprintCreate] = useState(false);
  const [editingSprint, setEditingSprint] = useState(null);

  const { data, setData, put, processing, errors } = useForm({
    client_id: String(project.client_id),
    name: project.name,
    description: project.description || '',
    services: project.services || [],
    budget: project.budget || '',
    priority: project.priority,
    status: project.status,
    assigned_team: project.assigned_team || [],
    start_date: project.start_date ? project.start_date.split('T')[0] : '',
    deadline: project.deadline ? project.deadline.split('T')[0] : '',
    progress: project.progress,
    tags: project.tags || [],
    notes: project.notes || '',
  });

  const sprintForm = useForm({
    name: '',
    duration: 'two_weeks',
    start_date: new Date().toISOString().split('T')[0],
    goal: '',
  });

  const sprintEditForm = useForm({ name: '', duration: '', start_date: '', goal: '', status: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    put(`/admin/projects/${project.id}`, { onSuccess: () => setEditing(false) });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this project?')) {
      router.delete(`/admin/projects/${project.id}`);
    }
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !data.tags.includes(tag)) { setData('tags', [...data.tags, tag]); setTagInput(''); }
  };
  const removeTag = (tag) => setData('tags', data.tags.filter(t => t !== tag));

  const handleTeamToggle = (id) => {
    const idStr = String(id);
    if (data.assigned_team.includes(idStr)) {
      setData('assigned_team', data.assigned_team.filter(t => t !== idStr));
    } else {
      setData('assigned_team', [...data.assigned_team, idStr]);
    }
  };

  // Sprint handlers
  const handleCreateSprint = (e) => {
    e.preventDefault();
    sprintForm.post(`/admin/projects/${project.id}/sprints`, {
      onSuccess: () => { sprintForm.reset('name', 'goal'); setShowSprintCreate(false); },
    });
  };

  const startEditSprint = (sprint) => {
    setEditingSprint(sprint.id);
    sprintEditForm.setData({
      name: sprint.name, duration: sprint.duration,
      start_date: sprint.start_date?.split('T')[0] || '', goal: sprint.goal || '', status: sprint.status,
    });
  };

  const handleUpdateSprint = (e) => {
    e.preventDefault();
    sprintEditForm.put(`/admin/sprints/${editingSprint}`, { onSuccess: () => setEditingSprint(null) });
  };

  const handleStartSprint = (sprint) => {
    if (confirm('Start this sprint? Any active sprint will be completed.')) {
      router.post(`/admin/sprints/${sprint.id}/start`);
    }
  };

  const handleCompleteSprint = (sprint) => {
    if (confirm('Complete this sprint?')) { router.post(`/admin/sprints/${sprint.id}/complete`); }
  };

  const handleDeleteSprint = (sprint) => {
    if (confirm(`Delete "${sprint.name}"? Tasks will move to backlog.`)) {
      router.delete(`/admin/sprints/${sprint.id}`);
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : '';
  const isOverdue = project.deadline && new Date(project.deadline) < new Date() && !['completed', 'cancelled'].includes(project.status);

  return (
    <AdminLayout title="Project Details">
      <Head title={`Project - ${project.name}`} />

      <div className="max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <Link href="/admin/projects" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Projects
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

        {editing ? (
          <div className="bg-card border border-border rounded-xl p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Project Name <span className="text-primary">*</span></label>
                  <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className={`form-input ${errors.name ? 'border-destructive' : ''}`} />
                  {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
                </div>
                <div>
                  <label className="form-label">Client <span className="text-primary">*</span></label>
                  <select value={data.client_id} onChange={(e) => setData('client_id', e.target.value)} className="form-input">
                    {Object.entries(clients).map(([id, company]) => <option key={id} value={id}>{company}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="form-label">Description</label>
                <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} rows="3" className="form-input resize-y" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="form-label">Budget</label>
                  <input type="number" step="0.01" value={data.budget} onChange={(e) => setData('budget', e.target.value)} className="form-input" />
                </div>
                <div>
                  <label className="form-label">Priority</label>
                  <select value={data.priority} onChange={(e) => setData('priority', e.target.value)} className="form-input">
                    <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Status</label>
                  <select value={data.status} onChange={(e) => setData('status', e.target.value)} className="form-input">
                    {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="form-label">Start Date</label>
                  <input type="date" value={data.start_date} onChange={(e) => setData('start_date', e.target.value)} className="form-input" />
                </div>
                <div>
                  <label className="form-label">Deadline</label>
                  <input type="date" value={data.deadline} onChange={(e) => setData('deadline', e.target.value)} className="form-input" />
                </div>
                <div>
                  <label className="form-label">Progress ({data.progress}%)</label>
                  <input type="range" min="0" max="100" step="5" value={data.progress} onChange={(e) => setData('progress', parseInt(e.target.value))} className="w-full mt-2" />
                </div>
              </div>
              {Object.keys(team).length > 0 && (
                <div>
                  <label className="form-label">Assigned Team</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {Object.entries(team).map(([id, name]) => (
                      <button key={id} type="button" onClick={() => handleTeamToggle(id)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${data.assigned_team.includes(String(id)) ? 'bg-primary/10 text-primary border-primary/30' : 'text-muted-foreground border-border hover:border-primary/30'}`}>
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="form-label">Tags</label>
                <div className="flex items-center gap-2">
                  <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} className="form-input flex-1" placeholder="Add tag..." />
                  <button type="button" onClick={addTag} className="px-3 py-2 text-sm bg-muted text-foreground rounded-lg">Add</button>
                </div>
                {data.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {data.tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {tag} <button type="button" onClick={() => removeTag(tag)} className="text-primary/60 hover:text-primary">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="form-label">Notes</label>
                <textarea value={data.notes} onChange={(e) => setData('notes', e.target.value)} rows="3" className="form-input resize-y" />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button type="button" onClick={() => setEditing(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /> Cancel</button>
                <button type="submit" disabled={processing} className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
                  <Save className="h-4 w-4" /> {processing ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{project.name}</h2>
                  {project.client && (
                    <Link href={`/admin/clients/${project.client.id}`} className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mt-1">
                      <Building2 className="h-3 w-3" /> {project.client.company}
                    </Link>
                  )}
                </div>
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[project.status]}`}>
                  {STATUS_LABELS[project.status]}
                </span>
              </div>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Progress</span>
                  <span className="text-sm font-medium text-foreground">{project.progress}%</span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${project.progress}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Budget</p>
                    <p className="text-sm font-medium text-foreground">{project.budget ? `$${Number(project.budget).toLocaleString()}` : '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Start Date</p>
                    <p className="text-sm font-medium text-foreground">{project.start_date ? new Date(project.start_date).toLocaleDateString() : '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className={`h-5 w-5 ${isOverdue ? 'text-red-400' : 'text-muted-foreground'}`} />
                  <div>
                    <p className="text-xs text-muted-foreground">Deadline</p>
                    <p className={`text-sm font-medium ${isOverdue ? 'text-red-400' : 'text-foreground'}`}>
                      {project.deadline ? new Date(project.deadline).toLocaleDateString() : '—'}
                      {isOverdue && ' (Overdue)'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sprints Section */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Timer className="h-4 w-4 text-muted-foreground" /> Sprints
                </h3>
                <button onClick={() => setShowSprintCreate(!showSprintCreate)} className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors">
                  <Plus className="h-3 w-3" /> New Sprint
                </button>
              </div>

              {/* Create Sprint Form */}
              {showSprintCreate && (
                <form onSubmit={handleCreateSprint} className="border border-border rounded-lg p-4 mb-4 bg-muted/30 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground">Name *</label>
                      <input type="text" value={sprintForm.data.name} onChange={(e) => sprintForm.setData('name', e.target.value)} className="form-input text-sm mt-1" placeholder="Sprint 1" />
                      {sprintForm.errors.name && <p className="text-xs text-destructive mt-1">{sprintForm.errors.name}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground">Duration *</label>
                        <select value={sprintForm.data.duration} onChange={(e) => sprintForm.setData('duration', e.target.value)} className="form-input text-sm mt-1">
                          {(sprintDurations || []).map((d) => <option key={d} value={d}>{DURATION_LABELS[d]}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Start *</label>
                        <input type="date" value={sprintForm.data.start_date} onChange={(e) => sprintForm.setData('start_date', e.target.value)} className="form-input text-sm mt-1" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Goal</label>
                    <input type="text" value={sprintForm.data.goal} onChange={(e) => sprintForm.setData('goal', e.target.value)} className="form-input text-sm mt-1" placeholder="What to achieve..." />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setShowSprintCreate(false)} className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">Cancel</button>
                    <button type="submit" disabled={sprintForm.processing} className="px-3 py-1.5 bg-primary text-primary-foreground rounded text-xs font-medium hover:bg-primary/90 disabled:opacity-50">Create</button>
                  </div>
                </form>
              )}

              {/* Sprint List */}
              {sprints && sprints.length > 0 ? (
                <div className="space-y-3">
                  {sprints.map((sprint) => {
                    const sc = SPRINT_STATUS_CONFIG[sprint.status];
                    const progress = sprint.tasks_count > 0 ? Math.round((sprint.completed_tasks_count / sprint.tasks_count) * 100) : 0;
                    const sprintOverdue = new Date(sprint.end_date) < new Date() && sprint.status !== 'completed';

                    if (editingSprint === sprint.id) {
                      return (
                        <form key={sprint.id} onSubmit={handleUpdateSprint} className="border border-border rounded-lg p-4 bg-muted/30 space-y-3">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <input type="text" value={sprintEditForm.data.name} onChange={(e) => sprintEditForm.setData('name', e.target.value)} className="form-input text-sm" placeholder="Name" />
                            <select value={sprintEditForm.data.duration} onChange={(e) => sprintEditForm.setData('duration', e.target.value)} className="form-input text-sm">
                              {(sprintDurations || []).map((d) => <option key={d} value={d}>{DURATION_LABELS[d]}</option>)}
                            </select>
                            <input type="date" value={sprintEditForm.data.start_date} onChange={(e) => sprintEditForm.setData('start_date', e.target.value)} className="form-input text-sm" />
                            <select value={sprintEditForm.data.status} onChange={(e) => sprintEditForm.setData('status', e.target.value)} className="form-input text-sm">
                              <option value="planning">Planning</option><option value="active">Active</option><option value="completed">Completed</option>
                            </select>
                          </div>
                          <input type="text" value={sprintEditForm.data.goal} onChange={(e) => sprintEditForm.setData('goal', e.target.value)} className="form-input text-sm" placeholder="Goal..." />
                          <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setEditingSprint(null)} className="px-3 py-1.5 text-xs text-muted-foreground">Cancel</button>
                            <button type="submit" disabled={sprintEditForm.processing} className="px-3 py-1.5 bg-primary text-primary-foreground rounded text-xs font-medium">Save</button>
                          </div>
                        </form>
                      );
                    }

                    return (
                      <div key={sprint.id} className="border border-border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-foreground">{sprint.name}</span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${sc.color}`}>{sc.label}</span>
                            <span className="text-xs text-muted-foreground">{DURATION_LABELS[sprint.duration]}</span>
                            {sprintOverdue && <span className="text-xs text-red-400 font-medium">Overdue</span>}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span>{formatDate(sprint.start_date)} — {formatDate(sprint.end_date)}</span>
                            {sprint.goal && <span className="truncate max-w-[200px]">{sprint.goal}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-center min-w-[60px]">
                            <div className="text-sm font-bold text-foreground">{progress}%</div>
                            <div className="text-xs text-muted-foreground">{sprint.completed_tasks_count}/{sprint.tasks_count}</div>
                            <div className="w-full h-1 bg-muted rounded-full mt-1">
                              <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {sprint.status === 'planning' && (
                              <button onClick={() => handleStartSprint(sprint)} className="p-1.5 text-green-400 hover:bg-green-500/10 rounded transition-colors" title="Start"><Play className="h-3.5 w-3.5" /></button>
                            )}
                            {sprint.status === 'active' && (
                              <button onClick={() => handleCompleteSprint(sprint)} className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded transition-colors" title="Complete"><CheckCircle className="h-3.5 w-3.5" /></button>
                            )}
                            <button onClick={() => startEditSprint(sprint)} className="p-1.5 text-muted-foreground hover:text-foreground rounded transition-colors" title="Edit"><Edit3 className="h-3.5 w-3.5" /></button>
                            <button onClick={() => handleDeleteSprint(sprint)} className="p-1.5 text-muted-foreground hover:text-destructive rounded transition-colors" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No sprints yet. Create one to organize tasks.</p>
              )}
            </div>

            {/* Details */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider">Priority</label>
                    <p className={`mt-1 text-sm font-medium capitalize ${PRIORITY_COLORS[project.priority]}`}>{project.priority}</p>
                  </div>
                  {project.assigned_team && project.assigned_team.length > 0 && (
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wider">Assigned Team</label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {project.assigned_team.map((id) => (
                          <span key={id} className="px-2 py-0.5 rounded text-xs bg-muted text-foreground">{team[id] || `#${id}`}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {project.description && (
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider">Description</label>
                    <p className="text-foreground mt-2 whitespace-pre-wrap bg-muted/50 p-4 rounded-lg">{project.description}</p>
                  </div>
                )}
                {project.tags && project.tags.length > 0 && (
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider">Tags</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {project.tags.map((tag) => (
                        <span key={tag} className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
                {project.notes && (
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider">Notes</label>
                    <p className="text-foreground mt-2 whitespace-pre-wrap bg-muted/50 p-4 rounded-lg">{project.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Internal Notes */}
            <NotesSection notableType="project" notableId={project.id} notes={internalNotes || []} />
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
