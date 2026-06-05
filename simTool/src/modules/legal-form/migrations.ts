import { migrateVersionedEnvelope } from "../../validation/migrationRunner";
import { CURRENT_TEMPLATE_VERSION } from "../common";
import { legalFormTemplateSchema } from "./schema";
import type { LegalFormData, LegalFormTemplate, LegalFormValue } from "./types";

export function migrateLegalForm(input: unknown): LegalFormTemplate {
  const migrated = migrateVersionedEnvelope(input, CURRENT_TEMPLATE_VERSION, {});
  const parsed = legalFormTemplateSchema.parse(migrated);
  return {
    ...parsed,
    data: applyDefaultLegalCosts(parsed.data)
  };
}

const LEGAL_COST_SOURCE_REFS = {
  wkoFoundingCosts: {
    label: "WKO Gruendungskosten",
    url: "https://www.wko.at/gruendung/gruendungskosten",
    publisher: "Wirtschaftskammer Oesterreich",
    retrievedAt: "2026-06-05",
    scope: "Oesterreich, Gruendungskosten nach Rechtsform"
  },
  wkoGmbh: {
    label: "WKO GmbH",
    url: "https://www.wko.at/gruendung/gesellschaft-beschraenkter-haftung-gmbh",
    publisher: "Wirtschaftskammer Oesterreich",
    retrievedAt: "2026-06-05",
    scope: "Oesterreich, GmbH"
  },
  wkoFlexCo: {
    label: "WKO FlexCo",
    url: "https://www.wko.at/gruendung/flexible-kapitalgesellschaft-flexkapg-",
    publisher: "Wirtschaftskammer Oesterreich",
    retrievedAt: "2026-06-05",
    scope: "Oesterreich, FlexKapG/FlexCo"
  },
  wkoKg: {
    label: "WKO KG",
    url: "https://www.wko.at/gruendung/kommanditgesellschaft-kg",
    publisher: "Wirtschaftskammer Oesterreich",
    retrievedAt: "2026-06-05",
    scope: "Oesterreich, Kommanditgesellschaft"
  },
  wkoGmbhCoKg: {
    label: "WKO GmbH & Co KG",
    url: "https://www.wko.at/wirtschaftsrecht/gmbh-und-co-kg-faq",
    publisher: "Wirtschaftskammer Oesterreich",
    retrievedAt: "2026-06-05",
    scope: "Oesterreich, GmbH & Co KG"
  },
  wkoGenossenschaft: {
    label: "WKO Genossenschaft",
    url: "https://www.wko.at/gruendung/genossenschaft",
    publisher: "Wirtschaftskammer Oesterreich",
    retrievedAt: "2026-06-05",
    scope: "Oesterreich, Genossenschaft"
  },
  bmiVerein: {
    label: "BMI Vereinswesen",
    url: "https://www.bmi.gv.at/609/start.html",
    publisher: "Bundesministerium fuer Inneres",
    retrievedAt: "2026-06-05",
    scope: "Oesterreich, ideeller Verein"
  },
  steuerberaterKosten: {
    label: "Steuerberater Oesterreich Honorar-Auswertung",
    url: "https://deine-steuerberater.at/wissenswertes/steuerberater-kosten",
    publisher: "Steuerberater Oesterreich",
    retrievedAt: "2026-06-05",
    scope: "Oesterreich, sekundaere Marktorientierung 2026"
  }
} as const satisfies Record<string, LegalFormData["sourceRefs"][number]>;

const DEFAULT_LEGAL_COSTS: Record<
  LegalFormValue,
  Pick<
    LegalFormData,
    | "foundingCostAmount"
    | "annualAccountingCostAmount"
    | "annualAdministrationCostAmount"
    | "annualComplianceCostAmount"
    | "costStatus"
    | "sourceRefs"
  >
> = {
  coOwnership: {
    foundingCostAmount: 1500,
    annualAccountingCostAmount: 0,
    annualAdministrationCostAmount: 600,
    annualComplianceCostAmount: 0,
    costStatus: "planningEstimate",
    sourceRefs: [LEGAL_COST_SOURCE_REFS.wkoFoundingCosts]
  },
  gbr: {
    foundingCostAmount: 1500,
    annualAccountingCostAmount: 1500,
    annualAdministrationCostAmount: 600,
    annualComplianceCostAmount: 0,
    costStatus: "planningEstimate",
    sourceRefs: [
      LEGAL_COST_SOURCE_REFS.wkoFoundingCosts,
      LEGAL_COST_SOURCE_REFS.steuerberaterKosten
    ]
  },
  gmbh: {
    foundingCostAmount: 2450,
    annualAccountingCostAmount: 4200,
    annualAdministrationCostAmount: 600,
    annualComplianceCostAmount: 500,
    costStatus: "planningEstimate",
    sourceRefs: [
      LEGAL_COST_SOURCE_REFS.wkoFoundingCosts,
      LEGAL_COST_SOURCE_REFS.wkoGmbh,
      LEGAL_COST_SOURCE_REFS.steuerberaterKosten
    ]
  },
  flexCo: {
    foundingCostAmount: 2450,
    annualAccountingCostAmount: 4200,
    annualAdministrationCostAmount: 600,
    annualComplianceCostAmount: 500,
    costStatus: "planningEstimate",
    sourceRefs: [
      LEGAL_COST_SOURCE_REFS.wkoFoundingCosts,
      LEGAL_COST_SOURCE_REFS.wkoFlexCo,
      LEGAL_COST_SOURCE_REFS.steuerberaterKosten
    ]
  },
  kg: {
    foundingCostAmount: 1760,
    annualAccountingCostAmount: 1500,
    annualAdministrationCostAmount: 600,
    annualComplianceCostAmount: 0,
    costStatus: "planningEstimate",
    sourceRefs: [
      LEGAL_COST_SOURCE_REFS.wkoFoundingCosts,
      LEGAL_COST_SOURCE_REFS.wkoKg,
      LEGAL_COST_SOURCE_REFS.steuerberaterKosten
    ]
  },
  gmbhCoKg: {
    foundingCostAmount: 4210,
    annualAccountingCostAmount: 6000,
    annualAdministrationCostAmount: 1200,
    annualComplianceCostAmount: 500,
    costStatus: "planningEstimate",
    sourceRefs: [
      LEGAL_COST_SOURCE_REFS.wkoFoundingCosts,
      LEGAL_COST_SOURCE_REFS.wkoGmbhCoKg,
      LEGAL_COST_SOURCE_REFS.steuerberaterKosten
    ]
  },
  verein: {
    foundingCostAmount: 57,
    annualAccountingCostAmount: 600,
    annualAdministrationCostAmount: 600,
    annualComplianceCostAmount: 0,
    costStatus: "sourceBacked",
    sourceRefs: [
      LEGAL_COST_SOURCE_REFS.bmiVerein,
      LEGAL_COST_SOURCE_REFS.steuerberaterKosten
    ]
  },
  genossenschaft: {
    foundingCostAmount: 2500,
    annualAccountingCostAmount: 4200,
    annualAdministrationCostAmount: 1200,
    annualComplianceCostAmount: 2000,
    costStatus: "missing",
    sourceRefs: [
      LEGAL_COST_SOURCE_REFS.wkoGenossenschaft,
      LEGAL_COST_SOURCE_REFS.steuerberaterKosten
    ]
  },
  eg: {
    foundingCostAmount: 2500,
    annualAccountingCostAmount: 4200,
    annualAdministrationCostAmount: 1200,
    annualComplianceCostAmount: 2000,
    costStatus: "missing",
    sourceRefs: [
      LEGAL_COST_SOURCE_REFS.wkoGenossenschaft,
      LEGAL_COST_SOURCE_REFS.steuerberaterKosten
    ]
  },
  ug: {
    foundingCostAmount: 2450,
    annualAccountingCostAmount: 4200,
    annualAdministrationCostAmount: 600,
    annualComplianceCostAmount: 500,
    costStatus: "planningEstimate",
    sourceRefs: [
      LEGAL_COST_SOURCE_REFS.wkoFoundingCosts,
      LEGAL_COST_SOURCE_REFS.wkoGmbh,
      LEGAL_COST_SOURCE_REFS.steuerberaterKosten
    ]
  },
  other: {
    foundingCostAmount: 0,
    annualAccountingCostAmount: 0,
    annualAdministrationCostAmount: 0,
    annualComplianceCostAmount: 0,
    costStatus: "missing",
    sourceRefs: []
  }
};

function applyDefaultLegalCosts(data: LegalFormData): LegalFormData {
  const hasAnyCost =
    data.foundingCostAmount > 0 ||
    data.annualAccountingCostAmount > 0 ||
    data.annualAdministrationCostAmount > 0 ||
    data.annualComplianceCostAmount > 0;

  if (hasAnyCost || data.costStatus !== "missing") {
    return data;
  }

  return {
    ...data,
    ...DEFAULT_LEGAL_COSTS[data.legalForm],
    notes:
      data.notes ??
      "Kostenprofil wurde aus Planungsannahmen gesetzt und muss mit Beratung und konkreten Angeboten geprueft werden."
  };
}
