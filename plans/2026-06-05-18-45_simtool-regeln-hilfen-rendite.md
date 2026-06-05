# simTool: Regeln-Tab, Kontext-Hilfen, Renditeansicht und Diagramm-/Rechtsformkosten-Update

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current.

## Purpose / Big Picture
- User/system value after change:
  - Steuerbare Berechnungsregeln stehen gebündelt im linken Tab `Regeln`.
  - Fachfremde Nutzer bekommen an interaktiven Feldern kurze Kontextinfos mit Formeln.
  - `Mein Anteil` zeigt zusätzlich eine 25-Jahres-Vermögens- und Renditebetrachtung.
  - Rechtsformkosten sind als sichtbare Planungsannahmen mit Quellenstatus hinterlegt.
  - Diagramme bleiben trotz großem Erwerbsjahr und kleinen Folgejahren lesbar.
- Observable behavior proving success:
  - PID `768` ist beendet und Dev-Server-Logs sind entfernt.
  - Tab `Regeln` ist sichtbar und enthält Punkt-, Anteils- und Nutzungsregeln.
  - Basispreis je Zimmernacht ist `6 EUR`; alle Default-Eigner haben `2.900 EUR` Monatsnettoeinkommen.
  - `Mein Anteil` enthält `Wert nach 25 Jahren`, `Investiertes Kapital` und `durchschnittliche Jahresrendite`.
  - Rechtsformvergleich zeigt Kurzbeschreibung, Kostenannahmen und Quellenstatus.
  - `Punkte` zeigt Kreisdiagramme fuer Nutzungsanteil und Unternehmensanteil.
  - `Beitraege / Nutzung` und `Bankkonto-Zahlungsfluss` nutzen getrennte Achsen fuer Einmal- und laufende Werte.

## Contract Mode
- `mixed`
- Begruendung:
  - Es werden UI, Defaults, Migrationen, Berechnungsergebnisse, Tests und Wiki-Dokumentation geaendert.
  - Projektmanifest und JSON-/GitHub-Speicherung bleiben kompatibel.

## Progress
- [x] (2026-06-05 18:45) PID `768` beenden und Dev-Server-Logs entfernen.
- [x] (2026-06-05 18:45) Worktree vor Umsetzung pruefen.
- [ ] (2026-06-05 18:45) ExecPlan-Datei anlegen.
- [ ] (2026-06-05 18:45) Neuen linken Tab `Regeln` einbauen.
- [ ] (2026-06-05 18:45) Punkt- und Einkommensdefaults sowie Migration anpassen.
- [ ] (2026-06-05 18:45) Eingabe-Hilfen mit Formeln ausbauen.
- [ ] (2026-06-05 18:45) 25-Jahres-Renditeansicht in `Mein Anteil` ergaenzen.
- [ ] (2026-06-05 18:45) Rechtsform-Kostenprofile mit Quellenstatus ergaenzen.
- [ ] (2026-06-05 18:45) Diagramme fuer Bankkonto, Beitraege und Punkte umbauen.
- [ ] (2026-06-05 18:45) Wiki und Audit aktualisieren.
- [ ] (2026-06-05 18:45) Tests ergaenzen/anpassen.
- [ ] (2026-06-05 18:45) `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` erfolgreich ausfuehren.
- [ ] (2026-06-05 18:45) Sinnvolle Einzelcommits erstellen.
- [ ] (2026-06-05 18:45) Move this file to `plans/Archive/2026-06-05-18-45_simtool-regeln-hilfen-rendite.md` as final completion step.

## Surprises & Discoveries
- Observation:
  - Punktregeln liegen bisher im Immobilien-Tab, obwohl sie objektuebergreifende Berechnungsregeln sind.
- Evidence:
  - `simTool/src/app/layout/InputTabs.tsx`, Funktion `PointRulesEditor`.
- Observation:
  - Monatsnettoeinkommen steht bei allen Default-Eignern auf `0`.
- Evidence:
  - `simTool/src/modules/ownership/defaults.ts`.
- Observation:
  - `HelpPopover` existiert bereits, wird aber fast nur in Ergebniszeilen verwendet.
- Evidence:
  - `simTool/src/ui/HelpPopover.tsx`, `simTool/src/ui/forms/NumberSliderField.tsx`.

## Decision Log
- Decision:
  - `Regeln` wird als virtueller linker Eingabe-Tab umgesetzt, nicht als neues Template.
- Rationale:
  - Die Regeln schreiben in bestehende `property`- und `strategy`-Daten; dadurch bleibt das Projektmanifest kompatibel.
- Date/Author:
  - 2026-06-05 / User + Codex.
- Decision:
  - Fehlendes oder altes Demo-Monatsnettoeinkommen `0` wird auf `2.900 EUR` migriert; positive manuelle Werte bleiben unveraendert.
- Rationale:
  - Der Nutzer verlangt `2.900 EUR` fuer alle; gleichzeitig sollen bewusst gesetzte Werte nicht ueberschrieben werden.
- Date/Author:
  - 2026-06-05 / User + Codex.
- Decision:
  - Rechtsformkosten bleiben Planungsannahmen mit Quellenstatus und Uebernahme-Button.
- Rationale:
  - Auswahl einer Rechtsform soll nicht stillschweigend manuelle Kostenfelder ueberschreiben.
- Date/Author:
  - 2026-06-05 / Codex.

## Outcomes & Retrospective
- Achieved:
  - Noch offen.
- Open:
  - Umsetzung und Verifikation.
- Improve next time:
  - Nach jedem Subsystem pruefen, ob UI-Begriffe deutsch und Formeln erklaert sind.

## Context and Orientation
- Repo root:
  - `c:\Users\Doebler\Documents\Modelle\RenntnerHazienda`
- Relevant modules/files:
  - `c:\Users\Doebler\Documents\Modelle\RenntnerHazienda\simTool\src\app\layout\InputTabs.tsx`
  - `c:\Users\Doebler\Documents\Modelle\RenntnerHazienda\simTool\src\app\layout\VisualizationTabs.tsx`
  - `c:\Users\Doebler\Documents\Modelle\RenntnerHazienda\simTool\src\ui\forms\NumberSliderField.tsx`
  - `c:\Users\Doebler\Documents\Modelle\RenntnerHazienda\simTool\src\modules\ownership\defaults.ts`
  - `c:\Users\Doebler\Documents\Modelle\RenntnerHazienda\simTool\src\modules\ownership\migrations.ts`
  - `c:\Users\Doebler\Documents\Modelle\RenntnerHazienda\simTool\src\modules\property\defaults.ts`
  - `c:\Users\Doebler\Documents\Modelle\RenntnerHazienda\simTool\src\modules\property\schema.ts`
  - `c:\Users\Doebler\Documents\Modelle\RenntnerHazienda\simTool\src\calculations\types.ts`
  - `c:\Users\Doebler\Documents\Modelle\RenntnerHazienda\simTool\src\calculations\calculateAll.ts`
  - `c:\Users\Doebler\Documents\Modelle\RenntnerHazienda\simTool\src\app\App.test.tsx`
  - `c:\Users\Doebler\Documents\Modelle\RenntnerHazienda\simTool\src\calculations\calculations.test.ts`
  - `c:\Users\Doebler\Documents\Modelle\RenntnerHazienda\wiki\04_ownership.md`
  - `c:\Users\Doebler\Documents\Modelle\RenntnerHazienda\wiki\08_calculation_logic.md`
- Term definitions:
  - `Regeln`: zentrale steuerbare Berechnungsvorschriften fuer Nutzung, Anteil, Belegung und Wirtschaftlichkeit.
  - `Zimmernacht`: ein Zimmer fuer eine Nacht.
  - `Investiertes Kapital`: Start-EK plus vermoegenswirksame Kapitalruecklage/Anlage.
  - `Nicht vermoegenswirksame Zahlungen`: Kostenumlage und Nutzungsentgelt.

## Scope
- In scope:
  - PID-Stop und Logbereinigung.
  - Regeln-Tab, Defaults, Migrationen, Hilfen, 25-Jahres-Rendite, Rechtsformkosten, Diagramme, Wiki, Tests.
- Out of scope:
  - Push.
  - Backend/OAuth.
  - Verbindliche Rechts-, Steuer- oder Bankberatung.

## Affected Files
- `simTool/src/app/layout/InputTabs.tsx`
- `simTool/src/app/layout/VisualizationTabs.tsx`
- `simTool/src/ui/forms/NumberSliderField.tsx`
- `simTool/src/modules/ownership/defaults.ts`
- `simTool/src/modules/ownership/migrations.ts`
- `simTool/src/modules/property/defaults.ts`
- `simTool/src/modules/property/schema.ts`
- `simTool/src/calculations/types.ts`
- `simTool/src/calculations/calculateAll.ts`
- `simTool/src/calculations/calculations.test.ts`
- `simTool/src/app/App.test.tsx`
- `wiki/04_ownership.md`
- `wiki/08_calculation_logic.md`
- `references/260605_deep-research-implementation-audit.md`

## Contract Gates (ThermoExpress)
### Gate Summary
| Topic | CURRENT (evidence) | TARGET | Plan handling |
|---|---|---|---|
| Copy-back scope | Keine ThermoExpress Copy-back-Pipeline; App speichert JSON/GitHub. | Keine Aenderung. | Nicht betroffen. |
| Stage-contract minimum artifacts | Vite-App ohne Stage-Artefakte. | Keine Aenderung. | Nicht betroffen. |
| Manifest/hash minimum schema | Projektmanifest bleibt Version 1 mit Template-Migrationen. | Neue Felder nur kompatibel/defaulted. | Keine Manifest-Versionserhoehung. |
| Exit-codes | `lint`, `typecheck`, `test`, `build` muessen 0 liefern. | Unveraendert. | Abschlusspruefung mit allen vier Scripts. |
| Atomic writes/idempotency | JSON-/GitHub-Speicherung unveraendert. | Keine Aenderung. | Neue Felder werden embedded gespeichert. |
| Session/locking | Kein Locking. | Keine Aenderung. | Nicht betroffen. |

### Open Decision SLA
- OPEN DECISION:
  - Keine blockierende Entscheidung offen.
- Owner:
  - Codex.
- Deadline:
  - Vor Abschlusspruefung.
- Fallback:
  - Bei fachlicher Unsicherheit Diagnose/Wiki-Hinweis statt stillschweigender Beratungsaussage.

### No-Behavior-Change Guard
- [ ] Projektmanifest bleibt kompatibel.
- [ ] Positive manuelle Monatsnettoeinkommen bleiben unveraendert.
- [ ] Kostenprofile ueberschreiben aktive Werte nur per Button.
- [ ] Rechtsformvergleich bleibt neutral.
- [ ] Keine automatische Rechtsformempfehlung.

## Minimal Blocking Decisions
1) Copy-back scope:
- Decision needed? no
- Plan policy until decided:
  - Nicht betroffen.

2) Stage-contract minimum artifacts:
- Decision needed? no
- Required per stage:
  - Nicht anwendbar.

3) Manifest/hash minimum schema:
- Decision needed? no
- Required fields:
  - Keine neuen Manifest-Pflichtfelder.

4) Exit-codes CURRENT vs TARGET:
- Decision needed? no
- Deviation handling:
  - Fehler werden behoben, bevor der Plan archiviert wird.

## Plan of Work

### Milestone 1 - Plan und Defaults
- Goal:
  - ExecPlan anlegen und Defaultwerte anpassen.
- Changes:
  - Plan-Datei.
  - `basePerBedPerNight = 6`.
  - Monatsnettoeinkommen Default/Migration `2.900 EUR`.
- Verification:
  - Unit-Test auf Defaults.

### Milestone 2 - Regeln-Tab und Hilfen
- Goal:
  - Regeln zentral steuerbar und erklaerbar machen.
- Changes:
  - Virtueller Tab `Regeln`.
  - Punkt- und Anteilregeln dorthin verschieben.
  - `NumberSliderField` und Label-Hilfen erweitern.
- Verification:
  - UI-Test fuer Tab und Hilfepopover.

### Milestone 3 - Rendite und Diagramme
- Goal:
  - `Mein Anteil`, `Punkte`, `Beitraege / Nutzung` und `Bankkonto-Zahlungsfluss` lesbarer machen.
- Changes:
  - 25-Jahres-Berechnung.
  - Kreisdiagramme fuer Nutzungs-/Unternehmensanteil.
  - Getrennte Achsen fuer Einmal-/laufende Werte.
- Verification:
  - Unit- und UI-Tests.

### Milestone 4 - Rechtsformkosten und Wiki
- Goal:
  - Kostenprofile quellenbasiert und dokumentiert darstellen.
- Changes:
  - Profilfelder, Uebernahme-Button, Tabellen.
  - Wiki und Audit aktualisieren.
- Verification:
  - UI-Test fuer Kostenprofile; `npm run build` synchronisiert Wiki.

### Milestone 5 - Abschluss
- Goal:
  - Vollstaendige Verifikation und Archivierung.
- Changes:
  - Tests, Build, Commits, Planarchiv.
- Verification:
  - `npm run lint`
  - `npm run typecheck`
  - `npm test`
  - `npm run build`
  - `git status --short`

## Concrete Steps

### Setup / Environment
- Command:
  - `git status --short`
- Expected:
  - Sauberer oder verstandener Worktree.

### Checks
- Command:
  - `rg -n "PointRulesEditor|monthlyNetIncomeAmount|basePerBedPerNight|HelpPopover|Bankkonto-Zahlungsfluss|LEGAL_FORM_PROFILES" simTool/src`
- Expected:
  - Betroffene Stellen sichtbar.

### Execution / Smoke
- Command:
  - `cd simTool; npm run build`
- Expected:
  - Build erfolgreich; Wiki-Sync erfolgt.

## Validation and Acceptance
- Criterion 1:
  - Check: UI-Test findet Tab `Regeln`.
  - Expected result: Regeln sind nicht mehr in `Immobilie`/`Strategie` verstreut.
- Criterion 2:
  - Check: Unit-Test Defaults.
  - Expected result: `6 EUR` und `2.900 EUR`.
- Criterion 3:
  - Check: UI-Test Hilfepopover.
  - Expected result: Formeltexte erscheinen auf Klick.
- Criterion 4:
  - Check: Unit-Test 25-Jahres-Rendite.
  - Expected result: Investiertes Kapital und Rendite sind nachvollziehbar.
- Criterion 5:
  - Check: UI-Test Diagramme.
  - Expected result: getrennte Achsen/Kreisdiagramme vorhanden.
- Criterion 6:
  - Check: Wiki- und Quellen-RG.
  - Expected result: Rechtsformkosten und Formelhinweise dokumentiert.

## Risks / Rollback / Recovery
- Risks:
  - Recharts-Achsen koennen Tooltip/Legende verkomplizieren.
  - Hilfetexte koennen UI ueberladen, wenn sie nicht kompakt bleiben.
  - Rechtsformkosten koennen als Beratung missverstanden werden.
- Rollback:
  - Commits je Subsystem trennen.
  - Defaults/Migrationen additiv halten.
- Recovery for partial outputs/crashes/stale locks:
  - Dev-Server bei Bedarf neu starten.
  - Build-Artefakte neu erzeugen.
  - Keine destruktiven Git-Befehle.

## References
- WKO Gruendungskosten:
  - `https://www.wko.at/gruendung/gruendungskosten`
- WKO GmbH:
  - `https://www.wko.at/gruendung/gesellschaft-beschraenkter-haftung-gmbh`
- WKO FlexCo:
  - `https://www.wko.at/gruendung/flexible-kapitalgesellschaft-flexkapg-`
- WKO KG:
  - `https://www.wko.at/gruendung/kommanditgesellschaft-kg`
- WKO GmbH & Co KG:
  - `https://www.wko.at/wirtschaftsrecht/gmbh-und-co-kg-faq`
- WKO Genossenschaft:
  - `https://www.wko.at/gruendung/genossenschaft`
- BMI Vereinswesen:
  - `https://www.bmi.gv.at/609/start.html`
- RIS Genossenschaftsrevisionsgesetz:
  - `https://ris.bka.gv.at/NormDokument.wxe?Abfrage=Bundesnormen&Gesetzesnummer=10003456&Paragraf=9`
