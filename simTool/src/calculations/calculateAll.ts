import { hasBlockingDiagnostics } from "../validation/diagnostics";
import { calculateCashflow } from "./calculateCashflow";
import { calculateCapitalShares } from "./calculateCapitalShares";
import {
  calculateInitialContributions,
  calculateRecurringContributions
} from "./calculateContributions";
import { calculateDebt } from "./calculateDebt";
import { calculateHouseComparison } from "./calculateHouseComparison";
import { calculateLiquidity } from "./calculateLiquidity";
import { calculateOccupancy } from "./calculateOccupancy";
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
  const capitalShares = calculateCapitalShares(snapshot, debt);
  const points = calculatePoints(snapshot, capitalShares);
  const occupancy = calculateOccupancy(snapshot, points);
  const houseComparison = calculateHouseComparison(snapshot);
  const timeline = calculateTimeline(snapshot, debt, liquidity);

  return {
    capitalNeed,
    capitalShares,
    points,
    occupancy,
    houseComparison,
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
      ...capitalShares.diagnostics,
      ...points.diagnostics,
      ...occupancy.diagnostics,
      ...houseComparison.diagnostics
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
      legalFoundingCosts: 0,
      initialReserve: 0,
      totalProjectNeed: 0,
      ownerEquity: 0,
      debtPrincipal: 0,
      actualEquityRatioPct: 0,
      targetEquityRatioPct: 0,
      diagnostics: []
    },
    capitalShares: {
      mode: "scheduledPrincipal",
      termYears: snapshot.financing.data.termYears,
      valuationInterestPct: snapshot.strategy.data.capitalValuationInterestPct,
      totalCapitalValueAtLoanEnd: 0,
      owners: [],
      diagnostics: []
    },
    points: {
      capacity: 0,
      annualPointPool: 0,
      propertyValue: 0,
      appreciationPercentPerYear: 0,
      shareMode: "usage",
      owners: [],
      nightTypes: [],
      diagnostics: []
    },
    occupancy: {
      houseTitle: "",
      capacityPersons: 0,
      capacityDataQuality: "missing",
      ownerCount: 0,
      ownerDemandNights: 0,
      guestNights: 0,
      blockedNights: 0,
      freeNights: 0,
      occupancyPct: 0,
      pointsPerAvailableNight: 0,
      pressureLabel: "offen",
      diagnostics: []
    },
    houseComparison: {
      houses: [],
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
