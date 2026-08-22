export function MatchBadge({ score }: { score: number }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-violet-50 px-3 py-2 text-center">
      <span className="text-lg font-bold leading-none text-violet-700">{score}%</span>
      <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-violet-500">
        Match
      </span>
    </div>
  );
}
