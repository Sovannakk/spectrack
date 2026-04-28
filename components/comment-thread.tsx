"use client";

import * as React from "react";
import { Send } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RoleBadge } from "@/components/role-badge";
import { timeAgo } from "@/lib/utils";
import type { Comment, Member } from "@/lib/types";

interface Props {
  comments: Comment[];
  endpoint?: string;
  endpointId?: string;
  hideEndpointLabel?: boolean;
  /** UX-WF-04: project members for @mention autocomplete */
  members?: Member[];
  onSubmit: (input: {
    endpoint: string;
    endpointId?: string;
    text: string;
    mentions?: string[];
  }) => void;
}

export function CommentThread({
  comments,
  endpoint,
  endpointId,
  hideEndpointLabel,
  members = [],
  onSubmit,
}: Props) {
  const [text, setText] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const [mentionState, setMentionState] = React.useState<{
    open: boolean;
    query: string;
    /** Index where the @ token begins in the textarea value */
    tokenStart: number;
    highlight: number;
  }>({ open: false, query: "", tokenStart: -1, highlight: 0 });

  const candidates = React.useMemo(() => {
    if (!mentionState.open) return [];
    const q = mentionState.query.toLowerCase();
    return members
      .filter((m) => m.name.toLowerCase().includes(q))
      .slice(0, 6);
  }, [members, mentionState.open, mentionState.query]);

  // Recompute the active @-token whenever the value changes
  React.useEffect(() => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    const caret = el.selectionStart ?? text.length;
    // Find the last @ before the caret with no whitespace after it
    const upTo = text.slice(0, caret);
    const match = upTo.match(/(?:^|\s)(@\w*)$/);
    if (match) {
      const tokenStart = upTo.lastIndexOf("@");
      const query = match[1].slice(1);
      setMentionState((s) => ({
        open: true,
        query,
        tokenStart,
        highlight: s.open ? Math.min(s.highlight, candidates.length - 1) : 0,
      }));
    } else if (mentionState.open) {
      setMentionState((s) => ({ ...s, open: false }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const insertMention = (memberName: string) => {
    if (mentionState.tokenStart < 0) return;
    const before = text.slice(0, mentionState.tokenStart);
    const caret = textareaRef.current?.selectionStart ?? text.length;
    const after = text.slice(caret);
    const next = `${before}@${memberName} ${after}`;
    setText(next);
    setMentionState({ open: false, query: "", tokenStart: -1, highlight: 0 });
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      const pos = before.length + 1 + memberName.length + 1;
      el.focus();
      el.setSelectionRange(pos, pos);
    });
  };

  const memberNames = members.map((m) => m.name);

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const mentions = extractMentions(trimmed, memberNames);
    onSubmit({
      endpoint: endpoint ?? "general",
      endpointId,
      text: trimmed,
      mentions: mentions.length > 0 ? mentions : undefined,
    });
    setText("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionState.open && candidates.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setMentionState((s) => ({
          ...s,
          highlight: Math.min(s.highlight + 1, candidates.length - 1),
        }));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setMentionState((s) => ({ ...s, highlight: Math.max(s.highlight - 1, 0) }));
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        const pick = candidates[mentionState.highlight];
        if (pick) insertMention(pick.name);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setMentionState((s) => ({ ...s, open: false }));
        return;
      }
    }
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {comments.length === 0 ? (
          <div className="rounded-lg border border-dashed border-stone-200/60 bg-white/40 px-4 py-5 text-center text-sm text-stone-500 dark:border-stone-800 dark:bg-stone-900/40">
            No comments yet — start the discussion below.
          </div>
        ) : (
          comments.map((c) => (
            <div
              key={c.id}
              className="glass-subtle flex items-start gap-3 rounded-lg p-3"
            >
              <Avatar name={c.author} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-sm font-medium text-stone-900 dark:text-stone-100">
                    {c.author}
                  </span>
                  {!hideEndpointLabel && (
                    <span className="font-mono text-xs text-stone-500">
                      {c.endpoint}
                    </span>
                  )}
                  <span className="ml-auto text-xs text-stone-400">
                    {timeAgo(c.createdAt)}
                  </span>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-stone-700 dark:text-stone-300">
                  <RenderWithMentions text={c.text} memberNames={memberNames} />
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="relative rounded-lg border border-stone-200/70 bg-white/70 backdrop-blur p-2 dark:border-stone-800/70 dark:bg-stone-900/60">
        <Textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          rows={2}
          placeholder={
            members.length > 0
              ? "Write a comment… use @ to mention"
              : "Write a comment…"
          }
          className="border-0 bg-transparent shadow-none focus-visible:ring-0"
        />
        {mentionState.open && candidates.length > 0 && (
          <div className="absolute bottom-full left-2 z-10 mb-1 w-60 overflow-hidden rounded-md border border-stone-200/80 bg-white shadow-lg dark:border-stone-800/80 dark:bg-stone-900">
            {candidates.map((m, i) => {
              const active = i === mentionState.highlight;
              return (
                <button
                  key={m.id}
                  type="button"
                  onMouseEnter={() =>
                    setMentionState((s) => ({ ...s, highlight: i }))
                  }
                  onClick={() => insertMention(m.name)}
                  className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm ${
                    active
                      ? "bg-orange-50 text-stone-900 dark:bg-stone-800 dark:text-stone-100"
                      : "text-stone-700 dark:text-stone-300"
                  }`}
                >
                  <Avatar name={m.name} size="sm" />
                  <span className="flex-1 truncate">{m.name}</span>
                  <RoleBadge role={m.role} />
                </button>
              );
            })}
          </div>
        )}
        <div className="mt-2 flex justify-end">
          <Button size="sm" onClick={submit} disabled={!text.trim()}>
            <Send className="h-3.5 w-3.5" /> Post
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Render comment text with @Name occurrences highlighted as inline badges.
 */
function RenderWithMentions({
  text,
  memberNames,
}: {
  text: string;
  memberNames: string[];
}) {
  if (memberNames.length === 0) return <>{text}</>;
  // Sort longer names first so "@Mony Pich" wins over "@Mony"
  const sorted = [...memberNames].sort((a, b) => b.length - a.length);
  const escaped = sorted.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp(`@(${escaped.join("|")})\\b`, "g");
  const parts: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(
      <span
        key={m.index}
        className="rounded bg-blue-100 px-1 py-0.5 text-[12px] font-medium text-blue-700 dark:bg-blue-950/60 dark:text-blue-200"
      >
        @{m[1]}
      </span>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

function extractMentions(text: string, memberNames: string[]): string[] {
  if (memberNames.length === 0) return [];
  const sorted = [...memberNames].sort((a, b) => b.length - a.length);
  const escaped = sorted.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp(`@(${escaped.join("|")})\\b`, "g");
  const out = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    out.add(m[1]);
  }
  return Array.from(out);
}
