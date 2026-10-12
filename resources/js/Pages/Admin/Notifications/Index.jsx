import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

const TYPE_ICONS = {
  new_lead: '🆕',
  proposal_accepted: '✅',
  task_assigned: '📋',
  invoice_paid: '💰',
  deadline_tomorrow: '⏰',
  project_completed: '🎉',
};

export default function NotificationsIndex({ notifications, unreadCount }) {
  const handleMarkAsRead = (id) => {
    router.patch(`/admin/notifications/${id}/read`, {}, { preserveScroll: true });
  };

  const handleMarkAllRead = () => {
    router.post('/admin/notifications/mark-all-read', {}, { preserveScroll: true });
  };

  return (
    <AdminLayout title="Notifications">
      <Head title="Notifications" />

      <div className="max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-2 px-4 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
            >
              <CheckCheck className="h-4 w-4" /> Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {notifications.data?.length > 0 ? (
            <div className="divide-y divide-border">
              {notifications.data.map((notification) => {
                const data = notification.data;
                const isUnread = !notification.read_at;
                return (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-4 p-4 transition-colors ${isUnread ? 'bg-primary/5' : ''}`}
                  >
                    <span className="text-xl mt-0.5">{TYPE_ICONS[data.type] || '📌'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{data.title}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{data.message}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {data.url && (
                          <Link href={data.url} className="text-xs text-primary hover:text-primary/80">View →</Link>
                        )}
                      </div>
                    </div>
                    {isUnread && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="p-1.5 text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                        title="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No notifications yet.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {notifications.links && notifications.links.length > 3 && (
          <div className="flex justify-center gap-1 mt-6">
            {notifications.links.map((link, i) => (
              <Link
                key={i}
                href={link.url || '#'}
                className={`px-3 py-2 text-sm rounded ${link.active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'} ${!link.url ? 'opacity-50 pointer-events-none' : ''}`}
                dangerouslySetInnerHTML={{ __html: link.label }}
              />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
