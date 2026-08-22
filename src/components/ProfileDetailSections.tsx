export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">{title}</h2>
      {children}
    </div>
  );
}

const TONE_CLASSES = {
  neutral: "bg-stone-100 text-stone-600",
  amber: "bg-amber-50 text-amber-700",
  violet: "bg-violet-50 text-violet-700",
} as const;

export function TagList({
  tags,
  tone,
  emptyLabel = "None selected yet",
}: {
  tags: string[];
  tone: keyof typeof TONE_CLASSES;
  emptyLabel?: string;
}) {
  if (tags.length === 0) {
    return <p className="text-sm text-stone-400">{emptyLabel}</p>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <span key={tag} className={`rounded-full px-2.5 py-1 text-xs font-medium ${TONE_CLASSES[tone]}`}>
          {tag}
        </span>
      ))}
    </div>
  );
}
