import { diagnostic } from "../../validation/diagnostics";
import { validationResult, type ValidationResult } from "../common";
import type { LegalFormTemplate } from "./types";

export function validateLegalForm(
  template: LegalFormTemplate
): ValidationResult {
  const diagnostics = [];

  if (template.data.legalForm === "other") {
    diagnostics.push(
      diagnostic(
        "legal-form.other-selected",
        "info",
        "legalForm",
        "Gesellschaftsform ist als sonstige Annahme modelliert."
      )
    );
  }

  if (template.data.taxModel === "unknown") {
    diagnostics.push(
      diagnostic(
        "legal-form.tax-model-unknown",
        "warning",
        "legalForm",
        "Steuermodell ist offen; Zahlungsfluss und Ergebnisrechnung bleiben Annahmen."
      )
    );
  }

  const hasAnyCost =
    template.data.foundingCostAmount > 0 ||
    template.data.annualAccountingCostAmount > 0 ||
    template.data.annualAdministrationCostAmount > 0 ||
    template.data.annualComplianceCostAmount > 0;

  if (!hasAnyCost || template.data.costStatus === "missing") {
    diagnostics.push(
      diagnostic(
        "legal-form.costs-missing",
        "warning",
        "legalForm",
        "Rechtsformkosten fehlen oder sind nicht belastbar; Kapitalbedarf und Betriebskosten koennen zu niedrig sein."
      )
    );
  }

  return validationResult(diagnostics);
}
