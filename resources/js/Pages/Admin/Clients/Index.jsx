import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search, Building2, CheckCircle, XCircle } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

const STATUS_LABELS = {
  active: 'Active',
  inactive: 'Inactive',
  churned: 'Churned',
};

const STATUS_COLORS = {
  active: 'bg-green-500/10 text-green-400',
  inactive: 'bg-yellow-500/10 text-yellow-400',
  churned: 'bg-red-500/10 text-red-400',
};

export default function ClientsIndex({ clients, stats, filters }) {
  const [search, setSearch] = React.useState(filters.search || '');

  const handleSearch = (e) => {
    e.preventDefault();
    router.get('/admin/clients', { search, status: filters.status }, { preserveState: true });
  };

  const handleFilterStatus = (status) => {
    router.get('/admin/clients', { search: filters.search, status: status || undefined }, { preserveState: true });
  };

  const statCards = [
    { label: 'Total Clients', value: stats.total, icon: Building2, color: 'text-blue-400' },
    { label: 'Active', value: stats.active, icon: CheckCircle, color: 'text-green-400' },
    { label: 'Inactive', value: stats.inactive, icon: XCircle, color: 'text-yellow-400' },
  ];

  return (
    <AdminLayout title="Clients">
      <Head title="Clients" />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
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
              placeholder="Search clients..."
              className="form-input pl-9 w-full"
            />
          </div>
        </form>
        <Link href="/admin/clients/create" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> New Client
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
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Contact Person</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Industry</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Since</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {clients.data?.map((client) => (
                <tr key={client.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/admin/clients/${client.id}`} className="text-sm font-medium text-foreground hover:text-primary">
                      {client.company}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{client.contact_person}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{client.email}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{client.industry || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[client.status]}`}>
                      {STATUS_LABELS[client.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(client.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {clients.data?.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">No clients found.</div>
        )}
      </div>

      {/* Pagination */}
      {clients.links && clients.links.length > 3 && (
        <div className="flex justify-center gap-1 mt-6">
          {clients.links.map((link, i) => (
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
