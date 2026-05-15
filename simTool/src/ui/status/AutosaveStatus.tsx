import { Clock3 } from "lucide-react";
import { autosaveNotImplementedStatus } from "../../state/autosaveStore";

export function AutosaveStatus() {
  return (
    <span className="status-pill" title={autosaveNotImplementedStatus}>
      <Clock3 aria-hidden="true" size={15} />
      Autosave vorbereitet
    </span>
  );
}
