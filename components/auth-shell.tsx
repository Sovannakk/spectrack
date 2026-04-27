import { Brand } from "@/components/brand";

interface Props {
  title: string;
  subtitle?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export function AuthShell({ title, subtitle, footer, children }: Props) {
  return (
    <div className="relative flex min-h-screen w-full overflow-hidden">
      {/* extra warm aurora behind the auth card */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-br from-orange-300/60 via-orange-400/40 to-orange-500/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[320px] w-[420px] rounded-full bg-orange-200/50 blur-3xl" />
      <div className="bg-dots absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />

      <div className="relative m-auto w-full max-w-md px-6 py-12">
        <div className="mb-8 flex justify-center">
          <Brand size="lg" />
        </div>
        <div className="glass-strong rounded-2xl p-8">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1.5 text-sm text-stone-500 dark:text-stone-400">
                {subtitle}
              </p>
            )}
          </div>
          {children}
        </div>
        {footer && (
          <p className="mt-6 text-center text-sm text-stone-500 dark:text-stone-400">
            {footer}
          </p>
        )}
      </div>
    </div>
  );
}
