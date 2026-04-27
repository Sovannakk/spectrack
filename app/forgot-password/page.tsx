"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth-shell";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OTPInput } from "@/components/otp-input";

type Step = "email" | "otp" | "reset";

const emailSchema = z.string().email("Enter a valid email");
const passwordSchema = z
  .object({
    password: z.string().min(6, "Min 6 characters"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    path: ["confirm"],
    message: "Passwords don't match",
  });

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = React.useState<Step>("email");
  const [email, setEmail] = React.useState("");
  const [emailErr, setEmailErr] = React.useState<string | null>(null);
  const [otp, setOtp] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [resetErrs, setResetErrs] = React.useState<{
    password?: string;
    confirm?: string;
  }>({});

  return (
    <AuthShell
      title={
        step === "email"
          ? "Reset your password"
          : step === "otp"
            ? "Enter the OTP code"
            : "Choose a new password"
      }
      subtitle={
        step === "email"
          ? "We'll send a 6-digit code to your email"
          : step === "otp"
            ? `Code sent to ${email}`
            : "Make it strong and easy to remember"
      }
      footer={
        <Link
          href="/sign-in"
          className="font-medium text-orange-600 hover:underline"
        >
          Back to sign in
        </Link>
      }
    >
      {step === "email" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const result = emailSchema.safeParse(email);
            if (!result.success) {
              setEmailErr(result.error.issues[0]?.message ?? "Invalid email");
              return;
            }
            setEmailErr(null);
            setStep("otp");
            toast.success("Verification code sent");
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {emailErr && <p className="text-xs text-red-500">{emailErr}</p>}
          </div>
          <Button type="submit" className="w-full">
            Send code
          </Button>
        </form>
      )}

      {step === "otp" && (
        <div className="space-y-5">
          <OTPInput
            value={otp}
            onChange={setOtp}
            onComplete={() => {
              toast.success("Code verified");
              setStep("reset");
            }}
          />
          <p className="text-center text-xs text-stone-500">
            Any 6-digit code is accepted in this demo.
          </p>
          <Button
            variant="outline"
            type="button"
            className="w-full"
            onClick={() => otp.length === 6 && setStep("reset")}
            disabled={otp.length !== 6}
          >
            Continue
          </Button>
        </div>
      )}

      {step === "reset" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const result = passwordSchema.safeParse({ password, confirm });
            if (!result.success) {
              const fieldErrs: { password?: string; confirm?: string } = {};
              for (const issue of result.error.issues) {
                const path = issue.path[0] as "password" | "confirm";
                fieldErrs[path] = issue.message;
              }
              setResetErrs(fieldErrs);
              return;
            }
            setResetErrs({});
            toast.success("Password updated");
            router.push("/sign-in");
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {resetErrs.password && (
              <p className="text-xs text-red-500">{resetErrs.password}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm">Confirm password</Label>
            <Input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            {resetErrs.confirm && (
              <p className="text-xs text-red-500">{resetErrs.confirm}</p>
            )}
          </div>
          <Button type="submit" className="w-full">
            Update password
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
