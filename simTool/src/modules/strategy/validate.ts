import { diagnostic } from "../../validation/diagnostics";
import {
  findDuplicateIds,
  isApproximately
} from "../../validation/commonSchemas";
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

  if (
    template.data.pointShareMode === "blended" &&
    !isApproximately(
      template.data.pointTierWeight + template.data.pointEquityWeight,
      100
    )
  ) {
    diagnostics.push(
      diagnostic(
        "strategy.point-weights-total",
        "warning",
        "strategy",
        `Point weights sum to ${(template.data.pointTierWeight + template.data.pointEquityWeight).toFixed(2)}% instead of 100%.`
      )
    );
  }

  return validationResult(diagnostics);
}
