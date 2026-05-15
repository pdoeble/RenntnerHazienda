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
    legalForm: "gbr",
    liabilityModel: "unlimited",
    taxModel: "transparent",
    votingModel: "ownershipShare",
    notes:
      "Annahme nur zur Modellierung. Rechtliche und steuerliche Prüfung erforderlich."
  }
};
