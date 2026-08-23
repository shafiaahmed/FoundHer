import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#faf4f1] via-[#f5eff6] to-[#e9def0]">
      <div className="pointer-events-none absolute -top-24 right-[-10%] h-80 w-80 rounded-full bg-violet-200/50 blur-3xl" />
      <div className="pointer-events-none absolute top-40 left-[-10%] h-72 w-72 rounded-full bg-amber-100/60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 right-[12%] h-72 w-72 rounded-full bg-violet-200/35 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.7),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(92,40,95,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(92,40,95,0.05)_1px,transparent_1px)] [background-size:44px_44px]" />

      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-6 py-24 text-center sm:py-32">
        <div
          role="img"
          aria-label="Feminine magnifying glass logo"
          className="pointer-events-none absolute left-[7.5rem] top-[32%] z-0 flex h-48 w-48 -translate-y-1/2 items-center justify-center rounded-full border-[5px] border-violet-800/20 bg-violet-100/20 opacity-35 backdrop-blur-[1px] sm:left-[5.5rem] sm:h-64 sm:w-64"
        >
          <span className="absolute -bottom-8 -right-7 h-16 w-3 rotate-[-45deg] rounded-full bg-violet-800/15" />
        </div>

        <span className="relative z-10 animate-fade-in-up mb-8 inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-sm font-medium text-violet-800">
          Connect With Women Who Get It.
        </span>

        <h1 className="relative z-10 animate-fade-in-up text-5xl font-semibold tracking-tight text-stone-900 sm:text-7xl">
          Found<span className="text-violet-600">Her</span>
        </h1>

        <p className="relative z-10 animate-fade-in-up mt-7 text-xl font-medium text-violet-800 sm:text-2xl">
          Find Women Who&apos;ve Been There.
        </p>

        <p className="relative z-10 animate-fade-in-up mt-8 max-w-2xl text-balance text-base leading-relaxed text-stone-600 sm:text-lg">
          FoundHer connects women in tech with peers, mentors, study partners, hackathon
          teammates, and women who share their experiences.
          Whatever you&apos;re facing, find a woman who&apos;s been there.
        </p>

        <div className="relative z-10 animate-fade-in-up mt-12 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/onboarding"
            className="rounded-full bg-violet-700 px-8 py-3.5 text-base font-semibold text-white shadow-md shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-800 hover:shadow-lg"
          >
            Find My Circle
          </Link>
          <Link
            href="/discover"
            className="rounded-full border border-stone-300 bg-white px-8 py-3.5 text-base font-semibold text-stone-700 transition hover:-translate-y-0.5 hover:border-violet-300 hover:text-violet-800"
          >
            Explore profiles
          </Link>
        </div>
      </div>
    </section>
  );
}
