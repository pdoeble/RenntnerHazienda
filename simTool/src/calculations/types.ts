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
  initialEquity?: number;
  startEquityContribution?: number;
  baseMonthlyObligation?: number;
  costContributionMonthly?: number;
  reserveTopUp?: number;
  liquidityReserveMonthly?: number;
  capitalContributionMonthly?: number;
  usageContributionMonthly?: number;
  specialAssessment?: number;
  totalMonthlyContribution?: number;
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

export type CapitalNeedItem = {
  id: string;
  label: string;
  amount: number;
};

export type CapitalNeedResult = {
  items: CapitalNeedItem[];
  purchasePrice: number;
  vatAtPurchase: number;
  vatRefund: number;
  closingCosts: number;
  mortgageRegistrationFee: number;
  renovations: number;
  legalFoundingCosts: number;
  initialReserve: number;
  totalProjectNeed: number;
  ownerEquity: number;
  debtPrincipal: number;
  actualEquityRatioPct: number;
  targetEquityRatioPct: number;
  diagnostics: DiagnosticMessage[];
};

export type CapitalShareOwnerResult = {
  ownerId: string;
  ownerName: string;
  startEquityContribution: number;
  startEquitySharePct: number;
  monthlyCapitalContribution: number;
  monthlyUsageContribution: number;
  usagePointBudget: number;
  capitalValueAtLoanEnd: number;
  companySharePct: number;
};

export type CapitalShareResult = {
  mode: "scheduledPrincipal" | "manualMonthly";
  termYears: number;
  valuationInterestPct: number;
  totalCapitalValueAtLoanEnd: number;
  owners: CapitalShareOwnerResult[];
  diagnostics: DiagnosticMessage[];
};

export type CashflowMonth = {
  month: number;
  rentalIncome: number;
  vacancyLoss: number;
  effectiveIncome: number;
  opexBreakdown: OpexBreakdownItem[];
  recoverableOpex: number;
  nonRecoverableOpex: number;
  operatingResult: number;
  debtService: number;
  interest: number;
  principalRepayment: number;
  netCashflowBeforeContributions: number;
  netCashflowAfterDebtService: number;
};

export type OpexBreakdownItem = {
  itemId: string;
  label: string;
  category?: string;
  recoverableFromTenants: boolean;
  amount: number;
};

export type CashflowYear = Omit<CashflowMonth, "month" | "opexBreakdown"> & {
  year: number;
};

export type BankAccountStack = {
  startEquity: number;
  costContributions: number;
  capitalContributions: number;
  usageContributions: number;
  reserveContributions: number;
  debtDrawdown: number;
  rentalIncome: number;
  vatRefund: number;
  acquisition: number;
  renovation: number;
  opex: number;
  interest: number;
  principalRepayment: number;
};

export type BankAccountMonth = BankAccountStack & {
  month: number;
  totalIncome: number;
  totalExpenses: number;
  netMovement: number;
  closingBalance: number;
};

export type BankAccountYear = BankAccountStack & {
  year: number;
  totalIncome: number;
  totalExpenses: number;
  netMovement: number;
  closingBalance: number;
};

export type CashflowResult = {
  monthly: CashflowMonth[];
  yearly: CashflowYear[];
  bankAccountMonthly: BankAccountMonth[];
  bankAccountYearly: BankAccountYear[];
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

export type TimelineEvent = {
  month: number;
  label: string;
  amount: number;
  kind:
    | "acquisition"
    | "tax"
    | "refund"
    | "renovation"
    | "financing"
    | "liquidity"
    | "debt";
};

export type PointNightType = {
  label: string;
  pointsPerNight: number;
  roomNightPrice: number;
};

export type OwnerPointResult = {
  ownerId: string;
  ownerName: string;
  monthlyUsageContribution: number;
  annualUsageBudget: number;
  usagePointBudget: number;
  usageSharePct: number;
  companySharePct: number;
  pointSharePct: number;
  annualPoints: number;
  affordableNightsAverage: number;
};

export type PointsResult = {
  capacity: number;
  annualPointPool: number;
  propertyValue: number;
  appreciationPercentPerYear: number;
  shareMode: "usage" | "blended" | "tier" | "equity";
  owners: OwnerPointResult[];
  nightTypes: PointNightType[];
  diagnostics: DiagnosticMessage[];
};

export type OccupancyResult = {
  activeHouseId?: string;
  houseTitle: string;
  bedrooms?: number;
  beds?: number;
  capacityPersons: number;
  roomCapacity: number;
  roomNightCapacity: number;
  weekendRoomNightCapacity: number;
  weekdayRoomNightCapacity: number;
  capacityDataQuality: "bedrooms" | "beds" | "missing";
  ownerCount: number;
  ownerDemandNights: number;
  ownerDemandRoomNights: number;
  guestNights: number;
  guestRoomNights: number;
  blockedNights: number;
  blockedRoomNights: number;
  freeNights: number;
  freeRoomNights: number;
  weekendDemandRoomNights: number;
  weekdayDemandRoomNights: number;
  weekendFreeRoomNights: number;
  weekdayFreeRoomNights: number;
  weekendOccupancyPct: number;
  weekdayOccupancyPct: number;
  occupancyPct: number;
  pointsPerAvailableNight: number;
  pressureLabel: string;
  diagnostics: DiagnosticMessage[];
};

export type HouseComparisonRow = {
  id: string;
  title: string;
  place: string;
  purchasePrice: number;
  totalCostRough: number;
  rentableAreaSqm?: number;
  plotAreaSqm?: number;
  rooms?: number;
  bedrooms?: number;
  capacityPersons: number;
  averageDriveMinutes?: number;
  nearestSkiArea?: string;
  nearestSkiMinutes?: number;
  guestNightsPerYear: number;
  occupancyPressurePct: number;
  sourceUrl?: string;
};

export type HouseComparisonResult = {
  activeHouseId?: string;
  houses: HouseComparisonRow[];
  diagnostics: DiagnosticMessage[];
};

export type CalculationResult = {
  capitalNeed: CapitalNeedResult;
  capitalShares: CapitalShareResult;
  points: PointsResult;
  occupancy: OccupancyResult;
  houseComparison: HouseComparisonResult;
  timeline: TimelineEvent[];
  liquidity: LiquidityResult;
  contributions: ContributionResult;
  cashflow: CashflowResult;
  debt: DebtResult;
  diagnostics: DiagnosticMessage[];
};
