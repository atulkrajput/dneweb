import React from 'react';
import { useForm, router } from '@inertiajs/react';
import { StickyNote, Trash2 } from 'lucide-react';

/**
 * Reusable Notes section for any entity.
 * @param {string} notableType - 'lead' | 'client' | 'project' | 'task' | 'invoice'
 * @param {number} notableId - The ID of the entity
 * @param {Array} notes - Array of note objects with {id, body, user, created_at}
 */
export default function NotesSection({ notableType, notableId, notes = [] }) {
  const { data, setData, post, processing, reset } = useForm({
    notable_type: notableType,
    notable_id: notableId,
    body: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!data.body.trim()) return;
    post('/admin/notes', {
      preserveScroll: true,
      onSuccess: () => reset('body'),
    });
  };

  const handleDelete = (noteId) => {
    if (confirm('Delete this note?')) {
      router.delete(`/admin/notes/${noteId}`, { preserveScroll: true });
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <StickyNote className="h-4 w-4 text-muted-foreground" /> Internal Notes
      </h3>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          value={data.body}
          onChange={(e) => setData('body', e.target.value)}
          className="form-input flex-1"
          placeholder="Add an internal note..."
        />
        <button
          type="submit"
          disabled={processing || !data.body.trim()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          Add
        </button>
      </form>

      {notes.length > 0 ? (
        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note.id} className="group flex items-start justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm text-foreground">{note.body}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {note.user?.name || 'System'} • {new Date(note.created_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => handleDelete(note.id)}
                className="p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No notes yet.</p>
      )}
    </div>
  );
}
