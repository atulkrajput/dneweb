import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

/**
 * Shows a small toast using sweetalert2 (loaded lazily to keep it out of the
 * main bundle), matching the app's existing flash-notification style.
 */
const toast = async (options) => {
  const { default: Swal } = await import('sweetalert2');
  return Swal.fire({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timerProgressBar: true,
    background: 'var(--color-card)',
    color: 'var(--color-foreground)',
    ...options,
  });
};

/**
 * Calls the backend Groq endpoint to improve a piece of text.
 *
 * @param {string} kind  One of: task_title, task_description, project_description, sprint_goal
 * @param {string} text  The text to improve.
 * @param {string} [context]  Optional context to help the model (not echoed back).
 * @returns {Promise<{result: string, html: boolean}>}
 */
export async function improveText(kind, text, context) {
  const { data } = await window.axios.post('/admin/ai/improve', { kind, text, context });
  return data;
}

/**
 * A compact "Improve with AI" button. Handles the request lifecycle, shows a
 * spinner while working, surfaces errors as a toast, and passes the improved
 * text to onImproved(result, html).
 */
export default function AiImproveButton({
  kind,
  getText,
  onImproved,
  context,
  title = 'Improve with AI',
  label,
  className = '',
  disabled = false,
  allowEmpty = false,
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    const text = (getText?.() ?? '').trim();
    const hasContext = (context ?? '').trim() !== '';

    // With no text: generate from context when allowed, otherwise prompt for input.
    if (!text && !(allowEmpty && hasContext)) {
      const message = allowEmpty
        ? 'Add a title first so AI has something to work from.'
        : 'Add some text first.';
      await toast({ icon: 'info', title: 'Nothing to improve', text: message, timer: 2500 });
      return;
    }

    setLoading(true);
    try {
      const { result, html } = await improveText(kind, text, context);
      onImproved?.(result, html);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        'Could not improve the text. Please try again.';
      await toast({ icon: 'error', title: 'AI error', text: message, timer: 4000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || loading}
      title={title}
      aria-label={title}
      className={`inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
      {label && <span>{loading ? 'Improving...' : label}</span>}
    </button>
  );
}
