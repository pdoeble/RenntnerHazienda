import { diagnostic } from "../../validation/diagnostics";
import { findDuplicateIds } from "../../validation/commonSchemas";
import { validationResult, type ValidationResult } from "../common";
import type { PropertyTemplate } from "./types";

export function validateProperty(template: PropertyTemplate): ValidationResult {
  const diagnostics = [];
  const duplicateRenovationIds = findDuplicateIds(
    template.data.renovationItems
  );
  const duplicateClosingCostIds = findDuplicateIds(
    template.data.closingCosts.otherCosts
  );

  for (const duplicateId of duplicateRenovationIds) {
    diagnostics.push(
      diagnostic(
        `property.duplicate-renovation.${duplicateId}`,
        "error",
        "property",
        `Renovation item id "${duplicateId}" is used more than once.`
      )
    );
  }

  for (const duplicateId of duplicateClosingCostIds) {
    diagnostics.push(
      diagnostic(
        `property.duplicate-closing-cost.${duplicateId}`,
        "error",
        "property",
        `Closing cost item id "${duplicateId}" is used more than once.`
      )
    );
  }

  if (template.data.purchasePrice === 0) {
    diagnostics.push(
      diagnostic(
        "property.purchase-price-zero",
        "warning",
        "property",
        "Purchase price is zero; acquisition and liquidity outputs are limited.",
        [{ kind: "property", field: "purchasePrice" }]
      )
    );
  }

  if (template.data.expectedMonthlyRent === undefined) {
    diagnostics.push(
      diagnostic(
        "property.missing-rent",
        "warning",
        "property",
        "Expected monthly rent is missing; cashflow uses zero rental income.",
        [{ kind: "property", field: "expectedMonthlyRent" }]
      )
    );
  }

  return validationResult(diagnostics);
}
