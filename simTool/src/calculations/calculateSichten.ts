import { roundMoney } from "./rounding";
import type {
  BankKennzahlResult,
  CalculationResult,
  ProjectSnapshot,
  SichtSummaryResult
} from "./types";

export function calculateSichten(
  snapshot: ProjectSnapshot,
  partial: Omit<CalculationResult, "sichten" | "diagnostics" | "bank">,
  bank: BankKennzahlResult
): SichtSummaryResult {
  const lastBalance = partial.cashflow.bankAccountYearly.at(-1);
  const firstWaterfall = partial.cashflow.operatingWaterfallYearly[0];
  const firstStatement = partial.cashflow.vermoegensuebersichtYearly[0];
  const annualUsageBudget = partial.points.owners.reduce(
    (total, owner) => total + owner.annualUsageBudget,
    0
  );

  return {
    objektkennung: snapshot.property.data.objektkennung,
    fallkennung: snapshot.strategy.data.fallkennung,
    szenariokennung: snapshot.strategy.data.szenariokennung,
    annahmenquelle: snapshot.strategy.data.annahmenquelle,
    objekte: {
      kaufpreis: roundMoney(snapshot.property.data.purchasePrice),
      gesamtmittelverwendung: partial.capitalNeed.funding.gesamtMittelverwendung,
      zimmernachtKapazitaet: partial.occupancy.roomNightCapacity,
      externeAuslastungPct: partial.occupancy.externalOccupancyPct
    },
    rechtstraeger: {
      bankkontoEndstand: lastBalance?.closingBalance ?? 0,
      ausschuettbarerZahlungsueberschussJahr1:
        firstWaterfall?.ausschuettbarerZahlungsueberschuss ?? 0,
      eigenkapital: firstStatement?.eigenkapital ?? partial.capitalNeed.ownerEquity,
      verbindlichkeiten:
        firstStatement?.verbindlichkeiten ?? partial.debt.totalRemainingDebt
    },
    mitglieder: {
      anzahl: snapshot.ownership.data.owners.length,
      startEk: partial.capitalNeed.ownerEquity,
      nutzungsentgeltJahr: roundMoney(annualUsageBudget)
    },
    bank: {
      bankdarlehen: partial.debt.totalInitialDebt,
      beleihungsauslaufPct: bank.beleihungsauslaufPct,
      kapitaldienstdeckungsgrad: bank.kapitaldienstdeckungsgrad
    }
  };
}
