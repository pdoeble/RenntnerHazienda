import {
  CURRENT_TEMPLATE_VERSION,
  DEFAULT_TEMPLATE_TIMESTAMP
} from "../common";
import type { ClosingCostsTemplate } from "./types";

export const defaultClosingCostsTemplate: ClosingCostsTemplate = {
  schema: "immo-finance.closing-costs",
  version: CURRENT_TEMPLATE_VERSION,
  id: "closing-costs-demo-at",
  name: "Demo Nebenkosten",
  description: "Oesterreichische Beispielwerte fuer Erwerbsnebenkosten.",
  createdAt: DEFAULT_TEMPLATE_TIMESTAMP,
  updatedAt: DEFAULT_TEMPLATE_TIMESTAMP,
  data: {
    realEstateTransferTaxPct: 3.5,
    notaryPct: 1.5,
    landRegistryPct: 1.1,
    brokerPct: 0,
    otherCosts: []
  }
};
