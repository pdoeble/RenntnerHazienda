import type { ProjectSnapshot } from "./types";
import { roundMoney, roundPct } from "./rounding";

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

export function calculateVatAtPurchase(snapshot: ProjectSnapshot): number {
  return (snapshot.property.data.purchasePrice * snapshot.property.data.vatRatePct) / 100;
}

export function calculateVatRefund(snapshot: ProjectSnapshot): number {
  return (
    calculateVatAtPurchase(snapshot) *
    snapshot.property.data.vatRecoverablePct /
    100
  );
}

export function calculateMortgageRegistrationFee(
  snapshot: ProjectSnapshot
): number {
  return (
    snapshot.property.data.purchasePrice *
    snapshot.property.data.mortgageRegistrationFeePct /
    100
  );
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
    calculateVatAtPurchase(snapshot) +
    calculateClosingCostsTotal(snapshot) +
    calculateMortgageRegistrationFee(snapshot) +
    snapshot.property.data.renovationItems.reduce(
      (total, item) => total + item.amount,
      0
    ) +
    calculateInitialReserveNeed(snapshot)
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

export function calculateInitialReserveNeed(snapshot: ProjectSnapshot): number {
  return Math.max(
    snapshot.strategy.data.minimumLiquidityAmount,
    snapshot.strategy.data.targetLiquidityAmount
  );
}

export function calculateActualEquityRatioPct(snapshot: ProjectSnapshot): number {
  const totalProjectCost = calculateTotalProjectCost(snapshot);
  if (totalProjectCost <= 0) {
    return 0;
  }

  return (calculateTotalOwnerEquity(snapshot) / totalProjectCost) * 100;
}

export function calculateCapitalNeed(snapshot: ProjectSnapshot) {
  const purchasePrice = roundMoney(snapshot.property.data.purchasePrice);
  const vatAtPurchase = roundMoney(calculateVatAtPurchase(snapshot));
  const vatRefund = roundMoney(calculateVatRefund(snapshot));
  const closingCosts = roundMoney(calculateClosingCostsTotal(snapshot));
  const mortgageRegistrationFee = roundMoney(
    calculateMortgageRegistrationFee(snapshot)
  );
  const renovations = roundMoney(
    snapshot.property.data.renovationItems.reduce(
      (total, item) => total + item.amount,
      0
    )
  );
  const initialReserve = roundMoney(calculateInitialReserveNeed(snapshot));
  const totalProjectNeed = roundMoney(calculateTotalProjectCost(snapshot));
  const ownerEquity = roundMoney(calculateTotalOwnerEquity(snapshot));
  const debtPrincipal = roundMoney(calculateDebtPrincipal(snapshot));
  const actualEquityRatioPct = roundPct(calculateActualEquityRatioPct(snapshot));

  return {
    items: [
      { id: "purchase", label: "Kaufpreis", amount: purchasePrice },
      { id: "vat", label: "USt bei Kauf", amount: vatAtPurchase },
      { id: "closing", label: "Nebenkosten", amount: closingCosts },
      {
        id: "mortgage-registration",
        label: "Pfandrecht / Eintragung",
        amount: mortgageRegistrationFee
      },
      { id: "renovations", label: "Renovierungen", amount: renovations },
      { id: "reserve", label: "Initiale Reserve", amount: initialReserve },
      { id: "equity", label: "Eigner-EK", amount: -ownerEquity },
      { id: "debt", label: "Darlehen", amount: debtPrincipal }
    ],
    purchasePrice,
    vatAtPurchase,
    vatRefund,
    closingCosts,
    mortgageRegistrationFee,
    renovations,
    initialReserve,
    totalProjectNeed,
    ownerEquity,
    debtPrincipal,
    actualEquityRatioPct,
    targetEquityRatioPct: snapshot.strategy.data.targetEquityRatioPct,
    diagnostics: []
  };
}
