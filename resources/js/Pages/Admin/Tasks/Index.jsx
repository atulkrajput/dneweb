import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Plus, X, Calendar, User, GripVertical, Timer, Edit3, FolderKanban, ChevronDown } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

const COLUMN_CONFIG = {
  todo: { label: 'To Do', color: 'border-t-blue-500' },
  in_progress: { label: 'In Progress', color: 'border-t-orange-500' },
  review: { label: 'Review', color: 'border-t-purple-500' },
  done: { label: 'Done', color: 'border-t-green-500' },
};

const PRIORITY_COLORS = {
  low: 'bg-gray-500/10 text-gray-400',
  medium: 'bg-blue-500/10 text-blue-400',
  high: 'bg-orange-500/10 text-orange-400',
  urgent: 'bg-red-500/10 text-red-400',
};

export default function TasksIndex({ columns, projects, currentProject, team, sprints, filters }) {
  const [showCreate, setShowCreate] = useState(false);
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);

  const { data, setData, post, processing, errors, reset } = useForm({
    project_id: filters.project_id || '',
    sprint_id: filters.sprint_id || '',
    title: '',
    description: '',
    assignee_id: '',
    priority: 'medium',
    due_date: '',
    status: 'todo',
    estimated_hours: '',
  });

  const switchProject = (projectId) => {
    router.get('/admin/tasks', { project_id: projectId }, { preserveState: true });
    setShowProjectPicker(false);
  };

  const handleFilterSprint = (sprintId) => {
    router.get('/admin/tasks', { project_id: filters.project_id, sprint_id: sprintId || undefined }, { preserveState: true });
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    post('/admin/tasks', {
      onSuccess: () => {
        reset('title', 'description', 'assignee_id', 'due_date', 'estimated_hours', 'sprint_id');
        setShowCreate(false);
      },
    });
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== newStatus) {
      router.patch(`/admin/tasks/${draggedTask.id}/status`, { status: newStatus }, { preserveState: true });
    }
    setDraggedTask(null);
  };

  return (
    <AdminLayout title="Tasks">
      <Head title="Tasks" />

      {/* Project Header Bar */}
      {currentProject && (
        <div className="bg-card border border-border rounded-xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Project Name + Switch */}
            <div className="flex items-center gap-3 relative">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FolderKanban className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-foreground">{currentProject.name}</h2>
                  <button
                    onClick={() => setShowProjectPicker(!showProjectPicker)}
                    className="px-2 py-1 text-xs text-muted-foreground hover:text-primary hover:bg-primary/5 border border-border rounded-md transition-colors"
                  >
                    Switch <ChevronDown className="h-3 w-3 inline" />
                  </button>
                </div>
                {currentProject.client && (
                  <p className="text-xs text-muted-foreground">{currentProject.client.company}</p>
                )}
              </div>

              {/* Project Picker Dropdown */}
              {showProjectPicker && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-card border border-border rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
                  {projects.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => switchProject(p.id)}
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-muted transition-colors first:rounded-t-xl last:rounded-b-xl ${String(p.id) === String(filters.project_id) ? 'bg-primary/5 text-primary font-medium' : 'text-foreground'}`}
                    >
                      {p.name}
                      {p.client && <span className="text-xs text-muted-foreground ml-2">({p.client.company})</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filters + Actions */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Sprint Filter */}
              {sprints && sprints.length > 0 && (
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Sprint</label>
                  <select
                    value={filters.sprint_id || ''}
                    onChange={(e) => handleFilterSprint(e.target.value)}
                    className="form-input text-sm min-w-[140px]"
                  >
                    <option value="">All</option>
                    <option value="backlog">Backlog</option>
                    {sprints.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} {s.status === 'active' ? '●' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={() => setShowCreate(!showCreate)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-4 w-4" /> New Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No project state */}
      {!currentProject && (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <FolderKanban className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">Select a project to view its tasks.</p>
        </div>
      )}
              <option value="">All Sprints</option>
              <option value="backlog">Backlog</option>
              {sprints.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.status === 'active' ? '●' : ''}
                </option>
              ))}
            </select>
          )}
        </div>

        <button
          onClick={() => setShowCreate(!showCreate)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> New Task
        </button>
      </div>

      {/* Create Task Form */}
      {showCreate && currentProject && (
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">
              New Task <span className="text-muted-foreground font-normal">in {currentProject.name}</span>
            </h3>
            <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
          </div>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Title <span className="text-primary">*</span></label>
                <input type="text" value={data.title} onChange={(e) => setData('title', e.target.value)} className={`form-input ${errors.title ? 'border-destructive' : ''}`} placeholder="Task title" />
                {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title}</p>}
              </div>
              <div>
                <label className="form-label">Sprint</label>
                <select value={data.sprint_id} onChange={(e) => setData('sprint_id', e.target.value)} className="form-input">
                  <option value="">Backlog</option>
                  {sprints.filter(s => s.status !== 'completed').map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="form-label">Assignee</label>
                <select value={data.assignee_id} onChange={(e) => setData('assignee_id', e.target.value)} className="form-input">
                  <option value="">Unassigned</option>
                  {Object.entries(team).map(([id, name]) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
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
              <div>
                <label className="form-label">Due Date</label>
                <input type="date" value={data.due_date} onChange={(e) => setData('due_date', e.target.value)} className="form-input" />
              </div>
              <div>
                <label className="form-label">Est. Hours</label>
                <input type="number" step="0.5" value={data.estimated_hours} onChange={(e) => setData('estimated_hours', e.target.value)} className="form-input" placeholder="0" />
              </div>
            </div>
            <div>
              <label className="form-label">Description</label>
              <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} rows="2" className="form-input resize-y" placeholder="Optional description..." />
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={processing} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
                {processing ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* No project selected state */}
      {!currentProject && (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <FolderKanban className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">Select a project to view its tasks.</p>
        </div>
      )}

      {/* Kanban Board */}
      {currentProject && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(COLUMN_CONFIG).map(([status, config]) => (
            <div
              key={status}
              className={`bg-card border border-border rounded-xl border-t-4 ${config.color} min-h-[300px]`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status)}
            >
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">{config.label}</h3>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {columns[status]?.length || 0}
                  </span>
                </div>
              </div>
              <div className="p-3 space-y-3">
                {columns[status]?.map((task) => {
                  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';
                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      className="bg-background border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-primary/40 transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <Link href={`/admin/tasks/${task.id}`} className="text-sm font-medium text-foreground hover:text-primary leading-tight flex-1">
                          {task.title}
                        </Link>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <Link href={`/admin/tasks/${task.id}`} className="p-1 text-muted-foreground hover:text-primary rounded transition-colors" title="Edit task">
                            <Edit3 className="h-3.5 w-3.5" />
                          </Link>
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}>
                          {task.priority}
                        </span>
                        {task.sprint && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-primary/10 text-primary">
                            <Timer className="h-3 w-3" />
                            {task.sprint.name}
                          </span>
                        )}
                        {task.due_date && (
                          <span className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-400' : 'text-muted-foreground'}`}>
                            <Calendar className="h-3 w-3" />
                            {new Date(task.due_date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                        {task.assignee && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            {task.assignee.name?.split(' ')[0]}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                {(!columns[status] || columns[status].length === 0) && (
                  <p className="text-xs text-muted-foreground text-center py-4">No tasks</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Click outside to close project picker */}
      {showProjectPicker && (
        <div className="fixed inset-0 z-40" onClick={() => setShowProjectPicker(false)} />
      )}
    </AdminLayout>
  );
}
