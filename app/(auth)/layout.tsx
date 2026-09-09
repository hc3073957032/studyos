import Link from "next/link";
import { CircleDot } from "lucide-react";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-canvas px-4 py-10">
      <main className="mx-auto w-full max-w-sm">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-secondary transition-colors hover:text-ink"
        >
          <CircleDot className="size-5 text-accent" strokeWidth={2.2} aria-hidden />
          <span className="text-sm font-semibold tracking-normal">StudyOS</span>
        </Link>
        {children}
      </main>
    </div>
  );
}
