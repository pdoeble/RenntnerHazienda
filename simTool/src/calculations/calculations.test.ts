import { describe, expect, it } from "vitest";
import { buildProjectSnapshot } from "./buildProjectSnapshot";
import { calculateAll } from "./calculateAll";
import { calculateCashflow, monthlyOpexAmount } from "./calculateCashflow";
import { calculateContributions } from "./calculateContributions";
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

  it("allocates initial contributions by ownership share", () => {
    const snapshot = buildProjectSnapshot(projectFixture(), {
      timeHorizonMonths: 12
    });
    const contributions = calculateContributions(snapshot);

    expect(contributions.requiredInitialContribution).toBe(176355);
    expect(contributions.requiredMonthlyContribution).toBeCloseTo(3723.47, 1);
    expect(contributions.initialContributions).toHaveLength(6);
    expect(contributions.initialContributions[0]).toEqual(
      expect.objectContaining({ ownerId: "owner-a", amount: 44088.75 })
    );
    expect(
      contributions.recurringContributions[0]?.contributions[0]?.amount
    ).toBeCloseTo(930.87, 1);
  });

  it("allocates initial contributions by equal split", () => {
    const project = projectFixture();
    project.ownership.data.contributionRules = [
      {
        id: "rule-equal",
        name: "Gleich verteilt",
        basis: "equalSplit"
      }
    ];

    const contributions = calculateContributions(buildProjectSnapshot(project));

    expect(contributions.initialContributions).toHaveLength(6);
    expect(contributions.initialContributions[0]?.amount).toBe(29392.5);
  });

  it("allocates initial contributions by custom split", () => {
    const project = projectFixture();
    project.ownership.data.contributionRules = [
      {
        id: "rule-custom",
        name: "Custom",
        basis: "custom",
        customShares: {
          "owner-a": 40,
          "owner-b": 20,
          "owner-c": 15,
          "owner-d": 10,
          "owner-e": 10,
          "owner-f": 5
        }
      }
    ];

    const contributions = calculateContributions(buildProjectSnapshot(project));

    expect(contributions.initialContributions[0]?.amount).toBe(70542);
    expect(contributions.initialContributions[1]?.amount).toBe(35271);
  });

  it("converts yearly opex to monthly values", () => {
    const insurance = projectFixture().opex.data.recurringItems[1];

    expect(insurance ? monthlyOpexAmount(insurance, 0) : undefined).toBe(100);
  });

  it("calculates vacancy and cashflow from rent, opex, and debt service", () => {
    const snapshot = buildProjectSnapshot(projectFixture(), {
      timeHorizonMonths: 12
    });
    const debt = calculateDebt(snapshot, calculateContributions(snapshot));
    const cashflow = calculateCashflow(snapshot, debt);

    expect(cashflow.monthly[0]).toEqual(
      expect.objectContaining({
        rentalIncome: 4500,
        vacancyLoss: 135,
        effectiveIncome: 4365,
        nonRecoverableOpex: 600,
        netCashflowAfterDebtService: 41.53
      })
    );
    expect(cashflow.yearly[0]?.netCashflowAfterDebtService).toBeGreaterThan(0);
  });

  it("calculates a 25-year annuity debt schedule", () => {
    const snapshot = buildProjectSnapshot(projectFixture(), {
      timeHorizonMonths: 300
    });
    const debt = calculateDebt(snapshot, calculateContributions(snapshot));

    expect(debt.totalInitialDebt).toBe(705420);
    expect(debt.monthlyDebtService[0]?.totalPayment).toBeCloseTo(3723.47, 1);
    expect(debt.monthlyDebtService[0]?.interest).toBe(2351.4);
    expect(debt.totalRemainingDebt).toBe(0);
  });

  it("detects negative liquidity", () => {
    const project = projectFixture();
    project.property.data.expectedMonthlyRent = 0;
    project.opex.data.recurringItems = [
      {
        id: "opex-high",
        label: "Hohe laufende Kosten",
        amount: 120000,
        period: "yearly",
        recoverableFromTenants: false
      }
    ];

    const result = calculateAll(
      buildProjectSnapshot(project, { timeHorizonMonths: 12 })
    );

    expect(result.liquidity.firstNegativeMonth).toBe(0);
    expect(
      result.diagnostics.some(
        (diagnostic) => diagnostic.id === "liquidity.first-negative-month"
      )
    ).toBe(true);
  });
});
