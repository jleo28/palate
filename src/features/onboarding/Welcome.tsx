import { useNavigate } from "react-router-dom";
import { Wordmark } from "../../components/Wordmark";

export function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-tray px-6 text-center">
      <Wordmark size="large" />
      <p className="max-w-xs text-base text-ink-soft">
        Know what to put on your plate before you walk in.
      </p>
      <button
        type="button"
        onClick={() => navigate("/onboarding")}
        className="tap-target rounded-chip bg-cardinal px-8 py-3 font-display text-base text-plate"
      >
        Get started
      </button>
    </div>
  );
}
