import {
  CURRENT_TEMPLATE_VERSION,
  DEFAULT_TEMPLATE_TIMESTAMP
} from "../common";
import type { LegalFormTemplate } from "./types";

export const defaultLegalFormTemplate: LegalFormTemplate = {
  schema: "immo-finance.legal-form",
  version: CURRENT_TEMPLATE_VERSION,
  id: "legal-form-demo-gbr",
  name: "Demo Gesellschaftsform",
  description: "Neutrale Annahme zur Gesellschaftsform.",
  createdAt: DEFAULT_TEMPLATE_TIMESTAMP,
  updatedAt: DEFAULT_TEMPLATE_TIMESTAMP,
  data: {
    legalForm: "coOwnership",
    liabilityModel: "mixed",
    taxModel: "transparent",
    votingModel: "ownershipShare",
    foundingCostAmount: 1500,
    annualAccountingCostAmount: 0,
    annualAdministrationCostAmount: 600,
    annualComplianceCostAmount: 0,
    costStatus: "planningEstimate",
    sourceRefs: [
      {
        label: "WKO Gruendungskosten",
        url: "https://www.wko.at/gruendung/gruendungskosten",
        publisher: "Wirtschaftskammer Oesterreich",
        retrievedAt: "2026-06-05",
        scope: "Oesterreich, Gruendungskosten nach Rechtsform"
      }
    ],
    notes:
      "Planungsannahme fuer Miteigentum mit Benutzungs-, Kosten- und Exitvertrag. Kosten muessen mit Notar, Rechtsberatung, Steuerberatung und Bank konkretisiert werden."
  }
};
