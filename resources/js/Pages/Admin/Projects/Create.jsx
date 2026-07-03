import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function ProjectCreate({ clients, team, preselectedClient }) {
  const { data, setData, post, processing, errors } = useForm({
    client_id: preselectedClient || '',
    name: '',
    description: '',
    services: [],
    budget: '',
    priority: 'medium',
    status: 'planning',
    assigned_team: [],
    start_date: '',
    deadline: '',
    tags: [],
    notes: '',
  });

  const [tagInput, setTagInput] = React.useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/admin/projects');
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !data.tags.includes(tag)) {
      setData('tags', [...data.tags, tag]);
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setData('tags', data.tags.filter(t => t !== tag));
  };

  const handleTeamToggle = (id) => {
    const idStr = String(id);
    if (data.assigned_team.includes(idStr)) {
      setData('assigned_team', data.assigned_team.filter(t => t !== idStr));
    } else {
      setData('assigned_team', [...data.assigned_team, idStr]);
    }
  };

  return (
    <AdminLayout title="New Project">
      <Head title="New Project" />

      <div className="max-w-3xl">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/projects" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Projects
          </Link>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Project Name <span className="text-primary">*</span></label>
                <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className={`form-input ${errors.name ? 'border-destructive' : ''}`} placeholder="Website Redesign" />
                {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
              </div>
              <div>
                <label className="form-label">Client <span className="text-primary">*</span></label>
                <select value={data.client_id} onChange={(e) => setData('client_id', e.target.value)} className={`form-input ${errors.client_id ? 'border-destructive' : ''}`}>
                  <option value="">Select a client...</option>
                  {Object.entries(clients).map(([id, company]) => (
                    <option key={id} value={id}>{company}</option>
                  ))}
                </select>
                {errors.client_id && <p className="mt-1 text-sm text-destructive">{errors.client_id}</p>}
              </div>
            </div>

            <div>
              <label className="form-label">Description</label>
              <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} rows="3" className="form-input resize-y" placeholder="Project scope and objectives..." />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="form-label">Budget</label>
                <input type="number" step="0.01" value={data.budget} onChange={(e) => setData('budget', e.target.value)} className="form-input" placeholder="0.00" />
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
                <label className="form-label">Status</label>
                <select value={data.status} onChange={(e) => setData('status', e.target.value)} className="form-input">
                  <option value="planning">Planning</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="testing">Testing</option>
                  <option value="on_hold">On Hold</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Start Date</label>
                <input type="date" value={data.start_date} onChange={(e) => setData('start_date', e.target.value)} className="form-input" />
              </div>
              <div>
                <label className="form-label">Deadline</label>
                <input type="date" value={data.deadline} onChange={(e) => setData('deadline', e.target.value)} className="form-input" />
              </div>
            </div>

            {/* Team Assignment */}
            {Object.keys(team).length > 0 && (
              <div>
                <label className="form-label">Assigned Team</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {Object.entries(team).map(([id, name]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleTeamToggle(id)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${data.assigned_team.includes(String(id)) ? 'bg-primary/10 text-primary border-primary/30' : 'text-muted-foreground border-border hover:border-primary/30'}`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            <div>
              <label className="form-label">Tags</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                  className="form-input flex-1"
                  placeholder="Add a tag and press Enter"
                />
                <button type="button" onClick={addTag} className="px-3 py-2 text-sm bg-muted text-foreground rounded-lg hover:bg-muted/80">Add</button>
              </div>
              {data.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {data.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="text-primary/60 hover:text-primary">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="form-label">Notes</label>
              <textarea value={data.notes} onChange={(e) => setData('notes', e.target.value)} rows="3" className="form-input resize-y" placeholder="Internal project notes..." />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Link href="/admin/projects" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</Link>
              <button type="submit" disabled={processing} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                {processing ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
