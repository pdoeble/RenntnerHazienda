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
- [ ] (2026-06-05 15:45) Erstplan `plans/2026-06-05-15-05_erster_plan.md` als Grundlage dokumentieren.
- [ ] (2026-06-05 15:45) `references/260605-deep-research-report.md` inventarisieren.
- [ ] (2026-06-05 15:45) `references/260605-deep-research-report_2.md` inventarisieren.
- [ ] (2026-06-05 15:45) Bericht 1, Bericht 2 und aktuellen App-Stand in einer Audit-Tabelle zusammenfuehren.
- [ ] (2026-06-05 15:45) Sichtbare englische Fachbegriffe in App und Wiki erfassen.
- [ ] (2026-06-05 15:45) Deutsches Begriffsregister und Hilfetextregister festlegen.
- [ ] (2026-06-05 15:45) Vier-Sichten-Modell in Datenmodell, Berechnung und UI einfuehren.
- [ ] (2026-06-05 15:45) Objektkennung, Fallkennung und Szenariokennung migrationssicher ergaenzen.
- [ ] (2026-06-05 15:45) Mittelherkunft und Mittelverwendung modellieren.
- [ ] (2026-06-05 15:45) Erwerbskostenmodell fuer Oesterreich erweitern.
- [ ] (2026-06-05 15:45) Zahlungsklassen und Buchungslogik ergaenzen.
- [ ] (2026-06-05 15:45) Unternehmensanteile von Nutzungsentgelt, Kostenumlage und Darlehen trennen.
- [ ] (2026-06-05 15:45) Beitraege und `Mein Anteil` fachlich umbauen.
- [ ] (2026-06-05 15:45) Belegung auf Zimmernaechte, Eigennutzung und Fremdvermietung umbauen.
- [ ] (2026-06-05 15:45) Eigennutzungswert mit Kostenuntergrenze, Marktwertverdraengung und Hybridregel ergaenzen.
- [ ] (2026-06-05 15:45) Bankkonto-Zahlungsfluss, Ergebnisrechnung und Vermoegensuebersicht trennen.
- [ ] (2026-06-05 15:45) Banksicht mit Beleihungsauslauf, Kapitaldienstdeckungsgrad und Stressfaellen ergaenzen.
- [ ] (2026-06-05 15:45) Umsatzsteuer-Matrix und Vorsteuer-Konsistenzpruefungen ergaenzen.
- [ ] (2026-06-05 15:45) Rechtsformvergleich neutral mit Pruefgattern ausbauen.
- [ ] (2026-06-05 15:45) Kennzahlenregister und rote Diagnosen ergaenzen.
- [ ] (2026-06-05 15:45) Klickbare Fragezeichen-Hilfen einbauen.
- [ ] (2026-06-05 15:45) Wiki vollstaendig aktualisieren.
- [ ] (2026-06-05 15:45) Beraterdokument aktualisieren.
- [ ] (2026-06-05 15:45) Tests ergaenzen und Vollpruefung ausfuehren.
- [ ] (2026-06-05 15:45) Aenderungen regelmaessig in sinnvollen Abschnitten committen.
- [ ] (2026-06-05 15:45) Kein Push ohne separate Beauftragung.
- [ ] (2026-06-05 15:45) Plan nach Abschluss nach `plans/Archive/2026-06-05-15-45_simtool-konsolidierte-finanzierungslogik.md` verschieben.

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
- Offen:
  - Umsetzung der App-, Test- und Wiki-Aenderungen.
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
- [ ] Audit-Datei anlegen.
- [ ] Beide Berichte abschnittsweise inventarisieren.
- [ ] App- und Wiki-Zielstellen je Erkenntnis dokumentieren.
- [ ] Quellenstatus je Erkenntnis markieren.

### Meilenstein 2 - Deutsche Fachsprache und Hilfen

- [ ] Sichtbare App-Begriffe inventarisieren.
- [ ] Englische Fachbegriffe ersetzen.
- [ ] Uneindeutige alte Begriffe ersetzen.
- [ ] `HelpPopover` erstellen.
- [ ] Hilfetextregister erstellen.
- [ ] Hilfen fuer Mittelherkunft, Zahlungsklassen, Nutzung, Bankkonto, Banksicht, Umsatzsteuer und Rechtsform schreiben.
- [ ] UI-Tests fuer Hilfe und deutsche Begriffe ergaenzen.

### Meilenstein 3 - Vier-Sichten-Modell und Kennungen

- [ ] Projektmodell additiv um Objektkennung, Fallkennung, Szenariokennung, Annahmenquelle und Waehrung ergaenzen.
- [ ] Alte Projekte ohne diese Felder migrieren.
- [ ] Ergebnisstruktur nach Objektsicht, Rechtstraegersicht, Mitgliedersicht und Banksicht gruppieren.
- [ ] UI mit Sichtbegriffen strukturieren.

### Meilenstein 4 - Erwerbskosten und Mittelverwendung

- [ ] Mittelverwendung fuer Kaufpreis, Grunderwerbsteuer, Grundbuch, Pfandrecht, Eingabegebuehr, Makler, Notar, Beglaubigung, technische Pruefung, Renovierung, Einrichtung, Finanzierungsgebuehren, Sicherheitspuffer, Anfangsliquiditaet, Anfangsruecklage und Gruendungskosten modellieren.
- [ ] Oesterreichische Standardannahmen editierbar setzen.
- [ ] Netto-, Umsatzsteuer- und Bruttowerte getrennt fuehren.
- [ ] Fehlende Kostenschaetzungen sichtbar markieren.

### Meilenstein 5 - Mittelherkunft und Darlehenshoehe

- [ ] Mittelherkunft fuer Start-EK, Kapitalruecklage, Bankdarlehen, Gesellschafterdarlehen, Verkaeuferfinanzierung und Foerderungen modellieren.
- [ ] Harte Gleichung `Gesamtmittelverwendung = Gesamtmittelherkunft + Finanzierungsluecke`.
- [ ] Bankdarlehen automatisch saldieren oder manuell fixieren.
- [ ] Bank-Zielquote nur als Diagnose verwenden.
- [ ] Diagramm und Tabelle `Mittelherkunft / Mittelverwendung` bauen.

### Meilenstein 6 - Zahlungsklassen und Buchungslogik

- [ ] Zahlungsklassen definieren.
- [ ] Rang, Rueckzahlbarkeit, Verzinsung, Sicherheit, Anteilsauswirkung, Nutzungswirkung und Umsatzsteuerbezug fuehren.
- [ ] Buchungsvorlagen ergaenzen.
- [ ] Diagnosen fuer fehlende oder widerspruechliche Klassen.

### Meilenstein 7 - Unternehmensanteile und Mitgliedersicht

- [ ] Unternehmensanteile nur aus echten Beteiligungsklassen berechnen.
- [ ] Kapitalruecklage, Gesellschafterdarlehen, Kostenumlage und Nutzungsentgelt trennen.
- [ ] Beteiligungstabelle anzeigen.
- [ ] `Mein Anteil` fachlich trennen.
- [ ] Phils Nutzungsbeispiel pruefen.

### Meilenstein 8 - Nutzung, Belegung und Eigennutzungswert

- [ ] Zimmernacht-Kapazitaet berechnen.
- [ ] Wartungssperren, Eigennutzung, Fremdvermietung und Leerstand trennen.
- [ ] Eigennutzungswert mit Marktwertverdraengung, Kostenuntergrenze und Hybridregel berechnen.
- [ ] Wochenend- und Saison-Druck zeigen.

### Meilenstein 9 - Bankkonto, Ergebnisrechnung und Vermoegensuebersicht

- [ ] `Cashflow` sichtbar zu `Bankkonto-Zahlungsfluss` umbenennen.
- [ ] Einzahlungen und Auszahlungen nach Zahlungsklassen stapeln.
- [ ] Kontostand, zweckgebundene Reserve und freie Liquiditaet tabellarisch zeigen.
- [ ] Ergebnisrechnung ergaenzen.
- [ ] Vermoegensuebersicht ergaenzen.
- [ ] Identitaeten testen.

### Meilenstein 10 - Operativer Zahlungsfluss und ausschuettbarer Ueberschuss

- [ ] Wasserfall in fester Reihenfolge berechnen.
- [ ] Ausschüttungssperre bei Mindestliquiditaet.
- [ ] Diagnosen fuer negativen Ueberschuss.

### Meilenstein 11 - Darlehen, Banksicht und Stressfaelle

- [ ] Darlehensprofil mit Restschuld, Zins, Tilgung und Kapitaldienstdeckungsgrad.
- [ ] Beleihungsauslauf, Kapitaldienstdeckungsgrad, Belastungsquote und Laufzeit pruefen.
- [ ] FMA-Leitplanken als Richtwerte anzeigen.
- [ ] Stressfaelle und Sensitivitaeten ergaenzen.

### Meilenstein 12 - Umsatzsteuer-Matrix und Vorsteuerlogik

- [ ] Umsatzsteuerarten und Leistungsarten modellieren.
- [ ] Vorsteuerlogik nach steuerfreier, steuerpflichtiger und gemischter Nutzung pruefen.
- [ ] Diagnosen fuer widerspruechliche Annahmen.

### Meilenstein 13 - Neutraler Rechtsformvergleich

- [ ] Miteigentum, Verein, GmbH, FlexCo, KG, GmbH & Co KG, Genossenschaft und Sonstige vergleichen.
- [ ] Pruefgatter fuer Verein, GmbH/FlexCo und Genossenschaft.
- [ ] Keine automatische Empfehlung.

### Meilenstein 14 - Kennzahlen und rote Diagnosen

- [ ] Kennzahlenregister ergaenzen.
- [ ] Harte Identitaetsdiagnosen ergaenzen.
- [ ] Rote Warnungen fuer Bank, Liquiditaet, Umsatzsteuer, Nutzung und Rechtsform.

### Meilenstein 15 - Navigation und Visualisierungen

- [ ] Projekt-Tab links erweitern.
- [ ] Topbar von GitHub-/Projektsteuerung befreien.
- [ ] Eingabe- und Auswertungstabs deutsch strukturieren.
- [ ] Wasserfall-, Belegungs-, Darlehens-, Sensitivitaets- und Mitglieder-Zahlungsreihen-Diagramme ergaenzen.

### Meilenstein 16 - Wiki und Beraterdokumentation

- [ ] Alle Wiki-Dateien aktualisieren.
- [ ] `08_calculation_logic.md` zur technischen Hauptreferenz machen.
- [ ] Beraterdokument aktualisieren.
- [ ] Quellenbloecke nach `AGENTS.md` sicherstellen.

### Meilenstein 17 - Tests, Begriffsscan und Vollpruefung

- [ ] Migrationstests.
- [ ] Berechnungstests.
- [ ] UI-Tests.
- [ ] Persistenztests.
- [ ] Begriffsscan.
- [ ] `npm run lint`.
- [ ] `npm run typecheck`.
- [ ] `npm test`.
- [ ] `npm run build`.

### Meilenstein 18 - Commit-Plan und Abschluss

- [ ] Regelmaessige Commits pro Subsystem.
- [ ] Vor jedem Commit `git status --short`.
- [ ] Keine fremden Nutzeränderungen unbeabsichtigt committen.
- [ ] Kein Push ohne separate Beauftragung.
- [ ] Plan nach Abschluss archivieren.

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
