import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { MessageCircle, Target, Eye } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

const formatDate = (iso) => (iso ? new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—');
const pagePath = (url) => {
  try { return new URL(url).pathname; } catch (e) { return url || '—'; }
};

export default function ChatsIndex({ chats, filter, stats }) {
  const filters = [
    { id: 'all', label: 'All conversations', href: '/admin/chats' },
    { id: 'leads', label: 'With lead captured', href: '/admin/chats?filter=leads' },
  ];

  return (
    <AdminLayout title="AI Chats">
      <Head title="AI Chats" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total conversations', value: stats.total },
          { label: 'Active today', value: stats.today },
          { label: 'Leads captured', value: stats.leads },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
            <p className="text-2xl font-semibold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {filters.map((f) => (
          <Link
            key={f.id}
            href={f.href}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f.id ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:text-foreground border border-border'
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">First message</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Messages</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Started on</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Lead</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Last activity</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {chats.data.map((c) => (
                <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-foreground max-w-md">
                    <Link href={`/admin/chats/${c.id}`} className="hover:text-primary">{c.preview || '—'}</Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{c.message_count}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{pagePath(c.page_url)}</td>
                  <td className="px-6 py-4 text-sm">
                    {c.lead ? (
                      <Link href={`/admin/leads/${c.lead.id}`} className="inline-flex items-center gap-1 text-primary hover:underline">
                        <Target className="h-3.5 w-3.5" /> {c.lead.name || c.lead.email}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">{formatDate(c.last_message_at)}</td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/chats/${c.id}`} className="inline-flex p-2 text-muted-foreground hover:text-foreground transition-colors" title="View conversation">
                      <Eye className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
              {chats.data.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    No chat conversations yet. Turn the chat on in Settings → AI Chat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {chats.links && chats.links.length > 3 && (
        <div className="flex justify-center gap-1 mt-6">
          {chats.links.map((link, i) => (
            <Link
              key={i}
              href={link.url || '#'}
              className={`px-3 py-2 text-sm rounded-lg ${link.active ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:text-foreground border border-border'} ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
              dangerouslySetInnerHTML={{ __html: link.label }}
            />
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
