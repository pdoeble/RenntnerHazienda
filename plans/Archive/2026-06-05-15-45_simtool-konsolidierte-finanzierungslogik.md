# simTool: Konsolidierte Finanzierungs-, Buchungs-, Nutzungs-, Bank- und Wiki-Logik

Dieser Ausfuehrungsplan ist ein lebendes Dokument. `Fortschritt`, `Ueberraschungen und Erkenntnisse`, `Entscheidungsprotokoll` und `Ergebnis / Rueckblick` sind waehrend der Umsetzung aktuell zu halten.

## Zweck / Gesamtbild

- Ziel nach der Aenderung:
  - `simTool` erklaert fachfremden Interessenten, Bankberatung, Steuerberatung und Rechtsberatung nachvollziehbar, wie gemeinschaftlicher Erwerb, Finanzierung, Rechtsform, Nutzung, Vermietung, laufende Zahlungen, Ruecklagen, Darlehen und Exit wirtschaftlich zusammenhaengen.
  - Die sichtbare App-Sprache ist Deutsch.
  - Die App trennt `Objektsicht`, `Rechtstraegersicht`, `Mitgliedersicht` und `Banksicht`.
  - Jede Zahlung wird nach Zahlungsklasse, Rang, Rueckzahlbarkeit, Verzinsung, Sicherheit, Umsatzsteuerbezug und Wirkung auf Unternehmensanteile klassifiziert.
  - Mittelherkunft und Mittelverwendung muessen saldieren; sonst zeigt die App eine harte Diagnose.
  - Eigennutzung wird nicht als kostenlos behandelt, sondern als wirtschaftlicher Nutzungswert dargestellt.
  - Bankkonto-Zahlungsfluss, Ergebnisrechnung und Vermoegensuebersicht werden getrennt.
  - Die App bleibt neutral und empfiehlt keine Rechtsform automatisch.
  - Erkenntnisse aus `references/260605-deep-research-report.md` und `references/260605-deep-research-report_2.md` werden in App, Wiki und Audit uebernommen.

- Sichtbarer Erfolg:
  - Kein sichtbarer Tab `Cashflow`; Zielbegriff ist `Bankkonto-Zahlungsfluss`.
  - Keine sichtbaren englischen Fachbegriffe wie `Equity`, `Debt`, `Funding`, `Sources`, `Uses`, `KPI`, `DSCR`, `LTV`, `ADR`, `Cap Table`, `Tax Schedule`, `Dashboard`, `Owner`, `Member`, `VAT`, `Opex`.
  - `Mittelherkunft / Mittelverwendung` zeigt Erwerbskosten, Gruendung, Ausbau, Reserve, Bankdarlehen, Eigenkapital, Gesellschafterdarlehen, Foerderungen und Finanzierungsluecke.
  - `Mein Anteil` trennt Unternehmensanteil, Rueckzahlungsansprueche, Kostenumlagen, Nutzungsentgelte, Liquiditaetsreserve, Zimmernaechte und moegliche Ausschuettungen.
  - `Belegung / Nutzung` rechnet in Zimmernaechten und trennt Eigennutzung, Fremdvermietung, Wartungssperren und Leerstand.
  - `Banksicht` zeigt Beleihungsauslauf, Kapitaldienstdeckungsgrad, persoenliche Belastungsquote, Laufzeit und FMA-Leitplanken als pruefpflichtige Richtwerte.
  - Jede zentrale Kennzahl hat ein klickbares Fragezeichen mit kurzer Erklaerung und Wiki-Verweis.
  - Wiki-Dateien dokumentieren Berechnungslogik, Begriffe, Rechtsformrisiken, Umsatzsteuerlogik, Nutzung und Bankpruefung quellenbasiert.

## Vertragsmodus

- `mixed`
- Begruendung:
  - UI, Berechnung, Projekt-JSON, Migrationen, Tests, Wiki und Referenzdokumentation aendern sich.
  - JSON-Import/-Export und GitHub-Speicherung bleiben erhalten.
  - Neue Felder werden additiv und migrationssicher ergaenzt.
  - Alte Projekte muessen weiter laden.

## Fortschritt

- [x] (2026-06-05 15:45) Konsolidierten Plan als Datei angelegt.
- [x] (2026-06-05 16:35) Erstplan `plans/2026-06-05-15-05_erster_plan.md` als Grundlage dokumentiert.
- [x] (2026-06-05 16:35) `references/260605-deep-research-report.md` inventarisiert.
- [x] (2026-06-05 16:35) `references/260605-deep-research-report_2.md` inventarisiert.
- [x] (2026-06-05 16:35) Bericht 1, Bericht 2 und aktuellen App-Stand in einer Audit-Tabelle zusammengefuehrt.
- [x] (2026-06-05 16:35) Sichtbare englische Fachbegriffe in App und Wiki erfasst und produktive Treffer bereinigt.
- [x] (2026-06-05 16:35) Deutsches Begriffsregister und Hilfetextregister im Grundmodell festgelegt.
- [x] (2026-06-05 16:35) Vier-Sichten-Modell in Datenmodell, Berechnung und UI eingefuehrt.
- [x] (2026-06-05 16:35) Objektkennung, Fallkennung und Szenariokennung migrationssicher ergaenzt.
- [x] (2026-06-05 16:35) Mittelherkunft und Mittelverwendung modelliert.
- [x] (2026-06-05 16:35) Erwerbskostenmodell fuer Oesterreich in die Mittelverwendung ueberfuehrt.
- [x] (2026-06-05 17:05) Zahlungsklassen und Buchungslogik ergaenzt.
- [x] (2026-06-05 17:35) Unternehmensanteile von Nutzungsentgelt, Kostenumlage und Darlehen getrennt; Anteilsschalter fuer Tilgung und Kapitalruecklage ergaenzt.
- [x] (2026-06-05 17:35) Beitraege und `Mein Anteil` fachlich um anteilswirksamen und nicht verwaessernden Kapitalwert ergaenzt.
- [x] (2026-06-05 16:35) Belegung auf Zimmernaechte, Eigennutzung und Fremdvermietung im Grundmodell umgebaut.
- [x] (2026-06-05 16:35) Eigennutzungswert mit Kostenuntergrenze, Marktwertverdraengung und Hybridregel ergaenzt.
- [x] (2026-06-05 16:35) Bankkonto-Zahlungsfluss, Ergebnisrechnung und Vermoegensuebersicht getrennt.
- [x] (2026-06-05 17:20) Banksicht mit Beleihungsauslauf, Kapitaldienstdeckungsgrad, persoenlicher Belastungsquote und Stressfaellen ergaenzt.
- [x] (2026-06-05 17:05) Umsatzsteuer-Matrix und Vorsteuer-Konsistenzpruefungen ergaenzt.
- [x] (2026-06-05 17:05) Rechtsformvergleich neutral mit Pruefgattern ausgebaut.
- [x] (2026-06-05 18:25) Kennzahlenregister, Sensitivitaeten und rote Identitaetsdiagnosen ergaenzt.
- [x] (2026-06-05 16:35) Klickbare Fragezeichen-Hilfen im Grundmodell eingebaut.
- [x] (2026-06-05 16:35) Wiki mit den neuen Kernlogiken aktualisiert; einzelne Rechtsform-/USt-Detailpruefungen bleiben offen.
- [x] (2026-06-05 16:35) Beraterdokument begrifflich aktualisiert.
- [x] (2026-06-05 16:35) Tests ergaenzt; `lint`, `typecheck` und `test` erfolgreich.
- [x] (2026-06-05 16:35) Aenderungen in ersten sinnvollen Abschnitten committed.
- [x] (2026-06-05 18:30) Kein Push ohne separate Beauftragung.
- [x] (2026-06-05 18:30) `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` erfolgreich ausgefuehrt.
- [x] (2026-06-05 18:30) Plan nach Abschluss nach `plans/Archive/2026-06-05-15-45_simtool-konsolidierte-finanzierungslogik.md` verschieben.

## Ueberraschungen und Erkenntnisse

- Beobachtung: Der Erstplan deckt Mittelherkunft, Zahlungsklassen, Buchungslogik, Rechtsform, Umsatzsteuer und Hilfen bereits ab, trennt aber die Rechensichten noch nicht stark genug.
  - Beleg: `plans/2026-06-05-15-05_erster_plan.md`.
- Beobachtung: Der zweite Bericht verlangt vier getrennte Sichten: Objektsicht, Rechtstraegersicht, Mitgliedersicht und Banksicht.
  - Beleg: `references/260605-deep-research-report_2.md`, Abschnitt `Recommended financial model architecture`.
- Beobachtung: Mitgliederzahlungen duerfen nicht als Ertrag behandelt werden, wenn sie Finanzierung, Darlehen, Kapitalruecklage oder Kostenumlage sind.
  - Beleg: `references/260605-deep-research-report_2.md`, Abschnitt zur Schichtentrennung.
- Beobachtung: Eigennutzung ist nicht kostenlos. Sie ist Konsum oder verdraengter Fremdertrag und braucht eine wirtschaftliche Bewertungslogik.
  - Beleg: `references/260605-deep-research-report_2.md`, Abschnitt `Operations and occupancy logic`.
- Beobachtung: Tilgung ist Bankkontoabfluss und reduziert Verbindlichkeiten, aber nicht vollstaendig periodischer Aufwand.
  - Beleg: `references/260605-deep-research-report_2.md`, Abschnitt zu Darlehen und Rechnungslogik.
- Beobachtung: Netto-, Umsatzsteuer- und Bruttowerte duerfen nicht in einem Feld vermischt werden.
  - Beleg: `references/260605-deep-research-report_2.md`, Abschnitt zur Umsatzsteuer- und Namenslogik.
- Beobachtung: `financing.data.equitySharePct` wird aktuell validiert, steuert aber die Darlehenshoehe nicht.
  - Beleg: `simTool/src/modules/financing/schema.ts`, `simTool/src/modules/financing/validate.ts`, `simTool/src/calculations/financialInputs.ts`.

## Entscheidungsprotokoll

- Entscheidung: Die sichtbare App-Sprache ist Deutsch.
  - Begruendung: Nutzeranforderung.
  - Datum / Autor: 2026-06-05 / Nutzer.
- Entscheidung: Die App bleibt ein neutraler Vergleich, keine automatische Rechtsformempfehlung.
  - Begruendung: Nutzerentscheidung `Neutraler Vergleich`.
  - Datum / Autor: 2026-06-05 / Nutzer.
- Entscheidung: Beitragslogik wird als Zahlungsklassen- und Buchungsmodell umgesetzt, nicht nur als Warnlogik.
  - Begruendung: Nutzerentscheidung `Buchungsmodell`.
  - Datum / Autor: 2026-06-05 / Nutzer.
- Entscheidung: Kontext-Hilfe erscheint als klickbares Fragezeichen im Kreis.
  - Begruendung: Nutzerentscheidung `Klick-Popover`.
  - Datum / Autor: 2026-06-05 / Nutzer.
- Entscheidung: Der Erstplan bleibt inhaltliche Grundlage und wird durch Bericht 2 erweitert.
  - Begruendung: Nutzerhinweis, dass urspruengliche Inhalte nicht zu kurz kommen duerfen.
  - Datum / Autor: 2026-06-05 / Nutzer.
- Entscheidung: Erkenntnisse werden im Wiki dokumentiert und Aenderungen regelmaessig committed.
  - Begruendung: Nutzeranforderung und `AGENTS.md`.
  - Datum / Autor: 2026-06-05 / Nutzer + Projektregel.

## Ergebnis / Rueckblick

- Erreicht:
  - Plan-Datei angelegt.
- App-Grundmodell fuer deutsche Begriffe, Mittelherkunft/-verwendung, Bankkonto-Zahlungsfluss, Banksicht, Eigennutzungswert und Hilfepopover umgesetzt.
- Wiki und Beraterdokument auf diese Kernlogiken aktualisiert.
- `npm run lint`, `npm run typecheck` und `npm test` erfolgreich.
- Buchungslogik, Umsatzsteuer-Matrix, Rechtsform-Pruefgatter, Banksicht-Stressfaelle, persoenliche Belastungsquote, Anteilsschalter und Kennzahlenregister umgesetzt.
- `npm run lint`, `npm run typecheck`, `npm test` und `npm run build` erfolgreich.
- Offen:
  - Kein fachlicher Rest aus diesem Plan; Push bleibt ohne separate Beauftragung aus.
- Beim naechsten Mal verbessern:
  - Nach jedem Commit dokumentieren, welche App-, Test- und Wiki-Bereiche geaendert wurden.

## Begriffsmodell

- `Objektsicht`: Betrachtet Haus, Kaufpreis, Nebenkosten, Zustand, Flaeche, Zimmer, Nutzung, Fremdvermietung, Betriebskosten, Objektwert und Objekt-Risiken.
- `Rechtstraegersicht`: Betrachtet Organisation, Mittelherkunft, Mittelverwendung, Darlehen, Bankkonto, Ergebnisrechnung, Vermoegensuebersicht, Ruecklagen, Steuern, Ausschuettungen und Verwaltung.
- `Mitgliedersicht`: Betrachtet Start-EK, Kapitalruecklage, Darlehensanspruch, Kostenumlage, Nutzungsentgelt, Unternehmensanteil, Zimmernaechte, Ausschuettung und Exit-Anteil.
- `Banksicht`: Betrachtet Kreditfaehigkeit, Bankpruefungs-Zahlungsfluss, Kapitaldienst, Beleihungsauslauf, Kapitaldienstdeckungsgrad, persoenliche Belastungsquote, Laufzeit und Stressfaelle.
- `Objektkennung`: Kennung des konkreten Hauses oder Kandidatenobjekts.
- `Fallkennung`: Kennung einer rechtlich-finanziellen Struktur fuer ein Objekt.
- `Szenariokennung`: Kennung eines Annahmensatzes.
- `Mittelverwendung`: Alles, wofuer Geld benoetigt wird.
- `Mittelherkunft`: Alles, woher Geld kommt.
- `Zahlungsklasse`: Fachliche Wirkung einer Zahlung.
- `Zimmernacht`: Ein Schlafzimmer oder buchbares Zimmer fuer eine Nacht.
- `Eigennutzungswert`: Wirtschaftlicher Wert einer von Beteiligten genutzten Zimmernacht.
- `Bankkonto-Zahlungsfluss`: Einzahlungen und Auszahlungen auf dem Projektkonto, nicht steuerlicher Gewinn.
- `Ergebnisrechnung`: Periodengerechte Sicht auf Erloese, Aufwand, Abschreibung und Zinsaufwand.
- `Vermoegensuebersicht`: Sicht auf Vermoegen, Verbindlichkeiten und Eigenkapital.
- `Bankpruefungs-Zahlungsfluss`: Zahlungsfluss vor Kapitaldienst, der als Grundlage fuer die Banksicht dient.

## Sichtbare Ersatzbegriffe

- `Cashflow` -> `Bankkonto-Zahlungsfluss` oder `Zahlungsfluss`
- `Sources & Uses` -> `Mittelherkunft / Mittelverwendung`
- `Equity` -> `Eigenkapital` oder `Unternehmensanteil`
- `Debt` -> `Fremdkapital` oder `Darlehen`
- `Funding` -> `Finanzierung` oder `Mittelherkunft`
- `Cap Table` -> `Beteiligungstabelle`
- `Tax Schedule` -> `Umsatzsteuer-Matrix` oder `steuerliche Annahmen`
- `DSCR` -> `Kapitaldienstdeckungsgrad`
- `LTV` -> `Beleihungsauslauf`
- `ADR` -> `Durchschnittspreis je belegter Fremdnacht`
- `NOI` -> `Betriebsergebnis vor Ruecklagen`
- `KPI` -> `Kennzahl`
- `Dashboard` -> `Uebersicht`
- `Owner` -> `Eigner` oder `Beteiligter`
- `Member` -> `Mitglied` oder `Beteiligter`
- `Case` -> `Fall`
- `Scenario` -> `Szenario`
- `VAT` -> `Umsatzsteuer`
- `Opex` -> `Betriebskosten` oder `laufende Kosten`

## Umfang

### Enthalten

- Deutsche sichtbare Fachsprache in App, Wiki, Diagrammen, Diagnosen, Exportanzeigen und Hilfetexten.
- Vier-Sichten-Modell.
- Objektkennung, Fallkennung, Szenariokennung.
- Mittelherkunft-/Mittelverwendungsmodell.
- Oesterreichisches Erwerbskostenmodell.
- Zahlungsklassenmodell.
- Buchungslogik mit Beispielbuchungen.
- Unternehmensanteile nur aus echten Beteiligungsmechaniken.
- Getrennte Mitgliedersicht.
- Zimmernachtmodell.
- Eigennutzungswert.
- Bankkonto-Zahlungsfluss.
- Ergebnisrechnung.
- Vermoegensuebersicht.
- Banksicht mit Kennzahlen und Stressfaellen.
- Umsatzsteuer-Matrix.
- Neutraler Rechtsformvergleich mit Pruefgattern.
- Kennzahlenregister und rote Diagnosen.
- Klickbare Fragezeichen-Hilfen.
- Wiki-Update mit Quellenbloecken.
- Auditdokumentation.
- Tests, Baupruefung und Einzelcommits.

### Nicht enthalten

- Verbindliche Rechts-, Steuer- oder Bankberatung.
- Automatische Rechtsformempfehlung.
- Neuer Server, neues Backend oder OAuth.
- Vollstaendiger produktiver Kontenplan.
- Automatische Steueroptimierung.
- Push ohne separate Beauftragung.

## Arbeitsplan

### Meilenstein 1 - Konsolidierten Plan und Auditstruktur

- [x] Plan-Datei anlegen.
- [x] Audit-Datei anlegen.
- [x] Beide Berichte abschnittsweise inventarisieren.
- [x] App- und Wiki-Zielstellen je Erkenntnis dokumentieren.
- [x] Quellenstatus je Erkenntnis markieren.

### Meilenstein 2 - Deutsche Fachsprache und Hilfen

- [x] Sichtbare App-Begriffe inventarisieren.
- [x] Englische Fachbegriffe ersetzen.
- [x] Uneindeutige alte Begriffe ersetzen.
- [x] `HelpPopover` erstellen.
- [x] Hilfetextregister erstellen.
- [x] Hilfen fuer Mittelherkunft, Zahlungsklassen, Nutzung, Bankkonto, Banksicht, Umsatzsteuer und Rechtsform schreiben.
- [x] UI-Tests fuer Hilfe und deutsche Begriffe ergaenzen.

### Meilenstein 3 - Vier-Sichten-Modell und Kennungen

- [x] Projektmodell additiv um Objektkennung, Fallkennung, Szenariokennung, Annahmenquelle und Waehrung ergaenzen.
- [x] Alte Projekte ohne diese Felder migrieren.
- [x] Ergebnisstruktur nach Objektsicht, Rechtstraegersicht, Mitgliedersicht und Banksicht gruppieren.
- [x] UI mit Sichtbegriffen strukturieren.

### Meilenstein 4 - Erwerbskosten und Mittelverwendung

- [x] Mittelverwendung fuer Kaufpreis, Grunderwerbsteuer, Grundbuch, Pfandrecht, Eingabegebuehr, Makler, Notar, Beglaubigung, technische Pruefung, Renovierung, Einrichtung, Finanzierungsgebuehren, Sicherheitspuffer, Anfangsliquiditaet, Anfangsruecklage und Gruendungskosten modellieren.
- [x] Oesterreichische Standardannahmen editierbar setzen.
- [x] Netto-, Umsatzsteuer- und Bruttowerte getrennt fuehren.
- [x] Fehlende Kostenschaetzungen sichtbar markieren.

### Meilenstein 5 - Mittelherkunft und Darlehenshoehe

- [x] Mittelherkunft fuer Start-EK, Kapitalruecklage, Bankdarlehen, Gesellschafterdarlehen, Verkaeuferfinanzierung und Foerderungen modellieren.
- [x] Harte Gleichung `Gesamtmittelverwendung = Gesamtmittelherkunft + Finanzierungsluecke`.
- [x] Bankdarlehen automatisch saldieren oder manuell fixieren.
- [x] Bank-Zielquote nur als Diagnose verwenden.
- [x] Diagramm und Tabelle `Mittelherkunft / Mittelverwendung` bauen.

### Meilenstein 6 - Zahlungsklassen und Buchungslogik

- [x] Zahlungsklassen definieren.
- [x] Rang, Rueckzahlbarkeit, Verzinsung, Sicherheit, Anteilsauswirkung, Nutzungswirkung und Umsatzsteuerbezug fuehren.
- [x] Buchungsvorlagen ergaenzen.
- [x] Diagnosen fuer fehlende oder widerspruechliche Klassen.

### Meilenstein 7 - Unternehmensanteile und Mitgliedersicht

- [x] Unternehmensanteile nur aus echten Beteiligungsklassen berechnen.
- [x] Kapitalruecklage, Gesellschafterdarlehen, Kostenumlage und Nutzungsentgelt trennen.
- [x] Beteiligungstabelle anzeigen.
- [x] `Mein Anteil` fachlich trennen.
- [x] Phils Nutzungsbeispiel pruefen.

### Meilenstein 8 - Nutzung, Belegung und Eigennutzungswert

- [x] Zimmernacht-Kapazitaet berechnen.
- [x] Wartungssperren, Eigennutzung, Fremdvermietung und Leerstand trennen.
- [x] Eigennutzungswert mit Marktwertverdraengung, Kostenuntergrenze und Hybridregel berechnen.
- [x] Wochenend- und Saison-Druck zeigen.

### Meilenstein 9 - Bankkonto, Ergebnisrechnung und Vermoegensuebersicht

- [x] `Cashflow` sichtbar zu `Bankkonto-Zahlungsfluss` umbenennen.
- [x] Einzahlungen und Auszahlungen nach Zahlungsklassen stapeln.
- [x] Kontostand, zweckgebundene Reserve und freie Liquiditaet tabellarisch zeigen.
- [x] Ergebnisrechnung ergaenzen.
- [x] Vermoegensuebersicht ergaenzen.
- [x] Identitaeten testen.

### Meilenstein 10 - Operativer Zahlungsfluss und ausschuettbarer Ueberschuss

- [x] Wasserfall in fester Reihenfolge berechnen.
- [x] Ausschüttungssperre bei Mindestliquiditaet.
- [x] Diagnosen fuer negativen Ueberschuss.

### Meilenstein 11 - Darlehen, Banksicht und Stressfaelle

- [x] Darlehensprofil mit Restschuld, Zins, Tilgung und Kapitaldienstdeckungsgrad.
- [x] Beleihungsauslauf, Kapitaldienstdeckungsgrad, Belastungsquote und Laufzeit pruefen.
- [x] FMA-Leitplanken als Richtwerte anzeigen.
- [x] Stressfaelle und Sensitivitaeten ergaenzen.

### Meilenstein 12 - Umsatzsteuer-Matrix und Vorsteuerlogik

- [x] Umsatzsteuerarten und Leistungsarten modellieren.
- [x] Vorsteuerlogik nach steuerfreier, steuerpflichtiger und gemischter Nutzung pruefen.
- [x] Diagnosen fuer widerspruechliche Annahmen.

### Meilenstein 13 - Neutraler Rechtsformvergleich

- [x] Miteigentum, Verein, GmbH, FlexCo, KG, GmbH & Co KG, Genossenschaft und Sonstige vergleichen.
- [x] Pruefgatter fuer Verein, GmbH/FlexCo und Genossenschaft.
- [x] Keine automatische Empfehlung.

### Meilenstein 14 - Kennzahlen und rote Diagnosen

- [x] Kennzahlenregister ergaenzen.
- [x] Harte Identitaetsdiagnosen ergaenzen.
- [x] Rote Warnungen fuer Bank, Liquiditaet, Umsatzsteuer, Nutzung und Rechtsform.

### Meilenstein 15 - Navigation und Visualisierungen

- [x] Projekt-Tab links erweitern.
- [x] Topbar von GitHub-/Projektsteuerung befreien.
- [x] Eingabe- und Auswertungstabs deutsch strukturieren.
- [x] Wasserfall-, Belegungs-, Darlehens-, Sensitivitaets- und Mitglieder-Zahlungsreihen-Diagramme ergaenzen.

### Meilenstein 16 - Wiki und Beraterdokumentation

- [x] Alle Wiki-Dateien aktualisieren.
- [x] `08_calculation_logic.md` zur technischen Hauptreferenz machen.
- [x] Beraterdokument aktualisieren.
- [x] Quellenbloecke nach `AGENTS.md` sicherstellen.

### Meilenstein 17 - Tests, Begriffsscan und Vollpruefung

- [x] Migrationstests.
- [x] Berechnungstests.
- [x] UI-Tests.
- [x] Persistenztests.
- [x] Begriffsscan.
- [x] `npm run lint`.
- [x] `npm run typecheck`.
- [x] `npm test`.
- [x] `npm run build`.

### Meilenstein 18 - Commit-Plan und Abschluss

- [x] Regelmaessige Commits pro Subsystem.
- [x] Vor jedem Commit `git status --short`.
- [x] Keine fremden Nutzeränderungen unbeabsichtigt committen.
- [x] Kein Push ohne separate Beauftragung.
- [x] Plan nach Abschluss archivieren.

## Abnahmekriterien

- Keine produktiven sichtbaren englischen Fachbegriffe.
- Vier Sichten sind in Berechnung und UI unterscheidbar.
- Mittelherkunft und Mittelverwendung saldieren oder zeigen eine klare Luecke.
- Bankdarlehen ist nachvollziehbar abgeleitet.
- Nur echte Beteiligungsklassen veraendern Unternehmensanteile.
- `Mein Anteil` trennt Unternehmensanteil, Darlehensanspruch, Kostenumlage, Nutzungsentgelt und Zimmernaechte.
- Nutzung rechnet in Zimmernaechten.
- Eigennutzung wird wirtschaftlich bewertet.
- Schlusskonto = Anfangskonto + Einzahlungen - Auszahlungen.
- Vermoegen = Verbindlichkeiten + Eigenkapital.
- Kapitaldienstdeckungsgrad nutzt Bankpruefungs-Zahlungsfluss.
- Umsatzsteuerlogik erzeugt Diagnosen bei Widerspruechen.
- Rechtsformvergleich bleibt neutral.
- Fragezeichen-Hilfen funktionieren.
- Wiki ist aktuell und quellenbasiert.
- `lint`, `typecheck`, `test`, `build` laufen erfolgreich.

## Risiken / Ruecknahme / Wiederherstellung

- Risiken:
  - Neue Logik veraendert Zahlen sichtbar.
  - Migrationen koennen alte Projekte brechen.
  - Rechts- und Steuertexte koennen zu verbindlich wirken.
  - Rechtsformvergleich kann als Empfehlung missverstanden werden.
- Ruecknahme:
  - Einzelcommits pro Subsystem.
  - Additive Migrationen.
  - Alte technische Felder zunaechst behalten.
- Wiederherstellung:
  - Kein `git reset --hard`.
  - Keine Nutzeränderungen revertieren.
  - Bei Testbruch betroffenen Commit isolieren.
  - Bei fachlicher Unsicherheit Diagnose anzeigen statt stillschweigend rechnen.

## Referenzen

- `plans/2026-06-05-15-05_erster_plan.md`
- `references/260605-deep-research-report.md`
- `references/260605-deep-research-report_2.md`
- `AGENTS.md`
- `PLANS.md`
- `wiki/01_overall.md`
- `wiki/02_legal.md`
- `wiki/03_tax.md`
- `wiki/04_ownership.md`
- `wiki/05_finance.md`
- `wiki/06_usage.md`
- `wiki/07_operational.md`
- `wiki/08_calculation_logic.md`
- `simTool/src/calculations/financialInputs.ts`
- `simTool/src/calculations/calculateDebt.ts`
- `simTool/src/calculations/calculateContributions.ts`
- `simTool/src/calculations/calculateCapitalShares.ts`
- `simTool/src/calculations/calculateCashflow.ts`
- `simTool/src/calculations/calculateOccupancy.ts`
- `simTool/src/app/layout/InputTabs.tsx`
- `simTool/src/app/layout/VisualizationTabs.tsx`
- `simTool/src/state/uiStore.ts`
