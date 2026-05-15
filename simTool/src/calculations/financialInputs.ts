import type { ProjectSnapshot } from "./types";

export function calculateClosingCostsTotal(snapshot: ProjectSnapshot): number {
  const purchasePrice = snapshot.property.data.purchasePrice;
  const percentages = snapshot.property.data.closingCosts;
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
  return snapshot.property.data.renovationItems
    .reduce((total, item) => total + item.amount, 0);
}

export function calculateInitialFundingNeed(snapshot: ProjectSnapshot): number {
  return calculateTotalProjectCost(snapshot);
}

export function calculateTotalProjectCost(snapshot: ProjectSnapshot): number {
  return (
    snapshot.property.data.purchasePrice +
    calculateClosingCostsTotal(snapshot) +
    snapshot.property.data.renovationItems.reduce(
      (total, item) => total + item.amount,
      0
    )
  );
}

export function calculateEquityContributionNeed(
  snapshot: ProjectSnapshot
): number {
  return calculateTotalOwnerEquity(snapshot);
}

export function calculateDebtPrincipal(snapshot: ProjectSnapshot): number {
  return Math.max(
    0,
    calculateTotalProjectCost(snapshot) - calculateEquityContributionNeed(snapshot)
  );
}

export function calculateTotalOwnerEquity(snapshot: ProjectSnapshot): number {
  return snapshot.ownership.data.owners.reduce(
    (total, owner) => total + owner.equityContribution,
    0
  );
}

export function calculateOwnerEquitySharePct(
  snapshot: ProjectSnapshot,
  ownerId: string
): number {
  const totalEquity = calculateTotalOwnerEquity(snapshot);
  if (totalEquity <= 0) {
    return 0;
  }

  const owner = snapshot.ownership.data.owners.find(
    (candidate) => candidate.id === ownerId
  );
  return owner ? (owner.equityContribution / totalEquity) * 100 : 0;
}
