interface SelectCardProps {
  selected: boolean;
  onClick: () => void;
  emoji: string;
  label: string;
}

export function SelectCard({ selected, onClick, emoji, label }: SelectCardProps) {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-2 ${
        selected
          ? 'border-primary bg-primary/5 shadow-soft'
          : 'border-border bg-card hover:border-primary/50'
      }`}
    >
      <span className="text-2xl">{emoji}</span>
      <span className={`text-sm font-medium ${
        selected ? 'text-primary' : 'text-foreground'
      }`}>
        {label}
      </span>
    </button>
  );
}
