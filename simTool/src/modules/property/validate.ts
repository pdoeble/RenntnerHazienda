import { diagnostic } from "../../validation/diagnostics";
import { validationResult, type ValidationResult } from "../common";
import type { PropertyTemplate } from "./types";

export function validateProperty(template: PropertyTemplate): ValidationResult {
  const diagnostics = [];

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
