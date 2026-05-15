import { hasBlockingDiagnostics } from "../validation/diagnostics";
import { calculateCashflow } from "./calculateCashflow";
import { calculateContributions } from "./calculateContributions";
import { calculateDebt } from "./calculateDebt";
import { calculateLiquidity } from "./calculateLiquidity";
import { collectInputDiagnostics } from "./diagnostics";
import type { CalculationResult, ProjectSnapshot } from "./types";

export function calculateAll(snapshot: ProjectSnapshot): CalculationResult {
  const inputDiagnostics = collectInputDiagnostics(snapshot);

  if (hasBlockingDiagnostics(inputDiagnostics)) {
    return emptyCalculationResult(snapshot, inputDiagnostics);
  }

  const contributions = calculateContributions(snapshot);
  const debt = calculateDebt(snapshot, contributions);
  const cashflow = calculateCashflow(snapshot, debt);
  const liquidity = calculateLiquidity(snapshot, contributions, cashflow, debt);

  return {
    liquidity,
    contributions,
    cashflow,
    debt,
    diagnostics: [
      ...inputDiagnostics,
      ...contributions.diagnostics,
      ...debt.diagnostics,
      ...cashflow.diagnostics,
      ...liquidity.diagnostics
    ]
  };
}

function emptyCalculationResult(
  snapshot: ProjectSnapshot,
  diagnostics: CalculationResult["diagnostics"]
): CalculationResult {
  return {
    contributions: {
      initialContributions: [],
      recurringContributions: [],
      totalByOwner: {},
      requiredInitialContribution: 0,
      diagnostics: []
    },
    debt: {
      loans: [],
      totalInitialDebt: 0,
      totalRemainingDebt: 0,
      totalInterestPaid: 0,
      totalPrincipalPaid: 0,
      monthlyDebtService: [],
      diagnostics: []
    },
    cashflow: {
      monthly: [],
      yearly: [],
      cumulativeCashflow: 0,
      diagnostics: []
    },
    liquidity: {
      monthly: [],
      minimumLiquidity: 0,
      finalLiquidity: 0,
      diagnostics: []
    },
    diagnostics: [
      ...diagnostics,
      {
        id: "project.calculation-blocked",
        severity: "error",
        domain: "project",
        message: `Calculation blocked for ${snapshot.metadata.timeHorizonMonths} month horizon because input validation has errors.`
      }
    ]
  };
}
