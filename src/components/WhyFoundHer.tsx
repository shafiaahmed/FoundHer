const STATS = [
  {
    value: "52%",
    label: "of highly qualified women in science, engineering, and tech eventually leave their field.",
    source: "Harvard Business Review, \"The Athena Factor\" (Hewlett, Buck Luce & Servon)",
    href: "https://hbr.org/2008/06/stopping-the-exodus-of-women-in-science",
  },
  {
    value: "~50%",
    label: "of technical women report lacking a mentor, and 84% report lacking a sponsor.",
    source: "Harvard Business Review, \"The Athena Factor\"",
    href: "https://hbr.org/2008/06/stopping-the-exodus-of-women-in-science",
  },
  {
    value: "26%",
    label: "of U.S. computing occupations are held by women, a share that has barely moved in over a decade.",
    source: "National Center for Women & Information Technology (NCWIT)",
    href: "https://ncwit.org/resource/scorecard/",
  },
];

export function WhyFoundHer() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
          Why this matters
        </h2>
        <p className="mt-3 text-stone-600">
          The Athena Factor study found the top drivers of women leaving tech are isolation from
          being the only woman on a team, and a lack of mentors who&apos;ve faced the same path.
          FoundHer exists to close that gap at the university level, before the exodus starts.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
          >
            <p className="text-4xl font-bold text-violet-700">{stat.value}</p>
            <p className="mt-2 text-sm leading-relaxed text-stone-700">{stat.label}</p>
            <a
              href={stat.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block text-xs font-medium text-stone-400 underline decoration-stone-300 underline-offset-2 transition hover:text-violet-600"
            >
              {stat.source}
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
