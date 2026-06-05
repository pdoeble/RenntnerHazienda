import { diagnostic } from "../validation/diagnostics";
import { roundMoney } from "./rounding";
import type {
  BuchungRow,
  BuchungslogikResult,
  CapitalNeedResult,
  MittelverwendungKlasse,
  MittelverwendungResult,
  Zahlungsklasse,
  MittelherkunftResult
} from "./types";

type BuchungTemplate = {
  soll: string;
  haben: string;
  pruefhinweis: string;
  umsatzsteuerHinweis?: string;
};

const SOURCE_TEMPLATES: Record<Zahlungsklasse, BuchungTemplate> = {
  echtesEigenkapital: {
    soll: "Bank",
    haben: "Einlagekapital / gezeichnetes Kapital",
    pruefhinweis:
      "Nur verwenden, wenn die Zahlung gesellschaftsrechtlich echte Beteiligung begruendet.",
    umsatzsteuerHinweis: "Keine Leistungsabrechnung; USt regelmaessig nicht der Zweck."
  },
  kapitalruecklage: {
    soll: "Bank",
    haben: "Kapitalruecklage",
    pruefhinweis:
      "Anteilsauswirkung und Nicht-Rueckzahlbarkeit muessen im Vertrag festgelegt sein.",
    umsatzsteuerHinweis: "Keine Leistungsabrechnung; USt-Bezug pruefen."
  },
  nachschuss: {
    soll: "Bank",
    haben: "Nachschuss / Kapitalruecklage oder Verbindlichkeit",
    pruefhinweis:
      "Nachschuss nur mit klarer Grundlage; sonst als Darlehen oder Kostenumlage klassifizieren.",
    umsatzsteuerHinweis: "USt-Bezug haengt vom Leistungsgrund ab."
  },
  gesellschafterdarlehen: {
    soll: "Bank",
    haben: "Verbindlichkeiten gegenueber Beteiligten",
    pruefhinweis:
      "Rueckzahlung, Rang, Verzinsung, Sicherheiten und Ausfallfolgen schriftlich regeln.",
    umsatzsteuerHinweis: "Darlehensvaluta ist keine Nutzungsleistung; Zinsen separat pruefen."
  },
  bankdarlehen: {
    soll: "Bank",
    haben: "Bankverbindlichkeiten",
    pruefhinweis: "Bankzusage, Auszahlungsvoraussetzungen und Pfandrecht abstimmen.",
    umsatzsteuerHinweis: "Darlehensauszahlung selbst ist keine Nutzungsleistung."
  },
  nutzungsentgelt: {
    soll: "Bank / Forderung",
    haben: "Umsatzerloese Nutzungsentgelt",
    pruefhinweis:
      "Nutzungsentgelt getrennt von Kapital und Kostenumlage abrechnen.",
    umsatzsteuerHinweis: "Steuersatz, Steuerbarkeit und Rechnungspflicht offen pruefen."
  },
  kostenumlage: {
    soll: "Bank / Forderung",
    haben: "Kostenersatz / sonstige betriebliche Ertraege",
    pruefhinweis:
      "Kostenumlage erzeugt keine Unternehmensanteile und muss von Nutzungsentgelt getrennt bleiben.",
    umsatzsteuerHinweis: "USt-Behandlung als echter Kostenersatz oder Leistung pruefen."
  },
  liquiditaetsreserve: {
    soll: "Bank",
    haben: "gebundene Liquiditaetsreserve / Kapitalruecklage",
    pruefhinweis:
      "Reserve bleibt Liquiditaet, solange keine Zahlung an Dritte erfolgt.",
    umsatzsteuerHinweis: "USt-Bezug nur bei spaeterer Ausgabe relevant."
  },
  vermietungserloes: {
    soll: "Bank / Forderung",
    haben: "Umsatzerloese Vermietung",
    pruefhinweis:
      "Drittvermietung getrennt nach Beherbergung, Wohnzweck oder Nebenleistung pruefen.",
    umsatzsteuerHinweis: "Steuersatz und Vorsteuerquote muessen je Leistungsart geprueft werden."
  },
  foerderung: {
    soll: "Bank",
    haben: "Foerderertrag / Investitionszuschuss",
    pruefhinweis: "Foerderbedingungen, Rueckzahlung und Aktivierung pruefen.",
    umsatzsteuerHinweis: "Echter Zuschuss oder Entgelt von dritter Seite pruefen."
  },
  sonstige: {
    soll: "Bank",
    haben: "offene Gegenposition",
    pruefhinweis: "Zahlungsklasse fehlt; vor Modellnutzung fachlich zuordnen.",
    umsatzsteuerHinweis: "USt-Behandlung offen."
  }
};

const USE_TEMPLATES: Record<MittelverwendungKlasse, BuchungTemplate> = {
  kaufpreis: {
    soll: "Grundstueck / Gebaeude",
    haben: "Bank",
    pruefhinweis:
      "Aufteilung Grund und Boden, Gebaeude und allfaellige Umsatzsteuer pruefen.",
    umsatzsteuerHinweis: "Vorsteuer nur bei steuerbarer unternehmerischer Nutzung pruefen."
  },
  grunderwerbsteuer: {
    soll: "Anschaffungsnebenkosten / Steueraufwand",
    haben: "Bank",
    pruefhinweis: "Aktivierung oder Aufwand mit Steuerberatung pruefen.",
    umsatzsteuerHinweis: "Keine Umsatzsteuer."
  },
  grundbuchEigentum: {
    soll: "Anschaffungsnebenkosten / Grundbuchkosten",
    haben: "Bank",
    pruefhinweis: "Einordnung als Anschaffungsnebenkosten pruefen.",
    umsatzsteuerHinweis: "Keine Umsatzsteuer."
  },
  pfandrecht: {
    soll: "Finanzierungsnebenkosten / Pfandrecht",
    haben: "Bank",
    pruefhinweis: "Aktivierung oder laufender Aufwand pruefen.",
    umsatzsteuerHinweis: "Keine Umsatzsteuer."
  },
  eingabegebuehr: {
    soll: "Gebuehrenaufwand",
    haben: "Bank",
    pruefhinweis: "Gebuehrentatbestand und Zeitpunkt pruefen.",
    umsatzsteuerHinweis: "Keine Umsatzsteuer."
  },
  makler: {
    soll: "Anschaffungsnebenkosten / Makler",
    haben: "Bank",
    pruefhinweis: "Maklerpflicht und Provisionsfreiheit objektbezogen pruefen.",
    umsatzsteuerHinweis: "Vorsteuer nur bei Rechnung und unternehmerischer Nutzung pruefen."
  },
  vertragNotar: {
    soll: "Anschaffungsnebenkosten / Rechtsberatung",
    haben: "Bank",
    pruefhinweis: "Leistungsumfang Vertrag, Treuhand und Notar trennen.",
    umsatzsteuerHinweis: "Vorsteuerabzug pruefen."
  },
  beglaubigung: {
    soll: "Gebuehren / Beglaubigung",
    haben: "Bank",
    pruefhinweis: "Einordnung als Nebenkosten pruefen.",
    umsatzsteuerHinweis: "Vorsteuerabzug pruefen, soweit USt ausgewiesen ist."
  },
  technischePruefung: {
    soll: "Pruefkosten / Anschaffungsnebenkosten",
    haben: "Bank",
    pruefhinweis: "Technische Due Diligence vor Kauf dokumentieren.",
    umsatzsteuerHinweis: "Vorsteuerabzug pruefen."
  },
  renovierung: {
    soll: "Anlagevermoegen oder Erhaltungsaufwand",
    haben: "Bank",
    pruefhinweis: "Herstellung, Instandsetzung und laufenden Aufwand trennen.",
    umsatzsteuerHinweis: "Vorsteuerquote bei gemischter Nutzung pruefen."
  },
  einrichtung: {
    soll: "Betriebs- und Geschaeftsausstattung",
    haben: "Bank",
    pruefhinweis: "Nutzungsdauer und Aktivierungsgrenze pruefen.",
    umsatzsteuerHinweis: "Vorsteuerquote bei gemischter Nutzung pruefen."
  },
  finanzierungsgebuehr: {
    soll: "Finanzierungsaufwand / aktive Abgrenzung",
    haben: "Bank",
    pruefhinweis: "Laufzeitgerechte Verteilung pruefen.",
    umsatzsteuerHinweis: "USt-Bezug offen."
  },
  sicherheitspuffer: {
    soll: "Zweckbindung Liquiditaet",
    haben: "Bankkonto intern / keine Drittzahlung",
    pruefhinweis: "Puffer ist keine Ausgabe, solange Geld auf dem Konto bleibt.",
    umsatzsteuerHinweis: "Keine USt ohne Drittleistung."
  },
  anfangsliquiditaet: {
    soll: "Zweckbindung Liquiditaet",
    haben: "Bankkonto intern / keine Drittzahlung",
    pruefhinweis: "Anfangsliquiditaet bleibt Bankguthaben und ist kein Aufwand.",
    umsatzsteuerHinweis: "Keine USt ohne Drittleistung."
  },
  anfangsruecklage: {
    soll: "Zweckbindung Ruecklage",
    haben: "Bankkonto intern / keine Drittzahlung",
    pruefhinweis: "Ruecklage bleibt Liquiditaet bis zur Reparatur oder Ausgabe.",
    umsatzsteuerHinweis: "Keine USt ohne Drittleistung."
  },
  gruendungskosten: {
    soll: "Gruendungskosten / Rechtsberatung",
    haben: "Bank",
    pruefhinweis: "Aktivierung oder Aufwand nach Rechtsform pruefen.",
    umsatzsteuerHinweis: "Vorsteuerabzug pruefen."
  },
  sonstige: {
    soll: "offene Verwendung",
    haben: "Bank",
    pruefhinweis: "Verwendungsklasse fehlt; vor Modellnutzung fachlich zuordnen.",
    umsatzsteuerHinweis: "USt-Behandlung offen."
  }
};

export function calculateBuchungslogik(
  capitalNeed: CapitalNeedResult
): BuchungslogikResult {
  const sourceRows = capitalNeed.funding.mittelherkunft.map(sourceToRow);
  const useRows = capitalNeed.funding.mittelverwendung.map(useToRow);
  const diagnostics = [
    ...capitalNeed.funding.mittelherkunft
      .filter((source) => source.zahlungsklasse === "sonstige")
      .map((source) =>
        diagnostic(
          `buchung.source.${source.id}.class-open`,
          "warning",
          "financing",
          `Mittelherkunft "${source.label}" hat keine fachlich klare Zahlungsklasse.`
        )
      ),
    ...capitalNeed.funding.mittelherkunft
      .filter((source) => source.rueckzahlbar && source.wirktAufUnternehmensanteil)
      .map((source) =>
        diagnostic(
          `buchung.source.${source.id}.repayable-share-effect`,
          "warning",
          "ownership",
          `Mittelherkunft "${source.label}" ist rueckzahlbar und soll zugleich Unternehmensanteile beeinflussen.`
        )
      ),
    ...capitalNeed.funding.mittelverwendung
      .filter((item) => item.klasse === "sonstige")
      .map((item) =>
        diagnostic(
          `buchung.use.${item.id}.class-open`,
          "warning",
          "financing",
          `Mittelverwendung "${item.label}" hat keine fachlich klare Verwendungsklasse.`
        )
      )
  ];

  return {
    rows: [...sourceRows, ...useRows],
    diagnostics
  };
}

function sourceToRow(source: MittelherkunftResult): BuchungRow {
  const template = SOURCE_TEMPLATES[source.zahlungsklasse];
  return {
    id: `source-${source.id}`,
    quelle: "mittelherkunft",
    vorgang: source.label,
    zahlungsklasse: source.zahlungsklasse,
    soll: template.soll,
    haben: template.haben,
    betrag: roundMoney(source.betrag),
    pruefhinweis: source.besichert
      ? `${template.pruefhinweis} Besicherung ist modelliert.`
      : template.pruefhinweis,
    umsatzsteuerHinweis: template.umsatzsteuerHinweis ?? "USt-Behandlung pruefen."
  };
}

function useToRow(item: MittelverwendungResult): BuchungRow {
  const template = USE_TEMPLATES[item.klasse];
  return {
    id: `use-${item.id}`,
    quelle: "mittelverwendung",
    vorgang: item.label,
    verwendungsklasse: item.klasse,
    soll: template.soll,
    haben: template.haben,
    betrag: roundMoney(item.bruttoBetrag),
    pruefhinweis: item.aktivierbar
      ? `${template.pruefhinweis} Aktivierbarkeit ist als Planannahme markiert.`
      : template.pruefhinweis,
    umsatzsteuerHinweis:
      item.umsatzsteuerRelevant && item.umsatzsteuerBetrag > 0
        ? `${template.umsatzsteuerHinweis ?? "USt-Behandlung pruefen."} Modell-USt: ${roundMoney(
            item.umsatzsteuerBetrag
          ).toLocaleString("de-DE")} EUR.`
        : template.umsatzsteuerHinweis ?? "USt-Behandlung pruefen."
  };
}
