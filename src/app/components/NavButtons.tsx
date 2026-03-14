import { useNavigate } from "react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface NavButtonsProps {
  /** Explicit path to navigate back to. Falls back to browser history if omitted. */
  backTo?: string;
  /** Explicit path to navigate forward to. Falls back to browser history if omitted. */
  forwardTo?: string;
}

export function NavButtons({ backTo, forwardTo }: NavButtonsProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-0.5">
      <button
        onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
        className="size-7 flex items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
        aria-label="Go back"
      >
        <ChevronLeft className="size-4" />
      </button>
      <button
        onClick={() => (forwardTo ? navigate(forwardTo) : navigate(1))}
        className="size-7 flex items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
        aria-label="Go forward"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}
