import { diagnostic } from "../../validation/diagnostics";
import { findDuplicateIds } from "../../validation/commonSchemas";
import { validationResult, type ValidationResult } from "../common";
import type { StrategyTemplate } from "./types";

export function validateStrategy(template: StrategyTemplate): ValidationResult {
  const diagnostics = [];
  const duplicateCheckIds = findDuplicateIds(template.data.goNoGoChecks);

  for (const duplicateId of duplicateCheckIds) {
    diagnostics.push(
      diagnostic(
        `strategy.duplicate-check.${duplicateId}`,
        "error",
        "strategy",
        `Go/No-Go check id "${duplicateId}" is used more than once.`
      )
    );
  }

  if (template.data.targetLiquidityAmount < template.data.minimumLiquidityAmount) {
    diagnostics.push(
      diagnostic(
        "strategy.target-below-minimum",
        "warning",
        "strategy",
        "Target liquidity is below minimum liquidity; minimum liquidity is used as floor."
      )
    );
  }

  return validationResult(diagnostics);
}
