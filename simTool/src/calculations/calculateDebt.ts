import { calculateDebtPrincipal } from "./financialInputs";
import { calculateAnnuityMonthlyPayment } from "./loanMath";
import { roundMoney } from "./rounding";
import type { ContributionResult, DebtResult, ProjectSnapshot } from "./types";

export function calculateDebt(
  snapshot: ProjectSnapshot,
  _contributions: ContributionResult
): DebtResult {
  const principal = roundMoney(calculateDebtPrincipal(snapshot));
  const termMonths = snapshot.financing.data.termYears * 12;
  const startMonth = snapshot.financing.data.startMonth;
  const monthlyPayment = roundMoney(calculateAnnuityMonthlyPayment(snapshot));
  const monthlyInterestRate =
    snapshot.financing.data.annualInterestRatePct / 100 / 12;
  const loanMonthly = [];
  const monthlyDebtService = [];
  let balance = principal;
  let totalInterestPaid = 0;
  let totalPrincipalPaid = 0;

  for (let month = 0; month < snapshot.metadata.timeHorizonMonths; month += 1) {
    const inLoanWindow =
      principal > 0 &&
      month >= startMonth &&
      month < startMonth + termMonths &&
      balance > 0;
    const openingBalance = balance;
    const interest = inLoanWindow
      ? roundMoney(openingBalance * monthlyInterestRate)
      : 0;
    const isFinalLoanMonth = month === startMonth + termMonths - 1;
    const plannedPrincipalRepayment = inLoanWindow
      ? isFinalLoanMonth
        ? openingBalance
        : Math.max(0, monthlyPayment - interest)
      : 0;
    const principalRepayment = roundMoney(
      Math.min(openingBalance, plannedPrincipalRepayment)
    );
    const payment = roundMoney(interest + principalRepayment);
    balance = roundMoney(Math.max(0, openingBalance - principalRepayment));
    totalInterestPaid = roundMoney(totalInterestPaid + interest);
    totalPrincipalPaid = roundMoney(totalPrincipalPaid + principalRepayment);

    loanMonthly.push({
      month,
      openingBalance: roundMoney(openingBalance),
      interest,
      principalRepayment,
      payment,
      closingBalance: balance
    });

    monthlyDebtService.push({
      month,
      interest,
      principalRepayment,
      totalPayment: payment,
      remainingDebt: balance
    });
  }

  return {
    loans:
      principal > 0
        ? [
            {
              id: "loan-primary",
              name: snapshot.financing.data.loanName,
              principal,
              annualInterestRatePct:
                snapshot.financing.data.annualInterestRatePct,
              fixedMonthlyPayment: monthlyPayment,
              monthly: loanMonthly
            }
          ]
        : [],
    totalInitialDebt: principal,
    totalRemainingDebt: balance,
    totalInterestPaid,
    totalPrincipalPaid,
    monthlyDebtService,
    diagnostics: []
  };
}
