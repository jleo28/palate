interface ProgressBarsProps {
  step: number;
  total: number;
}

export function ProgressBars({ step, total }: ProgressBarsProps) {
  return (
    <div className="flex gap-1.5" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={total}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-cardinal" : "bg-line"}`}
        />
      ))}
    </div>
  );
}
