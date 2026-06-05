import { diagnostic } from "../validation/diagnostics";
import { roundMoney, roundPct } from "./rounding";
import type {
  BankKennzahlResult,
  BankStressCaseResult,
  CapitalNeedResult,
  CashflowResult,
  ContributionResult,
  DebtResult,
  ProjectSnapshot
} from "./types";

export function calculateBankView(
  snapshot: ProjectSnapshot,
  debt: DebtResult,
  cashflow: CashflowResult,
  capitalNeed: CapitalNeedResult,
  contributions: ContributionResult
): BankKennzahlResult {
  const diagnostics = [];
  const firstYearWaterfall = cashflow.operatingWaterfallYearly[0];
  const firstYearCashflow = cashflow.yearly[0];
  const bankpruefungsZahlungsflussJahr1 =
    firstYearWaterfall?.bankpruefungsZahlungsfluss ?? 0;
  const kapitaldienstJahr1 = debt.monthlyDebtService
    .filter((month) => month.month < 12)
    .reduce((total, month) => total + month.totalPayment, 0);
  const kapitaldienstdeckungsgrad =
    kapitaldienstJahr1 > 0
      ? bankpruefungsZahlungsflussJahr1 / kapitaldienstJahr1
      : 0;
  const valueBasis =
    snapshot.property.data.purchasePrice > 0
      ? snapshot.property.data.purchasePrice
      : capitalNeed.totalProjectNeed;
  const beleihungsauslaufPct =
    valueBasis > 0 ? (debt.totalInitialDebt / valueBasis) * 100 : 0;
  const zielBeleihungsauslaufPct = 90;
  const fmaBelastungsquoteRichtwertPct = 40;
  const fmaLaufzeitRichtwertJahre = 35;
  const personalBurden = calculatePersonalBurden(snapshot, contributions);
  const stressfaelle = calculateStressCases({
    snapshot,
    debt,
    bankpruefungsZahlungsflussJahr1,
    kapitaldienstJahr1,
    firstYearCashflow,
    contributions
  });

  if (beleihungsauslaufPct > zielBeleihungsauslaufPct) {
    diagnostics.push(
      diagnostic(
        "bank.beleihungsauslauf-hoch",
        "warning",
        "debt",
        `Beleihungsauslauf ${roundPct(
          beleihungsauslaufPct
        ).toFixed(1)}% liegt ueber der FMA-Leitplanke von ${zielBeleihungsauslaufPct}%.`
      )
    );
  }

  if (kapitaldienstJahr1 > 0 && kapitaldienstdeckungsgrad < 1.1) {
    diagnostics.push(
      diagnostic(
        "bank.kapitaldienstdeckungsgrad-niedrig",
        "warning",
        "debt",
        `Kapitaldienstdeckungsgrad ${kapitaldienstdeckungsgrad.toFixed(
          2
        )} ist niedrig; die Banksicht sollte geprueft werden.`
      )
    );
  }

  if (snapshot.financing.data.termYears > fmaLaufzeitRichtwertJahre) {
    diagnostics.push(
      diagnostic(
        "bank.laufzeit-ueber-richtwert",
        "warning",
        "debt",
        `Darlehenslaufzeit ${snapshot.financing.data.termYears} Jahre liegt ueber der FMA-Leitplanke von ${fmaLaufzeitRichtwertJahre} Jahren.`
      )
    );
  }

  if (personalBurden.persoenlicheBelastungsquotePct === null) {
    diagnostics.push(
      diagnostic(
        "bank.persoenliche-belastungsquote-offen",
        "info",
        "debt",
        "Monatsnettoeinkommen fehlen; die persoenliche Belastungsquote ist nicht modelliert."
      )
    );
  } else if (
    personalBurden.persoenlicheBelastungsquotePct >
    fmaBelastungsquoteRichtwertPct
  ) {
    diagnostics.push(
      diagnostic(
        "bank.persoenliche-belastungsquote-hoch",
        "warning",
        "debt",
        `Persoenliche Belastungsquote ${roundPct(
          personalBurden.persoenlicheBelastungsquotePct
        ).toFixed(1)}% liegt ueber der FMA-Leitplanke von ${fmaBelastungsquoteRichtwertPct}%.`
      )
    );
  }

  for (const stressfall of stressfaelle) {
    if (stressfall.status === "kritisch") {
      diagnostics.push(
        diagnostic(
          `bank.stress.${stressfall.id}.kritisch`,
          "warning",
          "debt",
          `Stressfall "${stressfall.label}" ist kritisch: Kapitaldienstdeckungsgrad ${stressfall.kapitaldienstdeckungsgrad.toFixed(
            2
          )}.`
        )
      );
    }
  }

  return {
    bankpruefungsZahlungsflussJahr1,
    kapitaldienstJahr1,
    kapitaldienstdeckungsgrad: Math.round(kapitaldienstdeckungsgrad * 100) / 100,
    beleihungsauslaufPct: roundPct(beleihungsauslaufPct),
    zielBeleihungsauslaufPct,
    persoenlicheMonatszahlungen: personalBurden.persoenlicheMonatszahlungen,
    persoenlichesMonatsnettoeinkommen:
      personalBurden.persoenlichesMonatsnettoeinkommen,
    persoenlicheBelastungsquotePct:
      personalBurden.persoenlicheBelastungsquotePct,
    laufzeitJahre: snapshot.financing.data.termYears,
    fmaBelastungsquoteRichtwertPct,
    fmaLaufzeitRichtwertJahre,
    stressfaelle,
    diagnostics
  };
}

function calculatePersonalBurden(
  snapshot: ProjectSnapshot,
  contributions: ContributionResult
): {
  persoenlicheMonatszahlungen: number;
  persoenlichesMonatsnettoeinkommen: number;
  persoenlicheBelastungsquotePct: number | null;
} {
  const firstSchedule = contributions.recurringContributions[0];
  const monthlyPayments =
    firstSchedule?.contributions.reduce(
      (total, contribution) =>
        total + (contribution.totalMonthlyContribution ?? contribution.amount),
      0
    ) ?? 0;
  const monthlyIncome = snapshot.ownership.data.owners.reduce(
    (total, owner) => total + (owner.monthlyNetIncomeAmount ?? 0),
    0
  );

  return {
    persoenlicheMonatszahlungen: roundMoney(monthlyPayments),
    persoenlichesMonatsnettoeinkommen: roundMoney(monthlyIncome),
    persoenlicheBelastungsquotePct:
      monthlyIncome > 0 ? roundPct((monthlyPayments / monthlyIncome) * 100) : null
  };
}

function calculateStressCases({
  snapshot,
  debt,
  bankpruefungsZahlungsflussJahr1,
  kapitaldienstJahr1,
  firstYearCashflow,
  contributions
}: {
  snapshot: ProjectSnapshot;
  debt: DebtResult;
  bankpruefungsZahlungsflussJahr1: number;
  kapitaldienstJahr1: number;
  firstYearCashflow: CashflowResult["yearly"][number] | undefined;
  contributions: ContributionResult;
}): BankStressCaseResult[] {
  const firstSchedule = contributions.recurringContributions[0];
  const largestMemberPayment =
    firstSchedule?.contributions.reduce(
      (largest, contribution) =>
        Math.max(
          largest,
          contribution.totalMonthlyContribution ?? contribution.amount
        ),
      0
    ) ?? 0;
  const stressedDebtService = annualAnnuityPayment(
    debt.totalInitialDebt,
    snapshot.financing.data.annualInterestRatePct + 2,
    snapshot.financing.data.termYears
  );
  const rentalIncome = firstYearCashflow?.effectiveIncome ?? 0;
  const operatingCosts =
    (firstYearCashflow?.recoverableOpex ?? 0) +
    (firstYearCashflow?.nonRecoverableOpex ?? 0);

  return [
    createStressCase(
      "zins-plus-zwei",
      "Zins +2 Prozentpunkte",
      "Bankzinssatz steigt rechnerisch um zwei Prozentpunkte.",
      bankpruefungsZahlungsflussJahr1,
      stressedDebtService
    ),
    createStressCase(
      "fremderloes-minus-fuenfzig",
      "Fremderloes -50%",
      "Fremdvermietungserloese fallen im ersten Jahr um 50%.",
      bankpruefungsZahlungsflussJahr1 - rentalIncome * 0.5,
      kapitaldienstJahr1
    ),
    createStressCase(
      "betriebskosten-plus-zwanzig",
      "Betriebskosten +20%",
      "Betriebskosten steigen im ersten Jahr um 20%.",
      bankpruefungsZahlungsflussJahr1 - operatingCosts * 0.2,
      kapitaldienstJahr1
    ),
    createStressCase(
      "beteiligter-faellt-aus",
      "Ausfall groesster Beteiligtenbeitrag",
      "Der hoechste monatliche Beteiligtenbeitrag fehlt ein Jahr.",
      bankpruefungsZahlungsflussJahr1 - largestMemberPayment * 12,
      kapitaldienstJahr1
    )
  ];
}

function createStressCase(
  id: string,
  label: string,
  annahme: string,
  bankpruefungsZahlungsfluss: number,
  kapitaldienst: number
): BankStressCaseResult {
  const kapitaldienstdeckungsgrad =
    kapitaldienst > 0 ? bankpruefungsZahlungsfluss / kapitaldienst : 0;
  const roundedRatio = Math.round(kapitaldienstdeckungsgrad * 100) / 100;
  return {
    id,
    label,
    annahme,
    bankpruefungsZahlungsfluss: roundMoney(bankpruefungsZahlungsfluss),
    kapitaldienst: roundMoney(kapitaldienst),
    kapitaldienstdeckungsgrad: roundedRatio,
    status:
      roundedRatio >= 1.2
        ? "tragfaehig"
        : roundedRatio >= 1
          ? "angespannt"
          : "kritisch"
  };
}

function annualAnnuityPayment(
  principal: number,
  annualInterestRatePct: number,
  termYears: number
): number {
  const paymentCount = termYears * 12;
  if (principal <= 0 || paymentCount <= 0) {
    return 0;
  }

  const monthlyRate = annualInterestRatePct / 100 / 12;
  if (monthlyRate <= 0) {
    return roundMoney((principal / paymentCount) * 12);
  }

  return roundMoney(
    (principal * monthlyRate) /
      (1 - Math.pow(1 + monthlyRate, -paymentCount)) *
      12
  );
}
