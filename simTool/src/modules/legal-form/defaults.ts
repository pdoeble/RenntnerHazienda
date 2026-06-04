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
    foundingCostAmount: 0,
    annualAccountingCostAmount: 0,
    annualAdministrationCostAmount: 0,
    annualComplianceCostAmount: 0,
    costStatus: "missing",
    sourceRefs: [
      {
        label: "Wiki Rechtsformen",
        url: "wiki/04_ownership.md",
        publisher: "Projekt-Wiki",
        retrievedAt: "2026-05-15",
        scope: "Oesterreich"
      }
    ],
    notes:
      "Annahme nur zur Modellierung. Kosten muessen mit Notar, Steuerberatung und Bank konkretisiert werden."
  }
};
