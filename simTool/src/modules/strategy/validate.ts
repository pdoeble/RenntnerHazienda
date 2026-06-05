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
        `Pruefpunkt "${duplicateId}" wird mehrfach verwendet.`
      )
    );
  }

  if (template.data.targetLiquidityAmount < template.data.minimumLiquidityAmount) {
    diagnostics.push(
      diagnostic(
        "strategy.target-below-minimum",
        "warning",
        "strategy",
        "Zielliquiditaet liegt unter der Mindestliquiditaet; die Mindestliquiditaet wird als Untergrenze verwendet."
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
        `Punkte-Gewichte ergeben ${(template.data.pointTierWeight + template.data.pointEquityWeight).toFixed(2)}% statt 100%.`
      )
    );
  }

  return validationResult(diagnostics);
}
