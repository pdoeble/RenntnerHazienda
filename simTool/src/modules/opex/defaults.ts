import {
  CURRENT_TEMPLATE_VERSION,
  DEFAULT_TEMPLATE_TIMESTAMP
} from "../common";
import type { OpexTemplate } from "./types";

export const defaultOpexTemplate: OpexTemplate = {
  schema: "immo-finance.opex",
  version: CURRENT_TEMPLATE_VERSION,
  id: "opex-demo-standard",
  name: "Demo Opex",
  description: "Neutrale Beispielwerte fuer laufende Kosten.",
  createdAt: DEFAULT_TEMPLATE_TIMESTAMP,
  updatedAt: DEFAULT_TEMPLATE_TIMESTAMP,
  data: {
    recurringItems: [
      {
        id: "opex-001",
        label: "Instandhaltungsruecklage",
        amount: 6000,
        period: "yearly",
        inflationPct: 2,
        recoverableFromTenants: false,
        category: "reserve"
      },
      {
        id: "opex-002",
        label: "Versicherung",
        amount: 1200,
        period: "yearly",
        inflationPct: 2,
        recoverableFromTenants: false,
        category: "insurance"
      }
    ]
  }
};
