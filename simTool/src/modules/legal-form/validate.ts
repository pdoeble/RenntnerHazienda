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
        "Tax model is unknown; cashflow outputs remain assumption-based."
      )
    );
  }

  return validationResult(diagnostics);
}
