"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { GlobalNav } from "@/components/global-nav";
import { useAppStore } from "@/lib/store";
import { usePageLoader } from "@/components/page-loader";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { RoleBadge } from "@/components/role-badge";
import { ConfirmModal } from "@/components/confirm-modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Send } from "lucide-react";
import { formatDate } from "@/lib/utils";

const profileSchema = z.object({
  name: z.string().min(2, "Enter your name"),
});

type ProfileValues = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    current: z.string().min(6, "Min 6 characters"),
    next: z.string().min(6, "Min 6 characters"),
    confirm: z.string(),
  })
  .refine((d) => d.next === d.confirm, {
    path: ["confirm"],
    message: "Passwords don't match",
  });

type PasswordValues = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const loading = usePageLoader();
  const user = useAppStore((s) => s.currentUser);
  const updateCurrentUser = useAppStore((s) => s.updateCurrentUser);
  const [connectOpen, setConnectOpen] = React.useState(false);
  const [disconnectOpen, setDisconnectOpen] = React.useState(false);
  const [tgHandle, setTgHandle] = React.useState(
    user.telegramHandle ?? "@sovannak_bot",
  );

  React.useEffect(() => {
    setTgHandle(user.telegramHandle ?? "@sovannak_bot");
  }, [user.telegramHandle]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name },
  });

  React.useEffect(() => {
    reset({ name: user.name });
  }, [user.name, reset]);

  const {
    register: regPwd,
    handleSubmit: handlePwd,
    formState: { errors: pwdErrors },
    reset: resetPwd,
  } = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) });

  return (
    <div className="min-h-screen">
      <GlobalNav trail={[{ label: "Profile" }]} />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
        {loading ? (
          <Skeleton className="h-96" />
        ) : (
          <>
            <Card>
              <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:gap-6">
                <Avatar name={user.name} size="xl" />
                <div className="text-center sm:text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
                      {user.name}
                    </h1>
                    <RoleBadge role={user.role} />
                  </div>
                  <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
                    {user.email}
                  </p>
                  <p className="mt-1 text-xs text-stone-500">
                    Joined {formatDate(user.joinedAt)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleSubmit((v) => {
                    updateCurrentUser({ name: v.name });
                    toast.success("Profile updated");
                  })}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Full name</Label>
                    <Input id="name" {...register("name")} />
                    {errors.name && (
                      <p className="text-xs text-red-500">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                  <Button type="submit">Save</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="telegram">Telegram notifications</Label>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      Receive approval and comment alerts on Telegram.
                    </p>
                  </div>
                  <Switch
                    id="telegram"
                    checked={!!user.telegramEnabled}
                    onCheckedChange={(c) => {
                      if (c) setConnectOpen(true);
                      else setDisconnectOpen(true);
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Change password</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handlePwd(() => {
                    toast.success("Password updated");
                    resetPwd();
                  })}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <Label htmlFor="current">Current password</Label>
                    <Input
                      id="current"
                      type="password"
                      {...regPwd("current")}
                    />
                    {pwdErrors.current && (
                      <p className="text-xs text-red-500">
                        {pwdErrors.current.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="next">New password</Label>
                    <Input id="next" type="password" {...regPwd("next")} />
                    {pwdErrors.next && (
                      <p className="text-xs text-red-500">
                        {pwdErrors.next.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="confirm">Confirm new password</Label>
                    <Input
                      id="confirm"
                      type="password"
                      {...regPwd("confirm")}
                    />
                    {pwdErrors.confirm && (
                      <p className="text-xs text-red-500">
                        {pwdErrors.confirm.message}
                      </p>
                    )}
                  </div>
                  <Button type="submit">Update password</Button>
                </form>
              </CardContent>
            </Card>
          </>
        )}
      </main>

      <Dialog open={connectOpen} onOpenChange={setConnectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect Telegram bot</DialogTitle>
            <DialogDescription>
              Receive approval, rejection, and comment alerts on Telegram.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="tgHandle">Telegram username</Label>
            <Input
              id="tgHandle"
              value={tgHandle}
              onChange={(e) => setTgHandle(e.target.value)}
              placeholder="@username"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConnectOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                updateCurrentUser({
                  telegramEnabled: true,
                  telegramHandle: tgHandle.trim() || "@apilens_bot",
                });
                toast.success("Telegram connected", {
                  icon: <Send className="h-4 w-4 text-orange-500" />,
                });
                setConnectOpen(false);
              }}
            >
              <Send className="h-4 w-4" /> Connect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmModal
        open={disconnectOpen}
        onOpenChange={setDisconnectOpen}
        title="Disconnect Telegram?"
        description="You'll no longer receive alerts on Telegram. You can reconnect anytime."
        confirmLabel="Disconnect"
        destructive
        onConfirm={() => {
          updateCurrentUser({ telegramEnabled: false });
          toast.success("Telegram disconnected");
        }}
      />
    </div>
  );
}
