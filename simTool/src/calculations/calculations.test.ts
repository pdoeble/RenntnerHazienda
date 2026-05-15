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

  it("derives ownership shares and initial contributions from owner equity", () => {
    const snapshot = buildProjectSnapshot(projectFixture(), {
      timeHorizonMonths: 12
    });
    const contributions = calculateInitialContributions(snapshot);

    expect(contributions.requiredInitialContribution).toBe(200000);
    expect(contributions.requiredMonthlyContribution).toBe(0);
    expect(contributions.initialContributions).toHaveLength(6);
    expect(contributions.initialContributions[0]).toEqual(
      expect.objectContaining({
        ownerId: "owner-a",
        amount: 50000,
        sharePct: 25
      })
    );
    expect(contributions.initialContributions[5]).toEqual(
      expect.objectContaining({
        ownerId: "owner-f",
        amount: 20000,
        sharePct: 10
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
    ).toBe(5400);
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
    ).toBe(1700);
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
    ).toBe(7500);
  });

  it("calculates vacancy and cashflow from rent, opex, and debt service", () => {
    const snapshot = buildProjectSnapshot(projectFixture(), {
      timeHorizonMonths: 12
    });
    const debt = calculateDebt(snapshot, calculateInitialContributions(snapshot));
    const cashflow = calculateCashflow(snapshot, debt);

    expect(cashflow.monthly[0]).toEqual(
      expect.objectContaining({
        rentalIncome: 4500,
        vacancyLoss: 135,
        effectiveIncome: 4365,
        nonRecoverableOpex: 550,
        netCashflowBeforeContributions: 3815
      })
    );
    expect(cashflow.monthly[0]?.netCashflowAfterDebtService).toBeCloseTo(
      216.34,
      1
    );
    expect(cashflow.yearly[0]?.netCashflowAfterDebtService).toBeGreaterThan(0);
  });

  it("calculates a 25-year annuity debt schedule", () => {
    const snapshot = buildProjectSnapshot(projectFixture(), {
      timeHorizonMonths: 300
    });
    const debt = calculateDebt(snapshot, calculateInitialContributions(snapshot));

    expect(debt.totalInitialDebt).toBe(681775);
    expect(debt.monthlyDebtService[0]?.totalPayment).toBeCloseTo(3598.66, 1);
    expect(debt.monthlyDebtService[0]?.interest).toBeCloseTo(2272.58, 1);
    expect(debt.totalRemainingDebt).toBe(0);
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
