import type { OpexItem } from "../modules/opex/types";
import { diagnostic } from "../validation/diagnostics";
import { roundMoney } from "./rounding";
import type {
  CashflowMonth,
  CashflowResult,
  CashflowYear,
  DebtResult,
  ProjectSnapshot
} from "./types";

export function calculateCashflow(
  snapshot: ProjectSnapshot,
  debt: DebtResult
): CashflowResult {
  const diagnostics = [];
  const monthlyRent = snapshot.property.data.expectedMonthlyRent ?? 0;
  const vacancyRatePct = snapshot.property.data.vacancyRatePct ?? 0;

  if (snapshot.property.data.expectedMonthlyRent === undefined) {
    diagnostics.push(
      diagnostic(
        "cashflow.missing-rent",
        "warning",
        "cashflow",
        "Expected monthly rent is missing; cashflow uses zero rental income."
      )
    );
  }

  const monthly = Array.from(
    { length: snapshot.metadata.timeHorizonMonths },
    (_value, month) => {
      const vacancyLoss = roundMoney((monthlyRent * vacancyRatePct) / 100);
      const effectiveIncome = roundMoney(monthlyRent - vacancyLoss);
      const recoverableOpex = roundMoney(
        snapshot.opex.data.recurringItems
          .filter((item) => item.recoverableFromTenants)
          .reduce(
            (total, item) => total + monthlyOpexAmount(item, month, snapshot),
            0
          )
      );
      const nonRecoverableOpex = roundMoney(
        snapshot.opex.data.recurringItems
          .filter((item) => !item.recoverableFromTenants)
          .reduce(
            (total, item) => total + monthlyOpexAmount(item, month, snapshot),
            0
          ) + snapshot.property.data.tourismFeeAnnualAmount / 12
      );
      const debtService = debt.monthlyDebtService[month]?.totalPayment ?? 0;
      const interest = debt.monthlyDebtService[month]?.interest ?? 0;
      const principalRepayment =
        debt.monthlyDebtService[month]?.principalRepayment ?? 0;
      const netCashflowBeforeContributions = roundMoney(
        effectiveIncome - recoverableOpex - nonRecoverableOpex
      );

      return {
        month,
        rentalIncome: roundMoney(monthlyRent),
        vacancyLoss,
        effectiveIncome,
        recoverableOpex,
        nonRecoverableOpex,
        operatingResult: netCashflowBeforeContributions,
        debtService,
        interest,
        principalRepayment,
        netCashflowBeforeContributions,
        netCashflowAfterDebtService: roundMoney(
          netCashflowBeforeContributions - debtService
        )
      } satisfies CashflowMonth;
    }
  );

  return {
    monthly,
    yearly: aggregateCashflowYears(monthly),
    cumulativeCashflow: roundMoney(
      monthly.reduce(
        (total, month) => total + month.netCashflowAfterDebtService,
        0
      )
    ),
    diagnostics
  };
}

export function monthlyOpexAmount(
  item: OpexItem,
  month: number,
  snapshot?: ProjectSnapshot
): number {
  const baseMonthlyAmount = annualOpexAmount(item, snapshot) / 12;
  const inflationRate = (item.inflationPct ?? 0) / 100;
  return baseMonthlyAmount * (1 + inflationRate) ** (month / 12);
}

export function annualOpexAmount(
  item: OpexItem,
  snapshot?: ProjectSnapshot
): number {
  const legacyAnnualAmount =
    item.period === "monthly"
      ? item.amount * 12
      : item.period === "quarterly"
        ? item.amount * 4
        : item.amount;
  const base = item.annualAmount ?? legacyAnnualAmount;
  const mode = item.annualCostMode ?? "fixed";

  if (!snapshot || mode === "fixed") {
    return base;
  }

  if (mode === "rentableArea") {
    return base * (snapshot.property.data.rentableAreaSqm ?? 0);
  }

  if (mode === "plotArea") {
    return base * (snapshot.property.data.plotAreaSqm ?? 0);
  }

  return (snapshot.property.data.purchasePrice * base) / 100;
}

function aggregateCashflowYears(monthly: readonly CashflowMonth[]): CashflowYear[] {
  const years = new Map<number, CashflowYear>();

  for (const month of monthly) {
    const year = Math.floor(month.month / 12) + 1;
    const existing =
      years.get(year) ??
      ({
        year,
        rentalIncome: 0,
        vacancyLoss: 0,
        effectiveIncome: 0,
        recoverableOpex: 0,
        nonRecoverableOpex: 0,
        operatingResult: 0,
        debtService: 0,
        interest: 0,
        principalRepayment: 0,
        netCashflowBeforeContributions: 0,
        netCashflowAfterDebtService: 0
      } satisfies CashflowYear);

    existing.rentalIncome += month.rentalIncome;
    existing.vacancyLoss += month.vacancyLoss;
    existing.effectiveIncome += month.effectiveIncome;
    existing.recoverableOpex += month.recoverableOpex;
    existing.nonRecoverableOpex += month.nonRecoverableOpex;
    existing.operatingResult += month.operatingResult;
    existing.debtService += month.debtService;
    existing.interest += month.interest;
    existing.principalRepayment += month.principalRepayment;
    existing.netCashflowBeforeContributions +=
      month.netCashflowBeforeContributions;
    existing.netCashflowAfterDebtService += month.netCashflowAfterDebtService;
    years.set(year, existing);
  }

  return [...years.values()].map((year) => ({
    year: year.year,
    rentalIncome: roundMoney(year.rentalIncome),
    vacancyLoss: roundMoney(year.vacancyLoss),
    effectiveIncome: roundMoney(year.effectiveIncome),
    recoverableOpex: roundMoney(year.recoverableOpex),
    nonRecoverableOpex: roundMoney(year.nonRecoverableOpex),
    operatingResult: roundMoney(year.operatingResult),
    debtService: roundMoney(year.debtService),
    interest: roundMoney(year.interest),
    principalRepayment: roundMoney(year.principalRepayment),
    netCashflowBeforeContributions: roundMoney(
      year.netCashflowBeforeContributions
    ),
    netCashflowAfterDebtService: roundMoney(year.netCashflowAfterDebtService)
  }));
}
