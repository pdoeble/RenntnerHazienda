# Deep-Research-Umsetzungs-Audit 2026-06-05

Dieses Audit verfolgt, welche Erkenntnisse aus den beiden Tiefenrechercheberichten in App, Wiki und Tests uebernommen werden. Es ist Arbeitsdokument und ersetzt keine Rechts-, Steuer- oder Bankberatung.

## Quellen

| Quelle | Datei | Status |
|---|---|---|
| Tiefenrecherche 1 | `references/260605-deep-research-report.md` | zu inventarisieren |
| Tiefenrecherche 2 | `references/260605-deep-research-report_2.md` | zu inventarisieren |
| Erstplan | `plans/2026-06-05-15-05_erster_plan.md` | als Grundlage uebernommen |
| Konsolidierter Plan | `plans/2026-06-05-15-45_simtool-konsolidierte-finanzierungslogik.md` | aktiv |

## Umsetzungsregister

| Nr. | Erkenntnis | Quelle | App-Ziel | Wiki-Ziel | Status | Pruefhinweis |
|---:|---|---|---|---|---|---|
| 1 | Sichtbare Fachsprache muss deutsch sein. | Nutzer / Erstplan | UI-Labels, Diagnosen, Hilfen | alle Wiki-Dateien | offen | Begriffsscan noetig |
| 2 | Zahlungen muessen nach rechtlicher und bilanzieller Wirkung getrennt werden. | Bericht 1 | Zahlungsklassen, Buchungslogik | `04_ownership.md`, `05_finance.md`, `08_calculation_logic.md` | offen | Steuerberatungshinweis noetig |
| 3 | Mittelherkunft und Mittelverwendung muessen saldieren. | Bericht 1 und 2 | Finanzierungsberechnung | `05_finance.md`, `08_calculation_logic.md` | offen | harte Diagnose |
| 4 | Objektsicht, Rechtstraegersicht, Mitgliedersicht und Banksicht sind zu trennen. | Bericht 2 | Ergebnisstruktur, UI-Tabs | `01_overall.md`, `08_calculation_logic.md` | offen | Begriffsdefinitionen noetig |
| 5 | Netto-, Umsatzsteuer- und Bruttowerte duerfen nicht vermischt werden. | Bericht 2 | Umsatzsteuer-Matrix, Erwerbskosten | `03_tax.md`, `08_calculation_logic.md` | offen | Vorsteuerdiagnosen |
| 6 | Eigennutzung ist wirtschaftlich zu bewerten. | Bericht 2 | Belegung/Nutzung | `06_usage.md`, `08_calculation_logic.md` | offen | Hybridregel dokumentieren |
| 7 | Tilgung ist Bankkontoabfluss und Vermoegens-/Schuldenwirkung, nicht voller Ergebnisaufwand. | Bericht 2 | Bankkonto, Ergebnisrechnung, Vermoegensuebersicht | `05_finance.md`, `08_calculation_logic.md` | offen | Identitaetstests |
| 8 | Banken sollten Bankpruefungs-Zahlungsfluss, Beleihungsauslauf und Kapitaldienstdeckungsgrad sehen. | Bericht 2 | Banksicht | `05_finance.md` | offen | FMA-Werte als Richtwerte |
| 9 | Verein, GmbH/FlexCo und Genossenschaft brauchen unterschiedliche Pruefgatter. | Bericht 1 und 2 | Rechtsformvergleich | `04_ownership.md` | offen | keine automatische Empfehlung |
| 10 | Kontext-Hilfe soll per Fragezeichen auf Nachfrage erscheinen. | Nutzer / Erstplan | Hilfesystem | `01_overall.md`, `08_calculation_logic.md` | offen | UI-Test |

## Offene Quellenpruefung

- [ ] oesterreich.gv.at Kaufnebenkosten.
- [ ] FMA Leitplanken Wohnimmobilienkredit nach KIM-V.
- [ ] BMF / USP Umsatzsteuer bei Vermietung, Beherbergung, Kleinunternehmer, Option.
- [ ] BMI / RIS Vereinswesen.
- [ ] RIS / WKO GmbH, FlexCo, GmbH & Co KG.
- [ ] RIS Genossenschaftsgesetz.

## Arbeitsregel

- Jede rechtliche, steuerliche oder finanzielle Wiki-Aussage braucht Quellenblock mit Herausgeber, Stand oder Veroeffentlichungsdatum, Abrufdatum, Geltungsbereich und Stabilitaet.
- Unklare Einzelfallfragen werden als `offen / pruefen` markiert.
- Objektbezogene Demoannahmen bleiben aus den Hauptkapiteln heraus.
