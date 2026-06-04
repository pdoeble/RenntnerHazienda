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

    expect(contributions.requiredInitialContribution).toBe(185000);
    expect(contributions.requiredMonthlyContribution).toBe(0);
    expect(contributions.initialContributions).toHaveLength(9);
    expect(contributions.initialContributions[0]).toEqual(
      expect.objectContaining({
        ownerId: "phil",
        amount: 40000,
        sharePct: 21.6216
      })
    );
    expect(contributions.initialContributions[8]).toEqual(
      expect.objectContaining({
        ownerId: "jens",
        amount: 15000,
        sharePct: 8.1081
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
        nonRecoverableOpex: 520,
        operatingResult: -520,
        netCashflowBeforeContributions: -520
      })
    );
    expect(cashflow.monthly[0]?.opexBreakdown).toEqual([
      expect.objectContaining({
        label: "Instandhaltungsruecklage",
        amount: 420
      }),
      expect.objectContaining({
        label: "Versicherung",
        amount: 100
      })
    ]);
    expect(cashflow.monthly[0]?.netCashflowAfterDebtService).toBeCloseTo(
      -3496.52,
      1
    );
    expect(cashflow.yearly[0]?.netCashflowAfterDebtService).toBeLessThan(0);
  });

  it("calculates a 25-year annuity debt schedule", () => {
    const snapshot = buildProjectSnapshot(projectFixture(), {
      timeHorizonMonths: 300
    });
    const debt = calculateDebt(snapshot, calculateInitialContributions(snapshot));

    expect(debt.totalInitialDebt).toBe(563910);
    expect(debt.monthlyDebtService[0]?.totalPayment).toBeCloseTo(2976.52, 1);
    expect(debt.monthlyDebtService[0]?.interest).toBeCloseTo(1879.7, 1);
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
    expect(result.capitalNeed.initialReserve).toBe(30000);
    expect(result.capitalNeed.totalProjectNeed).toBe(748910);
    expect(result.capitalNeed.debtPrincipal).toBe(563910);
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
      3506.05,
      1
    );
    expect(firstOwner?.baseMonthlyObligation).toBeGreaterThan(0);
    expect(firstOwner?.totalMonthlyContribution).toBeGreaterThan(0);
  });

  it("can offset owner obligations with rental income when strategy allows it", () => {
    const project = projectFixture();
    project.property.data.expectedMonthlyRent = 4500;
    project.property.data.vacancyRatePct = 3;
    project.strategy.data.rentOffsetsOwnerContributions = true;

    const result = calculateAll(
      buildProjectSnapshot(project, { timeHorizonMonths: 12 })
    );

    expect(result.contributions.requiredMonthlyContribution).toBe(0);
  });

  it("calculates blended point shares and sample night costs", () => {
    const snapshot = buildProjectSnapshot(projectFixture(), {
      timeHorizonMonths: 12
    });
    const points = calculatePoints(snapshot);

    expect(points.capacity).toBe(8);
    expect(points.annualPointPool).toBe(2920);
    expect(points.shareMode).toBe("blended");
    expect(points.owners[0]).toEqual(
      expect.objectContaining({
        ownerId: "phil",
        tierSharePct: 18.1818,
        equitySharePct: 21.6216,
        pointSharePct: 19.9017,
        annualPoints: 581,
        affordableNightsAverage: 44
      })
    );
    expect(points.owners[8]).toEqual(
      expect.objectContaining({
        ownerId: "jens",
        pointSharePct: 8.5995,
        annualPoints: 251
      })
    );
    expect(nightPoints(new Date(2026, 3, 8), snapshot)).toBe(8);
    expect(nightPoints(new Date(2026, 0, 10), snapshot)).toBeCloseTo(21.6);
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
      equityContribution: 0
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
