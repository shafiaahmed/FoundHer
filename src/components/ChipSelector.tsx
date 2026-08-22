"use client";

interface ChipSelectorProps {
  options: string[];
  selected: string[];
  onToggle: (option: string) => void;
  compact?: boolean;
}

export function ChipSelector({ options, selected, onToggle, compact = false }: ChipSelectorProps) {
  return (
    <div className={`flex flex-wrap ${compact ? "gap-1.5" : "gap-2.5"}`}>
      {options.map((option) => {
        const isSelected = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            aria-pressed={isSelected}
            className={`rounded-full border font-medium transition ${
              compact ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"
            } ${
              isSelected
                ? "border-violet-600 bg-violet-600 text-white shadow-sm"
                : "border-stone-300 bg-white text-stone-700 hover:border-violet-300 hover:bg-violet-50"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
