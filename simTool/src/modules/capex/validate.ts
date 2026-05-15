import { diagnostic } from "../../validation/diagnostics";
import { findDuplicateIds } from "../../validation/commonSchemas";
import { validationResult, type ValidationResult } from "../common";
import type { CapexTemplate } from "./types";

export function validateCapex(template: CapexTemplate): ValidationResult {
  const diagnostics = [];
  const duplicateItemIds = findDuplicateIds(template.data.items);

  for (const duplicateId of duplicateItemIds) {
    diagnostics.push(
      diagnostic(
        `capex.duplicate-item.${duplicateId}`,
        "error",
        "capex",
        `Capex item id "${duplicateId}" is used more than once.`
      )
    );
  }

  for (const item of template.data.items) {
    if (item.financing !== "equity") {
      diagnostics.push(
        diagnostic(
          `capex.unsupported-financing.${item.id}`,
          "warning",
          "capex",
          `Capex item "${item.label}" uses financing "${item.financing}", which is not fully modeled in the vertical scaffold.`,
          [{ kind: "capex", itemId: item.id, field: "financing" }]
        )
      );
    }
  }

  return validationResult(diagnostics);
}
