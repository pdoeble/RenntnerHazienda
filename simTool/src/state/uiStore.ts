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
  | "liquidity"
  | "contributions"
  | "cashflow"
  | "debt"
  | "timeline";

export const VISUALIZATION_TAB_ORDER: VisualizationTab[] = [
  "dashboard",
  "capitalNeed",
  "liquidity",
  "contributions",
  "cashflow",
  "debt",
  "timeline"
];

export const VISUALIZATION_LABELS: Record<VisualizationTab, string> = {
  dashboard: "Dashboard",
  capitalNeed: "Kapitalbedarf",
  liquidity: "Liquiditaet",
  contributions: "Beitraege",
  cashflow: "Cashflow",
  debt: "Schulden",
  timeline: "Zeitachse"
};
