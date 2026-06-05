# Beitragsstruktur, Zimmernaechte und Bankkonto-Cashflow konsistent machen

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current.

## Purpose / Big Picture
- User/system value after change: `simTool` verwendet in Eignerschaft, Beitraege/Punkte, Belegung, Darlehen und Cashflow dieselben Begriffe und zeigt nachvollziehbar, was Eigentum, Anlage, Nutzung und Bankkonto-Liquiditaet bedeuten.
- Observable behavior proving success: Phil und andere Eigner zeigen keine widerspruechlichen Werte mehr wie `100 Nutzungsbeitrag` vs. `449 Jahrespunkte`; Zimmernaechte statt Hausnaechte bestimmen die Belegung; der Cashflow zeigt Bankkonto-Einnahmen, Bankkonto-Ausgaben und jaehrlichen Kontostand in einer Ansicht.

## Contract Mode
- `mixed`
- Begruendung: UI-/Berechnungslogik aendert sich gezielt. Projekt-JSON, GitHub-Speicherung und bestehende Migrationen bleiben kompatibel.

## Progress
- [x] (2026-06-05 10:36) ExecPlan-Datei unter `plans/2026-06-05-10-36_simtool-beitragsstruktur-cashflow.md` anlegen.
- [x] (2026-06-05 11:06) Jonas' Punktelogik final mit bestehender `simTool`-Logik abgleichen.
- [x] (2026-06-05 11:06) Einheitliches Begriffsmodell in Types, Berechnungen und UI einfuehren.
- [x] (2026-06-05 11:06) Nutzungsbeitrag als EUR/Monat mit separaten Punkteregeln umsetzen.
- [x] (2026-06-05 11:06) Belegung auf Zimmernaechte und Wochenendmodell umbauen.
- [x] (2026-06-05 11:06) Projekt-/GitHub-Topbar in linken Tab `Projekt` verschieben.
- [x] (2026-06-05 11:06) Darlehensplot mit zweiter Y-Achse fuer Zins und Tilgung erweitern.
- [x] (2026-06-05 11:06) Cashflow als Bankkonto-Ansicht mit gestapelten Einnahmen/Ausgaben und Liquiditaetslinie neu bauen.
- [x] (2026-06-05 11:06) Tests ergaenzen/anpassen.
- [x] (2026-06-05 11:06) `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` erfolgreich ausfuehren.
- [x] (2026-06-05 11:06) Sinnvolle Einzelcommits erstellen.
- [ ] (2026-06-05 10:36) Push auf `origin main`, wenn alle Pruefungen erfolgreich sind.
- [x] (2026-06-05 11:06) Move this file to `plans/Archive/2026-06-05-10-36_simtool-beitragsstruktur-cashflow.md` as final completion step.

## Surprises & Discoveries
- Observation: `usagePointBudget = 100` wird aktuell als relatives Gewicht interpretiert und auf einen Jahrespunktpool hochskaliert.
- Evidence: `c:\Users\Doebler\Documents\Modelle\RenntnerHazienda\simTool\src\calculations\calculatePoints.ts` berechnet `annualPoints = annualPointPool * usageSharePct`.
- Observation: Die aktuelle Belegung rechnet in Hausnaechten statt Zimmernaechten.
- Evidence: `c:\Users\Doebler\Documents\Modelle\RenntnerHazienda\simTool\src\calculations\calculateOccupancy.ts` nutzt `blockedNights = ownerDemandNights + guestNights`.
- Observation: Jonas' Repo enthaelt Saison-/Wochenend-Multiplikatoren.
- Evidence: `C:\Users\Doebler\Documents\Modelle\ferienhaus\src\lib\formulas\points.ts`; `data\houses\waldchalet-pfunds.json` mit `weekendMultipliers` und `seasonMultipliers`.

## Decision Log
- Decision: `Nutzungsbeitrag` ist kuenftig ein EUR-Betrag pro Monat, kein Punktegewicht.
- Rationale: Der Begriff "Beitrag" soll finanzielle Zahlung bedeuten; Punkte entstehen aus separaten Punkteregeln.
- Date/Author: 2026-06-05 / User + Codex.
- Decision: Eine Nacht im Punktesystem entspricht einer Zimmernacht, nicht einer ganzen Hausnacht.
- Rationale: Mehrere Parteien koennen im selben Haus parallel unterschiedliche Schlafzimmer nutzen.
- Date/Author: 2026-06-05 / User.
- Decision: Belegung wird als Wochenendmodell gerechnet.
- Rationale: Realistische Nutzung konzentriert sich ueberwiegend auf Wochenenden.
- Date/Author: 2026-06-05 / User.

## Outcomes & Retrospective
- Achieved: Beitragsbegriffe, EUR-Nutzungsbeitrag, Zimmernachtbelegung, Projekt-Tab, Darlehens-Zweitachse und Bankkonto-Cashflow wurden umgesetzt und getestet.
- Open: Push auf `origin main` erfolgt nach Archivierungscommit.
- Improve next time: Sehr grosse UI-Dateien frueher in kleinere Komponenten zerlegen, damit fachliche und visuelle Aenderungen leichter getrennt commitbar sind.

## Context and Orientation
- Repo root: `c:\Users\Doebler\Documents\Modelle\RenntnerHazienda`
- Relevant modules/files:
  - `c:\Users\Doebler\Documents\Modelle\RenntnerHazienda\simTool\src\app\App.tsx`
  - `c:\Users\Doebler\Documents\Modelle\RenntnerHazienda\simTool\src\app\layout\InputTabs.tsx`
  - `c:\Users\Doebler\Documents\Modelle\RenntnerHazienda\simTool\src\app\layout\VisualizationTabs.tsx`
  - `c:\Users\Doebler\Documents\Modelle\RenntnerHazienda\simTool\src\state\uiStore.ts`
  - `c:\Users\Doebler\Documents\Modelle\RenntnerHazienda\simTool\src\calculations\types.ts`
  - `c:\Users\Doebler\Documents\Modelle\RenntnerHazienda\simTool\src\calculations\calculatePoints.ts`
  - `c:\Users\Doebler\Documents\Modelle\RenntnerHazienda\simTool\src\calculations\calculateOccupancy.ts`
  - `c:\Users\Doebler\Documents\Modelle\RenntnerHazienda\simTool\src\calculations\calculateContributions.ts`
  - `c:\Users\Doebler\Documents\Modelle\RenntnerHazienda\simTool\src\calculations\calculateCashflow.ts`
  - `c:\Users\Doebler\Documents\Modelle\RenntnerHazienda\simTool\src\calculations\calculateLiquidity.ts`
  - `c:\Users\Doebler\Documents\Modelle\RenntnerHazienda\simTool\src\calculations\calculateDebt.ts`
  - `c:\Users\Doebler\Documents\Modelle\RenntnerHazienda\simTool\src\calculations\calculations.test.ts`
  - `c:\Users\Doebler\Documents\Modelle\RenntnerHazienda\simTool\src\app\App.test.tsx`
- Term definitions:
  - `Start-EK`: einmalige Einlage zum Projektstart; zaehlt zum Unternehmensanteil.
  - `Anlagebeitrag`: monatlicher Vermoegensaufbau; zaehlt zum Unternehmensanteil, wenn er Tilgung oder manuelle Kapitalanlage repraesentiert.
  - `Nutzungsbeitrag`: monatlicher EUR-Beitrag fuer Nutzungsrechte; zaehlt nicht zum Unternehmensanteil.
  - `Nutzungspunkte`: aus EUR-Nutzungsbeitrag und Punkteregeln abgeleitete Zimmernacht-Berechtigung.
  - `Zimmernacht`: ein Schlafzimmer/Zimmer fuer eine Nacht.
  - `Unternehmensanteil`: finaler wirtschaftlicher Anteil am Unternehmen/Wiederverkauf.
  - `Kostenbeitrag`: laufende Umlage fuer Zins, Opex, Verwaltung und andere Bankkonto-Ausgaben ohne Eigentumszuwachs.
  - `Kontostand`: simulierter Bankkonto-Endstand je Monat/Jahr.
- Current-state evidence:
  - `rg -n "Nutzungsbeitrag|Initiale Einlage|Basis mtl|Reserve mtl|Sonderumlage|EK-Anteil|Unternehmensanteil" simTool/src`
  - `rg -n "type VisualizationTab|CashflowMonth|LiquidityMonth|OwnerPointResult|OccupancyResult" simTool/src/calculations simTool/src/state`
  - `rg -n "weekendMultipliers|seasonMultipliers|nightPoints" C:\Users\Doebler\Documents\Modelle\ferienhaus`

## Scope
- In scope:
  - Einheitliche UI-Begriffe in Eignerschaft, Beitraege/Punkte, Mein Anteil und Tabellen.
  - Nutzungsbeitrag als EUR/Monat mit separatem Punktpreis-/Saison-/Wochenendmodell.
  - Zimmernacht- und Wochenendbelegung.
  - Projekt-/GitHub-Verwaltung im linken Tab `Projekt`.
  - Cashflow- und Darlehensvisualisierung.
  - Unit- und UI-Tests.
  - Einzelcommits und Push nach erfolgreicher Pruefung.
- Out of scope:
  - Juristische Neuberewertung der Rechtsformen.
  - Neues Backend oder OAuth.
  - Aenderung des GitHub Contents API Speicherformats, ausser falls neue Projektfelder migrationssicher ergaenzt werden muessen.
  - Vollstaendige Buchhaltungs- oder Steuerlogik.

## Affected Files
- `simTool/src/app/App.tsx`
- `simTool/src/app/layout/InputTabs.tsx`
- `simTool/src/app/layout/VisualizationTabs.tsx`
- `simTool/src/state/uiStore.ts`
- `simTool/src/calculations/types.ts`
- `simTool/src/calculations/calculatePoints.ts`
- `simTool/src/calculations/calculateOccupancy.ts`
- `simTool/src/calculations/calculateContributions.ts`
- `simTool/src/calculations/calculateCashflow.ts`
- `simTool/src/calculations/calculateLiquidity.ts`
- `simTool/src/calculations/calculateDebt.ts`
- `simTool/src/calculations/calculateAll.ts`
- `simTool/src/modules/ownership/types.ts`
- `simTool/src/modules/ownership/schema.ts`
- `simTool/src/modules/ownership/defaults.ts`
- `simTool/src/modules/property/types.ts`
- `simTool/src/modules/property/schema.ts`
- `simTool/src/modules/property/defaults.ts`
- `simTool/src/modules/strategy/types.ts`
- `simTool/src/modules/strategy/schema.ts`
- `simTool/src/modules/strategy/defaults.ts`
- `simTool/src/calculations/calculations.test.ts`
- `simTool/src/app/App.test.tsx`

## Contract Gates (ThermoExpress)
### Gate Summary
| Topic | CURRENT (evidence) | TARGET (wiki) | Plan handling |
|---|---|---|---|
| Copy-back scope | Keine ThermoExpress Copy-back-Pipeline in `simTool`; App speichert JSON lokal/GitHub. | Keine Aenderung. | Nicht betroffen; GitHub/JSON-Speicherung bleibt funktional. |
| Stage-contract minimum artifacts | Keine Stage-Artefakte; Vite-App. | Keine Aenderung. | Nicht betroffen. |
| Manifest/hash minimum schema | Projektmanifest existiert als App-JSON mit Migrationen. | Neue Felder migrationssicher ergaenzen. | Alte Projekte laden weiter; neue Felder bekommen Defaults. |
| Exit-codes | `npm run lint/typecheck/test/build` liefern 0 bei Erfolg. | Unveraendert. | Abschlusspruefung mit allen vier Scripts. |
| Atomic writes/idempotency | GitHub Contents API und JSON Export/Import existieren. | Keine Speichersemantik aendern. | Projekt-Tab verschiebt UI nur; Speichern bleibt idempotent wie bisher. |
| Session/locking | Kein Locking; GitHub 409 wird bereits als Konflikt behandelt. | Keine Aenderung. | Nicht betroffen. |

### Open Decision SLA
- OPEN DECISION: Exakte EUR-zu-Punkte-Basiseinheit, falls Jonas' bestehender Punktpreis nicht eindeutig auf EUR gemappt ist.
- Owner: Codex.
- Deadline: Vor Implementierung von Milestone 2.
- Fallback: `1 EUR Jahres-Nutzungsbudget = 1 Nutzungspunkt`; Zimmernachtkosten ergeben sich aus `basePerRoomNight`, Saison- und Wochenendmultiplikator und werden in der UI editierbar gemacht.

### No-Behavior-Change Guard
- [ ] GitHub-/JSON-Speicherung bleibt unveraendert nutzbar.
- [ ] Alte Projektdateien laden ohne neue Pflichtfelder.
- [ ] Wenn ein neues Beitragsfeld fehlt, wird aus bestehenden Feldern migrationssicher abgeleitet.
- [ ] Falls eine Contract-Gate-Entscheidung offen bleibt, bleibt das betroffene Speicher-/CLI-Verhalten unveraendert.
- [ ] Record explicit follow-up decision task.

## Minimal Blocking Decisions
1) Copy-back scope:
- Decision needed? no
- Plan policy until decided: nicht betroffen; kein Copy-back-Verhalten aendern.

2) Stage-contract minimum artifacts:
- Decision needed? no
- Required per stage: nicht anwendbar.

3) Manifest/hash minimum schema:
- Decision needed? yes, fuer neue App-Felder.
- Plan policy: neue Felder optional/defaulted; bestehende JSON-Projekte bleiben gueltig.

4) Exit-codes CURRENT vs TARGET:
- Decision needed? no
- Codes for new CLIs: keine neuen CLIs.
- Deviation handling: `lint`, `typecheck`, `test`, `build` muessen 0 liefern.

## Plan of Work

### Milestone 1 - ExecPlan-Datei und Begriffs-Inventar
- Goal: Plan als Datei anlegen und vorhandene Begriffe vollstaendig erfassen.
- Changes:
  - Datei `plans/2026-06-05-10-36_simtool-beitragsstruktur-cashflow.md` mit diesem Inhalt anlegen.
  - Per `rg` alle UI-Labels und Ergebnisfelder zu Einlage, EK, Beitrag, Punkten, Anteil, Cashflow und Liquiditaet erfassen.
- Verification:
  - `Test-Path plans/2026-06-05-10-36_simtool-beitragsstruktur-cashflow.md` ergibt `True`.
  - `rg -n "Initiale Einlage|Basis mtl|Reserve mtl|Sonderumlage|EK-Anteil|Punkte-Anteil" simTool/src` zeigt nur bewusst migrierte oder entfernte Reststellen.

### Milestone 2 - Einheitliches Beitrags- und Anteilsmodell
- Goal: Eignerschaft und Beitraege/Punkte verwenden dieselben Fachbegriffe und dieselben Zahlenquellen.
- Changes:
  - Canonical labels einfuehren: `Start-EK`, `Anlagebeitrag`, `Nutzungsbeitrag`, `Kostenbeitrag`, `Liquiditaetsreserve`, `Unternehmensanteil`, `Nutzungsrechte`.
  - Legacy-Anzeigen ersetzen:
    - `Initiale Einlage` -> `Start-EK`
    - `Basis mtl.` -> `Kostenbeitrag mtl.`
    - `Reserve mtl.` -> `Liquiditaetsreserve mtl.`
    - `Sonderumlage` bleibt nur als explizite Zusatzumlage sichtbar.
    - `EK-Anteil` -> `Unternehmensanteil`, wenn der finale Firmen-/Wiederverkaufsanteil gemeint ist.
  - Eignerschaft zeigt berechneten `Unternehmensanteil` aus `capitalShares` statt nur den EK-Anteil.
  - Wenn Strategie `Bankrate verteilt` aktiv ist, wird der Anlagebeitrag als berechneter Tilgungsanteil angezeigt; manuelle `0 EUR Anlagebeitrag` wird nicht als fachlicher Beitrag missverstanden.
  - `ContributionsView` wird in eine verstaendliche Zahlungsuebersicht umgebaut: Startzahlungen, laufende Kostenbeitraege, laufende Anlagebeitraege, Nutzungsbeitraege, Reserve/Sonderumlagen.
- Verification:
  - Unit-Test: Phil mit `0 EUR` manuellem Anlagebeitrag zeigt trotzdem seinen berechneten Tilgungs-/Unternehmensanteil, wenn `Bankrate verteilt` aktiv ist.
  - UI-Test: Eignerschaft und Beitraege/Punkte enthalten keine widerspruechlichen Begriffe.
  - `rg -n "Initiale Einlage|Basis mtl|Reserve mtl|EK-Anteil|Punkte-Anteil" simTool/src/app simTool/src/calculations` zeigt keine produktiven UI-Reste.

### Milestone 3 - Nutzungsbeitrag EUR und Punkteregeln
- Goal: `Nutzungsbeitrag` ist EUR/Monat; Punkte werden daraus ueber editierbare Regeln erzeugt.
- Changes:
  - Owner-Feld semantisch auf `monthlyUsageContribution` oder kompatibles Aequivalent ausrichten; alte `usagePointBudget`-Daten migrationssicher uebernehmen.
  - Separaten Punktregeln-Abschnitt im Punkte-/Beitraege-Kontext einfuehren:
    - Basispreis pro Zimmernacht.
    - Multiplikatoren fuer `Mo-Do`, `Fr`, `Sa/So`.
    - Saisonmultiplikatoren `winterSki`, `summer`, `spring`, `autumn`.
    - Regeln orientieren sich an Jonas' `weekendMultipliers` und `seasonMultipliers`.
  - Jahres-Nutzungsbudget = `monthlyUsageContribution * 12`.
  - Leistbare Zimmernaechte = Jahres-Nutzungsbudget geteilt durch gewichtete Zimmernachtpreise.
  - Anzeigen ersetzen `Jahrespunkte` durch `Jahres-Nutzungsbudget`, `Zimmernacht-Kosten` und `leistbare Zimmernaechte`.
- Verification:
  - Unit-Test: `100 EUR/Monat` ergibt `1.200 EUR/Jahr` Nutzungsbudget, nicht automatisch `449 Jahrespunkte`.
  - Unit-Test: Wochenende Winter/Ski kostet mehr als Wochentag Fruehling.
  - UI-Test: Punkte-/Beitraege-Tab zeigt EUR-Nutzungsbeitrag und separate Punkteregeln.

### Milestone 4 - Zimmernacht- und Wochenendbelegung
- Goal: Belegung rechnet realistisch in Zimmernaechten und zeigt Wochenenddruck.
- Changes:
  - Kapazitaet:
    - Primaer `bedrooms * verfuegbare Naechte`.
    - Fallback auf `beds / 2`, wenn Schlafzimmer fehlen.
    - Fehlende Kapazitaet sichtbar markieren.
  - `guestNightsPerYear` als Fremdgast-Zimmernaechte behandeln oder UI eindeutig `Fremdgast-Zimmernaechte/Jahr` nennen.
  - Eigennutzung aus leistbaren Zimmernaechten je Eigner ableiten.
  - Wochenendmodell:
    - Wochenende separat als `Fr`, `Sa/So` bzw. mindestens `Wochenend-Zimmernaechte` rechnen.
    - Standardannahme: Eigentuemerbedarf ueberwiegend am Wochenende; Anteil editierbar oder als Default in Strategy/Property hinterlegt.
  - KPIs:
    - Zimmernacht-Kapazitaet/Jahr.
    - Wochenend-Zimmernacht-Kapazitaet.
    - Eigennutzung Zimmernaechte.
    - Fremdgaeste Zimmernaechte.
    - Freie Zimmernaechte.
    - Wochenenddruck.
    - Saison-/Wochenenddruck.
- Verification:
  - Unit-Test: Haus mit 5 Schlafzimmern hat mehr gleichzeitige Kapazitaet als 1 Hausnacht.
  - Unit-Test: 60 Fremdgastnaechte werden als 60 Zimmernaechte gerechnet.
  - Unit-Test: Wochenenddruck steigt, wenn Eigentuemerbedarf ueberwiegend auf Wochenende gelegt wird.
  - UI-Test: Belegungsrechner verwendet durchgehend `Zimmernaechte`.

### Milestone 5 - Projekt-Tab statt Topbar
- Goal: Projektname, JSON- und GitHub-Speicherung sind links im Tab `Projekt`.
- Changes:
  - `VisualizationTab` nicht aendern; linken Input-/Template-Tab um `Projekt` erweitern.
  - Projektname, Dirty-State, Projektdatum, JSON Import/Export, Default laden, GitHub Token, GitHub Laden/Speichern und Statusmeldungen aus `App.tsx` in eine Projekt-Tab-Komponente verschieben.
  - `App.tsx` haelt weiterhin State und Handler; die neue Projekt-Komponente bekommt Props.
  - Topbar auf App-Titel/Minimalheader reduzieren oder entfernen, ohne Funktionen zu verlieren.
- Verification:
  - UI-Test: `Projekt`-Tab ist in linker Spalte sichtbar.
  - UI-Test: GitHub Token Eingabe ist nicht mehr im oberen Block.
  - UI-Test: JSON-Fallback bleibt sichtbar und bedienbar.

### Milestone 6 - Darlehensplot mit zweiter Y-Achse
- Goal: Restschuld, Zins und Tilgung sind gleichzeitig lesbar.
- Changes:
  - `DebtView` auf `ComposedChart` oder Recharts-Konfiguration mit zwei Y-Achsen umbauen.
  - Linke Achse: Restschuld.
  - Rechte Achse: Zins und Tilgung pro Jahr/Monat.
  - Legende und Tooltip klar benennen.
  - Bestehende `calculateDebt`-Daten wiederverwenden; keine neue Finanzmathematik, sofern Tests keinen Fehler zeigen.
- Verification:
  - UI-Test oder Snapshot: Legende enthaelt `Restschuld`, `Zins`, `Tilgung`.
  - Unit-Test: Jahresaggregation zeigt Zins + Tilgung plausibel und Restschuld sinkt bei Annuitaet.

### Milestone 7 - Bankkonto-Cashflow und integrierte Liquiditaet
- Goal: Cashflow zeigt echte Bankkonto-Bewegungen statt schwer lesbarer Vor-/Nach-Bank-Kennzahlen.
- Changes:
  - Neue strukturierte Ergebnisdaten ergaenzen, z.B. `bankAccount.monthly` und `bankAccount.yearly`, oder `CashflowResult` entsprechend erweitern.
  - Einnahmen-Stack:
    - Start-EK.
    - Laufende Kostenbeitraege.
    - Anlagebeitraege/Tilgungsumlage.
    - Nutzungsbeitraege.
    - Darlehensauszahlung.
    - Mieteinnahmen/Fremdgaeste.
    - USt-Erstattung oder sonstige Rueckfluesse, falls vorhanden.
  - Ausgaben-Stack:
    - Kaufpreis/Nebenkosten.
    - Capex/Renovierung.
    - Opex/Unterhalt.
    - Zins.
    - Tilgung.
    - Rechtsform/Buchhaltung/Verwaltung.
    - Reservezufuehrung nur als Bankkonto-internen Zweck markieren, nicht als "Geld weg", sofern sie auf dem Konto bleibt.
  - CashflowView:
    - Oben gruppierte gestapelte Balken: ein Balken `Einnahmen`, ein Balken `Ausgaben vom Bankkonto` je Jahr.
    - Darunter direkte Linie `Kontostand`.
    - Tabelle mit Jahr, Einnahmen, Ausgaben, Netto-Bewegung, Kontostand Jahresende.
  - Separaten Tab `Liquiditaet` aus `VISUALIZATION_TAB_ORDER` entfernen; Liquiditaetsdaten bleiben intern fuer Timeline/Diagnostik nutzbar.
- Verification:
  - Unit-Test: Kontostand Jahr 1 entspricht Summe aus Anfangskonto + Bankkonto-Einnahmen - Bankkonto-Ausgaben.
  - Unit-Test: Ruecklagenzufuehrung reduziert Liquiditaet nur, wenn sie das Bankkonto wirklich verlaesst; interne Reserve wird separat ausgewiesen.
  - UI-Test: Tab `Liquiditaet` ist entfernt, Cashflow enthaelt `Kontostand`.
  - UI-Test: Cashflow-Chart zeigt getrennte Einnahmen- und Ausgaben-Stacks.

### Milestone 8 - Tests, Regression und Plausibilitaetspruefung
- Goal: Zahlen sind durchgerechnet, UI-Begriffe konsistent, alte Projekte bleiben ladbar.
- Changes:
  - `calculations.test.ts` um Beitrags-, Punkte-, Belegungs-, Cashflow- und Debt-Aggregation erweitern.
  - `App.test.tsx` um Projekt-Tab, Cashflow, Darlehen und Label-Konsistenz erweitern.
  - Migrationstests fuer alte `usagePointBudget`-/`participationTier`-Felder ergaenzen.
  - Plausibilitaetsfall mit Phil pruefen: kein `100 -> 449` Missverstaendnis mehr.
- Verification:
  - `cd simTool; npm run lint`
  - `cd simTool; npm run typecheck`
  - `cd simTool; npm test`
  - `cd simTool; npm run build`
  - Erwartung: alle Befehle Exit-Code 0.

### Milestone 9 - Commits und Push
- Goal: Arbeit in nachvollziehbaren Abschnitten versionieren.
- Changes:
  - Commit 1: `docs(plans): add contribution and cashflow exec plan`
  - Commit 2: `feat(simTool): align owner contribution terminology`
  - Commit 3: `feat(simTool): convert usage contribution to room-night model`
  - Commit 4: `feat(simTool): move project controls into project tab`
  - Commit 5: `feat(simTool): rebuild debt and cashflow visualizations`
  - Commit 6: `test(simTool): cover contribution cashflow and occupancy regressions`
  - Push: `git push origin main`
- Verification:
  - `git status --short` ist vor Push sauber.
  - `git log --oneline -6` zeigt die sechs Commit-Bloecke.
  - Push erfolgreich ohne Reject.

## Concrete Steps

### Setup / Environment
- Command: `git status --short`
  - Expected: keine unerwarteten uncommitted Aenderungen; falls doch, nicht ueberschreiben.
- Command: `cd simTool; npm install`
  - Expected: keine Aenderung noetig, falls Dependencies bereits vorhanden.

### Checks
- Command: `cd simTool; npm run typecheck`
  - Expected: aktuelle Ausgangslage bekannt; Fehler dokumentieren, falls vorhanden.
- Command: `cd simTool; npm test`
  - Expected: aktuelle Tests laufen oder bestehende Fehler werden im Plan dokumentiert.

### Investigations (read-only)
- `rg -n "Nutzungsbeitrag|Initiale Einlage|Basis mtl|Reserve mtl|Sonderumlage|EK-Anteil|Punkte-Anteil" simTool/src`
  - Expected: alle umzubenennenden UI-Stellen sichtbar.
- `rg -n "usagePointBudget|participationTier|annualPoints|affordableNights" simTool/src`
  - Expected: alle Punkte-/Nutzungsdatenfluesse sichtbar.
- `rg -n "netCashflowBeforeContributions|netCashflowAfterDebtService|LiquidityMonth|CashflowMonth" simTool/src`
  - Expected: Cashflow-/Liquiditaetsdatenfluss vollstaendig sichtbar.
- `rg -n "weekendMultipliers|seasonMultipliers|nightPoints" C:\Users\Doebler\Documents\Modelle\ferienhaus`
  - Expected: Jonas' Punktelogik referenzierbar.

### Execution / Smoke
- Command: `cd simTool; npm run build`
  - Expected artifacts: `simTool/dist/` wird erfolgreich erzeugt.
- Command: `cd simTool; npm run dev -- --host 127.0.0.1`
  - Expected: App laeuft lokal; Projekt-Tab, Cashflow und Darlehen manuell pruefbar.

## Validation and Acceptance
- Criterion 1: Begriffe sind konsistent.
  - Check: `rg` auf alte Labels und UI-Test.
  - Expected result: Keine produktiven widerspruechlichen Labels.
- Criterion 2: Phil-Beispiel ist erklaerbar.
  - Check: Testdatensatz mit Phil.
  - Expected result: `100 EUR/Monat Nutzungsbeitrag` wird als `1.200 EUR/Jahr Nutzungsbudget` angezeigt, nicht als verdeckt skalierte `449 Jahrespunkte`.
- Criterion 3: Belegung rechnet Zimmernaechte.
  - Check: Unit-Test mit 5 Schlafzimmern.
  - Expected result: Kapazitaet basiert auf `5 * Naechte`, nicht auf `1 Hausnacht`.
- Criterion 4: Wochenenddruck ist sichtbar.
  - Check: UI und Unit-Test.
  - Expected result: Wochenende wird getrennt von Gesamtjahr ausgewiesen.
- Criterion 5: Projektverwaltung ist links.
  - Check: UI-Test.
  - Expected result: `Projekt`-Tab enthaelt GitHub Token und Projektaktionen; oberer Block enthaelt diese nicht mehr.
- Criterion 6: Darlehen zeigt Zins/Tilgung.
  - Check: Chart-Legende und Tooltip.
  - Expected result: Restschuld, Zins und Tilgung sind gleichzeitig sichtbar.
- Criterion 7: Cashflow zeigt Bankkonto.
  - Check: Tabelle und Chart.
  - Expected result: Einnahmen/Ausgaben-Stacks plus Kontostand je Jahr.
- Criterion 8: Separate Liquiditaet entfaellt.
  - Check: UI-Tabliste.
  - Expected result: Kein Tab `Liquiditaet`; Kontostand im Cashflow.
- Criterion 9: Full verification.
  - Check: `lint`, `typecheck`, `test`, `build`.
  - Expected result: alle Exit-Code 0.

## Risks / Rollback / Recovery
- Risks:
  - Neue Begriffe koennen bestehende Tests brechen.
  - Migration von `usagePointBudget` kann alte Projekte semantisch veraendern.
  - Cashflow-Umbau kann bisherige Kennzahlen entfernen, die intern noch genutzt werden.
- Rollback:
  - Einzelcommits ermoeglichen Ruecknahme pro Subsystem.
  - JSON-/GitHub-Speicherung wird nicht destruktiv geaendert.
- Recovery for partial outputs/crashes/stale locks:
  - Keine Locks betroffen.
  - Bei abgebrochenem Build `simTool/dist/` loeschen und Build erneut ausfuehren.
  - Bei fehlgeschlagenem Push lokale Commits behalten, Fehler pruefen, nicht resetten.

## References
- Code paths:
  - `simTool/src/calculations/calculatePoints.ts`
  - `simTool/src/calculations/calculateOccupancy.ts`
  - `simTool/src/calculations/calculateCashflow.ts`
  - `simTool/src/calculations/calculateLiquidity.ts`
  - `simTool/src/app/layout/VisualizationTabs.tsx`
  - `simTool/src/app/layout/InputTabs.tsx`
  - `simTool/src/app/App.tsx`
- Jonas reference:
  - `C:\Users\Doebler\Documents\Modelle\ferienhaus\src\lib\formulas\points.ts`
  - `C:\Users\Doebler\Documents\Modelle\ferienhaus\data\houses\waldchalet-pfunds.json`
- Tests/fixtures:
  - `simTool/src/calculations/calculations.test.ts`
  - `simTool/src/app/App.test.tsx`
