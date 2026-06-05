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
    fallkennung: "fall-waldchalet-pfunds-basis",
    szenariokennung: "szenario-demo-basis",
    annahmenquelle: "Demo-/Szenario-Daten, keine Beratung",
    reserveMonths: 3,
    minimumLiquidityAmount: 15000,
    targetLiquidityAmount: 30000,
    contributionPolicy: "minimumObligationPlusReserveTopUp",
    rentOffsetsOwnerContributions: false,
    targetEquityRatioPct: 20,
    pointShareMode: "usage",
    pointTierWeight: 50,
    pointEquityWeight: 50,
    capitalShareMode: "scheduledPrincipal",
    scheduledPrincipalAffectsCompanyShare: true,
    manualCapitalContributionsAffectCompanyShare: true,
    capitalValuationInterestPct: 2,
    appreciationPercentPerYear: 2,
    ownerWeekendUsagePct: 80,
    guestWeekendUsagePct: 50,
    externalOccupancyRatePct: 35,
    averageGrossPricePerExternalRoomNight: 120,
    ownerUseDisplacementFactorPct: 50,
    variableCostPerRoomNightAmount: 25,
    reservePerRoomNightAmount: 15,
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
