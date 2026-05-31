interface ScoreBarProps {
  label: string;
  value: number;
  maxValue: number;
  color?: string;
}

export function ScoreBar({ label, value, maxValue, color }: ScoreBarProps) {
  const pct = Math.min((value / maxValue) * 100, 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-foreground font-medium">{value.toFixed(2)}</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full animate-score-fill ${color || "bg-primary"}`}
          style={{ "--score-width": `${pct}%` } as React.CSSProperties}
        />
      </div>
    </div>
  );
}
