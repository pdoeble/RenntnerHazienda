import { diagnostic } from "../validation/diagnostics";
import {
  calculateClosingCostsTotal,
  calculateOwnerEquitySharePct,
  calculateTotalOwnerEquity
} from "./financialInputs";
import { roundMoney, roundPct } from "./rounding";
import type {
  CashflowResult,
  ContributionResult,
  DebtResult,
  OwnerContribution,
  ProjectSnapshot
} from "./types";

export function calculateInitialContributions(
  snapshot: ProjectSnapshot
): ContributionResult {
  const diagnostics = [];
  const owners = snapshot.ownership.data.owners;
  const requiredInitialContribution = roundMoney(calculateTotalOwnerEquity(snapshot));
  const requiredMonthlyContribution = 0;

  if (owners.length === 0) {
    return {
      initialContributions: [],
      recurringContributions: [],
      totalByOwner: {},
      requiredInitialContribution,
      requiredMonthlyContribution,
      diagnostics: [
        diagnostic(
          "contributions.no-owners",
          "error",
          "contributions",
          "No owners are defined; contributions cannot be allocated."
        )
      ]
    };
  }

  const initialContributions = owners.map((owner) => {
    const sharePct = calculateOwnerEquitySharePct(snapshot, owner.id);
    return {
      ownerId: owner.id,
      ownerName: owner.displayName,
      amount: roundMoney(owner.equityContribution),
      basis: "ownershipShare",
      sharePct: roundPct(sharePct)
    } satisfies OwnerContribution;
  });

  if (requiredInitialContribution <= 0) {
    diagnostics.push(
      diagnostic(
        "contributions.no-equity",
        "error",
        "contributions",
        "No owner equity is defined; shares and contributions cannot be allocated."
      )
    );
  }

  return {
    initialContributions,
    recurringContributions: [],
    totalByOwner: Object.fromEntries(
      initialContributions.map((contribution) => [
        contribution.ownerId,
        contribution.amount
      ])
    ),
    requiredInitialContribution,
    requiredMonthlyContribution,
    diagnostics
  };
}

export function calculateRecurringContributions(
  snapshot: ProjectSnapshot,
  debt: DebtResult,
  cashflow: CashflowResult,
  initialResult: ContributionResult
): ContributionResult {
  const owners = snapshot.ownership.data.owners;
  const totalEquity = calculateTotalOwnerEquity(snapshot);
  if (owners.length === 0 || totalEquity <= 0) {
    return initialResult;
  }

  const recurringContributions = [];
  const totalByOwner = { ...initialResult.totalByOwner };
  const yearlyContributionCount = Math.ceil(snapshot.metadata.timeHorizonMonths / 12);
  let runningBalance = 0;

  for (let yearIndex = 0; yearIndex < yearlyContributionCount; yearIndex += 1) {
    const startMonth = yearIndex * 12;
    const endMonth = Math.min(
      snapshot.metadata.timeHorizonMonths - 1,
      startMonth + 11
    );
    const monthlyContribution = roundMoney(
      calculateRequiredMonthlyContributionForYear(
        snapshot,
        debt,
        cashflow,
        startMonth,
        endMonth,
        runningBalance
      )
    );

    const contributions = owners.map((owner) => {
      const sharePct = calculateOwnerEquitySharePct(snapshot, owner.id);
      const amount = roundMoney((monthlyContribution * sharePct) / 100);
      totalByOwner[owner.id] = roundMoney(
        (totalByOwner[owner.id] ?? 0) + amount * (endMonth - startMonth + 1)
      );

      return {
        ownerId: owner.id,
        ownerName: owner.displayName,
        amount,
        basis: "ownershipShare" as const,
        sharePct: roundPct(sharePct)
      };
    });

    recurringContributions.push({
      month: startMonth,
      contributions
    });

    for (let month = startMonth; month <= endMonth; month += 1) {
      runningBalance = roundMoney(
        runningBalance +
          monthlyContribution +
          calculateNonContributionLiquidityFlow(snapshot, debt, cashflow, month)
      );
    }
  }

  return {
    ...initialResult,
    recurringContributions,
    totalByOwner,
    requiredMonthlyContribution:
      recurringContributions[0]?.contributions.reduce(
        (total, contribution) => total + contribution.amount,
        0
      ) ?? 0
  };
}

function calculateRequiredMonthlyContributionForYear(
  snapshot: ProjectSnapshot,
  debt: DebtResult,
  cashflow: CashflowResult,
  startMonth: number,
  endMonth: number,
  openingBalance: number
): number {
  let simulatedBalance = openingBalance;
  let requiredMonthlyContribution = 0;

  for (let month = startMonth; month <= endMonth; month += 1) {
    simulatedBalance += calculateNonContributionLiquidityFlow(
      snapshot,
      debt,
      cashflow,
      month
    );
    const reserveTarget = calculateReserveTarget(snapshot, debt, cashflow, month);
    const monthsReceivingContribution = month - startMonth + 1;
    requiredMonthlyContribution = Math.max(
      requiredMonthlyContribution,
      (reserveTarget - simulatedBalance) / monthsReceivingContribution
    );
  }

  return Math.max(0, requiredMonthlyContribution);
}

function calculateNonContributionLiquidityFlow(
  snapshot: ProjectSnapshot,
  debt: DebtResult,
  cashflow: CashflowResult,
  month: number
): number {
  const purchaseMonth = snapshot.property.data.purchaseMonth ?? 0;
  const initialContributionInflow =
    month === 0 ? calculateTotalOwnerEquity(snapshot) : 0;
  const loanInflow =
    month === snapshot.financing.data.startMonth ? debt.totalInitialDebt : 0;
  const acquisitionOutflow =
    month === purchaseMonth
      ? snapshot.property.data.purchasePrice + calculateClosingCostsTotal(snapshot)
      : 0;
  const renovationOutflow = snapshot.property.data.renovationItems
    .filter((item) => item.timingMonth === month)
    .reduce((total, item) => total + item.amount, 0);
  const netCashflow = cashflow.monthly[month]?.netCashflowAfterDebtService ?? 0;

  return (
    initialContributionInflow +
    loanInflow +
    netCashflow -
    acquisitionOutflow -
    renovationOutflow
  );
}

export function calculateReserveTarget(
  snapshot: ProjectSnapshot,
  debt: DebtResult,
  cashflow: CashflowResult,
  month: number
): number {
  const currentCashflow = cashflow.monthly[month];
  const currentDebtService = debt.monthlyDebtService[month]?.totalPayment ?? 0;
  const monthlyCostBasis = currentCashflow
    ? currentCashflow.recoverableOpex +
      currentCashflow.nonRecoverableOpex +
      currentDebtService
    : currentDebtService;

  return roundMoney(monthlyCostBasis * snapshot.property.data.reserveMonths);
}
