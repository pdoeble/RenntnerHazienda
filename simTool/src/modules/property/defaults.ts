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
    country: "AT",
    federalState: "T",
    municipality: "Gemeinde offen",
    useType: "holidayHome",
    rentableAreaSqm: 300,
    plotAreaSqm: 850,
    units: 4,
    expectedMonthlyRent: 4500,
    vacancyRatePct: 3,
    purchaseMonth: 0,
    reserveMonths: 3,
    tourismFeeAnnualAmount: 1200,
    vatRatePct: 20,
    vatRecoverablePct: 0,
    vatRefundMonth: 12,
    mortgageRegistrationFeePct: 0,
    closingCosts: {
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
    },
    renovationItems: [
      {
        id: "renovation-001",
        label: "Renovierung",
        category: "renovation",
        amount: 50000,
        timingMonth: 0
      }
    ],
    notes: "Beispieldaten ohne Bezug zu einem realen Projekt."
  }
};
