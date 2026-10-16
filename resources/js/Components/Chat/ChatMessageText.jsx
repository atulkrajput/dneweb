import React from 'react';
import { Link } from '@inertiajs/react';

// Renders the small Markdown subset the assistant uses (paragraphs, "-"/"1."
// lists, **bold** and [links](/path)) as React elements, so model output is
// never injected as HTML. Only on-site paths and https URLs become links.

function safeHref(href) {
  if (href.startsWith('/') && !href.startsWith('//')) return { href, internal: true };
  if (href.startsWith('https://')) return { href, internal: false };
  if (href.startsWith('mailto:')) return { href, internal: false };
  return null;
}

function renderInline(text, keyPrefix) {
  const nodes = [];
  const pattern = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let match;
  let i = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const key = `${keyPrefix}-${i++}`;

    if (match[1]) {
      nodes.push(<strong key={key} className="font-semibold">{match[1]}</strong>);
    } else {
      const link = safeHref(match[3]);
      if (!link) {
        nodes.push(match[2]);
      } else if (link.internal) {
        nodes.push(<Link key={key} href={link.href} className="underline underline-offset-2 font-medium">{match[2]}</Link>);
      } else {
        nodes.push(<a key={key} href={link.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 font-medium">{match[2]}</a>);
      }
    }
    last = pattern.lastIndex;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

const isTableRow = (line) => line.startsWith('|') && line.endsWith('|') && line.length > 2;
const isTableDivider = (line) => /^\|[\s:|-]+\|$/.test(line);
const tableCells = (line) => line.slice(1, -1).split('|').map((c) => c.trim());

export default function ChatMessageText({ text }) {
  const blocks = [];
  let list = null;
  let table = null;
  const lines = String(text || '').split('\n').map((l) => l.trim());

  lines.forEach((line, idx) => {
    // Markdown tables are too wide for the chat window, so each row becomes
    // a list item: "**first cell** — other cells". The header row is dropped.
    if (isTableRow(line)) {
      list = null;
      if (isTableDivider(line)) return;
      if (!table) {
        table = { rows: [] };
        blocks.push(table);
        const next = lines.slice(idx + 1).find((l) => l !== '');
        if (next && isTableDivider(next)) return; // header row
      }
      const [first, ...rest] = tableCells(line).filter((c) => c !== '');
      if (first) table.rows.push(renderInline(rest.length ? `**${first.replace(/\*\*/g, '')}** — ${rest.join(' — ')}` : first, `tr-${idx}`));
      return;
    }
    // Blank lines inside a table don't end it.
    if (table && line === '' && lines.slice(idx + 1).find((l) => l !== '')?.startsWith('|')) return;
    table = null;

    const bullet = line.match(/^(?:[-*•]|\d+[.)])\s+(.*)$/);

    if (bullet) {
      if (!list) {
        list = { ordered: /^\d/.test(line), items: [] };
        blocks.push(list);
      }
      list.items.push(renderInline(bullet[1], `li-${idx}`));
      return;
    }

    list = null;
    if (line === '') return;
    blocks.push({ paragraph: renderInline(line.replace(/^#+\s*/, ''), `p-${idx}`) });
  });

  return (
    <div className="space-y-2 break-words">
      {blocks.map((block, i) => {
        if (block.paragraph) return <p key={i}>{block.paragraph}</p>;
        if (block.rows) {
          return (
            <ul key={i} className="space-y-1.5">
              {block.rows.map((row, j) => <li key={j} className="pl-3 border-l-2 border-primary/40">{row}</li>)}
            </ul>
          );
        }
        const Tag = block.ordered ? 'ol' : 'ul';
        return (
          <Tag key={i} className={`pl-5 space-y-1 ${block.ordered ? 'list-decimal' : 'list-disc'}`}>
            {block.items.map((item, j) => <li key={j}>{item}</li>)}
          </Tag>
        );
      })}
    </div>
  );
}
