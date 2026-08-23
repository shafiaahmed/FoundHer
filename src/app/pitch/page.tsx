import Link from "next/link";

export default function PitchPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-14">
      <div className="rounded-2xl border border-violet-100 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">
          FoundHer
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-stone-900">Find women who get it.</h1>
        <p className="mt-3 max-w-2xl leading-7 text-stone-600">
          FoundHer helps women in tech discover peers, build meaningful connections, join events,
          and find people to learn and create with.
        </p>
        <Link
          href="/discover"
          className="mt-6 inline-block rounded-full bg-violet-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-800"
        >
          Explore FoundHer
        </Link>
      </div>
    </main>
  );
}
