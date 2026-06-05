import { roundMoney, roundPct } from "./rounding";
import type {
  CapitalShareResult,
  CashflowResult,
  ContributionResult,
  DebtResult,
  PersonalReturnResult,
  ProjectSnapshot
} from "./types";

const DEFAULT_RETURN_YEARS = 25;

export function calculatePersonalReturns(
  snapshot: ProjectSnapshot,
  capitalShares: CapitalShareResult,
  debt: DebtResult,
  cashflow: CashflowResult,
  contributions: ContributionResult,
  years = DEFAULT_RETURN_YEARS
): PersonalReturnResult {
  const projectedPropertyValue = roundMoney(
    snapshot.property.data.purchasePrice *
      (1 + snapshot.strategy.data.appreciationPercentPerYear / 100) ** years
  );
  const targetMonth = Math.max(0, years * 12 - 1);
  const projectedRemainingDebt = roundMoney(
    debt.monthlyDebtService[targetMonth]?.remainingDebt ??
      debt.monthlyDebtService.at(-1)?.remainingDebt ??
      debt.totalRemainingDebt
  );
  const projectedBankBalance = roundMoney(
    cashflow.bankAccountYearly.find((year) => year.year === years)?.closingBalance ??
      cashflow.bankAccountYearly.at(-1)?.closingBalance ??
      0
  );
  const projectedProjectNetWorth = roundMoney(
    projectedPropertyValue + projectedBankBalance - projectedRemainingDebt
  );

  return {
    years,
    propertyValueToday: roundMoney(snapshot.property.data.purchasePrice),
    appreciationPercentPerYear:
      snapshot.strategy.data.appreciationPercentPerYear,
    owners: capitalShares.owners.map((owner) => {
      const recurring = contributions.recurringContributions[0]?.contributions.find(
        (candidate) => candidate.ownerId === owner.ownerId
      );
      const monthlyCapital =
        recurring?.capitalContributionMonthly ?? owner.monthlyCapitalContribution;
      const monthlyCost =
        recurring?.costContributionMonthly ??
        recurring?.baseMonthlyObligation ??
        0;
      const monthlyUsage =
        recurring?.usageContributionMonthly ?? owner.monthlyUsageContribution;
      const capitalPayments = roundMoney(monthlyCapital * 12 * years);
      const investedCapital = roundMoney(
        owner.startEquityContribution + capitalPayments
      );
      const nonWealthPayments = roundMoney(
        (monthlyCost + monthlyUsage) * 12 * years
      );
      const projectedOwnerValue = roundMoney(
        (owner.companySharePct / 100) * projectedProjectNetWorth
      );
      const returnResult = averageAnnualReturn({
        startEquity: owner.startEquityContribution,
        annualCapitalPayment: monthlyCapital * 12,
        projectedOwnerValue,
        years,
        investedCapital
      });

      return {
        ownerId: owner.ownerId,
        ownerName: owner.ownerName,
        years,
        companySharePct: owner.companySharePct,
        projectedPropertyValue,
        projectedBankBalance,
        projectedRemainingDebt,
        projectedProjectNetWorth,
        projectedOwnerValue,
        investedCapital,
        startEquityContribution: owner.startEquityContribution,
        capitalPayments,
        nonWealthPayments,
        averageAnnualReturnPct: roundPct(returnResult.rate * 100),
        returnMethod: returnResult.method
      };
    }),
    diagnostics: []
  };
}

function averageAnnualReturn({
  startEquity,
  annualCapitalPayment,
  projectedOwnerValue,
  years,
  investedCapital
}: {
  startEquity: number;
  annualCapitalPayment: number;
  projectedOwnerValue: number;
  years: number;
  investedCapital: number;
}): { rate: number; method: "internalRate" | "fallback" | "notAvailable" } {
  if (investedCapital <= 0 || projectedOwnerValue <= 0 || years <= 0) {
    return { rate: 0, method: "notAvailable" };
  }

  const internalRate = solveInternalRate({
    startEquity,
    annualCapitalPayment,
    projectedOwnerValue,
    years
  });
  if (internalRate !== undefined) {
    return { rate: internalRate, method: "internalRate" };
  }

  return {
    rate: (projectedOwnerValue / investedCapital) ** (1 / years) - 1,
    method: "fallback"
  };
}

function solveInternalRate({
  startEquity,
  annualCapitalPayment,
  projectedOwnerValue,
  years
}: {
  startEquity: number;
  annualCapitalPayment: number;
  projectedOwnerValue: number;
  years: number;
}): number | undefined {
  let low = -0.95;
  let high = 1;
  const lowNpv = netPresentValue(low, {
    startEquity,
    annualCapitalPayment,
    projectedOwnerValue,
    years
  });
  const highNpv = netPresentValue(high, {
    startEquity,
    annualCapitalPayment,
    projectedOwnerValue,
    years
  });

  if (Math.sign(lowNpv) === Math.sign(highNpv)) {
    return undefined;
  }

  for (let iteration = 0; iteration < 80; iteration += 1) {
    const mid = (low + high) / 2;
    const midNpv = netPresentValue(mid, {
      startEquity,
      annualCapitalPayment,
      projectedOwnerValue,
      years
    });
    if (Math.abs(midNpv) < 0.01) {
      return mid;
    }
    if (Math.sign(midNpv) === Math.sign(lowNpv)) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return (low + high) / 2;
}

function netPresentValue(
  rate: number,
  {
    startEquity,
    annualCapitalPayment,
    projectedOwnerValue,
    years
  }: {
    startEquity: number;
    annualCapitalPayment: number;
    projectedOwnerValue: number;
    years: number;
  }
): number {
  let npv = -startEquity;
  for (let year = 1; year <= years; year += 1) {
    npv -= annualCapitalPayment / (1 + rate) ** year;
  }
  npv += projectedOwnerValue / (1 + rate) ** years;
  return npv;
}
