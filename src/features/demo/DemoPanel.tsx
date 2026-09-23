import { useNavigate } from "react-router-dom";
import { Sheet } from "../../components/Sheet";
import { useDemo } from "../../context/DemoContext";
import { useProfile } from "../../context/ProfileContext";
import { rotationWeek } from "../../core/menu";
import { sampleMenu } from "../../data/menu";

interface DemoPanelProps {
  open: boolean;
  onClose: () => void;
}

export function DemoPanel({ open, onClose }: DemoPanelProps) {
  const demo = useDemo();
  const { resetProfile } = useProfile();
  const navigate = useNavigate();
  const week = rotationWeek(sampleMenu, demo.date);

  const handleReset = () => {
    resetProfile();
    demo.clear();
    onClose();
    navigate("/");
  };

  return (
    <Sheet title="Demo panel" open={open} onClose={onClose}>
      <div className="flex flex-col gap-5">
        <p className="text-sm text-ink-soft">
          Jump the date and time to show the rotation live. Built for the Week 5 presentation.
        </p>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-ink-soft">Date</span>
          <input
            type="date"
            value={demo.date}
            onChange={(e) => demo.setDate(e.target.value)}
            className="tap-target rounded-row border border-line bg-plate px-3 text-base text-ink"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-ink-soft">Time</span>
          <input
            type="time"
            value={demo.time}
            onChange={(e) => demo.setTime(e.target.value)}
            className="tap-target rounded-row border border-line bg-plate px-3 text-base text-ink"
          />
        </label>

        <div className="rounded-row border border-line bg-tray px-3 py-2 text-sm text-ink-soft">
          Rotation week {week} of {sampleMenu.rotationWeeks}. Current meal: {demo.currentMeal}.
        </div>

        <div className="flex flex-col gap-2">
          {demo.isOverridden && (
            <button
              type="button"
              onClick={demo.clear}
              className="tap-target rounded-chip border border-line bg-plate font-display text-base text-ink"
            >
              Use real date and time
            </button>
          )}
          <button
            type="button"
            onClick={handleReset}
            className="tap-target rounded-chip border border-cardinal bg-plate font-display text-base text-cardinal"
          >
            Reset profile
          </button>
        </div>
      </div>
    </Sheet>
  );
}
