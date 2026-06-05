import type { ProjectSnapshot } from "./types";
import { diagnostic } from "../validation/diagnostics";
import { roundMoney, roundPct } from "./rounding";
import type {
  FundingBalanceResult,
  MittelherkunftResult,
  MittelverwendungKlasse,
  MittelverwendungResult,
  Zahlungsklasse
} from "./types";

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

export function calculateLegalFoundingCosts(snapshot: ProjectSnapshot): number {
  return snapshot.legalForm.data.foundingCostAmount;
}

export function calculateAnnualLegalOngoingCosts(snapshot: ProjectSnapshot): number {
  return (
    snapshot.legalForm.data.annualAccountingCostAmount +
    snapshot.legalForm.data.annualAdministrationCostAmount +
    snapshot.legalForm.data.annualComplianceCostAmount
  );
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
  return calculateFundingBalance(snapshot).gesamtMittelverwendung;
}

export function calculateEquityContributionNeed(
  snapshot: ProjectSnapshot
): number {
  return calculateTotalOwnerEquity(snapshot);
}

export function calculateDebtPrincipal(snapshot: ProjectSnapshot): number {
  return calculateFundingBalance(snapshot).bankdarlehen;
}

export function calculateTotalOwnerEquity(snapshot: ProjectSnapshot): number {
  return snapshot.ownership.data.owners.reduce(
    (total, owner) => total + owner.startEquityContribution,
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
  return owner ? (owner.startEquityContribution / totalEquity) * 100 : 0;
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

export function calculateFundingBalance(
  snapshot: ProjectSnapshot
): FundingBalanceResult {
  const mittelverwendung = getMittelverwendung(snapshot);
  const configuredSources = snapshot.financing.data.mittelherkunft;
  const nonBankSources =
    configuredSources.length > 0
      ? configuredSources
          .filter((source) => source.zahlungsklasse !== "bankdarlehen")
          .map(toMittelherkunftResult)
      : deriveNonBankMittelherkunft(snapshot);
  const gesamtMittelverwendung = roundMoney(
    mittelverwendung.reduce((total, item) => total + item.bruttoBetrag, 0)
  );
  const nichtBankMittelherkunft = roundMoney(
    nonBankSources.reduce((total, item) => total + item.betrag, 0)
  );
  const manualBankSources = configuredSources
    .filter((source) => source.zahlungsklasse === "bankdarlehen")
    .map(toMittelherkunftResult);
  const bankdarlehen =
    snapshot.financing.data.bankdarlehenModus === "manuell"
      ? roundMoney(manualBankSources.reduce((total, item) => total + item.betrag, 0))
      : roundMoney(Math.max(0, gesamtMittelverwendung - nichtBankMittelherkunft));
  const bankSources =
    snapshot.financing.data.bankdarlehenModus === "manuell"
      ? manualBankSources
      : [
          createMittelherkunft(
            "bankdarlehen-auto",
            "Automatisch saldiertes Bankdarlehen",
            "bankdarlehen",
            bankdarlehen,
            snapshot.financing.data.startMonth,
            {
              rueckzahlbar: true,
              zinssatzPct: snapshot.financing.data.annualInterestRatePct,
              rang: "vorrangig",
              besichert: true
            }
          )
        ].filter((source) => source.betrag > 0);
  const mittelherkunft = [...nonBankSources, ...bankSources];
  const gesamtMittelherkunft = roundMoney(
    mittelherkunft.reduce((total, item) => total + item.betrag, 0)
  );
  const difference = roundMoney(gesamtMittelverwendung - gesamtMittelherkunft);
  const finanzierungsluecke = roundMoney(Math.max(0, difference));
  const finanzierungsueberschuss = roundMoney(Math.max(0, -difference));

  return {
    mittelverwendung,
    mittelherkunft,
    gesamtMittelverwendung,
    gesamtMittelherkunft,
    nichtBankMittelherkunft,
    bankdarlehen,
    finanzierungsluecke,
    finanzierungsueberschuss,
    istSaldierend: Math.abs(difference) <= 0.01
  };
}

export function calculateCapitalNeed(snapshot: ProjectSnapshot) {
  const funding = calculateFundingBalance(snapshot);
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
  const legalFoundingCosts = roundMoney(calculateLegalFoundingCosts(snapshot));
  const initialReserve = roundMoney(calculateInitialReserveNeed(snapshot));
  const totalProjectNeed = roundMoney(funding.gesamtMittelverwendung);
  const ownerEquity = roundMoney(calculateTotalOwnerEquity(snapshot));
  const debtPrincipal = roundMoney(funding.bankdarlehen);
  const actualEquityRatioPct = roundPct(calculateActualEquityRatioPct(snapshot));
  const diagnostics = [];

  if (!funding.istSaldierend) {
    diagnostics.push(
      diagnostic(
        "funding.sources-uses-not-balanced",
        "error",
        "financing",
        `Mittelherkunft und Mittelverwendung saldieren nicht: Luecke ${roundMoney(
          funding.finanzierungsluecke
        ).toLocaleString("de-DE")} EUR, Ueberschuss ${roundMoney(
          funding.finanzierungsueberschuss
        ).toLocaleString("de-DE")} EUR.`
      )
    );
  }

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
      {
        id: "legal-founding",
        label: "Rechtsform-Gruendung",
        amount: legalFoundingCosts
      },
      { id: "reserve", label: "Initiale Reserve", amount: initialReserve },
      { id: "equity", label: "Start-EK", amount: -ownerEquity },
      { id: "debt", label: "Darlehen", amount: debtPrincipal }
    ],
    funding,
    purchasePrice,
    vatAtPurchase,
    vatRefund,
    closingCosts,
    mortgageRegistrationFee,
    renovations,
    legalFoundingCosts,
    initialReserve,
    totalProjectNeed,
    ownerEquity,
    debtPrincipal,
    actualEquityRatioPct,
    targetEquityRatioPct: snapshot.strategy.data.targetEquityRatioPct,
    diagnostics
  };
}

function getMittelverwendung(snapshot: ProjectSnapshot): MittelverwendungResult[] {
  const configuredUses = snapshot.financing.data.mittelverwendung;
  if (configuredUses.length > 0) {
    return configuredUses.map((item) => ({
      id: item.id,
      label: item.bezeichnung,
      klasse: item.verwendungsklasse,
      nettoBetrag: roundMoney(item.betrag.nettoBetrag),
      umsatzsteuerBetrag: roundMoney(item.betrag.umsatzsteuerBetrag),
      bruttoBetrag: roundMoney(item.betrag.bruttoBetrag),
      monat: item.monat,
      aktivierbar: item.aktivierbar,
      umsatzsteuerRelevant: item.umsatzsteuerRelevant
    }));
  }

  return deriveMittelverwendung(snapshot);
}

function deriveMittelverwendung(
  snapshot: ProjectSnapshot
): MittelverwendungResult[] {
  const purchasePrice = snapshot.property.data.purchasePrice;
  const closingCosts = snapshot.property.data.closingCosts;
  const realEstateTransferTax = (purchasePrice * closingCosts.realEstateTransferTaxPct) / 100;
  const landRegistry = (purchasePrice * closingCosts.landRegistryPct) / 100;
  const broker = (purchasePrice * closingCosts.brokerPct) / 100;
  const notary = (purchasePrice * closingCosts.notaryPct) / 100;
  const purchaseMonth = snapshot.property.data.purchaseMonth ?? 0;
  const items: MittelverwendungResult[] = [
    createMittelverwendung(
      "purchase",
      "Kaufpreis",
      "kaufpreis",
      purchasePrice,
      calculateVatAtPurchase(snapshot),
      purchaseMonth,
      { aktivierbar: true, umsatzsteuerRelevant: calculateVatAtPurchase(snapshot) > 0 }
    ),
    createMittelverwendung(
      "grunderwerbsteuer",
      "Grunderwerbsteuer",
      "grunderwerbsteuer",
      realEstateTransferTax,
      0,
      purchaseMonth
    ),
    createMittelverwendung(
      "grundbuch-eigentum",
      "Grundbuch Eigentum",
      "grundbuchEigentum",
      landRegistry,
      0,
      purchaseMonth
    ),
    createMittelverwendung(
      "makler",
      "Makler",
      "makler",
      broker,
      0,
      purchaseMonth
    ),
    createMittelverwendung(
      "vertrag-notar",
      "Vertrag / Notar",
      "vertragNotar",
      notary,
      0,
      purchaseMonth
    ),
    createMittelverwendung(
      "pfandrecht",
      "Pfandrecht / Eintragung",
      "pfandrecht",
      calculateMortgageRegistrationFee(snapshot),
      0,
      purchaseMonth
    ),
    createMittelverwendung(
      "gruendungskosten",
      "Gruendungskosten",
      "gruendungskosten",
      calculateLegalFoundingCosts(snapshot),
      0,
      purchaseMonth
    ),
    createMittelverwendung(
      "anfangsruecklage",
      "Anfangsruecklage",
      "anfangsruecklage",
      calculateInitialReserveNeed(snapshot),
      0,
      0
    )
  ];

  for (const cost of closingCosts.otherCosts) {
    items.push(
      createMittelverwendung(
        cost.id,
        cost.label,
        "sonstige",
        cost.amount,
        0,
        cost.timingMonth ?? purchaseMonth
      )
    );
  }

  for (const renovation of snapshot.property.data.renovationItems) {
    items.push(
      createMittelverwendung(
        renovation.id,
        renovation.label,
        renovation.category === "furniture" ? "einrichtung" : "renovierung",
        renovation.amount,
        0,
        renovation.timingMonth,
        { aktivierbar: true }
      )
    );
  }

  return items.filter((item) => item.bruttoBetrag > 0);
}

function deriveNonBankMittelherkunft(
  snapshot: ProjectSnapshot
): MittelherkunftResult[] {
  const ownerEquity = calculateTotalOwnerEquity(snapshot);
  return [
    createMittelherkunft(
      "owner-start-ek",
      "Start-EK der Beteiligten",
      "echtesEigenkapital",
      ownerEquity,
      0,
      { wirktAufUnternehmensanteil: true, rang: "eigenkapitalnah" }
    )
  ].filter((source) => source.betrag > 0);
}

function toMittelherkunftResult(source: {
  id: string;
  bezeichnung: string;
  zahlungsklasse: Zahlungsklasse;
  bruttoBetrag: number;
  monat: number;
  rueckzahlbar: boolean;
  zinssatzPct: number;
  rang: MittelherkunftResult["rang"];
  besichert: boolean;
  wirktAufUnternehmensanteil: boolean;
  wirktAufNutzungsrechte: boolean;
  umsatzsteuerRelevant: boolean;
}): MittelherkunftResult {
  return {
    id: source.id,
    label: source.bezeichnung,
    zahlungsklasse: source.zahlungsklasse,
    betrag: roundMoney(source.bruttoBetrag),
    monat: source.monat,
    rueckzahlbar: source.rueckzahlbar,
    zinssatzPct: source.zinssatzPct,
    rang: source.rang,
    besichert: source.besichert,
    wirktAufUnternehmensanteil: source.wirktAufUnternehmensanteil,
    wirktAufNutzungsrechte: source.wirktAufNutzungsrechte,
    umsatzsteuerRelevant: source.umsatzsteuerRelevant
  };
}

function createMittelverwendung(
  id: string,
  label: string,
  klasse: MittelverwendungKlasse,
  nettoBetrag: number,
  umsatzsteuerBetrag: number,
  monat: number,
  options: Partial<Pick<MittelverwendungResult, "aktivierbar" | "umsatzsteuerRelevant">> = {}
): MittelverwendungResult {
  return {
    id,
    label,
    klasse,
    nettoBetrag: roundMoney(nettoBetrag),
    umsatzsteuerBetrag: roundMoney(umsatzsteuerBetrag),
    bruttoBetrag: roundMoney(nettoBetrag + umsatzsteuerBetrag),
    monat,
    aktivierbar: options.aktivierbar ?? false,
    umsatzsteuerRelevant: options.umsatzsteuerRelevant ?? false
  };
}

function createMittelherkunft(
  id: string,
  label: string,
  zahlungsklasse: Zahlungsklasse,
  betrag: number,
  monat: number,
  options: Partial<
    Pick<
      MittelherkunftResult,
      | "rueckzahlbar"
      | "zinssatzPct"
      | "rang"
      | "besichert"
      | "wirktAufUnternehmensanteil"
      | "wirktAufNutzungsrechte"
      | "umsatzsteuerRelevant"
    >
  > = {}
): MittelherkunftResult {
  return {
    id,
    label,
    zahlungsklasse,
    betrag: roundMoney(betrag),
    monat,
    rueckzahlbar: options.rueckzahlbar ?? false,
    zinssatzPct: options.zinssatzPct ?? 0,
    rang: options.rang ?? "offen",
    besichert: options.besichert ?? false,
    wirktAufUnternehmensanteil: options.wirktAufUnternehmensanteil ?? false,
    wirktAufNutzungsrechte: options.wirktAufNutzungsrechte ?? false,
    umsatzsteuerRelevant: options.umsatzsteuerRelevant ?? false
  };
}
