# Wiki-Audit 2026-06-05

## 1. Zweck und Methode

### Kernaussage
Dieses Protokoll dokumentiert die systematische Aktualisierung der Dateien `wiki/*.md` auf den Projektstand 2026-06-05. Geprüft wurden Begriffe, Quellenblöcke, Link-Erreichbarkeit und fachliche Konsistenz mit der aktuellen `simTool`-Berechnungslogik.

### Prüfsystematik
| Schritt | Ergebnis |
|---|---|
| Datei-Inventar | `wiki/01_overall.md` bis `wiki/08_calculation_logic.md` geprüft |
| Begriffsinventar | alte Begriffe wie pauschales Punktesystem, Arbeitspunkte, Jahrespunkte und Liquiditäts-Cashflow gesucht |
| Quellenpriorität | offizielle Quellen aus RIS, BMF, USP, oesterreich.gv.at, Land Tirol, FMA und WKO bevorzugt |
| Linkprüfung | alle externen Wiki-Links automatisiert geprüft; FMA-Links per Browser zusätzlich geöffnet |
| Datumslogik | Abrufdatum auf 2026-06-05 gesetzt, soweit die Quelle in dieser Runde geprüft wurde |

### Quelle
- Quelle: Projektredaktionsstandard und Wiki-Update
- Herausgeber: Projektteam RenntnerHazienda
- Link: ../AGENTS.md
- Link: ../wiki/01_overall.md
- Stand/Veröffentlichungsdatum: Projektstand 2026-06-05
- Abrufdatum: 2026-06-05
- Geltungsbereich: internes Wiki-Audit
- Stabilität: niedrig

## 2. Quellen- und Linkprüfung

### Kernaussage
Die rechtlichen, steuerlichen und finanziellen Kernaussagen wurden gegen die im Wiki bevorzugten offiziellen Quellenkategorien geprüft. Die automatisierte Linkprüfung ergab HTTP 200 für die externen Wiki-Links; die beiden FMA-URLs blockierten den PowerShell-HTTP-Check, waren aber im Browser erreichbar.

### Quellenkategorien
| Kategorie | Beispielquellen | Status |
|---|---|---|
| Erwerbsnebenkosten und Grundbuch | oesterreich.gv.at, BMF | bestätigt |
| USt, Vorsteuer, Vermietung, AfA, Liebhaberei | BMF, USP, RIS | bestätigt |
| Freizeitwohnsitz, Aufenthaltsabgabe, Tiroler Vermietungsleitfäden | Land Tirol, RIS Landesrecht Tirol | bestätigt, lokal variabel |
| Wohnimmobilienkredit und KIM-V-Ende | FMA, ergänzend Bank Austria/Raiffeisen | bestätigt, bankabhängig |
| Rechtsformen und Vereinswesen | WKO, BMI, USP | bestätigt |
| Arbeit, Geringfügigkeit, Dienstleistungsscheck | ÖGK, Dienstleistungsscheck-Online, USP | bestätigt, einzelfallabhängig |

### Auffällige Links
| Link | Befund | Änderung |
|---|---|---|
| alter regionaler Raiffeisen-Eigenmittel-Link | automatisiert nicht stabil erreichbar | ersetzt durch allgemeinen Raiffeisen-Eigenmittel-Link |
| alter WKO-Steiermark-Haftpflicht-Link | automatisiert nicht stabil erreichbar | ersetzt durch aktuellen WKO-RSS-Haftpflicht-Link |
| FMA Wohnimmobilienkredite / KIM-V-Ende | PowerShell-Check mit Fehler, Browserzugriff erfolgreich | Links belassen |

### Quelle
- Quelle: Wiki-Quellenregister und Linkprüfung
- Herausgeber: Projektteam RenntnerHazienda
- Link: ../wiki/01_overall.md
- Link: https://www.oesterreich.gv.at/de/themen/bauen_und_wohnen/wohnen/8/Seite.210150
- Link: https://www.bmf.gv.at/themen/steuern/immobilien-grundstuecke/grunderwerbsteuer/bemessungsgrundlage.html
- Link: https://www.usp.gv.at/themen/steuern-finanzen/umsatzsteuer-ueberblick/
- Link: https://www.fma.gv.at/kim-v-ende-fma-erwartet-stabile-kreditvergabe/
- Link: https://www.fma.gv.at/banken/wohnimmobilienkredite/
- Link: https://www.tirol.gv.at/tourismus/aufenthaltsabgabe/
- Link: https://www.wko.at/wirtschaftsrecht/uebersicht-gesellschaftsformen
- Stand/Veröffentlichungsdatum: Websites laufend aktualisiert; FMA 26.06.2025 für KIM-V-Ende
- Abrufdatum: 2026-06-05
- Geltungsbereich: Österreich; Tirol bei Landes-/Tourismusquellen
- Stabilität: mittel, bei Bank- und Gemeindethemen niedrig

## 3. Datei-Audit

### Kernaussage
Die Hauptänderung ist begriffliche und fachliche Konsolidierung: Kapital, laufende Kosten, Nutzung und Bankkonto-Liquidität werden getrennt. Objektbezogene Annahmen wurden nicht in die Hauptkapitel übernommen.

| Datei | Kernaussagen | Status | Änderung |
|---|---|---|---|
| `01_overall.md` | Gesamtstruktur, Quellenregister, zentrale Begriffe | geändert | neue Begriffe `Start-EK`, `Anlagebeitrag`, `Kostenbeitrag`, `Nutzungsbeitrag`, `Zimmernacht`, `Bankkonto-Cashflow`; `08_calculation_logic.md` als Q037 ergänzt |
| `02_legal.md` | Grundbuch, Widmung, Freizeitwohnsitz, Gewerberecht, Versicherung | bestätigt/geändert | Quellenabruf aktualisiert; instabiler WKO-Haftpflichtlink ersetzt; lokale Variabilität bleibt markiert |
| `03_tax.md` | GrESt, USt, Vorsteuer, DBA, Liebhaberei, Nutzungsbeiträge | geändert | Warnhinweis von pauschalem Punktesystem auf Nutzungsbeitrag/Nutzungspunkte und Zimmernächte umgestellt |
| `04_ownership.md` | Rechtsformen, Haftung, Governance, Verein | geändert | Spalte `Punktesystem` durch `Nutzungsrechte` ersetzt; Arbeitsleistungen von Nutzungspunkten abgegrenzt |
| `05_finance.md` | KIM-V/FMA, Nebenkosten, Bankpaket, Eigenmittel, Stressszenarien | geändert | Bankenpaket auf Nutzungsbeitrag/Nutzungspunkte/Zimmernachtmodell umgestellt; Raiffeisen-Link aktualisiert |
| `06_usage.md` | Eigennutzung, Vermietung, Buchung, Punkte/Nutzung | geändert | altes Punktesystem durch Nutzungsbeitrag, Nutzungspunkte, Zimmernachtmodell und Wochenenddruck ersetzt |
| `07_operational.md` | Kosten, Cashflow, Rücklagen, Betrieb, Compliance | geändert | Rücklagenzuführung als interne Liquiditätsreserve statt Ausgabe an Dritte klargestellt |
| `08_calculation_logic.md` | konkrete App-Berechnung | geändert | Begriff `Start-EK-Anteil` in Formel zu `Start-EK-Quote` präzisiert; technische `annualPoints`-Bezeichnung erklärt |

### Quelle
- Quelle: Wiki-Dateien und aktuelle simTool-Berechnungsdokumentation
- Herausgeber: Projektteam RenntnerHazienda
- Link: ../wiki/01_overall.md
- Link: ../wiki/02_legal.md
- Link: ../wiki/03_tax.md
- Link: ../wiki/04_ownership.md
- Link: ../wiki/05_finance.md
- Link: ../wiki/06_usage.md
- Link: ../wiki/07_operational.md
- Link: ../wiki/08_calculation_logic.md
- Stand/Veröffentlichungsdatum: Projektstand 2026-06-05
- Abrufdatum: 2026-06-05
- Geltungsbereich: Wiki-interne Dokumentation
- Stabilität: niedrig

## 4. Fachliche Entscheidungen

### Kernaussage
Die aktuelle Dokumentation folgt dem Modell, dass Eigentum, Vermögensaufbau, laufende Kosten und Nutzung getrennte Ebenen sind. Nutzungspunkte sind keine Unternehmensanteile.

| Entscheidung | Begründung | Status |
|---|---|---|
| `Nutzungsbeitrag` ist ein EUR-Beitrag | Beiträge sollen finanzielle Zahlungen benennen; Punkte sind nur abgeleitete Verbrauchseinheiten | umgesetzt |
| Nutzungspunkte beziehen sich auf Zimmernächte | mehrere Nutzer können parallel unterschiedliche Zimmer belegen | umgesetzt |
| Start-EK und Anlagebeitrag bestimmen Unternehmensanteile | Nutzung soll keine versteckte Kapitalverzinsung erzeugen | umgesetzt |
| Kostenbeitrag deckt Zins, Opex und Verwaltung | laufende Kosten schaffen keinen Eigentumszuwachs | umgesetzt |
| Rücklagenzuführung bleibt Liquidität, solange kein Drittmittelabfluss erfolgt | interne Zweckbindung ist kein Bankkontoabfluss | umgesetzt |

### Quelle
- Quelle: Berechnungslogik simTool und steuerliche Warnhinweise
- Herausgeber: Projektteam RenntnerHazienda; WKO als externe Steuer-/Rechtsformquelle
- Link: ../wiki/08_calculation_logic.md
- Link: https://www.wko.at/steuern/besteuerung-personengesellschaften
- Link: https://www.wko.at/wirtschaftsrecht/kommanditgesellschaft-kg
- Stand/Veröffentlichungsdatum: Projektstand 2026-06-05; WKO Websites Stand 2025/2026
- Abrufdatum: 2026-06-05
- Geltungsbereich: internes Modell; Österreich für externe Steuer-/Rechtsformquellen
- Stabilität: mittel

## 5. Offene Punkte

### Kernaussage
Mehrere Aussagen bleiben absichtlich allgemein, weil sie ohne Objekt, Gemeinde, Rechtsform, Finanzierungspartner und Nutzungsprofil nicht abschließend beurteilt werden können.

| Thema | Warum offen | Nächste Prüfung |
|---|---|---|
| Freizeitwohnsitz und touristische Nutzung | landes- und gemeindeabhängig | schriftliche Gemeinde-/Landesauskunft zum konkreten Objekt |
| USt/Vorsteuer | abhängig von Kauf-USt, Nutzungsmix, Beherbergung/Überlassung und Option | Steuerberaterprüfung vor Kaufvertrag |
| Bankfähigkeit der Struktur | kreditinstituts- und bonitätsabhängig | Bankterm-Sheet mit konkreter Rechtsform |
| Rechtsformkosten | abhängig von Notar, Vertrag, Buchhaltung und Gewerbe | Angebote Notar/Steuerberater einholen |
| Versicherung | abhängig von Eigennutzung, Fremdgästen, Gewerblichkeit, Arbeitgeberrolle | Makler-/Versichererprüfung |

### Quelle
- Quelle: offizielle Quellen und Projekt-Wiki
- Herausgeber: Projektteam RenntnerHazienda; externe Herausgeber siehe Quellenregister
- Link: ../wiki/01_overall.md
- Link: ../wiki/02_legal.md
- Link: ../wiki/03_tax.md
- Link: ../wiki/04_ownership.md
- Link: ../wiki/05_finance.md
- Stand/Veröffentlichungsdatum: Projektstand 2026-06-05
- Abrufdatum: 2026-06-05
- Geltungsbereich: Österreich allgemein; konkrete Gemeinde/Objekt offen
- Stabilität: niedrig
