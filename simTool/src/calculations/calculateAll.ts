import { diagnostic, hasBlockingDiagnostics } from "../validation/diagnostics";
import {
  calculateBankAccountCashflow,
  calculateCashflow
} from "./calculateCashflow";
import { calculateBankView } from "./calculateBankView";
import { calculateBuchungslogik } from "./calculateBuchungslogik";
import { calculateCapitalShares } from "./calculateCapitalShares";
import {
  calculateInitialContributions,
  calculateRecurringContributions
} from "./calculateContributions";
import { calculateDebt } from "./calculateDebt";
import { calculateHouseComparison } from "./calculateHouseComparison";
import { calculateLiquidity } from "./calculateLiquidity";
import { calculateOccupancy } from "./calculateOccupancy";
import { calculatePoints } from "./calculatePoints";
import { calculateSichten } from "./calculateSichten";
import { calculateTimeline } from "./calculateTimeline";
import { calculateUmsatzsteuer } from "./calculateUmsatzsteuer";
import { collectInputDiagnostics } from "./diagnostics";
import { calculateCapitalNeed } from "./financialInputs";
import type { CalculationResult, ProjectSnapshot } from "./types";

export function calculateAll(snapshot: ProjectSnapshot): CalculationResult {
  const inputDiagnostics = collectInputDiagnostics(snapshot);

  if (hasBlockingDiagnostics(inputDiagnostics)) {
    return emptyCalculationResult(snapshot, inputDiagnostics);
  }

  const initialContributions = calculateInitialContributions(snapshot);
  const debt = calculateDebt(snapshot, initialContributions);
  const operatingCashflow = calculateCashflow(snapshot, debt);
  const contributions = calculateRecurringContributions(
    snapshot,
    debt,
    operatingCashflow,
    initialContributions
  );
  const liquidity = calculateLiquidity(
    snapshot,
    contributions,
    operatingCashflow,
    debt
  );
  const cashflow = {
    ...operatingCashflow,
    ...calculateBankAccountCashflow(
      snapshot,
      contributions,
      operatingCashflow,
      debt,
      liquidity
    )
  };
  const capitalNeed = calculateCapitalNeed(snapshot);
  const capitalShares = calculateCapitalShares(snapshot, debt);
  const points = calculatePoints(snapshot, capitalShares);
  const occupancy = calculateOccupancy(snapshot, points);
  const houseComparison = calculateHouseComparison(snapshot);
  const timeline = calculateTimeline(snapshot, debt, liquidity);
  const bank = calculateBankView(
    snapshot,
    debt,
    cashflow,
    capitalNeed,
    contributions
  );
  const identityDiagnostics = collectIdentityDiagnostics(cashflow);
  const buchungslogik = calculateBuchungslogik(capitalNeed);
  const umsatzsteuer = calculateUmsatzsteuer(snapshot);
  const sichten = calculateSichten(
    snapshot,
    {
      capitalNeed,
      capitalShares,
      points,
      occupancy,
      houseComparison,
      timeline,
      liquidity,
      contributions,
      buchungslogik,
      umsatzsteuer,
      cashflow,
      debt
    },
    bank
  );

  return {
    sichten,
    capitalNeed,
    bank,
    buchungslogik,
    umsatzsteuer,
    capitalShares,
    points,
    occupancy,
    houseComparison,
    timeline,
    liquidity,
    contributions,
    cashflow,
    debt,
    diagnostics: [
      ...inputDiagnostics,
      ...capitalNeed.diagnostics,
      ...contributions.diagnostics,
      ...debt.diagnostics,
      ...cashflow.diagnostics,
      ...bank.diagnostics,
      ...identityDiagnostics,
      ...buchungslogik.diagnostics,
      ...umsatzsteuer.diagnostics,
      ...liquidity.diagnostics,
      ...capitalShares.diagnostics,
      ...points.diagnostics,
      ...occupancy.diagnostics,
      ...houseComparison.diagnostics
    ]
  };
}

function collectIdentityDiagnostics(
  cashflow: CalculationResult["cashflow"]
): CalculationResult["diagnostics"] {
  const diagnostics = [];
  let previousClosingBalance = 0;

  for (const month of cashflow.bankAccountMonthly) {
    const expectedClosingBalance =
      month.month === 0
        ? month.netMovement
        : previousClosingBalance + month.netMovement;
    if (Math.abs(expectedClosingBalance - month.closingBalance) > 0.02) {
      diagnostics.push(
        diagnostic(
          `identity.bank-account.${month.month}`,
          "error",
          "cashflow",
          `Bankkonto-Identitaet stimmt in Monat ${
            month.month + 1
          } nicht: erwarteter Kontostand ${expectedClosingBalance.toLocaleString(
            "de-DE"
          )} EUR, modellierter Kontostand ${month.closingBalance.toLocaleString(
            "de-DE"
          )} EUR.`
        )
      );
      break;
    }
    previousClosingBalance = month.closingBalance;
  }

  for (const year of cashflow.vermoegensuebersichtYearly) {
    if (Math.abs(year.saldendifferenz) > 0.02) {
      diagnostics.push(
        diagnostic(
          `identity.balance-sheet.${year.year}`,
          "error",
          "cashflow",
          `Vermoegensidentitaet stimmt in Jahr ${year.year} nicht: Differenz ${year.saldendifferenz.toLocaleString(
            "de-DE"
          )} EUR.`
        )
      );
      break;
    }
  }

  return diagnostics;
}

function emptyCalculationResult(
  snapshot: ProjectSnapshot,
  diagnostics: CalculationResult["diagnostics"]
): CalculationResult {
  return {
    sichten: {
      objektkennung: snapshot.property.data.objektkennung,
      fallkennung: snapshot.strategy.data.fallkennung,
      szenariokennung: snapshot.strategy.data.szenariokennung,
      annahmenquelle: snapshot.strategy.data.annahmenquelle,
      objekte: {
        kaufpreis: 0,
        gesamtmittelverwendung: 0,
        zimmernachtKapazitaet: 0,
        externeAuslastungPct: 0
      },
      rechtstraeger: {
        bankkontoEndstand: 0,
        ausschuettbarerZahlungsueberschussJahr1: 0,
        eigenkapital: 0,
        verbindlichkeiten: 0
      },
      mitglieder: {
        anzahl: 0,
        startEk: 0,
        nutzungsentgeltJahr: 0
      },
      bank: {
        bankdarlehen: 0,
        beleihungsauslaufPct: 0,
        kapitaldienstdeckungsgrad: 0
      }
    },
    contributions: {
      initialContributions: [],
      recurringContributions: [],
      totalByOwner: {},
      requiredInitialContribution: 0,
      requiredMonthlyContribution: 0,
      diagnostics: []
    },
    capitalNeed: {
      items: [],
      funding: {
        mittelverwendung: [],
        mittelherkunft: [],
        gesamtMittelverwendung: 0,
        gesamtMittelherkunft: 0,
        nichtBankMittelherkunft: 0,
        bankdarlehen: 0,
        finanzierungsluecke: 0,
        finanzierungsueberschuss: 0,
        istSaldierend: true
      },
      purchasePrice: 0,
      vatAtPurchase: 0,
      vatRefund: 0,
      closingCosts: 0,
      mortgageRegistrationFee: 0,
      renovations: 0,
      legalFoundingCosts: 0,
      initialReserve: 0,
      totalProjectNeed: 0,
      ownerEquity: 0,
      debtPrincipal: 0,
      actualEquityRatioPct: 0,
      targetEquityRatioPct: 0,
      diagnostics: []
    },
    bank: {
      bankpruefungsZahlungsflussJahr1: 0,
      kapitaldienstJahr1: 0,
      kapitaldienstdeckungsgrad: 0,
      beleihungsauslaufPct: 0,
      zielBeleihungsauslaufPct: 90,
      persoenlicheMonatszahlungen: 0,
      persoenlichesMonatsnettoeinkommen: 0,
      persoenlicheBelastungsquotePct: null,
      laufzeitJahre: snapshot.financing.data.termYears,
      fmaBelastungsquoteRichtwertPct: 40,
      fmaLaufzeitRichtwertJahre: 35,
      stressfaelle: [],
      diagnostics: []
    },
    buchungslogik: {
      rows: [],
      diagnostics: []
    },
    umsatzsteuer: {
      rows: [],
      diagnostics: []
    },
    capitalShares: {
      mode: "scheduledPrincipal",
      termYears: snapshot.financing.data.termYears,
      valuationInterestPct: snapshot.strategy.data.capitalValuationInterestPct,
      totalCapitalValueAtLoanEnd: 0,
      owners: [],
      diagnostics: []
    },
    points: {
      capacity: 0,
      annualPointPool: 0,
      propertyValue: 0,
      appreciationPercentPerYear: 0,
      shareMode: "usage",
      owners: [],
      nightTypes: [],
      diagnostics: []
    },
    occupancy: {
      houseTitle: "",
      capacityPersons: 0,
      roomCapacity: 0,
      roomNightCapacity: 0,
      weekendRoomNightCapacity: 0,
      weekdayRoomNightCapacity: 0,
      capacityDataQuality: "missing",
      ownerCount: 0,
      ownerDemandNights: 0,
      ownerDemandRoomNights: 0,
      guestNights: 0,
      guestRoomNights: 0,
      blockedNights: 0,
      blockedRoomNights: 0,
      freeNights: 0,
      freeRoomNights: 0,
      weekendDemandRoomNights: 0,
      weekdayDemandRoomNights: 0,
      weekendFreeRoomNights: 0,
      weekdayFreeRoomNights: 0,
      weekendOccupancyPct: 0,
      weekdayOccupancyPct: 0,
      occupancyPct: 0,
      pointsPerAvailableNight: 0,
      ownerUseMarketOffsetValue: 0,
      ownerUseCostFloorValue: 0,
      ownerUseEconomicValue: 0,
      externalRentableRoomNights: 0,
      externalOccupiedRoomNights: 0,
      externalOccupancyPct: 0,
      averageGrossPricePerExternalRoomNight: 0,
      netExternalRevenue: 0,
      pressureLabel: "offen",
      diagnostics: []
    },
    houseComparison: {
      houses: [],
      diagnostics: []
    },
    timeline: [],
    debt: {
      loans: [],
      totalInitialDebt: 0,
      totalRemainingDebt: 0,
      totalInterestPaid: 0,
      totalPrincipalPaid: 0,
      monthlyDebtService: [],
      diagnostics: []
    },
    cashflow: {
      monthly: [],
      yearly: [],
      bankAccountMonthly: [],
      bankAccountYearly: [],
      operatingWaterfallYearly: [],
      ergebnisrechnungYearly: [],
      vermoegensuebersichtYearly: [],
      cumulativeCashflow: 0,
      diagnostics: []
    },
    liquidity: {
      monthly: [],
      minimumLiquidity: 0,
      finalLiquidity: 0,
      diagnostics: []
    },
    diagnostics: [
      ...diagnostics,
      {
        id: "project.calculation-blocked",
        severity: "error",
        domain: "project",
        message: `Calculation blocked for ${snapshot.metadata.timeHorizonMonths} month horizon because input validation has errors.`
      }
    ]
  };
}
