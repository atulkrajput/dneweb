import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Edit, Trash2, User } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function TeamMembersIndex({ members }) {
  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this team member?')) {
      router.delete(`/admin/team/${id}`);
    }
  };

  return (
    <AdminLayout title="Team Members">
      <Head title="Manage Team" />

      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">{members.length} members</p>
        <Link href="/admin/team/create" className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> Add Member
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <div key={member.id} className="bg-card border border-border rounded-xl p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-secondary border border-border flex items-center justify-center mb-4 overflow-hidden">
              {member.photo ? (
                <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-muted-foreground/50" />
              )}
            </div>
            <h3 className="font-semibold text-foreground">{member.name}</h3>
            <p className="text-sm text-primary mb-2">{member.role}</p>
            <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{member.bio}</p>
            <div className="flex gap-2">
              <Link href={`/admin/team/${member.id}/edit`} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                <Edit className="h-4 w-4" />
              </Link>
              <button onClick={() => handleDelete(member.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
