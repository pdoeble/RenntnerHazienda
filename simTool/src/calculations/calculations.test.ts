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

    expect(contributions.requiredInitialContribution).toBe(881775);
    expect(contributions.initialContributions).toEqual([
      expect.objectContaining({ ownerId: "owner-a", amount: 440887.5 }),
      expect.objectContaining({ ownerId: "owner-b", amount: 440887.5 })
    ]);
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
    project.ownership.data.owners.push(
      {
        id: "owner-c",
        displayName: "Eigner C",
        type: "person",
        ownershipSharePct: 0
      },
      {
        id: "owner-d",
        displayName: "Eigner D",
        type: "person",
        ownershipSharePct: 0
      }
    );

    const contributions = calculateContributions(buildProjectSnapshot(project));

    expect(contributions.initialContributions).toHaveLength(4);
    expect(contributions.initialContributions[0]?.amount).toBe(220443.75);
  });

  it("allocates initial contributions by custom split", () => {
    const project = projectFixture();
    project.ownership.data.contributionRules = [
      {
        id: "rule-custom",
        name: "Custom",
        basis: "custom",
        customShares: {
          "owner-a": 70,
          "owner-b": 30
        }
      }
    ];

    const contributions = calculateContributions(buildProjectSnapshot(project));

    expect(contributions.initialContributions[0]?.amount).toBe(617242.5);
    expect(contributions.initialContributions[1]?.amount).toBe(264532.5);
  });

  it("converts yearly opex to monthly values", () => {
    const insurance = projectFixture().opex.data.recurringItems[1];

    expect(insurance ? monthlyOpexAmount(insurance, 0) : undefined).toBe(100);
  });

  it("calculates vacancy and cashflow from rent, opex, and zero debt service", () => {
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
        netCashflowAfterDebtService: 3765
      })
    );
    expect(cashflow.yearly[0]?.netCashflowAfterDebtService).toBeGreaterThan(0);
  });

  it("returns a zero-debt result with an explicit diagnostic", () => {
    const snapshot = buildProjectSnapshot(projectFixture(), {
      timeHorizonMonths: 12
    });
    const debt = calculateDebt(snapshot, calculateContributions(snapshot));

    expect(debt.totalInitialDebt).toBe(0);
    expect(debt.diagnostics[0]?.id).toBe("debt.no-financing-module");
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
