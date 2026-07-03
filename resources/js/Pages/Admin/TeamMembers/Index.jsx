import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Edit, Trash2, User, Shield, Mail } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

const ROLE_LABELS = {
  super_admin: 'Super Admin',
  sales: 'Sales',
  project_manager: 'Project Manager',
  developer: 'Developer',
  accountant: 'Accountant',
};

const ROLE_COLORS = {
  super_admin: 'bg-red-500/10 text-red-400',
  sales: 'bg-blue-500/10 text-blue-400',
  project_manager: 'bg-purple-500/10 text-purple-400',
  developer: 'bg-green-500/10 text-green-400',
  accountant: 'bg-orange-500/10 text-orange-400',
};

export default function TeamMembersIndex({ members, roles }) {
  const handleDelete = (member) => {
    if (confirm(`Delete "${member.name}"? This cannot be undone.`)) {
      router.delete(`/admin/team/${member.id}`);
    }
  };

  return (
    <AdminLayout title="Team">
      <Head title="Team" />

      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">{members.length} member(s)</p>
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
                <span className="text-xl font-bold text-primary">{member.name?.[0]}</span>
              )}
            </div>
            <h3 className="font-semibold text-foreground">{member.name}</h3>
            {member.position && (
              <p className="text-sm text-primary mb-1">{member.position}</p>
            )}
            <div className="flex items-center gap-1 mb-2">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[member.team_role] || ''}`}>
                <Shield className="h-3 w-3" /> {ROLE_LABELS[member.team_role] || member.team_role}
              </span>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
              <Mail className="h-3 w-3" /> {member.email}
            </p>
            {member.bio && (
              <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{member.bio}</p>
            )}
            {!member.is_active && (
              <span className="text-xs text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full mb-3">Inactive</span>
            )}
            <div className="flex gap-2 mt-auto pt-3">
              <Link href={`/admin/team/${member.id}/edit`} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                <Edit className="h-4 w-4" />
              </Link>
              <button onClick={() => handleDelete(member)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
