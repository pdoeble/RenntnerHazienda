import type { ProjectSnapshot } from "./types";

export function calculateClosingCostsTotal(snapshot: ProjectSnapshot): number {
  const purchasePrice = snapshot.property.data.purchasePrice;
  const percentages = snapshot.closingCosts.data;
  const percentageTotal =
    percentages.realEstateTransferTaxPct +
    percentages.notaryPct +
    percentages.landRegistryPct +
    percentages.brokerPct;
  const percentageCosts = (purchasePrice * percentageTotal) / 100;
  const fixedCosts = percentages.otherCosts.reduce(
    (total, item) => total + item.amount,
    0
  );

  return percentageCosts + fixedCosts;
}

export function calculateEquityFundedCapexTotal(
  snapshot: ProjectSnapshot
): number {
  return snapshot.capex.data.items
    .filter((item) => item.financing === "equity" || item.financing === "mixed")
    .reduce((total, item) => total + item.amount, 0);
}

export function calculateInitialFundingNeed(snapshot: ProjectSnapshot): number {
  return calculateTotalProjectCost(snapshot);
}

export function calculateTotalProjectCost(snapshot: ProjectSnapshot): number {
  return (
    snapshot.property.data.purchasePrice +
    calculateClosingCostsTotal(snapshot) +
    snapshot.capex.data.items.reduce((total, item) => total + item.amount, 0)
  );
}

export function calculateEquityContributionNeed(
  snapshot: ProjectSnapshot
): number {
  return (
    (calculateTotalProjectCost(snapshot) *
      snapshot.financing.data.equitySharePct) /
    100
  );
}

export function calculateDebtPrincipal(snapshot: ProjectSnapshot): number {
  return Math.max(
    0,
    calculateTotalProjectCost(snapshot) - calculateEquityContributionNeed(snapshot)
  );
}
