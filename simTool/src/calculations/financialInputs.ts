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
  return (
    snapshot.property.data.purchasePrice +
    calculateClosingCostsTotal(snapshot) +
    calculateEquityFundedCapexTotal(snapshot)
  );
}
