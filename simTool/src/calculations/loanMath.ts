import { calculateDebtPrincipal } from "./financialInputs";
import type { ProjectSnapshot } from "./types";

export function calculateAnnuityMonthlyPayment(snapshot: ProjectSnapshot): number {
  const principal = calculateDebtPrincipal(snapshot);
  const termMonths = snapshot.financing.data.termYears * 12;
  const monthlyInterestRate =
    snapshot.financing.data.annualInterestRatePct / 100 / 12;
  const additionalRepayment =
    snapshot.financing.data.additionalMonthlyRepayment ?? 0;

  if (principal <= 0 || termMonths <= 0) {
    return 0;
  }

  if (monthlyInterestRate === 0) {
    return principal / termMonths + additionalRepayment;
  }

  const annuityPayment =
    (principal *
      monthlyInterestRate *
      (1 + monthlyInterestRate) ** termMonths) /
    ((1 + monthlyInterestRate) ** termMonths - 1);

  return annuityPayment + additionalRepayment;
}
