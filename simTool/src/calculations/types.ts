import type { SourceRef } from "../domain/templates";
import type { ProjectState } from "../state/projectStore";
import type { DiagnosticMessage } from "../validation/diagnostics";

export type ProjectSnapshot = ProjectState & {
  metadata: {
    currency: "EUR";
    locale: "de-DE";
    timeHorizonMonths: number;
    calculatedAt: string;
  };
};

export type OwnerContribution = {
  ownerId: string;
  ownerName: string;
  amount: number;
  basis: "ownershipShare" | "equalSplit" | "custom";
  sharePct: number;
};

export type OwnerContributionSchedule = {
  month: number;
  contributions: OwnerContribution[];
};

export type ContributionResult = {
  initialContributions: OwnerContribution[];
  recurringContributions: OwnerContributionSchedule[];
  totalByOwner: Record<string, number>;
  requiredInitialContribution: number;
  requiredMonthlyContribution: number;
  diagnostics: DiagnosticMessage[];
};

export type LoanMonth = {
  month: number;
  openingBalance: number;
  interest: number;
  principalRepayment: number;
  payment: number;
  closingBalance: number;
};

export type LoanResult = {
  id: string;
  name: string;
  principal: number;
  annualInterestRatePct: number;
  initialRepaymentRatePct?: number;
  fixedMonthlyPayment?: number;
  monthly: LoanMonth[];
};

export type DebtServiceMonth = {
  month: number;
  interest: number;
  principalRepayment: number;
  totalPayment: number;
  remainingDebt: number;
};

export type DebtResult = {
  loans: LoanResult[];
  totalInitialDebt: number;
  totalRemainingDebt: number;
  totalInterestPaid: number;
  totalPrincipalPaid: number;
  monthlyDebtService: DebtServiceMonth[];
  diagnostics: DiagnosticMessage[];
};

export type CashflowMonth = {
  month: number;
  rentalIncome: number;
  vacancyLoss: number;
  effectiveIncome: number;
  recoverableOpex: number;
  nonRecoverableOpex: number;
  debtService: number;
  netCashflowBeforeContributions: number;
  netCashflowAfterDebtService: number;
};

export type CashflowYear = Omit<CashflowMonth, "month"> & {
  year: number;
};

export type CashflowResult = {
  monthly: CashflowMonth[];
  yearly: CashflowYear[];
  cumulativeCashflow: number;
  diagnostics: DiagnosticMessage[];
};

export type LiquidityMonth = {
  month: number;
  openingBalance: number;
  inflows: number;
  outflows: number;
  closingBalance: number;
  sourceRefs?: SourceRef[];
};

export type LiquidityResult = {
  monthly: LiquidityMonth[];
  minimumLiquidity: number;
  finalLiquidity: number;
  firstNegativeMonth?: number;
  diagnostics: DiagnosticMessage[];
};

export type CalculationResult = {
  liquidity: LiquidityResult;
  contributions: ContributionResult;
  cashflow: CashflowResult;
  debt: DebtResult;
  diagnostics: DiagnosticMessage[];
};
