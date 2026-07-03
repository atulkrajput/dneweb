import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Target, DollarSign, FolderKanban, Users } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

const reports = [
  { name: 'Leads Report', description: 'Lead acquisition, status breakdown, and sources', href: '/admin/reports/leads', icon: Target, color: 'text-blue-400' },
  { name: 'Revenue Report', description: 'Invoiced amounts, payments, and revenue by client', href: '/admin/reports/revenue', icon: DollarSign, color: 'text-green-400' },
  { name: 'Projects Report', description: 'Project statuses, budgets, progress, and deadlines', href: '/admin/reports/projects', icon: FolderKanban, color: 'text-orange-400' },
  { name: 'Productivity Report', description: 'Task completion, hours logged, and team performance', href: '/admin/reports/productivity', icon: Users, color: 'text-purple-400' },
];

export default function ReportsIndex() {
  return (
    <AdminLayout title="Reports">
      <Head title="Reports" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl">
        {reports.map((report) => (
          <Link
            key={report.name}
            href={report.href}
            className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-colors group"
          >
            <report.icon className={`h-10 w-10 ${report.color} mb-4`} />
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{report.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
          </Link>
        ))}
      </div>
    </AdminLayout>
  );
}
