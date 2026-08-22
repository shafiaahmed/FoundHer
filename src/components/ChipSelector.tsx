"use client";

interface ChipSelectorProps {
  options: string[];
  selected: string[];
  onToggle: (option: string) => void;
}

export function ChipSelector({ options, selected, onToggle }: ChipSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {options.map((option) => {
        const isSelected = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            aria-pressed={isSelected}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
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
