import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Trash2, Target } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import ChatMessageText from '@/Components/Chat/ChatMessageText';

const formatDate = (iso) => (iso ? new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '—');

export default function ChatShow({ chat }) {
  const handleDelete = () => {
    if (confirm('Delete this conversation? This cannot be undone.')) {
      router.delete(`/admin/chats/${chat.id}`);
    }
  };

  return (
    <AdminLayout title="AI Chat Conversation">
      <Head title="AI Chat Conversation" />

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <Link href="/admin/chats" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to chats
        </Link>
        <button onClick={handleDelete} className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-border text-muted-foreground hover:text-destructive transition-colors">
          <Trash2 className="h-4 w-4" /> Delete
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 space-y-4">
          {chat.messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${m.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm whitespace-pre-wrap break-words' : 'bg-muted text-foreground rounded-tl-sm'}`}>
                {m.role === 'user' ? m.content : <ChatMessageText text={m.content} />}
                {m.at && <p className={`mt-1 text-[11px] ${m.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{formatDate(m.at)}</p>}
              </div>
            </div>
          ))}
          {chat.messages.length === 0 && <p className="text-muted-foreground text-sm">No messages.</p>}
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-4 h-fit text-sm">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Lead</p>
            {chat.lead ? (
              <Link href={`/admin/leads/${chat.lead.id}`} className="inline-flex items-center gap-1 text-primary hover:underline">
                <Target className="h-4 w-4" /> {chat.lead.name} ({chat.lead.email})
              </Link>
            ) : (
              <p className="text-muted-foreground">No email shared yet</p>
            )}
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Started on page</p>
            <p className="text-foreground break-all">{chat.page_url || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Started</p>
            <p className="text-foreground">{formatDate(chat.created_at)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Last message</p>
            <p className="text-foreground">{formatDate(chat.last_message_at)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Visitor</p>
            <p className="text-foreground">{chat.ip_address || '—'}</p>
            <p className="text-muted-foreground text-xs break-all mt-1">{chat.user_agent}</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
