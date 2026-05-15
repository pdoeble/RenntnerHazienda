import { CircleCheck } from "lucide-react";
import type { DirtyState } from "../../state/projectStore";

type DirtyStateIndicatorProps = {
  dirtyState: DirtyState;
};

export function DirtyStateIndicator({ dirtyState }: DirtyStateIndicatorProps) {
  const hasDirtyEntries = Object.values(dirtyState).some(Boolean);

  return (
    <span className={hasDirtyEntries ? "status-pill dirty" : "status-pill clean"}>
      <CircleCheck aria-hidden="true" size={15} />
      {hasDirtyEntries ? "Ungespeicherte Aenderungen" : "Keine lokalen Aenderungen"}
    </span>
  );
}
