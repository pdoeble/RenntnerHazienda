import {
  CURRENT_TEMPLATE_VERSION,
  DEFAULT_TEMPLATE_TIMESTAMP
} from "../common";
import type { CapexTemplate } from "./types";

export const defaultCapexTemplate: CapexTemplate = {
  schema: "immo-finance.capex",
  version: CURRENT_TEMPLATE_VERSION,
  id: "capex-demo-renovation",
  name: "Demo Capex",
  description: "Neutrales Beispiel fuer einmalige Investitionen.",
  createdAt: DEFAULT_TEMPLATE_TIMESTAMP,
  updatedAt: DEFAULT_TEMPLATE_TIMESTAMP,
  data: {
    items: [
      {
        id: "capex-001",
        label: "Renovierung",
        category: "renovation",
        amount: 50000,
        timingMonth: 0,
        financing: "equity"
      }
    ]
  }
};
