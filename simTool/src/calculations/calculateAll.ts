import { hasBlockingDiagnostics } from "../validation/diagnostics";
import { calculateCashflow } from "./calculateCashflow";
import {
  calculateInitialContributions,
  calculateRecurringContributions
} from "./calculateContributions";
import { calculateDebt } from "./calculateDebt";
import { calculateLiquidity } from "./calculateLiquidity";
import { calculatePoints } from "./calculatePoints";
import { calculateTimeline } from "./calculateTimeline";
import { collectInputDiagnostics } from "./diagnostics";
import { calculateCapitalNeed } from "./financialInputs";
import type { CalculationResult, ProjectSnapshot } from "./types";

export function calculateAll(snapshot: ProjectSnapshot): CalculationResult {
  const inputDiagnostics = collectInputDiagnostics(snapshot);

  if (hasBlockingDiagnostics(inputDiagnostics)) {
    return emptyCalculationResult(snapshot, inputDiagnostics);
  }

  const initialContributions = calculateInitialContributions(snapshot);
  const debt = calculateDebt(snapshot, initialContributions);
  const cashflow = calculateCashflow(snapshot, debt);
  const contributions = calculateRecurringContributions(
    snapshot,
    debt,
    cashflow,
    initialContributions
  );
  const liquidity = calculateLiquidity(snapshot, contributions, cashflow, debt);
  const capitalNeed = calculateCapitalNeed(snapshot);
  const points = calculatePoints(snapshot);
  const timeline = calculateTimeline(snapshot, debt, liquidity);

  return {
    capitalNeed,
    points,
    timeline,
    liquidity,
    contributions,
    cashflow,
    debt,
    diagnostics: [
      ...inputDiagnostics,
      ...contributions.diagnostics,
      ...debt.diagnostics,
      ...cashflow.diagnostics,
      ...liquidity.diagnostics,
      ...points.diagnostics
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
      requiredMonthlyContribution: 0,
      diagnostics: []
    },
    capitalNeed: {
      items: [],
      purchasePrice: 0,
      vatAtPurchase: 0,
      vatRefund: 0,
      closingCosts: 0,
      mortgageRegistrationFee: 0,
      renovations: 0,
      initialReserve: 0,
      totalProjectNeed: 0,
      ownerEquity: 0,
      debtPrincipal: 0,
      actualEquityRatioPct: 0,
      targetEquityRatioPct: 0,
      diagnostics: []
    },
    points: {
      capacity: 0,
      annualPointPool: 0,
      propertyValue: 0,
      appreciationPercentPerYear: 0,
      shareMode: "blended",
      owners: [],
      nightTypes: [],
      diagnostics: []
    },
    timeline: [],
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
