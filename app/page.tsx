import { CircleDot } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-6">
      <section className="w-full max-w-xl border border-line bg-surface p-8">
        <div className="flex items-center gap-3 text-secondary">
          <CircleDot className="size-5 text-accent" strokeWidth={2.2} aria-hidden />
          <span className="text-sm font-medium">StudyOS</span>
        </div>
        <h1 className="mt-8 text-3xl font-semibold tracking-normal text-ink">
          Phase 0 is ready.
        </h1>
        <p className="mt-3 text-[15px] leading-7 text-secondary">
          Next.js, TypeScript, Tailwind CSS and the base design system are installed.
        </p>
      </section>
    </main>
  );
}
