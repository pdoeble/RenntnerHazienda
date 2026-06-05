import { calculateOwnerEquitySharePct } from "./financialInputs";
import { roundMoney, roundPct } from "./rounding";
import type {
  CapitalShareOwnerResult,
  CapitalShareResult,
  DebtResult,
  ProjectSnapshot
} from "./types";

export function calculateCapitalShares(
  snapshot: ProjectSnapshot,
  debt: DebtResult
): CapitalShareResult {
  const termMonths = snapshot.financing.data.termYears * 12;
  const valuationInterestPct = snapshot.strategy.data.capitalValuationInterestPct;
  const annualRate = valuationInterestPct / 100;
  const mode = snapshot.strategy.data.capitalShareMode;
  const scheduledPrincipalAffectsCompanyShare =
    snapshot.strategy.data.scheduledPrincipalAffectsCompanyShare;
  const manualCapitalContributionsAffectCompanyShare =
    snapshot.strategy.data.manualCapitalContributionsAffectCompanyShare;
  const owners = snapshot.ownership.data.owners.map((owner) => {
    const startEquitySharePct = calculateOwnerEquitySharePct(snapshot, owner.id);
    const scheduledPrincipalContribution =
      mode === "scheduledPrincipal"
        ? debt.monthlyDebtService
            .slice(0, termMonths)
            .reduce(
              (total, month) =>
                total + (month.principalRepayment * startEquitySharePct) / 100,
              0
            )
        : owner.monthlyCapitalContribution * termMonths;
    const averageMonthlyCapitalContribution =
      termMonths > 0 ? scheduledPrincipalContribution / termMonths : 0;
    const startEquityFutureValue =
      owner.startEquityContribution * compoundFactor(annualRate, termMonths);
    const monthlyFutureValueRaw =
      mode === "scheduledPrincipal"
        ? debt.monthlyDebtService
            .slice(0, termMonths)
            .reduce((total, month) => {
              const contribution =
                (month.principalRepayment * startEquitySharePct) / 100;
              return (
                total +
                contribution *
                  compoundFactor(annualRate, termMonths - month.month - 1)
              );
            }, 0)
        : monthlyContributionFutureValue(
            owner.monthlyCapitalContribution,
            annualRate,
            termMonths
          );
    const monthlyAffectsCompanyShare =
      mode === "scheduledPrincipal"
        ? scheduledPrincipalAffectsCompanyShare
        : manualCapitalContributionsAffectCompanyShare;
    const shareEffectiveMonthlyValue = monthlyAffectsCompanyShare
      ? monthlyFutureValueRaw
      : 0;
    const nonDilutingCapitalValue = monthlyAffectsCompanyShare
      ? 0
      : monthlyFutureValueRaw;
    const shareEffectiveCapitalValue =
      startEquityFutureValue + shareEffectiveMonthlyValue;

    return {
      ownerId: owner.id,
      ownerName: owner.displayName,
      startEquityContribution: roundMoney(owner.startEquityContribution),
      startEquitySharePct: roundPct(startEquitySharePct),
      monthlyCapitalContribution: roundMoney(averageMonthlyCapitalContribution),
      monthlyUsageContribution: roundMoney(owner.monthlyUsageContribution),
      usagePointBudget: owner.usagePointBudget,
      shareEffectiveCapitalValue: roundMoney(shareEffectiveCapitalValue),
      nonDilutingCapitalValue: roundMoney(nonDilutingCapitalValue),
      capitalValueAtLoanEnd: roundMoney(shareEffectiveCapitalValue),
      companySharePct: 0
    } satisfies CapitalShareOwnerResult;
  });
  const totalCapitalValueAtLoanEnd = owners.reduce(
    (total, owner) => total + owner.capitalValueAtLoanEnd,
    0
  );
  const ownersWithShares = owners.map((owner) => ({
    ...owner,
    companySharePct: roundPct(
      totalCapitalValueAtLoanEnd > 0
        ? (owner.capitalValueAtLoanEnd / totalCapitalValueAtLoanEnd) * 100
        : 0
    )
  }));

  return {
    mode,
    termYears: snapshot.financing.data.termYears,
    valuationInterestPct,
    totalCapitalValueAtLoanEnd: roundMoney(totalCapitalValueAtLoanEnd),
    owners: ownersWithShares,
    diagnostics: [
      ...(!scheduledPrincipalAffectsCompanyShare &&
      mode === "scheduledPrincipal"
        ? [
            {
              id: "capital-shares.scheduled-principal-no-share-effect",
              severity: "info" as const,
              domain: "ownership" as const,
              message:
                "Tilgung wird als nicht verwaessernde Kapitalzufuehrung gezeigt und veraendert Unternehmensanteile nicht."
            }
          ]
        : []),
      ...(!manualCapitalContributionsAffectCompanyShare &&
      mode === "manualMonthly"
        ? [
            {
              id: "capital-shares.manual-capital-no-share-effect",
              severity: "info" as const,
              domain: "ownership" as const,
              message:
                "Manuelle Kapitalruecklagen werden als nicht verwaessernde Kapitalzufuehrung gezeigt und veraendern Unternehmensanteile nicht."
            }
          ]
        : [])
    ]
  };
}

function monthlyContributionFutureValue(
  monthlyContribution: number,
  annualRate: number,
  termMonths: number
): number {
  let total = 0;
  for (let month = 0; month < termMonths; month += 1) {
    total +=
      monthlyContribution * compoundFactor(annualRate, termMonths - month - 1);
  }
  return total;
}

function compoundFactor(annualRate: number, months: number): number {
  return (1 + annualRate) ** (months / 12);
}
