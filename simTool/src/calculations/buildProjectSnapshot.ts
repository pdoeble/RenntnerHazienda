import type { ProjectState } from "../state/projectStore";
import type { ProjectSnapshot } from "./types";

export function buildProjectSnapshot(
  projectState: ProjectState,
  metadata: Partial<ProjectSnapshot["metadata"]> = {}
): ProjectSnapshot {
  return {
    ...projectState,
    metadata: {
      currency: "EUR",
      locale: "de-DE",
      timeHorizonMonths: 360,
      calculatedAt:
        metadata.calculatedAt ?? "2026-05-15T00:00:00.000Z",
      ...metadata
    }
  };
}
