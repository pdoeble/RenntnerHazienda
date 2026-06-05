import { CircleHelp, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

type HelpPopoverProps = {
  label: string;
  children: string;
};

export function HelpPopover({ label, children }: HelpPopoverProps) {
  const [open, setOpen] = useState(false);
  const popoverId = useId();
  const rootRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <span className="help-popover" ref={rootRef}>
      <button
        aria-controls={popoverId}
        aria-expanded={open}
        aria-label={`${label} erklaeren`}
        className="help-popover-button"
        type="button"
        onClick={() => setOpen((current) => !current)}
      >
        <CircleHelp size={15} aria-hidden="true" />
      </button>
      {open ? (
        <span className="help-popover-panel" id={popoverId} role="dialog">
          <button
            aria-label="Hilfe schliessen"
            className="help-popover-close"
            type="button"
            onClick={() => setOpen(false)}
          >
            <X size={14} aria-hidden="true" />
          </button>
          <span>{children}</span>
        </span>
      ) : null}
    </span>
  );
}
