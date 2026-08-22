import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-violet-100 bg-[#faf8f6]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight text-violet-900">
          Found<span className="text-violet-500">Her</span>
        </Link>
        <nav className="flex items-center gap-2 text-sm font-medium">
          <Link
            href="/discover"
            className="rounded-full px-4 py-2 text-stone-600 transition hover:bg-violet-50 hover:text-violet-800"
          >
            Discover
          </Link>
          <Link
            href="/onboarding"
            className="rounded-full bg-violet-700 px-4 py-2 text-white shadow-sm transition hover:bg-violet-800"
          >
            Find My Circle
          </Link>
        </nav>
      </div>
    </header>
  );
}
