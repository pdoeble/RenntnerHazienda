import type { TemplateRef } from "../domain/templates";
import type { ProjectState } from "./projectStore";

export type AutosaveRecord = {
  id: "current";
  projectName?: string;
  savedAt: string;
  projectState: ProjectState;
  loadedTemplateRefs?: Partial<Record<keyof ProjectState, TemplateRef>>;
};

export const autosaveNotImplementedStatus =
  "Autosave-Schnittstelle vorbereitet; IndexedDB-Adapter folgt in einem separaten Schritt.";
