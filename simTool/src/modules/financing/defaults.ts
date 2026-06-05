import {
  CURRENT_TEMPLATE_VERSION,
  DEFAULT_TEMPLATE_TIMESTAMP
} from "../common";
import type { FinancingTemplate } from "./types";

export const defaultFinancingTemplate: FinancingTemplate = {
  schema: "immo-finance.financing",
  version: CURRENT_TEMPLATE_VERSION,
  id: "financing-demo-annuity",
  name: "Demo Finanzierung",
  description: "20% Eigenkapital, 80% Annuitaetendarlehen ueber 25 Jahre.",
  createdAt: DEFAULT_TEMPLATE_TIMESTAMP,
  updatedAt: DEFAULT_TEMPLATE_TIMESTAMP,
  data: {
    loanName: "Annuitaetendarlehen",
    equitySharePct: 20,
    annualInterestRatePct: 4,
    termYears: 25,
    startMonth: 0,
    additionalMonthlyRepayment: 0,
    bankdarlehenModus: "automatischSaldieren",
    mittelherkunft: [],
    mittelverwendung: []
  }
};
