"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth-shell";
import { OTPInput } from "@/components/otp-input";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [otp, setOtp] = React.useState("");
  const [seconds, setSeconds] = React.useState(60);

  React.useEffect(() => {
    if (seconds <= 0) return;
    const t = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [seconds]);

  const completed = (code: string) => {
    if (code.length === 6) {
      toast.success("Email verified");
      router.push("/projects");
    }
  };

  return (
    <AuthShell
      title="Verify your email"
      subtitle="Enter the 6-digit code we sent to your inbox"
      footer={
        <Link
          href="/sign-in"
          className="font-medium text-orange-600 hover:underline"
        >
          Back to sign in
        </Link>
      }
    >
      <div className="space-y-5">
        <OTPInput value={otp} onChange={setOtp} onComplete={completed} />

        <p className="text-center text-sm text-stone-500">
          Didn't get the code?{" "}
          <button
            type="button"
            disabled={seconds > 0}
            onClick={() => {
              setSeconds(60);
              toast.success("New code sent");
            }}
            className="font-medium text-orange-600 disabled:text-stone-400"
          >
            {seconds > 0 ? `Resend in ${seconds}s` : "Resend"}
          </button>
        </p>

        <Button
          className="w-full"
          onClick={() => completed(otp)}
          disabled={otp.length !== 6}
        >
          Verify email
        </Button>
      </div>
    </AuthShell>
  );
}
