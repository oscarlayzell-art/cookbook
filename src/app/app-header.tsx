import Link from "next/link";
import { Logo } from "./logo";

/** Sky band with the logo and account links, shown across the signed-in pages. */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[linear-gradient(to_bottom,#bae6fd_0,#e0f2fe_160px,#f5faff_420px)]">
      <header className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 pt-5">
        <Link href="/book" aria-label="My cookbook">
          <Logo />
        </Link>
        <nav className="flex gap-2 text-sm font-medium">
          <Link href="/book/prices" className="rounded-full bg-white/70 px-3 py-1.5 text-sky-900 hover:bg-white">
            My prices
          </Link>
          <Link href="/account" className="rounded-full bg-white/70 px-3 py-1.5 text-sky-900 hover:bg-white">
            My account
          </Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
