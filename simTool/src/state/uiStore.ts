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
  | "wiki";

export const VISUALIZATION_TAB_ORDER: VisualizationTab[] = [
  "dashboard",
  "capitalNeed",
  "contributions",
  "points",
  "myShare",
  "occupancy",
  "cashflow",
  "debt",
  "wiki"
];

export const VISUALIZATION_LABELS: Record<VisualizationTab, string> = {
  dashboard: "Uebersicht",
  capitalNeed: "Mittelherkunft / Mittelverwendung",
  contributions: "Beitraege / Nutzung",
  points: "Punkte",
  myShare: "Mein Anteil",
  occupancy: "Belegung",
  cashflow: "Bankkonto-Zahlungsfluss",
  debt: "Darlehen / Banksicht",
  wiki: "Wiki"
};
