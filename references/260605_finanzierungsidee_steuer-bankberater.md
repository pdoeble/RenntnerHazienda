# Finanzierungsidee Ferienhaus Österreich

## Entwurf für Steuer- und Bankberatung

### Status
Dieses Dokument ist ein Arbeitsentwurf für ein Gespräch mit Steuerberatung und Bank. Es beschreibt die aktuell modellierte Finanzierungsidee im `simTool` und sammelt Prüffragen. Es ist keine Rechts-, Steuer- oder Kreditberatung und enthält keine abschließende Empfehlung.

### Quelle
- Quelle: Berechnungspipeline und Default-Projekt
- Herausgeber: Projektteam RenntnerHazienda
- Link: [calculateAll.ts](../simTool/src/calculations/calculateAll.ts)
- Link: [property/defaults.ts](../simTool/src/modules/property/defaults.ts)
- Link: [ownership/defaults.ts](../simTool/src/modules/ownership/defaults.ts)
- Stand/Veröffentlichungsdatum: Projektstand 2026-06-05
- Abrufdatum: 2026-06-05
- Geltungsbereich: internes Planungsmodell
- Stabilität: niedrig

## 1. Anliegen

Wir prüfen den gemeinschaftlichen Erwerb, Besitz und Betrieb eines Ferienhauses in Österreich. Die Gruppe möchte die Finanzierung so strukturieren, dass Eigenkapital, laufender Vermögensaufbau, laufende Kosten, Nutzungsrechte und Liquiditätsreserve sauber getrennt werden.

Ziel des Beratungstermins ist die Prüfung, ob die Modellstruktur bankfähig, steuerlich sauber dokumentierbar und rechtlich sinnvoll umsetzbar ist. Die Rechtsform ist noch nicht final entschieden.

### Quelle
- Quelle: Projekt-Wiki Finanzierung und Eigentum
- Herausgeber: Projektteam RenntnerHazienda
- Link: [05_finance.md](../wiki/05_finance.md)
- Link: [04_ownership.md](../wiki/04_ownership.md)
- Stand/Veröffentlichungsdatum: Projektstand 2026-05-15 bis 2026-06-05
- Abrufdatum: 2026-06-05
- Geltungsbereich: Österreich, Projektvorbereitung
- Stabilität: niedrig

## 2. Strukturidee

Die Finanzierungslogik trennt vier Zahlungsarten:

| Zahlungsart | Zweck | Geplante wirtschaftliche Wirkung |
|---|---|---|
| Start-EK | einmalige Einlage bei Projektstart | zählt zum Unternehmens-/Wiederverkaufsanteil |
| Kapitalruecklage / Anlage | laufender Vermögensaufbau, im Default als Tilgungsanteil | zählt nur bei ausdrücklich definierter Beteiligungswirkung zum Unternehmens-/Wiederverkaufsanteil |
| Kostenbeitrag | Zinsen, laufende Kosten, Verwaltung, Buchhaltung, nicht aktivierungsfähige Kosten | zählt nicht zum Unternehmensanteil |
| Nutzungsentgelt | laufender EUR-Beitrag für Nutzungsrechte/Zimmernächte | zählt nicht zum Unternehmensanteil |
| Liquiditätsreserve | Bankkonto-Puffer und zweckgebundene Reserve | zählt nicht automatisch zum Unternehmensanteil |

Im aktuellen Default-Modell wird die Banktilgung als Kapitalwirkung behandelt. Die Zinsen und laufenden Kosten werden als Kostenbeitrag behandelt. Das Nutzungsentgelt wird in interne Nutzungspunkte bzw. Zimmernächte umgerechnet. Eine Nutzungspunkt-Nacht entspricht einer Zimmernacht, nicht einer ganzen Hausnacht.

### Quelle
- Quelle: Beitrags-, Kapitalanteils- und Punkteberechnung
- Herausgeber: Projektteam RenntnerHazienda
- Link: [calculateContributions.ts](../simTool/src/calculations/calculateContributions.ts)
- Link: [calculateCapitalShares.ts](../simTool/src/calculations/calculateCapitalShares.ts)
- Link: [calculatePoints.ts](../simTool/src/calculations/calculatePoints.ts)
- Stand/Veröffentlichungsdatum: Projektstand 2026-06-05
- Abrufdatum: 2026-06-05
- Geltungsbereich: internes Planungsmodell
- Stabilität: niedrig

## 3. Aktueller Demo-Stand im Modell

Die folgenden Zahlen sind Demo- und Szenariowerte aus dem aktuellen Default-Projekt. Sie sind nicht final geprüft und nicht als verbindliche Finanzierungsanfrage zu verstehen.

| Kennzahl | Aktueller Modellwert |
|---|---:|
| Kaufpreis | 670.000 EUR |
| Nebenkosten | 40.870 EUR |
| Pfandrecht-/Eintragungsannahme | 8.040 EUR |
| Renovierungen | 0 EUR |
| Rechtsform-Gründungskosten | 0 EUR, Status Kostenannahme fehlt/prüfen |
| Initiale Liquiditätsreserve | 30.000 EUR |
| Gesamtprojektbedarf | 748.910 EUR |
| Start-EK der Gruppe | 225.000 EUR |
| Darlehensbetrag im Modell | 523.910 EUR |
| tatsächliche EK-Quote im Modell | ca. 30,0 % |
| Zinssatz | 4,0 % p.a. |
| Laufzeit | 25 Jahre |
| erste Monatsrate | ca. 2.765,39 EUR |
| erster Monatszins | ca. 1.746,37 EUR |
| erste Monatstilgung | ca. 1.019,02 EUR |
| erster Gesamtbeitrag der Gruppe ohne Vermietungsertrag | ca. 2.866,29 EUR/Monat |

Wichtig: Die App berechnet die Pfandrecht-/Eintragungsannahme derzeit mit `Kaufpreis * 1,2 %`. Für die konkrete Bankstruktur ist zu prüfen, ob der einzutragende Pfandbetrag hiervon abweicht.

### Quelle
- Quelle: Default-Templates und Regressionsdaten
- Herausgeber: Projektteam RenntnerHazienda
- Link: [property/defaults.ts](../simTool/src/modules/property/defaults.ts)
- Link: [financing/defaults.ts](../simTool/src/modules/financing/defaults.ts)
- Link: [ownership/defaults.ts](../simTool/src/modules/ownership/defaults.ts)
- Link: [calculations.test.ts](../simTool/src/calculations/calculations.test.ts)
- Stand/Veröffentlichungsdatum: Projektstand 2026-06-05
- Abrufdatum: 2026-06-05
- Geltungsbereich: internes Demo-Szenario
- Stabilität: niedrig

### Externe Quelle
- Quelle: Nebenkosten beim Wohnungs- und Grundstückskauf
- Herausgeber: oesterreich.gv.at / Bundesministerium für Justiz
- Link: https://www.oesterreich.gv.at/de/themen/bauen_und_wohnen/wohnen/8/Seite.210150
- Stand/Veröffentlichungsdatum: letzte Aktualisierung 01.01.2026
- Abrufdatum: 2026-06-05
- Geltungsbereich: Österreich, Immobilienkauf
- Stabilität: mittel

## 4. Bankkonto- und Liquiditätslogik

Das Modell betrachtet das Projektkonto als zentrale Liquiditätsebene. Einzahlungen sind Start-EK, laufende Eigentümerbeiträge, Nutzungsentgelte, Darlehensauszahlung, Vermietungserträge und ggf. USt-Erstattung. Auszahlungen sind Kaufpreis, Nebenkosten, Renovierungen, Betriebskosten, Zinsen und Tilgung.

Die interne Reservezuführung wird nicht als Geldabfluss an Dritte behandelt. Sie bleibt im Modell auf dem Bankkonto und erhöht den Kontostand, bis tatsächliche Reparaturen, Renovierungen oder andere Zahlungen erfasst werden.

### Quelle
- Quelle: Liquiditäts- und Bankkonto-Zahlungsfluss
- Herausgeber: Projektteam RenntnerHazienda
- Link: [calculateLiquidity.ts](../simTool/src/calculations/calculateLiquidity.ts)
- Link: [calculateCashflow.ts](../simTool/src/calculations/calculateCashflow.ts)
- Stand/Veröffentlichungsdatum: Projektstand 2026-06-05
- Abrufdatum: 2026-06-05
- Geltungsbereich: internes Planungsmodell
- Stabilität: niedrig

## 5. Bankseitige Prüffragen

1. Welche Kreditnehmerstruktur ist aus Banksicht tragfähig: natürliche Personen gemeinsam, Miteigentum, Verein, GmbH, FlexCo, KG, GmbH & Co KG, Genossenschaft oder andere Struktur?
2. Welche Sicherheiten werden erwartet: Hypothek, persönliche Haftung, Bürgschaften, Nachschusspflichten, Reservekonto oder Verpfändung von Kontoguthaben?
3. Wird die Gruppe als Gesamtschuldner geprüft oder werden Einzelbonitäten anteilig bewertet?
4. Wie soll die Bank mit wechselnden Beteiligten, Exit-Regeln und Aufgriffsrechten umgehen?
5. Welche Mindest-Eigenmittelquote, Schuldendienstquote und Laufzeit werden in dieser konkreten Struktur erwartet?
6. Werden erwartete Vermietungserträge berücksichtigt oder nur als zusätzlicher Sicherheitspuffer betrachtet?
7. Ist der geplante Reservebetrag ausreichend, oder fordert die Bank einen separaten Liquiditätspuffer?
8. Soll das Pfandrecht auf den Darlehensbetrag, einen höheren Höchstbetrag oder eine andere Bemessungsgrundlage eingetragen werden?

### Quelle
- Quelle: FMA erwartet nach Auslaufen der KIM-V solide Wohnkreditvergabe
- Herausgeber: Finanzmarktaufsicht Österreich
- Link: https://www.fma.gv.at/kim-v-ende-fma-erwartet-stabile-kreditvergabe/
- Stand/Veröffentlichungsdatum: 26.06.2025
- Abrufdatum: 2026-06-05
- Geltungsbereich: Österreich, private Wohnimmobilienkredite
- Stabilität: mittel

## 6. Steuerliche Prüffragen

1. Wie sind Nutzungsbeiträge der Eigner steuerlich und umsatzsteuerlich zu behandeln?
2. Führt Eigennutzung zu Eigenverbrauch, verdeckten Vorteilen, fremdüblichen Entgelten oder Vorsteuerkorrekturen?
3. Ist kurzfristige Fremdvermietung als Beherbergung, Vermietung oder gemischte Nutzung einzuordnen?
4. Kann Vorsteuer aus Kauf, Renovierung, Ausstattung oder laufenden Kosten geltend gemacht werden?
5. Wie werden Zinsen, Betriebskosten, Buchhaltung, Verwaltung, Versicherung und Instandhaltung steuerlich behandelt?
6. Wie soll die interne Rücklage dokumentiert werden?
7. Wie werden Start-EK, Anlagebeiträge und Tilgungsanteile gesellschaftsrechtlich und steuerlich auf Kapitalkonten abgebildet?
8. Welche Dokumentation ist erforderlich, damit Nutzungsnächte, Zimmernächte, Fremdgäste und Eigennutzung nachvollziehbar bleiben?
9. Ist eine Kleinunternehmerregelung relevant oder ausgeschlossen?
10. Welche lokalen Tourismusabgaben, Gemeindeabgaben und Meldepflichten sind für das konkrete Objekt zu prüfen?

### Quelle
- Quelle: Vermietung und Verpachtung in der Umsatzsteuer
- Herausgeber: Bundesministerium für Finanzen
- Link: https://www.bmf.gv.at/themen/steuern/immobilien-grundstuecke/vermietung-verpachtung/vermietung-und-verpachtung-in-der-umsatzsteuer.html
- Stand/Veröffentlichungsdatum: letzte Aktualisierung 01.01.2026
- Abrufdatum: 2026-06-05
- Geltungsbereich: Österreich, Umsatzsteuer
- Stabilität: mittel

## 7. Rechtsform- und Vertragsfragen

Die Rechtsform soll vor allem Haftung, Bankfähigkeit, Governance, Exit, Aufgriff, Nachschuss, Nutzung, Vermietung, Buchhaltung und steuerliche Transparenz sauber abbilden. Das Modell kann Kostenfelder für Gründung und laufende Verwaltung berücksichtigen, bewertet aber keine Rechtsform abschließend.

Zu klären sind insbesondere:
- Wer hält das Eigentum im Grundbuch?
- Wer ist Kreditnehmer?
- Wer haftet gegenüber Bank, Dritten, Gemeinde und Gästen?
- Wie werden Stimmrechte und Unternehmensanteile fixiert?
- Wie werden Anlagebeiträge, Nutzungsbeiträge und Kostenbeiträge buchhalterisch geführt?
- Wie wird verhindert, dass Nutzungsrechte unbeabsichtigt Eigentumsrechte verschieben?
- Wie funktionieren Austritt, Tod, Verkauf, Ausschluss und Übertragung?

### Quelle
- Quelle: Rechtsform-Default und Projekt-Wiki Eigentum
- Herausgeber: Projektteam RenntnerHazienda
- Link: [legal-form/defaults.ts](../simTool/src/modules/legal-form/defaults.ts)
- Link: [04_ownership.md](../wiki/04_ownership.md)
- Stand/Veröffentlichungsdatum: Projektstand 2026-05-15 bis 2026-06-05
- Abrufdatum: 2026-06-05
- Geltungsbereich: internes Planungsmodell, Österreich
- Stabilität: niedrig

### Externe Quelle
- Quelle: eGründung / Unternehmensformen online gründen
- Herausgeber: Unternehmensserviceportal / Bundeskanzleramt
- Link: https://www.usp.gv.at/en/services/egruendung.html
- Stand/Veröffentlichungsdatum: letzte Aktualisierung 01.01.2026
- Abrufdatum: 2026-06-05
- Geltungsbereich: Österreich, Unternehmensgründung
- Stabilität: mittel

## 8. Unterlagen für den Termin

Für einen belastbaren Beratungstermin sollten vorbereitet werden:

- Eigentümerliste mit Start-EK, geplanter Kapitalruecklage / Anlage, geplantem Nutzungsentgelt und Wohnsitzland
- Entwurf der Beteiligungs- und Nutzungslogik
- Objektunterlagen, Grundbuchsauszug, Widmung, Energieausweis, Pläne und Inseratsdaten
- Kapitalbedarfsrechnung inklusive Nebenkosten, Pfandrecht, Reserven und Renovierungen
- Darlehensszenario mit Zins, Laufzeit, Tilgung und Stressvarianten
- Zahlungsfluss- und Bankkonto-Simulation mit jährlichem Kontostand
- Belegungsmodell auf Zimmernachtbasis
- Vermietungsannahmen und konservatives Szenario ohne Vermietungsertrag
- Rechtsformvergleich mit offenen Kostenannahmen
- Liste lokaler Prüfungen: Gemeinde, Freizeitwohnsitz, Grundverkehr, Tourismusverband, Meldepflichten

### Quelle
- Quelle: Projekt-Wiki Finanzierung, Betrieb, Nutzung und Berechnungslogik
- Herausgeber: Projektteam RenntnerHazienda
- Link: [05_finance.md](../wiki/05_finance.md)
- Link: [06_usage.md](../wiki/06_usage.md)
- Link: [07_operational.md](../wiki/07_operational.md)
- Link: [08_calculation_logic.md](../wiki/08_calculation_logic.md)
- Stand/Veröffentlichungsdatum: Projektstand 2026-05-15 bis 2026-06-05
- Abrufdatum: 2026-06-05
- Geltungsbereich: Österreich, Projektvorbereitung
- Stabilität: niedrig

## 9. Gewünschtes Ergebnis aus Beratungssicht

Nach dem Gespräch soll klar sein:

1. Welche Rechtsform und Kreditnehmerstruktur voraussichtlich weiterverfolgt werden sollte.
2. Welche Zahlungen gesellschaftsrechtlich als Kapital, Aufwand, Entgelt oder Reserve zu behandeln sind.
3. Wie Nutzungsbeiträge und Eigennutzung steuerlich sauber zu dokumentieren sind.
4. Ob und wie Vorsteuer, USt, Fremdvermietung und lokale Abgaben in das Modell aufgenommen werden müssen.
5. Welche Bankkennzahlen, Sicherheiten und Unterlagen vor einer konkreten Kreditanfrage erforderlich sind.
6. Welche Modellannahmen im `simTool` angepasst werden müssen.

### Quelle
- Quelle: Projektinterne Modellziele und offizielle Quellen in diesem Dokument
- Herausgeber: Projektteam RenntnerHazienda / genannte Behörden
- Link: [08_calculation_logic.md](../wiki/08_calculation_logic.md)
- Link: https://www.fma.gv.at/kim-v-ende-fma-erwartet-stabile-kreditvergabe/
- Link: https://www.bmf.gv.at/themen/steuern/immobilien-grundstuecke/vermietung-verpachtung/vermietung-und-verpachtung-in-der-umsatzsteuer.html
- Link: https://www.oesterreich.gv.at/de/themen/bauen_und_wohnen/wohnen/8/Seite.210150
- Stand/Veröffentlichungsdatum: Projektstand 2026-06-05; externe Quellen 2025/2026
- Abrufdatum: 2026-06-05
- Geltungsbereich: Österreich, Finanzierung/Steuer/Immobilienkauf
- Stabilität: niedrig bis mittel
