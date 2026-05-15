import { diagnostic } from "../../validation/diagnostics";
import { validationResult, type ValidationResult } from "../common";
import type { FinancingTemplate } from "./types";

export function validateFinancing(
  template: FinancingTemplate
): ValidationResult {
  const diagnostics = [];

  if (template.data.equitySharePct === 0) {
    diagnostics.push(
      diagnostic(
        "financing.no-equity",
        "warning",
        "financing",
        "Eigenkapitalanteil ist 0%; das Darlehen deckt die gesamten Erwerbskosten."
      )
    );
  }

  if (template.data.equitySharePct >= 100) {
    diagnostics.push(
      diagnostic(
        "financing.no-debt",
        "info",
        "financing",
        "Eigenkapitalanteil ist 100%; es wird kein Darlehen modelliert."
      )
    );
  }

  if (template.data.annualInterestRatePct === 0 && template.data.equitySharePct < 100) {
    diagnostics.push(
      diagnostic(
        "financing.zero-interest",
        "warning",
        "financing",
        "Sollzins ist 0%; die Darlehensrechnung nutzt einen zinsfreien Tilgungsplan."
      )
    );
  }

  return validationResult(diagnostics);
}
