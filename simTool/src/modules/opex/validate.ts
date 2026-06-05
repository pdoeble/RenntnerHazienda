import { diagnostic } from "../../validation/diagnostics";
import { findDuplicateIds } from "../../validation/commonSchemas";
import { validationResult, type ValidationResult } from "../common";
import type { OpexTemplate } from "./types";

export function validateOpex(template: OpexTemplate): ValidationResult {
  const diagnostics = [];
  const duplicateIds = findDuplicateIds(template.data.recurringItems);

  for (const duplicateId of duplicateIds) {
    diagnostics.push(
      diagnostic(
        `opex.duplicate-item.${duplicateId}`,
        "error",
        "opex",
        `Betriebskostenblock "${duplicateId}" wird mehrfach verwendet.`
      )
    );
  }

  for (const item of template.data.recurringItems) {
    if (
      item.inflationPct !== undefined &&
      (item.inflationPct < -5 || item.inflationPct > 15)
    ) {
      diagnostics.push(
        diagnostic(
          `opex.unusual-inflation.${item.id}`,
          "warning",
          "opex",
          `Inflationsannahme fuer "${item.label}" betraegt ${item.inflationPct.toFixed(2)}%.`,
          [{ kind: "opex", itemId: item.id, field: "inflationPct" }]
        )
      );
    }
  }

  return validationResult(diagnostics);
}
