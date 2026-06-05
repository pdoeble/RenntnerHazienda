# Deep-Research-Umsetzungs-Audit 2026-06-05

Dieses Audit verfolgt, welche Erkenntnisse aus den beiden Tiefenrechercheberichten in App, Wiki und Tests uebernommen werden. Es ist Arbeitsdokument und ersetzt keine Rechts-, Steuer- oder Bankberatung.

## Quellen

| Quelle | Datei | Status |
|---|---|---|
| Tiefenrecherche 1 | `references/260605-deep-research-report.md` | inventarisiert, Kernpunkte in App/Wiki teilweise umgesetzt |
| Tiefenrecherche 2 | `references/260605-deep-research-report_2.md` | inventarisiert, Kernpunkte in App/Wiki teilweise umgesetzt |
| Erstplan | `plans/2026-06-05-15-05_erster_plan.md` | als Grundlage uebernommen |
| Konsolidierter Plan | `plans/2026-06-05-15-45_simtool-konsolidierte-finanzierungslogik.md` | aktiv |

## Umsetzungsregister

| Nr. | Erkenntnis | Quelle | App-Ziel | Wiki-Ziel | Status | Pruefhinweis |
|---:|---|---|---|---|---|---|
| 1 | Sichtbare Fachsprache muss deutsch sein. | Nutzer / Erstplan | UI-Labels, Diagnosen, Hilfen | alle Wiki-Dateien | umgesetzt im ersten Block | Resttreffer nur interne Dateinamen |
| 2 | Zahlungen muessen nach rechtlicher und bilanzieller Wirkung getrennt werden. | Bericht 1 | Zahlungsklassen, Buchungslogik | `04_ownership.md`, `05_finance.md`, `08_calculation_logic.md` | teilweise umgesetzt | Zahlungsklassen im Datenmodell; Buchungsvorlagen noch auszubauen |
| 3 | Mittelherkunft und Mittelverwendung muessen saldieren. | Bericht 1 und 2 | Finanzierungsberechnung | `05_finance.md`, `08_calculation_logic.md` | umgesetzt | harte Diagnose bei Luecke/Ueberschuss |
| 4 | Objektsicht, Rechtstraegersicht, Mitgliedersicht und Banksicht sind zu trennen. | Bericht 2 | Ergebnisstruktur, UI-Tabs | `01_overall.md`, `08_calculation_logic.md` | umgesetzt im Grundmodell | weitere UI-Feingliederung moeglich |
| 5 | Netto-, Umsatzsteuer- und Bruttowerte duerfen nicht vermischt werden. | Bericht 2 | Umsatzsteuer-Matrix, Erwerbskosten | `03_tax.md`, `08_calculation_logic.md` | teilweise umgesetzt | Mittelverwendung fuehrt Netto/USt/Brutto; USt-Matrix-App noch offen |
| 6 | Eigennutzung ist wirtschaftlich zu bewerten. | Bericht 2 | Belegung/Nutzung | `06_usage.md`, `08_calculation_logic.md` | umgesetzt | Hybridregel mit Marktwertverdraengung und Kostenuntergrenze |
| 7 | Tilgung ist Bankkontoabfluss und Vermoegens-/Schuldenwirkung, nicht voller Ergebnisaufwand. | Bericht 2 | Bankkonto, Ergebnisrechnung, Vermoegensuebersicht | `05_finance.md`, `08_calculation_logic.md` | umgesetzt im Grundmodell | Identitaet Vermoegen = Verbindlichkeiten + Eigenkapital weiter haerten |
| 8 | Banken sollten Bankpruefungs-Zahlungsfluss, Beleihungsauslauf und Kapitaldienstdeckungsgrad sehen. | Bericht 2 | Banksicht | `05_finance.md` | umgesetzt im Grundmodell | persoenliche Belastungsquote und Stressfaelle noch offen |
| 9 | Verein, GmbH/FlexCo und Genossenschaft brauchen unterschiedliche Pruefgatter. | Bericht 1 und 2 | Rechtsformvergleich | `04_ownership.md` | Wiki umgesetzt, App teilweise offen | keine automatische Empfehlung |
| 10 | Kontext-Hilfe soll per Fragezeichen auf Nachfrage erscheinen. | Nutzer / Erstplan | Hilfesystem | `01_overall.md`, `08_calculation_logic.md` | umgesetzt im Grundmodell | Hilfetextabdeckung weiter ausbauen |

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

## Arbeitsregel

- Jede rechtliche, steuerliche oder finanzielle Wiki-Aussage braucht Quellenblock mit Herausgeber, Stand oder Veroeffentlichungsdatum, Abrufdatum, Geltungsbereich und Stabilitaet.
- Unklare Einzelfallfragen werden als `offen / pruefen` markiert.
- Objektbezogene Demoannahmen bleiben aus den Hauptkapiteln heraus.
