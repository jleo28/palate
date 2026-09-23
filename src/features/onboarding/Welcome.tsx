import { useNavigate } from "react-router-dom";
import { Wordmark } from "../../components/Wordmark";
import { tap } from "../../lib/haptics";

export function Welcome() {
  const navigate = useNavigate();

  const start = () => {
    tap();
    navigate("/onboarding");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-7 bg-tray px-6 text-center">
      <Wordmark size="large" />
      <div className="flex flex-col gap-3">
        <h1 className="font-display text-xl text-ink">8teSC</h1>
        <p className="max-w-xs text-base text-ink-soft">
          Know what to put on your plate before you walk in.
        </p>
      </div>
      <button
        type="button"
        onClick={start}
        className="tap-target rounded-chip bg-accent px-8 py-3 font-display text-base text-plate"
      >
        Get started
      </button>
    </div>
  );
}
