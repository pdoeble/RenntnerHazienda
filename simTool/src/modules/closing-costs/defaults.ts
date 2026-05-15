import {
  CURRENT_TEMPLATE_VERSION,
  DEFAULT_TEMPLATE_TIMESTAMP
} from "../common";
import type { ClosingCostsTemplate } from "./types";

export const defaultClosingCostsTemplate: ClosingCostsTemplate = {
  schema: "immo-finance.closing-costs",
  version: CURRENT_TEMPLATE_VERSION,
  id: "closing-costs-demo-bw",
  name: "Demo Nebenkosten",
  description: "Neutrale Beispielwerte fuer Erwerbsnebenkosten.",
  createdAt: DEFAULT_TEMPLATE_TIMESTAMP,
  updatedAt: DEFAULT_TEMPLATE_TIMESTAMP,
  data: {
    realEstateTransferTaxPct: 5,
    notaryPct: 1.5,
    landRegistryPct: 0.5,
    brokerPct: 3.57,
    otherCosts: [
      {
        id: "closing-001",
        label: "Gutachten",
        amount: 2500,
        timingMonth: 0
      }
    ]
  }
};
