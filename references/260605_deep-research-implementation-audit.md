# Deep-Research-Umsetzungs-Audit 2026-06-05

Dieses Audit verfolgt, welche Erkenntnisse aus den beiden Tiefenrechercheberichten in App, Wiki und Tests uebernommen werden. Es ist Arbeitsdokument und ersetzt keine Rechts-, Steuer- oder Bankberatung.

## Quellen

| Quelle | Datei | Status |
|---|---|---|
| Tiefenrecherche 1 | `references/260605-deep-research-report.md` | inventarisiert, Kernpunkte in App/Wiki umgesetzt; Detailquellen weiter zu pruefen |
| Tiefenrecherche 2 | `references/260605-deep-research-report_2.md` | inventarisiert, Kernpunkte in App/Wiki umgesetzt; Detailquellen weiter zu pruefen |
| Erstplan | `plans/2026-06-05-15-05_erster_plan.md` | als Grundlage uebernommen |
| Konsolidierter Plan | `plans/2026-06-05-15-45_simtool-konsolidierte-finanzierungslogik.md` | aktiv |

## Umsetzungsregister

| Nr. | Erkenntnis | Quelle | App-Ziel | Wiki-Ziel | Status | Pruefhinweis |
|---:|---|---|---|---|---|---|
| 1 | Sichtbare Fachsprache muss deutsch sein. | Nutzer / Erstplan | UI-Labels, Diagnosen, Hilfen | alle Wiki-Dateien | umgesetzt im ersten Block | Resttreffer nur interne Dateinamen |
| 2 | Zahlungen muessen nach rechtlicher und bilanzieller Wirkung getrennt werden. | Bericht 1 | Zahlungsklassen, Buchungslogik | `04_ownership.md`, `05_finance.md`, `08_calculation_logic.md` | umgesetzt | Zahlungsklassen im Datenmodell; Beispielbuchungen und Anteilsschalter fuer anteilswirksame Kapitalzufuehrung in der App |
| 3 | Mittelherkunft und Mittelverwendung muessen saldieren. | Bericht 1 und 2 | Finanzierungsberechnung | `05_finance.md`, `08_calculation_logic.md` | umgesetzt | harte Diagnose bei Luecke/Ueberschuss |
| 4 | Objektsicht, Rechtstraegersicht, Mitgliedersicht und Banksicht sind zu trennen. | Bericht 2 | Ergebnisstruktur, UI-Tabs | `01_overall.md`, `08_calculation_logic.md` | umgesetzt im Grundmodell | weitere UI-Feingliederung moeglich |
| 5 | Netto-, Umsatzsteuer- und Bruttowerte duerfen nicht vermischt werden. | Bericht 2 | Umsatzsteuer-Matrix, Erwerbskosten | `03_tax.md`, `08_calculation_logic.md` | umgesetzt | Mittelverwendung fuehrt Netto/USt/Brutto; USt-Matrix markiert offene Steuerfragen |
| 6 | Eigennutzung ist wirtschaftlich zu bewerten. | Bericht 2 | Belegung/Nutzung | `06_usage.md`, `08_calculation_logic.md` | umgesetzt | Hybridregel mit Marktwertverdraengung und Kostenuntergrenze |
| 7 | Tilgung ist Bankkontoabfluss und Vermoegens-/Schuldenwirkung, nicht voller Ergebnisaufwand. | Bericht 2 | Bankkonto, Ergebnisrechnung, Vermoegensuebersicht | `05_finance.md`, `08_calculation_logic.md` | umgesetzt im Grundmodell | Identitaet Vermoegen = Verbindlichkeiten + Eigenkapital weiter haerten |
| 8 | Banken sollten Bankpruefungs-Zahlungsfluss, Beleihungsauslauf und Kapitaldienstdeckungsgrad sehen. | Bericht 2 | Banksicht | `05_finance.md` | umgesetzt | persoenliche Belastungsquote bleibt ohne eingetragene Einkommen offen; Stressfaelle sind rechnerische Hinweise |
| 9 | Verein, GmbH/FlexCo und Genossenschaft brauchen unterschiedliche Pruefgatter. | Bericht 1 und 2 | Rechtsformvergleich | `04_ownership.md` | umgesetzt | keine automatische Empfehlung; App zeigt Pruefgatter und Vergleichsdimensionen |
| 10 | Kontext-Hilfe soll per Fragezeichen auf Nachfrage erscheinen. | Nutzer / Erstplan | Hilfesystem | `01_overall.md`, `08_calculation_logic.md` | umgesetzt im Grundmodell | Hilfetextabdeckung weiter ausbauen |
| 11 | Steuerbare Berechnungsregeln sollen gebuendelt und erklaert werden. | Nutzer / Update 2026-06-05 | Tab `Regeln` | `08_calculation_logic.md` | umgesetzt | Punkt-, Anteil-, Belegungs- und Wertregeln liegen im linken Regeln-Tab |
| 12 | Rechtsformkosten brauchen Quellenstatus und duerfen nicht als Beratung erscheinen. | Nutzer / Update 2026-06-05 | Kostenprofile mit Uebernahme-Button | `04_ownership.md` | umgesetzt | Kosten sind Planungsannahmen; aktive Kostenfelder werden nur per Button gesetzt |
| 13 | Persoenliche Tragfaehigkeit soll mit Monatsnettoeinkommen modelliert werden. | Nutzer / Update 2026-06-05 | Default `2.900 EUR` je Eigner | `08_calculation_logic.md` | umgesetzt | fehlende/nicht-positive alte Werte werden migriert, positive manuelle Werte bleiben |
| 14 | `Mein Anteil` soll Vermoegenswert und Rendite nach 25 Jahren zeigen. | Nutzer / Update 2026-06-05 | 25-Jahres-Auswertung | `08_calculation_logic.md` | umgesetzt | Kostenumlage und Nutzungsentgelt bleiben getrennt von investiertem Kapital |
| 15 | Diagramme sollen Einmal- und laufende Werte lesbar trennen. | Nutzer / Update 2026-06-05 | getrennte Achsen und Kreisdiagramme | `08_calculation_logic.md` | umgesetzt | Achsentrennung aendert keine Berechnung |

## Offene Quellenpruefung

- [x] oesterreich.gv.at Kaufnebenkosten.
- [x] FMA Leitplanken Wohnimmobilienkredit nach KIM-V.
- [x] BMF Umsatzsteuer bei Vermietung und Verpachtung.
- [x] BMI Vereinswesen.
- [ ] RIS / WKO GmbH, FlexCo, GmbH & Co KG.
- [ ] RIS Genossenschaftsgesetz.

## Umgesetzte Commit-Bloecke

| Commit | Inhalt | Pruefung |
|---|---|---|
| `2b311ed` | Konsolidierter Ausfuehrungsplan und Auditstruktur | Dokumentation |
| `f425ed2` | Deutsche App-Begriffe, Mittelherkunft/-verwendung, Bankkonto-Zahlungsfluss, Banksicht, Eigennutzungswert, Hilfepopover und Tests | `npm run lint`, `npm run typecheck`, `npm test` erfolgreich |
| `f208636` | Buchungslogik, Umsatzsteuer-Matrix und Rechtsform-Pruefgatter in App und Tests | `npm run lint`, `npm run typecheck`, `npm test` erfolgreich |
| `6aab03c` | Persoenliche Belastungsquote, Banksicht-Stressfaelle und Wiki-Ergaenzung | `npm run lint`, `npm run typecheck`, `npm test` erfolgreich |
| `7f4309e` | Anteilsschalter fuer Tilgung und Kapitalruecklage mit getrenntem nicht verwaessernden Kapitalwert | `npm run lint`, `npm run typecheck`, `npm test` erfolgreich |
| `dc597ab` | Kennzahlenregister, harte Identitaetsdiagnosen und Wiki-Ergaenzung | `npm run lint`, `npm run typecheck`, `npm test` erfolgreich |
| `07278a2` | ExecPlan fuer Regeln, Hilfen, Rendite und Diagrammupdate | Dokumentation |
| `f3f0971` | Regeln-Tab, 6-EUR-Zimmernachtbasis und 2.900-EUR-Nettoeinkommen | `npm run typecheck` erfolgreich |
| `0f27866` | Kontext-Hilfen an Eingabefeldern | `npm run typecheck` erfolgreich |
| `09e3b95` | 25-Jahres-Wert und Rendite in `Mein Anteil` | `npm run typecheck` erfolgreich |
| `7585559` | Rechtsform-Kostenprofile mit Kurzbeschreibung und Quellenstatus | `npm run typecheck` erfolgreich |
| `2cb4500` | Diagrammachsen und Kreisdiagramme fuer Anteile | `npm run typecheck` erfolgreich |
| `b805a7a` | Tests fuer Regeln, Defaults, Rendite, Rechtsformprofile und stabile Vitest-Ausfuehrung | `npm test` erfolgreich |
| Abschluss | Build und Wiki-Sync, Planarchivierung | `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` erfolgreich |

## Arbeitsregel

- Jede rechtliche, steuerliche oder finanzielle Wiki-Aussage braucht Quellenblock mit Herausgeber, Stand oder Veroeffentlichungsdatum, Abrufdatum, Geltungsbereich und Stabilitaet.
- Unklare Einzelfallfragen werden als `offen / pruefen` markiert.
- Objektbezogene Demoannahmen bleiben aus den Hauptkapiteln heraus.
