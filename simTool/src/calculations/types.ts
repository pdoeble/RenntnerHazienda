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

export type Zahlungsklasse =
  | "echtesEigenkapital"
  | "kapitalruecklage"
  | "nachschuss"
  | "gesellschafterdarlehen"
  | "bankdarlehen"
  | "nutzungsentgelt"
  | "kostenumlage"
  | "liquiditaetsreserve"
  | "vermietungserloes"
  | "foerderung"
  | "sonstige";

export type MittelverwendungKlasse =
  | "kaufpreis"
  | "grunderwerbsteuer"
  | "grundbuchEigentum"
  | "pfandrecht"
  | "eingabegebuehr"
  | "makler"
  | "vertragNotar"
  | "beglaubigung"
  | "technischePruefung"
  | "renovierung"
  | "einrichtung"
  | "finanzierungsgebuehr"
  | "sicherheitspuffer"
  | "anfangsliquiditaet"
  | "anfangsruecklage"
  | "gruendungskosten"
  | "sonstige";

export type MittelverwendungResult = {
  id: string;
  label: string;
  klasse: MittelverwendungKlasse;
  nettoBetrag: number;
  umsatzsteuerBetrag: number;
  bruttoBetrag: number;
  monat: number;
  aktivierbar: boolean;
  umsatzsteuerRelevant: boolean;
};

export type MittelherkunftResult = {
  id: string;
  label: string;
  zahlungsklasse: Zahlungsklasse;
  betrag: number;
  monat: number;
  rueckzahlbar: boolean;
  zinssatzPct: number;
  rang: "vorrangig" | "gleichrangig" | "nachrangig" | "eigenkapitalnah" | "offen";
  besichert: boolean;
  wirktAufUnternehmensanteil: boolean;
  wirktAufNutzungsrechte: boolean;
  umsatzsteuerRelevant: boolean;
};

export type FundingBalanceResult = {
  mittelverwendung: MittelverwendungResult[];
  mittelherkunft: MittelherkunftResult[];
  gesamtMittelverwendung: number;
  gesamtMittelherkunft: number;
  nichtBankMittelherkunft: number;
  bankdarlehen: number;
  finanzierungsluecke: number;
  finanzierungsueberschuss: number;
  istSaldierend: boolean;
};

export type CapitalNeedResult = {
  items: CapitalNeedItem[];
  funding: FundingBalanceResult;
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
  shareEffectiveCapitalValue: number;
  nonDilutingCapitalValue: number;
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

export type OperatingWaterfallYear = {
  year: number;
  bruttoOperativeEinzahlungen: number;
  vertriebUndZahlungsgebuehren: number;
  variableBetriebskosten: number;
  fixeBetriebskosten: number;
  betriebsergebnisVorRuecklagen: number;
  instandhaltungsUndAusbaureserve: number;
  verwaltungRechtBuchhaltung: number;
  bankpruefungsZahlungsfluss: number;
  zins: number;
  planmaessigeTilgung: number;
  zahlungsflussNachKapitaldienst: number;
  steuerzahlungenUndErstattungen: number;
  auffuellungMindestliquiditaet: number;
  ausschuettbarerZahlungsueberschuss: number;
};

export type ErgebnisrechnungYear = {
  year: number;
  erloese: number;
  betriebskosten: number;
  abschreibung: number;
  zinsaufwand: number;
  ergebnisVorSteuern: number;
};

export type VermoegensuebersichtYear = {
  year: number;
  vermoegen: number;
  immobilienwert: number;
  bankguthaben: number;
  zweckgebundeneReserve: number;
  verbindlichkeiten: number;
  bankdarlehen: number;
  gesellschafterdarlehen: number;
  eigenkapital: number;
  saldendifferenz: number;
};

export type CashflowResult = {
  monthly: CashflowMonth[];
  yearly: CashflowYear[];
  bankAccountMonthly: BankAccountMonth[];
  bankAccountYearly: BankAccountYear[];
  operatingWaterfallYearly: OperatingWaterfallYear[];
  ergebnisrechnungYearly: ErgebnisrechnungYear[];
  vermoegensuebersichtYearly: VermoegensuebersichtYear[];
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
  ownerUseMarketOffsetValue: number;
  ownerUseCostFloorValue: number;
  ownerUseEconomicValue: number;
  externalRentableRoomNights: number;
  externalOccupiedRoomNights: number;
  externalOccupancyPct: number;
  averageGrossPricePerExternalRoomNight: number;
  netExternalRevenue: number;
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

export type SichtSummaryResult = {
  objektkennung?: string;
  fallkennung: string;
  szenariokennung: string;
  annahmenquelle: string;
  objekte: {
    kaufpreis: number;
    gesamtmittelverwendung: number;
    zimmernachtKapazitaet: number;
    externeAuslastungPct: number;
  };
  rechtstraeger: {
    bankkontoEndstand: number;
    ausschuettbarerZahlungsueberschussJahr1: number;
    eigenkapital: number;
    verbindlichkeiten: number;
  };
  mitglieder: {
    anzahl: number;
    startEk: number;
    nutzungsentgeltJahr: number;
  };
  bank: {
    bankdarlehen: number;
    beleihungsauslaufPct: number;
    kapitaldienstdeckungsgrad: number;
  };
};

export type BankKennzahlResult = {
  bankpruefungsZahlungsflussJahr1: number;
  kapitaldienstJahr1: number;
  kapitaldienstdeckungsgrad: number;
  beleihungsauslaufPct: number;
  zielBeleihungsauslaufPct: number;
  persoenlicheMonatszahlungen: number;
  persoenlichesMonatsnettoeinkommen: number;
  persoenlicheBelastungsquotePct: number | null;
  laufzeitJahre: number;
  fmaBelastungsquoteRichtwertPct: number;
  fmaLaufzeitRichtwertJahre: number;
  stressfaelle: BankStressCaseResult[];
  diagnostics: DiagnosticMessage[];
};

export type BankStressCaseResult = {
  id: string;
  label: string;
  annahme: string;
  bankpruefungsZahlungsfluss: number;
  kapitaldienst: number;
  kapitaldienstdeckungsgrad: number;
  status: "tragfaehig" | "angespannt" | "kritisch";
};

export type BuchungRow = {
  id: string;
  quelle: "mittelherkunft" | "mittelverwendung";
  vorgang: string;
  zahlungsklasse?: Zahlungsklasse;
  verwendungsklasse?: MittelverwendungKlasse;
  soll: string;
  haben: string;
  betrag: number;
  pruefhinweis: string;
  umsatzsteuerHinweis: string;
};

export type BuchungslogikResult = {
  rows: BuchungRow[];
  diagnostics: DiagnosticMessage[];
};

export type UmsatzsteuerStatus = "ja" | "nein" | "offen";

export type UmsatzsteuerMatrixRow = {
  id: string;
  leistungsart: string;
  zahlungsklasse?: Zahlungsklasse;
  angenommenerSteuersatz: string;
  steuerbar: UmsatzsteuerStatus;
  vorsteuerbezug: UmsatzsteuerStatus;
  dokumentation: string;
  pruefhinweis: string;
  quellenstatus: string;
};

export type UmsatzsteuerResult = {
  rows: UmsatzsteuerMatrixRow[];
  diagnostics: DiagnosticMessage[];
};

export type CalculationResult = {
  sichten: SichtSummaryResult;
  capitalNeed: CapitalNeedResult;
  bank: BankKennzahlResult;
  buchungslogik: BuchungslogikResult;
  umsatzsteuer: UmsatzsteuerResult;
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
