import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Trash2 } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function ContactShow({ contact }) {
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this contact?')) {
      router.delete(`/admin/contacts/${contact.id}`);
    }
  };

  return (
    <AdminLayout title="Contact Details">
      <Head title={`Contact - ${contact.full_name}`} />

      <div className="max-w-3xl">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/contacts" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Contacts
          </Link>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Full Name</label>
              <p className="text-foreground font-medium mt-1">{contact.full_name}</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Email</label>
              <p className="text-foreground mt-1">
                <a href={`mailto:${contact.email}`} className="text-primary hover:text-primary/80">{contact.email}</a>
              </p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Company</label>
              <p className="text-foreground mt-1">{contact.company || '—'}</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Inquiry Type</label>
              <p className="text-foreground mt-1 capitalize">{contact.inquiry_type?.replace('-', ' ')}</p>
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider">Message</label>
            <p className="text-foreground mt-2 whitespace-pre-wrap bg-muted/50 p-4 rounded-lg">{contact.message || 'No message provided.'}</p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <span className="text-xs text-muted-foreground">
              Received: {new Date(contact.created_at).toLocaleString()}
            </span>
            <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
