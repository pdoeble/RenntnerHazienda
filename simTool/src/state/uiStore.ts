import type { TemplateKind } from "../domain/templates";

export const INPUT_TAB_ORDER: TemplateKind[] = [
  "ownership",
  "legalForm",
  "capex",
  "property",
  "closingCosts",
  "financing",
  "strategy",
  "opex"
];

export type VisualizationTab =
  | "dashboard"
  | "capitalNeed"
  | "contributions"
  | "points"
  | "myShare"
  | "occupancy"
  | "cashflow"
  | "debt"
  | "wiki"
  | "timeline";

export const VISUALIZATION_TAB_ORDER: VisualizationTab[] = [
  "dashboard",
  "capitalNeed",
  "contributions",
  "points",
  "myShare",
  "occupancy",
  "cashflow",
  "debt",
  "wiki",
  "timeline"
];

export const VISUALIZATION_LABELS: Record<VisualizationTab, string> = {
  dashboard: "Dashboard",
  capitalNeed: "Kapitalbedarf",
  contributions: "Beitraege",
  points: "Punkte",
  myShare: "Mein Anteil",
  occupancy: "Belegung",
  cashflow: "Cashflow",
  debt: "Darlehen",
  wiki: "Wiki",
  timeline: "Zeitachse"
};
