const STAGES = [
  { name: "Seedling", days: 0 },
  { name: "Sprout", days: 2 },
  { name: "Growing", days: 5 },
  { name: "Full grown", days: 10 },
] as const;

function petStage(completedDays: number) {
  let stage = 0;
  for (const [index, milestone] of STAGES.entries()) {
    if (completedDays >= milestone.days) stage = index;
  }
  return stage;
}

export function GoalPet({ completedDays, metToday, weeklyDays }: { completedDays: number; metToday: boolean; weeklyDays: number }) {
  const stage = petStage(completedDays);
  const current = STAGES[stage] ?? STAGES[0];
  const next = STAGES[stage + 1];
  const sizeClass = ["scale-[0.72]", "scale-[0.81]", "scale-90", "scale-100"][stage] ?? "scale-[0.72]";

  return (
    <section className="mt-5 overflow-hidden rounded-2xl border border-foreground/15 bg-card p-4">
      <div className="grid grid-cols-[1fr_8.5rem] items-center gap-3">
      <div>
        <p className="label-caps text-olive">Your 8te pal</p>
        <h2 className="mt-1 font-display text-lg font-bold">{current.name}</h2>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {metToday ? "Goal met today — your pal grew!" : "Hit today’s calories and protein to help it grow."}
        </p>
        <p className="mt-3 text-xs font-bold text-olive">
          {completedDays} goal {completedDays === 1 ? "day" : "days"}
          {next ? ` · ${next.days - completedDays} to ${next.name.toLowerCase()}` : " · fully grown"}
        </p>
      </div>

      <div className="relative grid h-32 place-items-center" aria-label={`${current.name} 8te pal after ${completedDays} completed goal days, ${weeklyDays} this week`}>
        <div className="absolute bottom-1 h-3 w-24 rounded-full bg-foreground/10" />
        <div className={`origin-bottom ${sizeClass}`}>
          <svg
            className={metToday ? "pet-celebrate h-32 w-32" : "h-32 w-32"}
            viewBox="0 0 140 140"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
          {stage >= 2 && <path className="fill-food-yolk stroke-foreground" strokeWidth="4" d="M28 28c-8-14 11-21 20-10 1-18 23-19 25-2 10-12 29-2 22 13Z" />}
          <path className="fill-card stroke-foreground" strokeWidth="4" d="M35 45c2-12 14-19 34-19s34 8 36 20l-5 66c-1 12-15 17-31 17s-30-5-31-17Z" />
          <path className="fill-food-veg stroke-foreground" strokeWidth="4" d="M36 57 23 23c-2-7 7-12 12-7l12 11 4-17c2-8 11-8 15-2l7 14 10-12c5-6 14-1 12 7l-9 40Z" />
          <path className="stroke-foreground" strokeWidth="4" d="M37 88 24 84m78 4 13-4M51 127l-2 9m39-9 2 9" />
          <circle className="fill-foreground" cx="59" cy="86" r="3.5" stroke="none" />
          <circle className="fill-foreground" cx="83" cy="86" r="3.5" stroke="none" />
          <path className="stroke-foreground" strokeWidth="3" d="M67 94c3 3 6 3 9 0" />
          <circle className="fill-food-fruit/60" cx="49" cy="96" r="5" stroke="none" />
          <circle className="fill-food-fruit/60" cx="93" cy="96" r="5" stroke="none" />
          {stage >= 1 && <path className="stroke-food-veg-ink" strokeWidth="3" d="m49 47 8-21m13 21 5-24m8 26 5-21" />}
          {stage >= 3 && (
            <>
              <path className="fill-food-fruit stroke-foreground" strokeWidth="2.5" d="M106 26c12-4 18 10 8 18-10-7-14-12-8-18Z" />
              <path className="stroke-foreground" strokeWidth="2.5" d="m104 25-7-7" />
            </>
          )}
           {weeklyDays >= 3 && (
             <>
               <circle className="fill-food-fruit stroke-foreground" cx="93" cy="108" r="9" strokeWidth="2.5" />
               <path className="stroke-foreground" strokeWidth="2" d="m89 108 3 3 5-7" />
             </>
           )}
           {weeklyDays >= 5 && <path className="fill-food-yolk stroke-foreground" strokeWidth="3" d="M31 105c11 8 66 8 78 0l-4 11c-18 8-50 8-69 0Z" />}
           {weeklyDays >= 7 && (
             <>
               <path className="fill-foreground" strokeWidth="0" d="M48 80h20v12H48Zm26 0h20v12H74Z" />
               <path className="stroke-foreground" strokeWidth="3" d="M68 84h6m-26 0-7-2m53 2 7-2" />
             </>
           )}
          </svg>
        </div>
      </div>
      </div>
      <div className="mt-3 border-t border-foreground/10 pt-3">
        <div className="mb-2 flex items-center justify-between text-xs font-bold">
          <span>This week</span><span className="text-olive">{weeklyDays}/7 goal days</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[[3, "Campus pin"], [5, "USC scarf"], [7, "Sunglasses"]].map(([days, label]) => (
            <div key={label} className={`rounded-lg border px-2 py-2 text-center text-[0.65rem] font-semibold ${weeklyDays >= Number(days) ? "border-olive bg-olive-soft text-olive" : "border-foreground/10 text-muted-foreground"}`}>
              {label}<span className="mt-0.5 block text-[0.6rem]">{days} days</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}