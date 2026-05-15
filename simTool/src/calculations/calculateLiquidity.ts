import { diagnostic } from "../validation/diagnostics";
import {
  calculateClosingCostsTotal
} from "./financialInputs";
import { roundMoney } from "./rounding";
import type {
  CashflowResult,
  ContributionResult,
  DebtResult,
  LiquidityMonth,
  LiquidityResult,
  ProjectSnapshot
} from "./types";

export function calculateLiquidity(
  snapshot: ProjectSnapshot,
  contributions: ContributionResult,
  cashflow: CashflowResult,
  debt: DebtResult
): LiquidityResult {
  const diagnostics = [];
  const monthly: LiquidityMonth[] = [];
  const purchaseMonth = snapshot.property.data.purchaseMonth ?? 0;
  const initialContributionTotal = contributions.initialContributions.reduce(
    (total, contribution) => total + contribution.amount,
    0
  );
  let balance = 0;
  let firstNegativeMonth: number | undefined;

  for (let month = 0; month < snapshot.metadata.timeHorizonMonths; month += 1) {
    const openingBalance = balance;
    const acquisitionOutflow =
      month === purchaseMonth
        ? snapshot.property.data.purchasePrice + calculateClosingCostsTotal(snapshot)
        : 0;
    const capexOutflow = snapshot.capex.data.items
      .filter((item) => item.timingMonth === month)
      .reduce((total, item) => total + item.amount, 0);
    const monthlyCashflow =
      cashflow.monthly[month]?.netCashflowAfterDebtService ?? 0;
    const contributionInflow = month === 0 ? initialContributionTotal : 0;
    const recurringContributionInflow =
      month >= snapshot.financing.data.startMonth &&
      month < snapshot.financing.data.startMonth + snapshot.financing.data.termYears * 12
        ? contributions.requiredMonthlyContribution
        : 0;
    const loanInflow =
      month === snapshot.financing.data.startMonth ? debt.totalInitialDebt : 0;
    const inflows =
      contributionInflow +
      recurringContributionInflow +
      loanInflow +
      (monthlyCashflow > 0 ? monthlyCashflow : 0);
    const outflows =
      acquisitionOutflow +
      capexOutflow +
      (monthlyCashflow < 0 ? Math.abs(monthlyCashflow) : 0);

    balance = roundMoney(openingBalance + inflows - outflows);

    if (balance < 0 && firstNegativeMonth === undefined) {
      firstNegativeMonth = month;
    }

    monthly.push({
      month,
      openingBalance: roundMoney(openingBalance),
      inflows: roundMoney(inflows),
      outflows: roundMoney(outflows),
      closingBalance: balance
    });
  }

  if (firstNegativeMonth !== undefined) {
    diagnostics.push(
      diagnostic(
        "liquidity.first-negative-month",
        "warning",
        "liquidity",
        `Liquidity becomes negative in month ${firstNegativeMonth}.`
      )
    );
  }

  return {
    monthly,
    minimumLiquidity: Math.min(...monthly.map((month) => month.closingBalance)),
    finalLiquidity: monthly.at(-1)?.closingBalance ?? 0,
    ...(firstNegativeMonth !== undefined ? { firstNegativeMonth } : {}),
    diagnostics
  };
}
