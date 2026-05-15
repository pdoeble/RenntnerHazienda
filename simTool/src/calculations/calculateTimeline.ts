import {
  calculateClosingCostsTotal,
  calculateMortgageRegistrationFee,
  calculateVatAtPurchase,
  calculateVatRefund
} from "./financialInputs";
import type { DebtResult, LiquidityResult, ProjectSnapshot, TimelineEvent } from "./types";

export function calculateTimeline(
  snapshot: ProjectSnapshot,
  debt: DebtResult,
  liquidity: LiquidityResult
): TimelineEvent[] {
  const purchaseMonth = snapshot.property.data.purchaseMonth ?? 0;
  const events: TimelineEvent[] = [
    {
      month: purchaseMonth,
      label: "Kaufpreis",
      amount: snapshot.property.data.purchasePrice,
      kind: "acquisition"
    },
    {
      month: purchaseMonth,
      label: "USt bei Kauf",
      amount: calculateVatAtPurchase(snapshot),
      kind: "tax"
    },
    {
      month: purchaseMonth,
      label: "Nebenkosten",
      amount: calculateClosingCostsTotal(snapshot),
      kind: "acquisition"
    },
    {
      month: purchaseMonth,
      label: "Pfandrecht / Eintragung",
      amount: calculateMortgageRegistrationFee(snapshot),
      kind: "acquisition"
    },
    {
      month: snapshot.financing.data.startMonth,
      label: "Darlehensstart",
      amount: debt.totalInitialDebt,
      kind: "financing"
    }
  ];

  if (calculateVatRefund(snapshot) > 0) {
    events.push({
      month: snapshot.property.data.vatRefundMonth,
      label: "USt-Erstattung",
      amount: calculateVatRefund(snapshot),
      kind: "refund"
    });
  }

  for (const item of snapshot.property.data.renovationItems) {
    events.push({
      month: item.timingMonth,
      label: item.label,
      amount: item.amount,
      kind: "renovation"
    });
  }

  if (liquidity.firstNegativeMonth !== undefined) {
    events.push({
      month: liquidity.firstNegativeMonth,
      label: "Erste negative Liquiditaet",
      amount: liquidity.monthly[liquidity.firstNegativeMonth]?.closingBalance ?? 0,
      kind: "liquidity"
    });
  }

  events.push({
    month: snapshot.financing.data.startMonth + snapshot.financing.data.termYears * 12,
    label: "Ende Darlehenslaufzeit",
    amount: debt.totalRemainingDebt,
    kind: "debt"
  });

  return events
    .filter((event) => event.amount !== 0 || event.kind === "debt")
    .sort((a, b) => a.month - b.month || a.label.localeCompare(b.label));
}
