import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search, FolderKanban, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

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
  planning: 'bg-blue-500/10 text-blue-400',
  in_progress: 'bg-orange-500/10 text-orange-400',
  review: 'bg-purple-500/10 text-purple-400',
  testing: 'bg-cyan-500/10 text-cyan-400',
  completed: 'bg-green-500/10 text-green-400',
  on_hold: 'bg-yellow-500/10 text-yellow-400',
  cancelled: 'bg-red-500/10 text-red-400',
};

const PRIORITY_COLORS = {
  low: 'text-muted-foreground',
  medium: 'text-blue-400',
  high: 'text-orange-400',
  urgent: 'text-red-400',
};

export default function ProjectsIndex({ projects, stats, filters }) {
  const [search, setSearch] = React.useState(filters.search || '');

  const handleSearch = (e) => {
    e.preventDefault();
    router.get('/admin/projects', { search, status: filters.status, priority: filters.priority }, { preserveState: true });
  };

  const handleFilterStatus = (status) => {
    router.get('/admin/projects', { search: filters.search, status: status || undefined, priority: filters.priority }, { preserveState: true });
  };

  const statCards = [
    { label: 'Total Projects', value: stats.total, icon: FolderKanban, color: 'text-blue-400' },
    { label: 'Active', value: stats.active, icon: Clock, color: 'text-orange-400' },
    { label: 'Overdue', value: stats.overdue, icon: AlertTriangle, color: 'text-red-400' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-green-400' },
  ];

  return (
    <AdminLayout title="Projects">
      <Head title="Projects" />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <card.icon className={`h-8 w-8 ${card.color}`} />
              <span className="text-3xl font-bold text-foreground">{card.value}</span>
            </div>
            <p className="text-sm text-muted-foreground">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="form-input pl-9 w-full"
            />
          </div>
        </form>
        <Link href="/admin/projects/create" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> New Project
        </Link>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => handleFilterStatus(null)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!filters.status ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
        >
          All
        </button>
        {Object.entries(STATUS_LABELS).map(([value, label]) => (
          <button
            key={value}
            onClick={() => handleFilterStatus(value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filters.status === value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Project</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Progress</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Deadline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {projects.data?.map((project) => {
                const isOverdue = project.deadline && new Date(project.deadline) < new Date() && !['completed', 'cancelled'].includes(project.status);
                return (
                  <tr key={project.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/admin/projects/${project.id}`} className="text-sm font-medium text-foreground hover:text-primary">
                        {project.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{project.client?.company || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium capitalize ${PRIORITY_COLORS[project.priority]}`}>{project.priority}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[project.status]}`}>
                        {STATUS_LABELS[project.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${project.progress}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm ${isOverdue ? 'text-red-400 font-medium' : 'text-muted-foreground'}`}>
                        {project.deadline ? new Date(project.deadline).toLocaleDateString() : '—'}
                        {isOverdue && ' ⚠️'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {projects.data?.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">No projects found.</div>
        )}
      </div>

      {/* Pagination */}
      {projects.links && projects.links.length > 3 && (
        <div className="flex justify-center gap-1 mt-6">
          {projects.links.map((link, i) => (
            <Link
              key={i}
              href={link.url || '#'}
              className={`px-3 py-2 text-sm rounded ${link.active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'} ${!link.url ? 'opacity-50 pointer-events-none' : ''}`}
              dangerouslySetInnerHTML={{ __html: link.label }}
            />
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
