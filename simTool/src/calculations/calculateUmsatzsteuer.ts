import { diagnostic } from "../validation/diagnostics";
import type {
  ProjectSnapshot,
  UmsatzsteuerMatrixRow,
  UmsatzsteuerResult,
  UmsatzsteuerStatus,
  Zahlungsklasse
} from "./types";

type RowInput = {
  id: string;
  leistungsart: string;
  zahlungsklasse?: Zahlungsklasse;
  angenommenerSteuersatz: string;
  steuerbar: UmsatzsteuerStatus;
  vorsteuerbezug: UmsatzsteuerStatus;
  dokumentation: string;
  pruefhinweis: string;
  quellenstatus: string;
};

export function calculateUmsatzsteuer(
  snapshot: ProjectSnapshot
): UmsatzsteuerResult {
  const hasUsageFees = snapshot.ownership.data.owners.some(
    (owner) => (owner.monthlyUsageContribution ?? 0) > 0
  );
  const hasExternalRental =
    (snapshot.property.data.expectedMonthlyRent ?? 0) > 0 ||
    (snapshot.property.data.guestNightsPerYear ?? 0) > 0 ||
    snapshot.strategy.data.externalOccupancyRatePct > 0;
  const hasInputTaxAssumption = snapshot.property.data.vatRecoverablePct > 0;
  const rows: UmsatzsteuerMatrixRow[] = [
    createRow({
      id: "private-eigennutzung",
      leistungsart: "Private Eigennutzung Beteiligte",
      angenommenerSteuersatz: "offen / pruefen",
      steuerbar: "offen",
      vorsteuerbezug: "offen",
      dokumentation: "Belegung, Nutzungsberechtigung und Kostenverrechnung",
      pruefhinweis:
        "Private Eigennutzung muss von entgeltlicher Leistung und Kapitalzahlung getrennt werden.",
      quellenstatus: "Wiki 03_tax, Steuerberatung erforderlich"
    }),
    createRow({
      id: "nutzungsentgelt-beteiligte",
      leistungsart: "Nutzungsentgelt Beteiligte",
      zahlungsklasse: "nutzungsentgelt",
      angenommenerSteuersatz: "offen / pruefen",
      steuerbar: hasUsageFees ? "offen" : "nein",
      vorsteuerbezug: "offen",
      dokumentation: "Nutzungsvereinbarung, Rechnung, Zimmernaechte",
      pruefhinweis:
        "Nutzungsentgelt ist kein Unternehmensanteil; Umsatzsteuer und Rechnungspflicht pruefen.",
      quellenstatus: "Wiki 03_tax, BMF/USP pruefen"
    }),
    createRow({
      id: "kostenumlage-beteiligte",
      leistungsart: "Kostenumlage Beteiligte",
      zahlungsklasse: "kostenumlage",
      angenommenerSteuersatz: "offen / pruefen",
      steuerbar: "offen",
      vorsteuerbezug: "offen",
      dokumentation: "Kostenbeschluss, Umlageschluessel, Zahlungsgrund",
      pruefhinweis:
        "Echter Kostenersatz und entgeltliche Leistung koennen unterschiedlich zu behandeln sein.",
      quellenstatus: "Wiki 03_tax, Steuerberatung erforderlich"
    }),
    createRow({
      id: "drittvermietung",
      leistungsart: "Drittvermietung / Beherbergung",
      zahlungsklasse: "vermietungserloes",
      angenommenerSteuersatz: "10% / 20% / offen",
      steuerbar: hasExternalRental ? "ja" : "offen",
      vorsteuerbezug: "offen",
      dokumentation: "Gaesterechnungen, Meldewesen, Leistungsumfang",
      pruefhinweis:
        "Beherbergung, Wohnzweckvermietung und Nebenleistungen getrennt pruefen.",
      quellenstatus: "Wiki 03_tax, BMF/USP pruefen"
    }),
    createRow({
      id: "kurzfristige-vermietung",
      leistungsart: "Kurzfristige Vermietung bis 14 Tage",
      zahlungsklasse: "vermietungserloes",
      angenommenerSteuersatz: "20% Sonderregel pruefen",
      steuerbar: "offen",
      vorsteuerbezug: "offen",
      dokumentation: "Vermietungsdauer, Leistungsort, Gaststatus",
      pruefhinweis:
        "Kurzfristige Vermietung kann andere Umsatzsteuerfolgen haben als Wohnzweckvermietung.",
      quellenstatus: "Wiki 03_tax, BMF pruefen"
    }),
    createRow({
      id: "parkplatz-garage",
      leistungsart: "Parkplatz / Garage",
      zahlungsklasse: "vermietungserloes",
      angenommenerSteuersatz: "20% pruefen",
      steuerbar: "offen",
      vorsteuerbezug: "offen",
      dokumentation: "Separater Leistungsbestandteil oder Nebenleistung",
      pruefhinweis:
        "Parkplatz/Garage kann umsatzsteuerlich anders eingeordnet werden als die Unterkunft.",
      quellenstatus: "Wiki 03_tax, Steuerberatung erforderlich"
    }),
    createRow({
      id: "nahestehende-unternehmen",
      leistungsart: "Nutzung durch nahestehende Unternehmen",
      angenommenerSteuersatz: "offen / fremdueblich pruefen",
      steuerbar: "offen",
      vorsteuerbezug: "offen",
      dokumentation: "Vertrag, Fremdueblichkeit, Rechnung, Zahlungsfluss",
      pruefhinweis:
        "Nahestehende Nutzer erhoehen Dokumentations- und Fremdvergleichsbedarf.",
      quellenstatus: "Wiki 03_tax, Einzelfallpruefung"
    }),
    createRow({
      id: "kleinunternehmer",
      leistungsart: "Kleinunternehmergrenze / Optionsfrage",
      angenommenerSteuersatz: "Schwelle und Option pruefen",
      steuerbar: "offen",
      vorsteuerbezug: hasInputTaxAssumption ? "offen" : "nein",
      dokumentation: "Umsaetze, Option, Vorsteuerannahmen",
      pruefhinweis:
        "Vorsteuerannahmen und Kleinunternehmerlogik duerfen nicht widerspruechlich modelliert werden.",
      quellenstatus: "Wiki 03_tax, BMF/USP pruefen"
    })
  ];
  const diagnostics = [];

  if (hasUsageFees) {
    diagnostics.push(
      diagnostic(
        "umsatzsteuer.nutzungsentgelt-pruefen",
        "warning",
        "property",
        "Nutzungsentgelte sind modelliert; Umsatzsteuer, Rechnung und Leistungsbeschreibung muessen geprueft werden."
      )
    );
  }

  if (hasInputTaxAssumption) {
    diagnostics.push(
      diagnostic(
        "umsatzsteuer.vorsteuer-gemischte-nutzung-pruefen",
        "warning",
        "property",
        "Vorsteuerabzug ist modelliert; gemischte Nutzung und Vorsteuerquote muessen fachlich geprueft werden."
      )
    );
  }

  if (hasExternalRental) {
    diagnostics.push(
      diagnostic(
        "umsatzsteuer.drittvermietung-pruefen",
        "info",
        "property",
        "Drittvermietung oder Fremdgaeste sind modelliert; Leistungsart, Meldewesen und USt-Satz pruefen."
      )
    );
  }

  return {
    rows,
    diagnostics
  };
}

function createRow(input: RowInput): UmsatzsteuerMatrixRow {
  return input;
}
