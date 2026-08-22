import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-24 right-[-10%] h-80 w-80 rounded-full bg-violet-200/50 blur-3xl" />
      <div className="pointer-events-none absolute top-40 left-[-10%] h-72 w-72 rounded-full bg-amber-100/60 blur-3xl" />

      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-6 py-24 text-center sm:py-32">
        <span className="animate-fade-in-up mb-6 inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-sm font-medium text-violet-800">
          For women in tech, by women in tech
        </span>

        <h1 className="animate-fade-in-up text-5xl font-semibold tracking-tight text-stone-900 sm:text-7xl">
          Found<span className="text-violet-600">Her</span>
        </h1>

        <p className="animate-fade-in-up mt-5 text-xl font-medium text-violet-800 sm:text-2xl">
          Find women who&apos;ve been there.
        </p>

        <p className="animate-fade-in-up mt-6 max-w-2xl text-balance text-base leading-relaxed text-stone-600 sm:text-lg">
          FoundHer connects women in tech with peers, mentors, study partners, hackathon
          teammates, and women who share their experiences &mdash; all at your own university.
          Whatever you&apos;re facing, find a woman who&apos;s been there.
        </p>

        <div className="animate-fade-in-up mt-10 flex flex-col items-center gap-3 sm:flex-row">
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
