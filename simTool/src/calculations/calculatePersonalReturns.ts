import { roundMoney, roundPct } from "./rounding";
import type {
  CapitalShareResult,
  CashflowResult,
  ContributionResult,
  DebtResult,
  PersonalReturnResult,
  PersonalReturnYearPoint,
  ProjectSnapshot
} from "./types";

const DEFAULT_RETURN_YEARS = 25;
const MAX_PROJECTION_YEARS = 30;

export function calculatePersonalReturns(
  snapshot: ProjectSnapshot,
  capitalShares: CapitalShareResult,
  debt: DebtResult,
  cashflow: CashflowResult,
  contributions: ContributionResult,
  years = DEFAULT_RETURN_YEARS
): PersonalReturnResult {
  return {
    years,
    propertyValueToday: roundMoney(snapshot.property.data.purchasePrice),
    appreciationPercentPerYear:
      snapshot.strategy.data.appreciationPercentPerYear,
    owners: capitalShares.owners.map((owner) => {
      const annualProjection = buildAnnualProjection({
        snapshot,
        ownerId: owner.ownerId,
        companySharePct: owner.companySharePct,
        startEquityContribution: owner.startEquityContribution,
        debt,
        cashflow,
        contributions
      });
      const target = projectionPoint(annualProjection, years);
      const capitalPayments = roundMoney(
        target.cumulativeInvestedCapital - owner.startEquityContribution
      );
      const annualCapitalPayments = annualProjection
        .filter((point) => point.year > 0 && point.year <= years)
        .map((point, index, points) =>
          roundMoney(
            point.cumulativeInvestedCapital -
              (points[index - 1]?.cumulativeInvestedCapital ??
                owner.startEquityContribution)
          )
        );
      const returnResult = averageAnnualReturn({
        startEquity: owner.startEquityContribution,
        annualCapitalPayments,
        projectedOwnerValue: target.projectedOwnerValue,
        years,
        investedCapital: target.cumulativeInvestedCapital
      });

      return {
        ownerId: owner.ownerId,
        ownerName: owner.ownerName,
        years,
        companySharePct: owner.companySharePct,
        projectedPropertyValue: target.projectedPropertyValue,
        projectedBankBalance: target.projectedBankBalance,
        projectedRemainingDebt: target.projectedRemainingDebt,
        projectedProjectNetWorth: target.projectedProjectNetWorth,
        projectedOwnerValue: target.projectedOwnerValue,
        investedCapital: target.cumulativeInvestedCapital,
        startEquityContribution: owner.startEquityContribution,
        capitalPayments,
        nonWealthPayments: target.cumulativeNonWealthPayments,
        averageAnnualReturnPct: roundPct(returnResult.rate * 100),
        returnMethod: returnResult.method,
        annualProjection
      };
    }),
    diagnostics: []
  };
}

function buildAnnualProjection({
  snapshot,
  ownerId,
  companySharePct,
  startEquityContribution,
  debt,
  cashflow,
  contributions
}: {
  snapshot: ProjectSnapshot;
  ownerId: string;
  companySharePct: number;
  startEquityContribution: number;
  debt: DebtResult;
  cashflow: CashflowResult;
  contributions: ContributionResult;
}): PersonalReturnYearPoint[] {
  let cumulativeInvestedCapital = roundMoney(startEquityContribution);
  let cumulativeTotalPayments = roundMoney(startEquityContribution);

  return Array.from({ length: MAX_PROJECTION_YEARS + 1 }, (_value, year) => {
    if (year > 0) {
      const recurring = contributionForYear(contributions, ownerId, year);
      const capitalPayment = roundMoney(
        (recurring?.capitalContributionMonthly ?? 0) * 12
      );
      const totalPayment = roundMoney(
        (recurring?.totalMonthlyContribution ?? recurring?.amount ?? 0) * 12
      );
      cumulativeInvestedCapital = roundMoney(
        cumulativeInvestedCapital + capitalPayment
      );
      cumulativeTotalPayments = roundMoney(
        cumulativeTotalPayments + totalPayment
      );
    }

    const projectedPropertyValue = roundMoney(
      snapshot.property.data.purchasePrice *
        (1 + snapshot.strategy.data.appreciationPercentPerYear / 100) ** year
    );
    const targetMonth = Math.max(0, year * 12 - 1);
    const projectedRemainingDebt = roundMoney(
      debt.monthlyDebtService[targetMonth]?.remainingDebt ??
        debt.monthlyDebtService.at(-1)?.remainingDebt ??
        debt.totalRemainingDebt
    );
    const projectedBankBalance = roundMoney(
      (year === 0
        ? cashflow.bankAccountMonthly[0]?.closingBalance
        : cashflow.bankAccountYearly.find(
            (candidate) => candidate.year === year
          )?.closingBalance) ??
        cashflow.bankAccountYearly.at(-1)?.closingBalance ??
        0
    );
    const projectedProjectNetWorth = roundMoney(
      projectedPropertyValue + projectedBankBalance - projectedRemainingDebt
    );

    return {
      year,
      cumulativeInvestedCapital,
      cumulativeTotalPayments,
      cumulativeNonWealthPayments: roundMoney(
        cumulativeTotalPayments - cumulativeInvestedCapital
      ),
      projectedPropertyValue,
      projectedBankBalance,
      projectedRemainingDebt,
      projectedProjectNetWorth,
      projectedOwnerValue: roundMoney(
        (companySharePct / 100) * projectedProjectNetWorth
      )
    };
  });
}

function contributionForYear(
  contributions: ContributionResult,
  ownerId: string,
  year: number
) {
  const targetMonth = (year - 1) * 12;
  const schedule =
    [...contributions.recurringContributions]
      .reverse()
      .find((candidate) => candidate.month <= targetMonth) ??
    contributions.recurringContributions[0];
  return schedule?.contributions.find(
    (candidate) => candidate.ownerId === ownerId
  );
}

function projectionPoint(
  projection: PersonalReturnYearPoint[],
  year: number
): PersonalReturnYearPoint {
  return projection.find((point) => point.year === year) ?? projection.at(-1)!;
}

function averageAnnualReturn({
  startEquity,
  annualCapitalPayments,
  projectedOwnerValue,
  years,
  investedCapital
}: {
  startEquity: number;
  annualCapitalPayments: number[];
  projectedOwnerValue: number;
  years: number;
  investedCapital: number;
}): { rate: number; method: "internalRate" | "fallback" | "notAvailable" } {
  if (investedCapital <= 0 || projectedOwnerValue <= 0 || years <= 0) {
    return { rate: 0, method: "notAvailable" };
  }

  const internalRate = solveInternalRate({
    startEquity,
    annualCapitalPayments,
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
  annualCapitalPayments,
  projectedOwnerValue,
  years
}: {
  startEquity: number;
  annualCapitalPayments: number[];
  projectedOwnerValue: number;
  years: number;
}): number | undefined {
  let low = -0.95;
  let high = 1;
  const lowNpv = netPresentValue(low, {
    startEquity,
    annualCapitalPayments,
    projectedOwnerValue,
    years
  });
  const highNpv = netPresentValue(high, {
    startEquity,
    annualCapitalPayments,
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
      annualCapitalPayments,
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
    annualCapitalPayments,
    projectedOwnerValue,
    years
  }: {
    startEquity: number;
    annualCapitalPayments: number[];
    projectedOwnerValue: number;
    years: number;
  }
): number {
  let npv = -startEquity;
  for (let year = 1; year <= years; year += 1) {
    npv -= (annualCapitalPayments[year - 1] ?? 0) / (1 + rate) ** year;
  }
  npv += projectedOwnerValue / (1 + rate) ** years;
  return npv;
}
