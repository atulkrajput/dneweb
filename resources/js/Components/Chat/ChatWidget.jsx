import React, { useEffect, useRef, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import { X, Send, RotateCcw } from 'lucide-react';
import ChatMessageText from '@/Components/Chat/ChatMessageText';
import DotAvatar from '@/Components/Chat/DotAvatar';

const STORAGE_KEY = 'dne-chat-v1';
const SUGGESTIONS = [
  'What services do you offer?',
  'Can you build a mobile app for us?',
  'How do I get a quote?',
];

function loadSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved && Array.isArray(saved.messages)) return saved;
  } catch (e) {
    // Storage unavailable (private mode, blocked cookies) — start fresh.
  }
  return { conversationId: null, messages: [] };
}

function save(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // Ignore — the chat still works for this page view.
  }
}

export default function ChatWidget() {
  const { chat } = usePage().props;
  const [open, setOpen] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const saved = loadSaved();
    setConversationId(saved.conversationId);
    setMessages(saved.messages);
  }, []);

  useEffect(() => {
    save({ conversationId, messages });
  }, [conversationId, messages]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, sending, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  if (!chat?.enabled) return null;

  const name = chat.name || 'Dot';
  const welcome = chat.welcome || `Hi, I'm ${name}, the DNE Consultants AI assistant. Ask me about our services, products, or how we can help you build, automate and scale.`;

  const send = async (text) => {
    const message = (text ?? input).trim();
    if (!message || sending) return;

    setError(null);
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: message }]);
    setSending(true);

    try {
      const { data } = await axios.post('/chat/message', {
        conversation_id: conversationId,
        message,
        page_url: window.location.href,
      });
      setConversationId(data.conversation_id);
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
      // Put the unsent text back so the visitor can retry.
      setMessages((prev) => prev.slice(0, -1));
      setInput(message);
    } finally {
      setSending(false);
    }
  };

  const reset = () => {
    setConversationId(null);
    setMessages([]);
    setError(null);
    inputRef.current?.focus();
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label={`Chat with ${name}`}
          className="fixed z-50 bottom-24 right-4 left-4 sm:left-auto sm:right-6 sm:w-[380px] h-[min(560px,calc(100vh-8rem))] flex flex-col bg-card text-foreground border border-border rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="flex items-center gap-3 px-4 py-3 bg-primary text-primary-foreground">
            <DotAvatar size={38} variant="light" active={sending} className="flex-shrink-0 shadow-sm rounded-full" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold leading-tight truncate">{name}</p>
              <p className="text-xs opacity-80">AI assistant · replies instantly</p>
            </div>
            {messages.length > 0 && (
              <button onClick={reset} className="p-2 rounded-lg hover:bg-primary-foreground/15 transition-colors" title="Start a new chat" aria-label="Start a new chat">
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
            <button onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-primary-foreground/15 transition-colors" title="Close chat" aria-label="Close chat">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 text-sm" aria-live="polite">
            <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-muted border border-border px-3.5 py-2.5">
              <ChatMessageText text={welcome} />
            </div>

            {messages.length === 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-xs px-3 py-1.5 rounded-full border border-primary/40 text-primary hover:bg-primary/10 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                    m.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-sm whitespace-pre-wrap break-words'
                      : 'bg-muted border border-border rounded-tl-sm'
                  }`}
                >
                  {m.role === 'user' ? m.content : <ChatMessageText text={m.content} />}
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex justify-start" aria-label={`${name} is typing`}>
                <div className="rounded-2xl rounded-tl-sm bg-muted border border-border px-3 py-2 flex items-center gap-1.5">
                  <DotAvatar size={22} active className="rounded-full mr-1" />
                  {[0, 150, 300].map((d) => (
                    <span key={d} className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            )}

            {error && <p className="text-xs text-destructive text-center">{error}</p>}
          </div>

          <div className="border-t border-border p-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                rows={1}
                maxLength={1000}
                placeholder="Type your message…"
                aria-label="Message"
                className="flex-1 resize-none max-h-28 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={() => send()}
                disabled={sending || !input.trim()}
                className="h-10 w-10 flex-shrink-0 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-[11px] leading-snug text-muted-foreground text-center">
              AI answers may be inaccurate. Please don't share sensitive information.{' '}
              <Link href="/legal/privacy-policy" className="underline">Privacy</Link>
            </p>
          </div>
        </div>
      )}

      <div className="fixed z-50 bottom-6 right-4 sm:right-6 flex items-center gap-3">
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="hidden sm:block px-3 py-1.5 rounded-full bg-card text-foreground text-sm font-medium border border-border shadow-md hover:border-primary/50 transition-colors"
            tabIndex={-1}
            aria-hidden="true"
          >
            Ask {name}
          </button>
        )}
        <button
          onClick={() => setOpen((o) => !o)}
          className="relative h-14 w-14 rounded-full shadow-lg hover:scale-105 transition-transform flex items-center justify-center bg-[#0A1E3E] text-white ring-2 ring-[#1985F0]/40"
          aria-label={open ? 'Close chat' : `Chat with ${name}`}
          aria-expanded={open}
        >
          {!open && <span className="dot-launcher-halo absolute inset-0 rounded-full bg-[#1985F0]/40 pointer-events-none" />}
          {open ? <X className="h-6 w-6" /> : <DotAvatar size={56} active={sending} className="relative" />}
        </button>
      </div>
    </>
  );
}
