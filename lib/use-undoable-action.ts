"use client";

import * as React from "react";
import { toast } from "sonner";

interface ToastOpts {
  message: string;
  onUndo: () => void;
  restoredMessage?: string;
  undoWindowMs?: number;
}

/**
 * UX-QW-02 — show an "undo" toast for an optimistic destructive action.
 * The caller is expected to have already mutated state; the `onUndo`
 * callback is invoked if the user clicks Undo within `undoWindowMs`.
 */
export function undoableToast({
  message,
  onUndo,
  restoredMessage = "Restored",
  undoWindowMs = 5000,
}: ToastOpts): void {
  let undone = false;
  toast(message, {
    duration: undoWindowMs,
    action: {
      label: "Undo",
      onClick: () => {
        if (undone) return;
        undone = true;
        onUndo();
        toast.success(restoredMessage);
      },
    },
  });
}

interface HookOpts {
  /** Performs the optimistic mutation. */
  action: () => void;
  /** Reverses it on undo. */
  undo: () => void;
  toastMessage: string;
  restoredMessage?: string;
  undoWindowMs?: number;
}

/**
 * Hook variant of {@link undoableToast}. Useful when the action and undo
 * callbacks reference long-lived data that doesn't change between renders.
 */
export function useUndoableAction({
  action,
  undo,
  toastMessage,
  restoredMessage,
  undoWindowMs,
}: HookOpts) {
  const actionRef = React.useRef(action);
  const undoRef = React.useRef(undo);
  React.useEffect(() => {
    actionRef.current = action;
    undoRef.current = undo;
  }, [action, undo]);

  const execute = React.useCallback(() => {
    actionRef.current();
    undoableToast({
      message: toastMessage,
      onUndo: () => undoRef.current(),
      restoredMessage,
      undoWindowMs,
    });
  }, [toastMessage, restoredMessage, undoWindowMs]);

  return { execute };
}
