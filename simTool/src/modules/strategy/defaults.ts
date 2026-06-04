import {
  CURRENT_TEMPLATE_VERSION,
  DEFAULT_TEMPLATE_TIMESTAMP
} from "../common";
import type { StrategyTemplate } from "./types";

export const defaultStrategyTemplate: StrategyTemplate = {
  schema: "immo-finance.strategy",
  version: CURRENT_TEMPLATE_VERSION,
  id: "strategy-demo-liquiditaet",
  name: "Demo Strategie",
  description: "Liquiditaets- und Entscheidungsziele fuer das Demo-Projekt.",
  createdAt: DEFAULT_TEMPLATE_TIMESTAMP,
  updatedAt: DEFAULT_TEMPLATE_TIMESTAMP,
  data: {
    reserveMonths: 3,
    minimumLiquidityAmount: 15000,
    targetLiquidityAmount: 30000,
    contributionPolicy: "minimumObligationPlusReserveTopUp",
    rentOffsetsOwnerContributions: false,
    targetEquityRatioPct: 20,
    pointShareMode: "blended",
    pointTierWeight: 50,
    pointEquityWeight: 50,
    appreciationPercentPerYear: 2,
    goNoGoChecks: [
      {
        id: "check-leisure-residence",
        label: "Freizeitwohnsitz / Nutzung",
        status: "open"
      },
      {
        id: "check-touristic-rental",
        label: "Touristische Vermietung",
        status: "open"
      },
      {
        id: "check-bank-documents",
        label: "Bankunterlagen",
        status: "open"
      },
      {
        id: "check-insurance",
        label: "Versicherung",
        status: "open"
      }
    ]
  }
};
