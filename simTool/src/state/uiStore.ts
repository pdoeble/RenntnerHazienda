import type { TemplateKind } from "../domain/templates";

export const INPUT_TAB_ORDER: TemplateKind[] = [
  "ownership",
  "legalForm",
  "capex",
  "property",
  "closingCosts",
  "opex"
];

export type VisualizationTab = "liquidity" | "contributions" | "cashflow" | "debt";

export const VISUALIZATION_TAB_ORDER: VisualizationTab[] = [
  "liquidity",
  "contributions",
  "cashflow",
  "debt"
];

export const VISUALIZATION_LABELS: Record<VisualizationTab, string> = {
  liquidity: "Liquiditaet",
  contributions: "Beitraege",
  cashflow: "Cashflow",
  debt: "Schulden"
};
