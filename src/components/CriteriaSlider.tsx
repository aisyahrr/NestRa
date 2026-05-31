interface CriteriaSliderProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
}

export function CriteriaSlider({ label, value, onChange }: CriteriaSliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-foreground font-medium">{label}</span>
        <span className="text-primary font-bold">{value}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none bg-muted cursor-pointer accent-primary"
      />
    </div>
  );
}
