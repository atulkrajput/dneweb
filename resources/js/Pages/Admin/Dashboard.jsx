import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { MessageSquare, Briefcase, Users, AlertCircle } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Dashboard({ stats, recent_contacts }) {
  const cards = [
    { label: 'Total Contacts', value: stats.contacts, icon: MessageSquare, color: 'text-blue-400' },
    { label: 'Unread Messages', value: stats.unread_contacts, icon: AlertCircle, color: 'text-orange-400' },
    { label: 'Services', value: stats.services, icon: Briefcase, color: 'text-green-400' },
    { label: 'Team Members', value: stats.team_members, icon: Users, color: 'text-purple-400' },
  ];

  return (
    <AdminLayout title="Dashboard">
      <Head title="Admin Dashboard" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <card.icon className={`h-8 w-8 ${card.color}`} />
              <span className="text-3xl font-bold text-foreground">{card.value}</span>
            </div>
            <p className="text-sm text-muted-foreground">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Recent Contacts</h2>
          <Link href="/admin/contacts" className="text-sm text-primary hover:text-primary/80">View All →</Link>
        </div>
        {recent_contacts && recent_contacts.length > 0 ? (
          <div className="space-y-3">
            {recent_contacts.map((contact) => (
              <Link key={contact.id} href={`/admin/contacts/${contact.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                <div>
                  <p className="text-sm font-medium text-foreground">{contact.full_name}</p>
                  <p className="text-xs text-muted-foreground">{contact.email} • {contact.inquiry_type}</p>
                </div>
                <div className="flex items-center gap-2">
                  {!contact.is_read && <span className="w-2 h-2 rounded-full bg-primary"></span>}
                  <span className="text-xs text-muted-foreground">{new Date(contact.created_at).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No contacts yet.</p>
        )}
      </div>
    </AdminLayout>
  );
}
