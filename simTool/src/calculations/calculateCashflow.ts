import type { OpexItem } from "../modules/opex/types";
import {
  calculateAnnualLegalOngoingCosts,
  calculateClosingCostsTotal,
  calculateFundingBalance,
  calculateMortgageRegistrationFee,
  calculateVatAtPurchase,
  calculateVatRefund
} from "./financialInputs";
import { diagnostic } from "../validation/diagnostics";
import { roundMoney } from "./rounding";
import type {
  CashflowMonth,
  CashflowResult,
  CashflowYear,
  BankAccountMonth,
  BankAccountYear,
  ContributionResult,
  DebtResult,
  ErgebnisrechnungYear,
  LiquidityResult,
  OpexBreakdownItem,
  OperatingWaterfallYear,
  ProjectSnapshot,
  VermoegensuebersichtYear
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
        "Erwartete Monatsmiete fehlt; der Bankkonto-Zahlungsfluss rechnet mit null Mieterloes."
      )
    );
  }

  const monthly = Array.from(
    { length: snapshot.metadata.timeHorizonMonths },
    (_value, month) => {
      const vacancyLoss = roundMoney((monthlyRent * vacancyRatePct) / 100);
      const effectiveIncome = roundMoney(monthlyRent - vacancyLoss);
      const opexBreakdown = monthlyOpexBreakdown(snapshot, month);
      const recoverableOpex = roundMoney(
        opexBreakdown
          .filter((item) => item.recoverableFromTenants)
          .reduce((total, item) => total + item.amount, 0)
      );
      const nonRecoverableOpex = roundMoney(
        opexBreakdown
          .filter((item) => !item.recoverableFromTenants)
          .reduce((total, item) => total + item.amount, 0)
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
        opexBreakdown,
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
    bankAccountMonthly: [],
    bankAccountYearly: [],
    operatingWaterfallYearly: [],
    ergebnisrechnungYearly: [],
    vermoegensuebersichtYearly: [],
    cumulativeCashflow: roundMoney(
      monthly.reduce(
        (total, month) => total + month.netCashflowAfterDebtService,
        0
      )
    ),
    diagnostics
  };
}

export function calculateBankAccountCashflow(
  snapshot: ProjectSnapshot,
  contributions: ContributionResult,
  cashflow: CashflowResult,
  debt: DebtResult,
  liquidity: LiquidityResult
): Pick<
  CashflowResult,
  | "bankAccountMonthly"
  | "bankAccountYearly"
  | "operatingWaterfallYearly"
  | "ergebnisrechnungYearly"
  | "vermoegensuebersichtYearly"
> {
  const purchaseMonth = snapshot.property.data.purchaseMonth ?? 0;
  const initialContributionTotal = contributions.initialContributions.reduce(
    (total, contribution) => total + contribution.amount,
    0
  );
  const bankAccountMonthly = Array.from(
    { length: snapshot.metadata.timeHorizonMonths },
    (_value, month) => {
      const recurring = getRecurringContributionBreakdown(contributions, month);
      const cashflowMonth = cashflow.monthly[month];
      const acquisition =
        month === purchaseMonth
          ? snapshot.property.data.purchasePrice +
            calculateVatAtPurchase(snapshot) +
            calculateClosingCostsTotal(snapshot) +
            calculateMortgageRegistrationFee(snapshot)
          : 0;
      const renovation = snapshot.property.data.renovationItems
        .filter((item) => item.timingMonth === month)
        .reduce((total, item) => total + item.amount, 0);
      const opex = cashflowMonth
        ? cashflowMonth.recoverableOpex + cashflowMonth.nonRecoverableOpex
        : 0;
      const startEquity = month === 0 ? initialContributionTotal : 0;
      const debtDrawdown =
        month === snapshot.financing.data.startMonth ? debt.totalInitialDebt : 0;
      const rentalIncome = cashflowMonth?.effectiveIncome ?? 0;
      const vatRefund =
        month === snapshot.property.data.vatRefundMonth
          ? calculateVatRefund(snapshot)
          : 0;
      const interest = cashflowMonth?.interest ?? 0;
      const principalRepayment = cashflowMonth?.principalRepayment ?? 0;
      const totalIncome = roundMoney(
        startEquity +
          recurring.costContributions +
          recurring.capitalContributions +
          recurring.usageContributions +
          recurring.reserveContributions +
          debtDrawdown +
          rentalIncome +
          vatRefund
      );
      const totalExpenses = roundMoney(
        acquisition + renovation + opex + interest + principalRepayment
      );

      return {
        month,
        startEquity: roundMoney(startEquity),
        costContributions: roundMoney(recurring.costContributions),
        capitalContributions: roundMoney(recurring.capitalContributions),
        usageContributions: roundMoney(recurring.usageContributions),
        reserveContributions: roundMoney(recurring.reserveContributions),
        debtDrawdown: roundMoney(debtDrawdown),
        rentalIncome: roundMoney(rentalIncome),
        vatRefund: roundMoney(vatRefund),
        acquisition: roundMoney(acquisition),
        renovation: roundMoney(renovation),
        opex: roundMoney(opex),
        interest: roundMoney(interest),
        principalRepayment: roundMoney(principalRepayment),
        totalIncome,
        totalExpenses,
        netMovement: roundMoney(totalIncome - totalExpenses),
        closingBalance: liquidity.monthly[month]?.closingBalance ?? 0
      } satisfies BankAccountMonth;
    }
  );

  return {
    bankAccountMonthly,
    bankAccountYearly: aggregateBankAccountYears(bankAccountMonthly),
    operatingWaterfallYearly: aggregateOperatingWaterfallYears(
      snapshot,
      cashflow,
      bankAccountMonthly
    ),
    ergebnisrechnungYearly: aggregateErgebnisrechnungYears(
      snapshot,
      cashflow,
      bankAccountMonthly
    ),
    vermoegensuebersichtYearly: aggregateVermoegensuebersichtYears(
      snapshot,
      debt,
      bankAccountMonthly
    )
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

function monthlyOpexBreakdown(
  snapshot: ProjectSnapshot,
  month: number
): OpexBreakdownItem[] {
  const recurring = snapshot.opex.data.recurringItems
    .filter((item) => item.category !== "reserve")
    .map((item) => ({
      itemId: item.id,
      label: item.label,
      category: item.category,
      recoverableFromTenants: item.recoverableFromTenants ?? false,
      amount: roundMoney(monthlyOpexAmount(item, month, snapshot))
    }));
  const tourismFee = roundMoney(snapshot.property.data.tourismFeeAnnualAmount / 12);
  const legalOngoing = roundMoney(calculateAnnualLegalOngoingCosts(snapshot) / 12);
  const legalOngoingItem =
    legalOngoing > 0
      ? [
          {
            itemId: "legal-form-ongoing",
            label: "Rechtsform/Buchhaltung",
            category: "accounting",
            recoverableFromTenants: false,
            amount: legalOngoing
          }
        ]
      : [];

  return [
    ...recurring,
    ...legalOngoingItem,
    ...(tourismFee > 0
      ? [
          {
            itemId: "tourism-fee",
            label: "Aufenthaltsabgaben",
            category: "tax",
            recoverableFromTenants: false,
            amount: tourismFee
          }
        ]
      : [])
  ];
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

function getRecurringContributionBreakdown(
  contributions: ContributionResult,
  month: number
): {
  costContributions: number;
  capitalContributions: number;
  usageContributions: number;
  reserveContributions: number;
} {
  const activeSchedule = contributions.recurringContributions
    .filter((schedule) => schedule.month <= month)
    .at(-1);

  if (!activeSchedule || month >= activeSchedule.month + 12) {
    return {
      costContributions: 0,
      capitalContributions: 0,
      usageContributions: 0,
      reserveContributions: 0
    };
  }

  return activeSchedule.contributions.reduce(
    (total, contribution) => ({
      costContributions:
        total.costContributions +
        (contribution.costContributionMonthly ??
          contribution.baseMonthlyObligation ??
          0),
      capitalContributions:
        total.capitalContributions +
        (contribution.capitalContributionMonthly ?? 0),
      usageContributions:
        total.usageContributions +
        (contribution.usageContributionMonthly ?? 0),
      reserveContributions:
        total.reserveContributions +
        (contribution.liquidityReserveMonthly ??
          contribution.reserveTopUp ??
          0)
    }),
    {
      costContributions: 0,
      capitalContributions: 0,
      usageContributions: 0,
      reserveContributions: 0
    }
  );
}

function aggregateOperatingWaterfallYears(
  snapshot: ProjectSnapshot,
  cashflow: CashflowResult,
  bankAccountMonthly: readonly BankAccountMonth[]
): OperatingWaterfallYear[] {
  return cashflow.yearly.map((year) => {
    const months = cashflow.monthly.filter(
      (month) => Math.floor(month.month / 12) + 1 === year.year
    );
    const bankMonths = bankAccountMonthly.filter(
      (month) => Math.floor(month.month / 12) + 1 === year.year
    );
    const usageContributions = bankMonths.reduce(
      (total, month) => total + month.usageContributions,
      0
    );
    const reserve = bankMonths.reduce(
      (total, month) => total + month.reserveContributions,
      0
    );
    const admin = months.reduce(
      (total, month) =>
        total +
        month.opexBreakdown
          .filter((item) => item.category === "accounting")
          .reduce((sum, item) => sum + item.amount, 0),
      0
    );
    const variableCosts = year.recoverableOpex;
    const fixedCosts = Math.max(0, year.nonRecoverableOpex - admin);
    const bruttoOperativeEinzahlungen = roundMoney(
      year.effectiveIncome + usageContributions
    );
    const betriebsergebnisVorRuecklagen = roundMoney(
      bruttoOperativeEinzahlungen - variableCosts - fixedCosts
    );
    const bankpruefungsZahlungsfluss = roundMoney(
      betriebsergebnisVorRuecklagen - reserve - admin
    );
    const zahlungsflussNachKapitaldienst = roundMoney(
      bankpruefungsZahlungsfluss - year.interest - year.principalRepayment
    );
    const steuerzahlungenUndErstattungen = roundMoney(
      bankMonths.reduce((total, month) => total + month.vatRefund, 0)
    );
    const closingBalance = bankMonths.at(-1)?.closingBalance ?? 0;
    const auffuellungMindestliquiditaet = roundMoney(
      Math.max(0, snapshot.strategy.data.minimumLiquidityAmount - closingBalance)
    );

    return {
      year: year.year,
      bruttoOperativeEinzahlungen,
      vertriebUndZahlungsgebuehren: 0,
      variableBetriebskosten: roundMoney(variableCosts),
      fixeBetriebskosten: roundMoney(fixedCosts),
      betriebsergebnisVorRuecklagen,
      instandhaltungsUndAusbaureserve: roundMoney(reserve),
      verwaltungRechtBuchhaltung: roundMoney(admin),
      bankpruefungsZahlungsfluss,
      zins: roundMoney(year.interest),
      planmaessigeTilgung: roundMoney(year.principalRepayment),
      zahlungsflussNachKapitaldienst,
      steuerzahlungenUndErstattungen,
      auffuellungMindestliquiditaet,
      ausschuettbarerZahlungsueberschuss: roundMoney(
        Math.max(
          0,
          zahlungsflussNachKapitaldienst +
            steuerzahlungenUndErstattungen -
            auffuellungMindestliquiditaet
        )
      )
    };
  });
}

function aggregateErgebnisrechnungYears(
  snapshot: ProjectSnapshot,
  cashflow: CashflowResult,
  bankAccountMonthly: readonly BankAccountMonth[]
): ErgebnisrechnungYear[] {
  const depreciableBasis =
    snapshot.property.data.purchasePrice +
    snapshot.property.data.renovationItems.reduce(
      (total, item) => total + item.amount,
      0
    );
  const annualDepreciation = depreciableBasis > 0 ? depreciableBasis / 50 : 0;

  return cashflow.yearly.map((year) => {
    const bankMonths = bankAccountMonthly.filter(
      (month) => Math.floor(month.month / 12) + 1 === year.year
    );
    const usageContributions = bankMonths.reduce(
      (total, month) => total + month.usageContributions,
      0
    );
    const erloese = roundMoney(year.effectiveIncome + usageContributions);
    const betriebskosten = roundMoney(year.recoverableOpex + year.nonRecoverableOpex);
    const abschreibung = roundMoney(annualDepreciation);
    const zinsaufwand = roundMoney(year.interest);

    return {
      year: year.year,
      erloese,
      betriebskosten,
      abschreibung,
      zinsaufwand,
      ergebnisVorSteuern: roundMoney(
        erloese - betriebskosten - abschreibung - zinsaufwand
      )
    };
  });
}

function aggregateVermoegensuebersichtYears(
  snapshot: ProjectSnapshot,
  debt: DebtResult,
  bankAccountMonthly: readonly BankAccountMonth[]
): VermoegensuebersichtYear[] {
  const funding = calculateFundingBalance(snapshot);
  const shareholderLoans = funding.mittelherkunft
    .filter((source) => source.zahlungsklasse === "gesellschafterdarlehen")
    .reduce((total, source) => total + source.betrag, 0);
  const propertyBasis =
    snapshot.property.data.purchasePrice +
    snapshot.property.data.renovationItems.reduce(
      (total, item) => total + item.amount,
      0
    );
  const annualDepreciation = propertyBasis > 0 ? propertyBasis / 50 : 0;
  const years = new Map<number, BankAccountMonth>();

  for (const month of bankAccountMonthly) {
    years.set(Math.floor(month.month / 12) + 1, month);
  }

  return [...years.entries()].map(([year, lastMonth]) => {
    const remainingDebt =
      debt.monthlyDebtService
        .filter((month) => Math.floor(month.month / 12) + 1 === year)
        .at(-1)?.remainingDebt ?? debt.totalRemainingDebt;
    const immobilienwert = roundMoney(
      Math.max(0, propertyBasis - annualDepreciation * year)
    );
    const bankguthaben = roundMoney(lastMonth.closingBalance);
    const zweckgebundeneReserve = roundMoney(
      Math.min(bankguthaben, snapshot.strategy.data.targetLiquidityAmount)
    );
    const vermoegen = roundMoney(immobilienwert + bankguthaben);
    const verbindlichkeiten = roundMoney(remainingDebt + shareholderLoans);
    const eigenkapital = roundMoney(vermoegen - verbindlichkeiten);

    return {
      year,
      vermoegen,
      immobilienwert,
      bankguthaben,
      zweckgebundeneReserve,
      verbindlichkeiten,
      bankdarlehen: roundMoney(remainingDebt),
      gesellschafterdarlehen: roundMoney(shareholderLoans),
      eigenkapital,
      saldendifferenz: roundMoney(vermoegen - verbindlichkeiten - eigenkapital)
    };
  });
}

function aggregateBankAccountYears(
  monthly: readonly BankAccountMonth[]
): BankAccountYear[] {
  const years = new Map<number, BankAccountYear>();

  for (const month of monthly) {
    const year = Math.floor(month.month / 12) + 1;
    const existing =
      years.get(year) ??
      ({
        year,
        startEquity: 0,
        costContributions: 0,
        capitalContributions: 0,
        usageContributions: 0,
        reserveContributions: 0,
        debtDrawdown: 0,
        rentalIncome: 0,
        vatRefund: 0,
        acquisition: 0,
        renovation: 0,
        opex: 0,
        interest: 0,
        principalRepayment: 0,
        totalIncome: 0,
        totalExpenses: 0,
        netMovement: 0,
        closingBalance: 0
      } satisfies BankAccountYear);

    existing.startEquity += month.startEquity;
    existing.costContributions += month.costContributions;
    existing.capitalContributions += month.capitalContributions;
    existing.usageContributions += month.usageContributions;
    existing.reserveContributions += month.reserveContributions;
    existing.debtDrawdown += month.debtDrawdown;
    existing.rentalIncome += month.rentalIncome;
    existing.vatRefund += month.vatRefund;
    existing.acquisition += month.acquisition;
    existing.renovation += month.renovation;
    existing.opex += month.opex;
    existing.interest += month.interest;
    existing.principalRepayment += month.principalRepayment;
    existing.totalIncome += month.totalIncome;
    existing.totalExpenses += month.totalExpenses;
    existing.netMovement += month.netMovement;
    existing.closingBalance = month.closingBalance;
    years.set(year, existing);
  }

  return [...years.values()].map((year) => ({
    year: year.year,
    startEquity: roundMoney(year.startEquity),
    costContributions: roundMoney(year.costContributions),
    capitalContributions: roundMoney(year.capitalContributions),
    usageContributions: roundMoney(year.usageContributions),
    reserveContributions: roundMoney(year.reserveContributions),
    debtDrawdown: roundMoney(year.debtDrawdown),
    rentalIncome: roundMoney(year.rentalIncome),
    vatRefund: roundMoney(year.vatRefund),
    acquisition: roundMoney(year.acquisition),
    renovation: roundMoney(year.renovation),
    opex: roundMoney(year.opex),
    interest: roundMoney(year.interest),
    principalRepayment: roundMoney(year.principalRepayment),
    totalIncome: roundMoney(year.totalIncome),
    totalExpenses: roundMoney(year.totalExpenses),
    netMovement: roundMoney(year.netMovement),
    closingBalance: roundMoney(year.closingBalance)
  }));
}
