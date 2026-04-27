"use client";

import * as React from "react";
import { Send } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/utils";
import type { Comment } from "@/lib/types";

interface Props {
  comments: Comment[];
  endpoint?: string;
  endpointId?: string;
  hideEndpointLabel?: boolean;
  onSubmit: (input: {
    endpoint: string;
    endpointId?: string;
    text: string;
  }) => void;
}

export function CommentThread({
  comments,
  endpoint,
  endpointId,
  hideEndpointLabel,
  onSubmit,
}: Props) {
  const [text, setText] = React.useState("");

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit({
      endpoint: endpoint ?? "general",
      endpointId,
      text: trimmed,
    });
    setText("");
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
                <p className="mt-1 text-sm text-stone-700 dark:text-stone-300">
                  {c.text}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="rounded-lg border border-stone-200/70 bg-white/70 backdrop-blur p-2 dark:border-stone-800/70 dark:bg-stone-900/60">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          placeholder="Write a comment…"
          className="border-0 bg-transparent shadow-none focus-visible:ring-0"
        />
        <div className="mt-2 flex justify-end">
          <Button size="sm" onClick={submit} disabled={!text.trim()}>
            <Send className="h-3.5 w-3.5" /> Post
          </Button>
        </div>
      </div>
    </div>
  );
}
