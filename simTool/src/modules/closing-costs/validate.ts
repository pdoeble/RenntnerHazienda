import { diagnostic } from "../../validation/diagnostics";
import { findDuplicateIds } from "../../validation/commonSchemas";
import { validationResult, type ValidationResult } from "../common";
import type { ClosingCostsTemplate } from "./types";

export function validateClosingCosts(
  template: ClosingCostsTemplate
): ValidationResult {
  const diagnostics = [];
  const duplicateIds = findDuplicateIds(template.data.otherCosts);

  for (const duplicateId of duplicateIds) {
    diagnostics.push(
      diagnostic(
        `closing-costs.duplicate-item.${duplicateId}`,
        "error",
        "closingCosts",
        `Closing cost item id "${duplicateId}" is used more than once.`
      )
    );
  }

  const percentTotal =
    template.data.realEstateTransferTaxPct +
    template.data.notaryPct +
    template.data.landRegistryPct +
    template.data.brokerPct;

  if (percentTotal > 15) {
    diagnostics.push(
      diagnostic(
        "closing-costs.high-percent-total",
        "warning",
        "closingCosts",
        `Percentage-based acquisition costs sum to ${percentTotal.toFixed(2)}%.`
      )
    );
  }

  return validationResult(diagnostics);
}
