import { diagnostic } from "../validation/diagnostics";
import { roundPct } from "./rounding";
import type {
  BankKennzahlResult,
  CapitalNeedResult,
  CashflowResult,
  DebtResult,
  ProjectSnapshot
} from "./types";

export function calculateBankView(
  snapshot: ProjectSnapshot,
  debt: DebtResult,
  cashflow: CashflowResult,
  capitalNeed: CapitalNeedResult
): BankKennzahlResult {
  const diagnostics = [];
  const firstYearWaterfall = cashflow.operatingWaterfallYearly[0];
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

  return {
    bankpruefungsZahlungsflussJahr1,
    kapitaldienstJahr1,
    kapitaldienstdeckungsgrad: Math.round(kapitaldienstdeckungsgrad * 100) / 100,
    beleihungsauslaufPct: roundPct(beleihungsauslaufPct),
    zielBeleihungsauslaufPct,
    laufzeitJahre: snapshot.financing.data.termYears,
    fmaBelastungsquoteRichtwertPct,
    fmaLaufzeitRichtwertJahre,
    diagnostics
  };
}
