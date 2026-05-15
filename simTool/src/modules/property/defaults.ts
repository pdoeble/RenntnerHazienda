import {
  CURRENT_TEMPLATE_VERSION,
  DEFAULT_TEMPLATE_TIMESTAMP
} from "../common";
import type { PropertyTemplate } from "./types";

export const defaultPropertyTemplate: PropertyTemplate = {
  schema: "immo-finance.property",
  version: CURRENT_TEMPLATE_VERSION,
  id: "property-demo-001",
  name: "Demo Immobilie",
  description: "Neutrales Beispielobjekt ohne reale Adresse.",
  createdAt: DEFAULT_TEMPLATE_TIMESTAMP,
  updatedAt: DEFAULT_TEMPLATE_TIMESTAMP,
  data: {
    purchasePrice: 750000,
    federalState: "BW",
    rentableAreaSqm: 300,
    units: 4,
    expectedMonthlyRent: 4500,
    vacancyRatePct: 3,
    purchaseMonth: 0,
    notes: "Beispieldaten ohne Bezug zu einem realen Projekt."
  }
};
