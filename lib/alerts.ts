"use client";

import { toast } from "sonner";
import { useAppStore } from "./store";

/**
 * WORK-04 / WORK-05 — simulate email + telegram alert side-effects.
 * Call after a primary action toast for events that would notify other people.
 */
export function fireAlerts(emailMessage: string, telegramMessage?: string) {
  const handle =
    useAppStore.getState().currentUser.telegramHandle ?? "@apilens_bot";
  const telegramOn = useAppStore.getState().currentUser.telegramEnabled;

  // Email is always sent
  toast.message(emailMessage, {
    icon: "✉️",
    description: "Sent via email",
    duration: 3500,
  });

  if (telegramOn) {
    toast.message(telegramMessage ?? emailMessage, {
      icon: "📨",
      description: `Telegram alert · ${handle}`,
      duration: 3500,
      style: {
        background:
          "linear-gradient(135deg, rgba(45, 212, 191, 0.12), rgba(124, 58, 237, 0.12))",
        borderColor: "rgba(124, 58, 237, 0.4)",
      },
    });
  }
}
