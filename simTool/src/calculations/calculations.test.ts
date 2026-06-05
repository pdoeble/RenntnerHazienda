import { describe, expect, it } from "vitest";
import { buildProjectSnapshot } from "./buildProjectSnapshot";
import { calculateAll } from "./calculateAll";
import {
  annualOpexAmount,
  calculateCashflow,
  monthlyOpexAmount
} from "./calculateCashflow";
import {
  calculateInitialContributions,
  calculateReserveTarget
} from "./calculateContributions";
import { calculateDebt } from "./calculateDebt";
import { calculateFundingBalance } from "./financialInputs";
import { calculatePoints, nightPoints } from "./calculatePoints";
import type { ProjectState } from "../state/projectStore";
import { defaultProjectState } from "../state/projectStore";

function projectFixture(): ProjectState {
  return structuredClone(defaultProjectState) as ProjectState;
}

describe("calculation pipeline", () => {
  it("builds a project snapshot with default metadata", () => {
    const snapshot = buildProjectSnapshot(projectFixture());

    expect(snapshot.metadata.currency).toBe("EUR");
    expect(snapshot.metadata.locale).toBe("de-DE");
    expect(snapshot.metadata.timeHorizonMonths).toBe(360);
  });

  it("does not warn about ownership share totals in the default project", () => {
    const result = calculateAll(
      buildProjectSnapshot(projectFixture(), { timeHorizonMonths: 12 })
    );

    expect(
      result.diagnostics.some(
        (diagnostic) => diagnostic.id === "ownership.share-total"
      )
    ).toBe(false);
  });

  it("derives ownership shares and initial contributions from owner equity", () => {
    const snapshot = buildProjectSnapshot(projectFixture(), {
      timeHorizonMonths: 12
    });
    const contributions = calculateInitialContributions(snapshot);

    expect(contributions.requiredInitialContribution).toBe(225000);
    expect(contributions.requiredMonthlyContribution).toBe(0);
    expect(contributions.initialContributions).toHaveLength(11);
    expect(contributions.initialContributions[0]).toEqual(
      expect.objectContaining({
        ownerId: "phil",
        amount: 40000,
        sharePct: 17.7778
      })
    );
    expect(contributions.initialContributions[8]).toEqual(
      expect.objectContaining({
        ownerId: "jens",
        amount: 15000,
        sharePct: 6.6667
      })
    );
    expect(contributions.initialContributions[9]).toEqual(
      expect.objectContaining({
        ownerId: "michael",
        amount: 20000,
        sharePct: 8.8889
      })
    );
  });

  it("converts yearly opex to monthly values", () => {
    const insurance = projectFixture().opex.data.recurringItems[1];

    expect(insurance ? monthlyOpexAmount(insurance, 0) : undefined).toBe(100);
  });

  it("calculates opex from fixed, rentable area, plot area, and property value bases", () => {
    const snapshot = buildProjectSnapshot(projectFixture(), {
      timeHorizonMonths: 12
    });

    expect(
      annualOpexAmount(snapshot.opex.data.recurringItems[0]!, snapshot)
    ).toBe(5040);
    const defaultAnnualOpex = snapshot.opex.data.recurringItems.reduce(
      (total, item) => total + annualOpexAmount(item, snapshot),
      0
    );
    expect(defaultAnnualOpex).toBe(6240);
    expect(defaultAnnualOpex / (snapshot.property.data.rentableAreaSqm ?? 1)).toBeCloseTo(
      22.29,
      2
    );
    expect(
      annualOpexAmount(
        {
          id: "opex-plot",
          label: "Grundstueckspflege",
          amount: 1,
          annualAmount: 2,
          annualCostMode: "plotArea",
          period: "yearly",
          recoverableFromTenants: false
        },
        snapshot
      )
    ).toBe(3880);
    expect(
      annualOpexAmount(
        {
          id: "opex-value",
          label: "Instandhaltung",
          amount: 1,
          annualAmount: 1,
          annualCostMode: "propertyValue",
          period: "yearly",
          recoverableFromTenants: false
        },
        snapshot
      )
    ).toBe(6700);
  });

  it("calculates vacancy and cashflow from rent, opex, and debt service", () => {
    const snapshot = buildProjectSnapshot(projectFixture(), {
      timeHorizonMonths: 12
    });
    const debt = calculateDebt(snapshot, calculateInitialContributions(snapshot));
    const cashflow = calculateCashflow(snapshot, debt);

    expect(cashflow.monthly[0]).toEqual(
      expect.objectContaining({
        rentalIncome: 0,
        vacancyLoss: 0,
        effectiveIncome: 0,
        nonRecoverableOpex: 100,
        operatingResult: -100,
        netCashflowBeforeContributions: -100
      })
    );
    expect(cashflow.monthly[0]?.opexBreakdown).toEqual([
      expect.objectContaining({
        label: "Versicherung",
        amount: 100
      })
    ]);
    expect(cashflow.monthly[0]?.netCashflowAfterDebtService).toBeCloseTo(
      -2865.39,
      1
    );
    expect(cashflow.yearly[0]?.netCashflowAfterDebtService).toBeLessThan(0);
  });

  it("calculates a 25-year annuity debt schedule", () => {
    const snapshot = buildProjectSnapshot(projectFixture(), {
      timeHorizonMonths: 300
    });
    const debt = calculateDebt(snapshot, calculateInitialContributions(snapshot));

    expect(debt.totalInitialDebt).toBe(523910);
    expect(debt.monthlyDebtService[0]?.totalPayment).toBeCloseTo(2765.39, 1);
    expect(debt.monthlyDebtService[0]?.interest).toBeCloseTo(1746.37, 1);
    expect(debt.totalRemainingDebt).toBe(0);
  });

  it("calculates capital need with VAT, closing costs, renovations, reserve, and debt", () => {
    const result = calculateAll(
      buildProjectSnapshot(projectFixture(), { timeHorizonMonths: 12 })
    );

    expect(result.capitalNeed.vatAtPurchase).toBe(0);
    expect(result.capitalNeed.closingCosts).toBe(40870);
    expect(result.capitalNeed.mortgageRegistrationFee).toBe(8040);
    expect(result.capitalNeed.renovations).toBe(0);
    expect(result.capitalNeed.legalFoundingCosts).toBe(0);
    expect(result.capitalNeed.initialReserve).toBe(30000);
    expect(result.capitalNeed.totalProjectNeed).toBe(748910);
    expect(result.capitalNeed.debtPrincipal).toBe(523910);
  });

  it("balances Mittelherkunft and Mittelverwendung with an automatic bank loan", () => {
    const snapshot = buildProjectSnapshot(projectFixture(), {
      timeHorizonMonths: 12
    });
    const funding = calculateFundingBalance(snapshot);

    expect(funding.istSaldierend).toBe(true);
    expect(funding.gesamtMittelverwendung).toBe(748910);
    expect(funding.nichtBankMittelherkunft).toBe(225000);
    expect(funding.bankdarlehen).toBe(523910);
    expect(funding.gesamtMittelherkunft).toBe(funding.gesamtMittelverwendung);
    expect(funding.mittelherkunft).toContainEqual(
      expect.objectContaining({
        id: "bankdarlehen-auto",
        zahlungsklasse: "bankdarlehen",
        rueckzahlbar: true,
        besichert: true
      })
    );
  });

  it("creates German booking rows for sources and uses", () => {
    const result = calculateAll(
      buildProjectSnapshot(projectFixture(), { timeHorizonMonths: 12 })
    );

    expect(result.buchungslogik.rows).toContainEqual(
      expect.objectContaining({
        vorgang: "Start-EK der Beteiligten",
        soll: "Bank",
        haben: "Einlagekapital / gezeichnetes Kapital",
        zahlungsklasse: "echtesEigenkapital"
      })
    );
    expect(result.buchungslogik.rows).toContainEqual(
      expect.objectContaining({
        vorgang: "Automatisch saldiertes Bankdarlehen",
        soll: "Bank",
        haben: "Bankverbindlichkeiten",
        zahlungsklasse: "bankdarlehen"
      })
    );
    expect(result.buchungslogik.rows).toContainEqual(
      expect.objectContaining({
        vorgang: "Anfangsruecklage",
        soll: "Zweckbindung Ruecklage",
        haben: "Bankkonto intern / keine Drittzahlung"
      })
    );
  });

  it("marks Umsatzsteuer questions without deciding tax treatment", () => {
    const result = calculateAll(
      buildProjectSnapshot(projectFixture(), { timeHorizonMonths: 12 })
    );

    expect(result.umsatzsteuer.rows).toContainEqual(
      expect.objectContaining({
        leistungsart: "Nutzungsentgelt Beteiligte",
        angenommenerSteuersatz: "offen / pruefen",
        steuerbar: "offen",
        zahlungsklasse: "nutzungsentgelt"
      })
    );
    expect(result.umsatzsteuer.rows).toContainEqual(
      expect.objectContaining({
        leistungsart: "Kleinunternehmergrenze / Optionsfrage",
        vorsteuerbezug: "nein"
      })
    );
    expect(
      result.diagnostics.some(
        (diagnostic) =>
          diagnostic.id === "umsatzsteuer.nutzungsentgelt-pruefen"
      )
    ).toBe(true);
  });

  it("shows a financing gap when the manual bank loan is too low", () => {
    const project = projectFixture();
    project.financing.data.bankdarlehenModus = "manuell";
    project.financing.data.mittelherkunft = [
      {
        id: "start-ek-manuell",
        bezeichnung: "Start-EK der Beteiligten",
        zahlungsklasse: "echtesEigenkapital",
        bruttoBetrag: 225000,
        monat: 0,
        rang: "eigenkapitalnah",
        rueckzahlbar: false,
        zinssatzPct: 0,
        besichert: false,
        wirktAufUnternehmensanteil: true,
        wirktAufNutzungsrechte: false,
        umsatzsteuerRelevant: false
      },
      {
        id: "bankdarlehen-manuell",
        bezeichnung: "Manuell zugesagtes Bankdarlehen",
        zahlungsklasse: "bankdarlehen",
        bruttoBetrag: 100000,
        monat: 0,
        rang: "vorrangig",
        rueckzahlbar: true,
        zinssatzPct: 4,
        besichert: true,
        wirktAufUnternehmensanteil: false,
        wirktAufNutzungsrechte: false,
        umsatzsteuerRelevant: false
      }
    ];

    const result = calculateAll(
      buildProjectSnapshot(project, { timeHorizonMonths: 12 })
    );

    expect(result.capitalNeed.funding.istSaldierend).toBe(false);
    expect(result.capitalNeed.funding.finanzierungsluecke).toBe(423910);
    expect(
      result.diagnostics.some(
        (diagnostic) => diagnostic.id === "funding.sources-uses-not-balanced"
      )
    ).toBe(true);
  });

  it("reconciles capital need, cashflow signs, and month-zero liquidity", () => {
    const result = calculateAll(
      buildProjectSnapshot(projectFixture(), { timeHorizonMonths: 12 })
    );
    const monthZero = result.cashflow.monthly[0]!;
    const liquidityZero = result.liquidity.monthly[0]!;
    const monthZeroOpex =
      monthZero.recoverableOpex + monthZero.nonRecoverableOpex;
    const acquisitionOutflow =
      result.capitalNeed.purchasePrice +
      result.capitalNeed.vatAtPurchase +
      result.capitalNeed.closingCosts +
      result.capitalNeed.mortgageRegistrationFee +
      result.capitalNeed.renovations;

    expect(result.capitalNeed.totalProjectNeed).toBe(
      acquisitionOutflow + result.capitalNeed.initialReserve
    );
    expect(result.capitalNeed.debtPrincipal).toBe(
      result.capitalNeed.totalProjectNeed - result.capitalNeed.ownerEquity
    );
    expect(monthZero.operatingResult).toBe(
      monthZero.effectiveIncome - monthZeroOpex
    );
    expect(monthZero.netCashflowAfterDebtService).toBe(
      monthZero.operatingResult - monthZero.debtService
    );
    expect(liquidityZero.inflows).toBeCloseTo(
      result.capitalNeed.ownerEquity +
        result.capitalNeed.debtPrincipal +
        result.contributions.requiredMonthlyContribution,
      2
    );
    expect(liquidityZero.outflows).toBeCloseTo(
      acquisitionOutflow + Math.abs(monthZero.netCashflowAfterDebtService),
      2
    );
    expect(liquidityZero.closingBalance).toBeCloseTo(
      liquidityZero.inflows - liquidityZero.outflows,
      2
    );
    expect(liquidityZero.closingBalance).toBeGreaterThanOrEqual(
      result.capitalNeed.initialReserve
    );
  });

  it("creates non-zero owner obligations from the strategy rule", () => {
    const result = calculateAll(
      buildProjectSnapshot(projectFixture(), { timeHorizonMonths: 12 })
    );
    const firstOwner =
      result.contributions.recurringContributions[0]?.contributions[0];

    expect(result.contributions.requiredMonthlyContribution).toBeCloseTo(
      2866.29,
      1
    );
    expect(firstOwner?.costContributionMonthly).toBeGreaterThan(0);
    expect(firstOwner?.capitalContributionMonthly).toBeGreaterThan(0);
    expect(firstOwner?.usageContributionMonthly).toBe(100);
    expect(firstOwner?.totalMonthlyContribution).toBeGreaterThan(0);
  });

  it("keeps non-diluting capital contributions out of company shares", () => {
    const project = projectFixture();
    project.strategy.data.capitalShareMode = "manualMonthly";
    project.strategy.data.manualCapitalContributionsAffectCompanyShare = false;
    project.ownership.data.owners = project.ownership.data.owners.map((owner) =>
      owner.id === "phil"
        ? { ...owner, monthlyCapitalContribution: 1000 }
        : owner
    );

    const result = calculateAll(
      buildProjectSnapshot(project, { timeHorizonMonths: 12 })
    );
    const phil = result.capitalShares.owners.find(
      (owner) => owner.ownerId === "phil"
    );

    expect(phil?.companySharePct).toBeCloseTo(17.7778, 4);
    expect(phil?.nonDilutingCapitalValue).toBeGreaterThan(0);
    expect(
      result.diagnostics.some(
        (diagnostic) =>
          diagnostic.id === "capital-shares.manual-capital-no-share-effect"
      )
    ).toBe(true);
  });

  it("lets manual capital contributions affect company shares when enabled", () => {
    const project = projectFixture();
    project.strategy.data.capitalShareMode = "manualMonthly";
    project.strategy.data.manualCapitalContributionsAffectCompanyShare = true;
    project.ownership.data.owners = project.ownership.data.owners.map((owner) =>
      owner.id === "phil"
        ? { ...owner, monthlyCapitalContribution: 1000 }
        : owner
    );

    const result = calculateAll(
      buildProjectSnapshot(project, { timeHorizonMonths: 12 })
    );
    const phil = result.capitalShares.owners.find(
      (owner) => owner.ownerId === "phil"
    );

    expect(phil?.companySharePct).toBeGreaterThan(17.7778);
    expect(phil?.nonDilutingCapitalValue).toBe(0);
  });

  it("can offset cost contributions with rental income while keeping principal as investment", () => {
    const project = projectFixture();
    project.property.data.expectedMonthlyRent = 4500;
    project.property.data.vacancyRatePct = 3;
    project.strategy.data.rentOffsetsOwnerContributions = true;

    const result = calculateAll(
      buildProjectSnapshot(project, { timeHorizonMonths: 12 })
    );

    expect(result.contributions.requiredMonthlyContribution).toBeCloseTo(
      1687.89,
      1
    );
    expect(
      result.contributions.recurringContributions[0]?.contributions[0]
        ?.costContributionMonthly
    ).toBe(0);
    expect(
      result.contributions.recurringContributions[0]?.contributions[0]
        ?.capitalContributionMonthly
    ).toBeGreaterThan(0);
  });

  it("calculates EUR usage budgets and sample room-night costs", () => {
    const snapshot = buildProjectSnapshot(projectFixture(), {
      timeHorizonMonths: 12
    });
    const points = calculatePoints(snapshot);

    expect(points.capacity).toBe(5);
    expect(points.annualPointPool).toBe(1825);
    expect(points.shareMode).toBe("usage");
    expect(points.owners[0]).toEqual(
      expect.objectContaining({
        ownerId: "phil",
        monthlyUsageContribution: 100,
        annualUsageBudget: 1200,
        usageSharePct: 15.3846,
        companySharePct: 17.7778,
        pointSharePct: 15.3846,
        annualPoints: 1200,
        affordableNightsAverage: 738
      })
    );
    expect(points.owners[8]).toEqual(
      expect.objectContaining({
        ownerId: "jens",
        pointSharePct: 7.6923,
        annualPoints: 600
      })
    );
    expect(nightPoints(new Date(2026, 3, 8), snapshot)).toBe(1);
    expect(nightPoints(new Date(2026, 0, 10), snapshot)).toBeCloseTo(2.7);
  });

  it("calculates occupancy pressure from room-nights and weekend demand", () => {
    const result = calculateAll(
      buildProjectSnapshot(projectFixture(), { timeHorizonMonths: 12 })
    );

    expect(result.occupancy.roomCapacity).toBe(5);
    expect(result.occupancy.roomNightCapacity).toBe(1825);
    expect(result.occupancy.ownerDemandRoomNights).toBeGreaterThan(
      result.occupancy.ownerDemandNights / 2
    );
    expect(result.occupancy.blockedRoomNights).toBe(
      result.occupancy.ownerDemandRoomNights + result.occupancy.guestRoomNights
    );
    expect(result.occupancy.weekendOccupancyPct).toBeGreaterThan(
      result.occupancy.weekdayOccupancyPct
    );
  });

  it("values owner use separately from external rental nights", () => {
    const project = projectFixture();
    project.property.data.candidateHouses = [];
    project.property.data.bedrooms = 30;
    project.property.data.guestNightsPerYear = 60;

    const result = calculateAll(
      buildProjectSnapshot(project, { timeHorizonMonths: 12 })
    );

    expect(result.occupancy.externalRentableRoomNights).toBeGreaterThan(0);
    expect(result.occupancy.externalOccupiedRoomNights).toBe(60);
    expect(result.occupancy.netExternalRevenue).toBe(
      result.occupancy.externalOccupiedRoomNights *
        result.occupancy.averageGrossPricePerExternalRoomNight
    );
    expect(result.occupancy.ownerUseEconomicValue).toBe(
      Math.max(
        result.occupancy.ownerUseMarketOffsetValue,
        result.occupancy.ownerUseCostFloorValue
      )
    );
  });

  it("calculates bank-facing indicators from debt and operating waterfall", () => {
    const result = calculateAll(
      buildProjectSnapshot(projectFixture(), { timeHorizonMonths: 12 })
    );

    expect(result.bank.beleihungsauslaufPct).toBeCloseTo(78.1955, 4);
    expect(result.bank.kapitaldienstJahr1).toBeGreaterThan(0);
    expect(result.bank.bankpruefungsZahlungsflussJahr1).toBeDefined();
    expect(result.bank.zielBeleihungsauslaufPct).toBe(90);
    expect(result.bank.fmaBelastungsquoteRichtwertPct).toBe(40);
    expect(result.bank.fmaLaufzeitRichtwertJahre).toBe(35);
    expect(result.bank.persoenlicheBelastungsquotePct).toBeNull();
    expect(result.bank.stressfaelle).toHaveLength(4);
    expect(result.bank.stressfaelle).toContainEqual(
      expect.objectContaining({
        id: "zins-plus-zwei",
        label: "Zins +2 Prozentpunkte"
      })
    );
  });

  it("calculates personal burden from owner income inputs", () => {
    const project = projectFixture();
    project.ownership.data.owners = project.ownership.data.owners.map((owner) => ({
      ...owner,
      monthlyNetIncomeAmount: 500
    }));

    const result = calculateAll(
      buildProjectSnapshot(project, { timeHorizonMonths: 12 })
    );

    expect(result.bank.persoenlichesMonatsnettoeinkommen).toBe(5500);
    expect(result.bank.persoenlicheBelastungsquotePct).toBeGreaterThan(40);
    expect(
      result.diagnostics.some(
        (diagnostic) =>
          diagnostic.id === "bank.persoenliche-belastungsquote-hoch"
      )
    ).toBe(true);
  });

  it("aggregates bank account cashflow with yearly account balance", () => {
    const result = calculateAll(
      buildProjectSnapshot(projectFixture(), { timeHorizonMonths: 12 })
    );
    const firstYear = result.cashflow.bankAccountYearly[0]!;
    const liquidityYearEnd = result.liquidity.monthly[11]!;

    expect(firstYear.totalIncome).toBeGreaterThan(0);
    expect(firstYear.totalExpenses).toBeGreaterThan(0);
    expect(firstYear.closingBalance).toBe(liquidityYearEnd.closingBalance);
    expect(firstYear.netMovement).toBeCloseTo(
      firstYear.totalIncome - firstYear.totalExpenses,
      2
    );
    expect(
      result.diagnostics.some((diagnostic) =>
        diagnostic.id.startsWith("identity.")
      )
    ).toBe(false);
  });

  it("calculates annual recurring contributions so liquidity stays above reserve", () => {
    const project = projectFixture();
    project.property.data.expectedMonthlyRent = 0;
    project.opex.data.recurringItems = [
      {
        id: "opex-high",
        label: "Hohe laufende Kosten",
        amount: 120000,
        annualAmount: 120000,
        annualCostMode: "fixed",
        period: "yearly",
        recoverableFromTenants: false
      }
    ];

    const updatedSnapshot = buildProjectSnapshot(project, { timeHorizonMonths: 24 });
    const result = calculateAll(updatedSnapshot);

    expect(result.contributions.recurringContributions).toHaveLength(2);
    expect(result.contributions.requiredMonthlyContribution).toBeGreaterThan(0);
    for (const month of result.liquidity.monthly) {
      expect(month.closingBalance).toBeGreaterThanOrEqual(
        calculateReserveTarget(
          updatedSnapshot,
          result.debt,
          result.cashflow,
          month.month
        ) - 0.1
      );
    }
  });

  it("blocks calculations when no owner equity is defined", () => {
    const project = projectFixture();
    project.ownership.data.owners = project.ownership.data.owners.map((owner) => ({
      ...owner,
      equityContribution: 0,
      startEquityContribution: 0
    }));

    const result = calculateAll(
      buildProjectSnapshot(project, { timeHorizonMonths: 12 })
    );

    expect(result.diagnostics.some((item) => item.id === "ownership.no-equity")).toBe(
      true
    );
    expect(
      result.diagnostics.some((item) => item.id === "project.calculation-blocked")
    ).toBe(true);
  });
});
