import { diagnostic } from "../validation/diagnostics";
import type { ContributionResult, DebtResult, ProjectSnapshot } from "./types";

export function calculateDebt(
  snapshot: ProjectSnapshot,
  _contributions: ContributionResult
): DebtResult {
  const monthlyDebtService = Array.from(
    { length: snapshot.metadata.timeHorizonMonths },
    (_value, month) => ({
      month,
      interest: 0,
      principalRepayment: 0,
      totalPayment: 0,
      remainingDebt: 0
    })
  );

  return {
    loans: [],
    totalInitialDebt: 0,
    totalRemainingDebt: 0,
    totalInterestPaid: 0,
    totalPrincipalPaid: 0,
    monthlyDebtService,
    diagnostics: [
      diagnostic(
        "debt.no-financing-module",
        "warning",
        "debt",
        "No dedicated financing module exists yet; debt is modeled as zero in this scaffold."
      )
    ]
  };
}
