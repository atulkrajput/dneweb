import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function ContactsIndex({ contacts }) {
  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      router.delete(`/admin/contacts/${id}`);
    }
  };

  return (
    <AdminLayout title="Contact Submissions">
      <Head title="Contacts" />

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {contacts.data?.map((contact) => (
                <tr key={contact.id} className={`hover:bg-muted/30 transition-colors ${!contact.is_read ? 'bg-primary/5' : ''}`}>
                  <td className="px-6 py-4">
                    <Link href={`/admin/contacts/${contact.id}`} className="text-sm font-medium text-foreground hover:text-primary">
                      {!contact.is_read && <span className="inline-block w-2 h-2 rounded-full bg-primary mr-2"></span>}
                      {contact.full_name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{contact.email}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground capitalize">{contact.inquiry_type?.replace('-', ' ')}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(contact.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(contact.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {contacts.data?.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">No contacts yet.</div>
        )}
      </div>

      {/* Pagination */}
      {contacts.links && contacts.links.length > 3 && (
        <div className="flex justify-center gap-1 mt-6">
          {contacts.links.map((link, i) => (
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
