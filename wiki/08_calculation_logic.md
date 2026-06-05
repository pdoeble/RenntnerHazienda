# 08_calculation_logic.md

# Berechnungslogik im simTool

## 1. Zweck und Status

### Kernaussage
Dieses Kapitel dokumentiert die aktuelle interne Berechnungslogik des `simTool`. Es beschreibt, wie aus Projekt-, Immobilien-, Finanzierungs-, Eigner-, Rechtsform-, Betriebskosten- und Strategiedaten die Ansichten Mittelherkunft / Mittelverwendung, Darlehen, Beiträge, Unternehmensanteile, Nutzungsrechte, Belegung, Bankkonto-Zahlungsfluss, Bankkonto-Liquidität, Banksicht und Hausvergleich entstehen.

Die Logik ist ein Planungsmodell. Sie ersetzt keine rechtliche, steuerliche, notarielle oder bankseitige Prüfung. Steuerliche Behandlungen, Kreditfähigkeit, Grundverkehr, Freizeitwohnsitz-/Widmungsfragen, Umsatzsteuer, Tourismusabgaben und zivilrechtliche Vertragsgestaltung müssen im Einzelfall geprüft werden.

### Geltungsbereich
- App: `simTool`
- Projektmodell: ein aktives Projekt mit einem aktiven Objekt und optionaler Haus-Kandidatenliste
- Landesschwerpunkt: Österreich
- Stand: 2026-06-05

### Quelle
- Quelle: Berechnungspipeline `calculateAll`
- Herausgeber: Projektteam RenntnerHazienda
- Link: [calculateAll.ts](../simTool/src/calculations/calculateAll.ts)
- Stand/Veröffentlichungsdatum: Projektstand 2026-06-05
- Abrufdatum: 2026-06-05
- Geltungsbereich: internes App-Modell
- Stabilität: niedrig, weil sich die App-Logik aktiv weiterentwickelt

## 2. Rechenreihenfolge

### Kernaussage
Die App berechnet nicht jede Ansicht isoliert. Die Ergebnisse entstehen in einer festen Reihenfolge, damit spätere Module auf bereits berechnete Daten zugreifen können.

### Reihenfolge
1. Eingabediagnosen werden gesammelt. Blockierende Fehler verhindern die Hauptberechnung.
2. Start-EK und initiale Beiträge werden aus den Eigner-Daten abgeleitet.
3. Der Darlehensbetrag wird aus Kapitalbedarf minus Start-EK berechnet.
4. Der Darlehensplan wird als monatlicher Annuitätenplan berechnet.
5. Der operative Zahlungsfluss wird aus Mietertrag, Leerstand, Betriebskosten und Darlehensdienst berechnet.
6. Laufende Beiträge werden jahresweise aus Kostenbeitrag, Kapitalruecklage / Anlage, Nutzungsentgelt und Reservebedarf abgeleitet.
7. Die Liquidität wird als monatlicher Bankkonto-Kontostand simuliert.
8. Der Bankkonto-Zahlungsfluss wird in Einnahmen- und Ausgabenstapel aufbereitet.
9. Kapitalbedarf, Unternehmensanteile, Nutzungspunkte, Belegung, Hausvergleich und Timeline werden berechnet.
10. Diagnosen aus allen Modulen werden zusammengeführt.

### Quelle
- Quelle: Berechnungspipeline `calculateAll`
- Herausgeber: Projektteam RenntnerHazienda
- Link: [calculateAll.ts](../simTool/src/calculations/calculateAll.ts)
- Stand/Veröffentlichungsdatum: Projektstand 2026-06-05
- Abrufdatum: 2026-06-05
- Geltungsbereich: internes App-Modell
- Stabilität: niedrig

## 3. Rundung

### Kernaussage
Geldbeträge werden auf zwei Nachkommastellen gerundet. Prozentwerte werden intern auf vier Nachkommastellen gerundet. Dadurch können Summen in Tabellen minimal von exakt nachgerechneten Rohwerten abweichen.

### Formeln
```text
Geldbetrag = round(value, 2 Nachkommastellen)
Prozentwert = round(value, 4 Nachkommastellen)
```

### Quelle
- Quelle: Rundungsfunktionen
- Herausgeber: Projektteam RenntnerHazienda
- Link: [rounding.ts](../simTool/src/calculations/rounding.ts)
- Stand/Veröffentlichungsdatum: Projektstand 2026-06-05
- Abrufdatum: 2026-06-05
- Geltungsbereich: internes App-Modell
- Stabilität: mittel

## 4. Kapitalbedarf

### Kernaussage
Der Kapitalbedarf umfasst nicht nur den Kaufpreis. Das Modell addiert Kaufpreis, allfällige Umsatzsteuer beim Kauf, Erwerbsnebenkosten, Pfandrecht-/Eintragungsannahme, Renovierungen, Rechtsform-Gründungskosten und eine initiale Liquiditätsreserve. Davon wird das Start-EK der Eigner abgezogen. Der verbleibende Betrag wird als Darlehensbetrag angesetzt.

### App-Formel
```text
Nebenkosten =
  Kaufpreis
  * (GrESt % + Notar % + Grundbuch % + Makler %) / 100
  + fixe sonstige Kosten

USt beim Kauf =
  Kaufpreis * USt-Satz % / 100

USt-Erstattung =
  USt beim Kauf * erstattbarer Anteil % / 100

Pfandrecht-/Eintragungsannahme =
  Kaufpreis * Pfandrechtssatz % / 100

Initiale Reserve =
  max(Mindestliquidität, Ziel-Liquidität)

Gesamtprojektbedarf =
  Kaufpreis
  + USt beim Kauf
  + Nebenkosten
  + Pfandrecht-/Eintragungsannahme
  + Renovierungen
  + Rechtsform-Gründungskosten
  + Initiale Reserve

Darlehensbetrag =
  max(0, Gesamtprojektbedarf - Summe Start-EK)

Tatsächliche EK-Quote =
  Summe Start-EK / Gesamtprojektbedarf * 100
```

### Aktuelle Modellgrenze
Die App berechnet die Pfandrecht-/Eintragungsannahme derzeit als Prozentsatz vom Kaufpreis. Die österreichische Grundbuchinformation nennt für die Pfandrechtseintragung einen Prozentsatz vom Pfandbetrag. Bei konkreter Finanzierung muss daher geprüft werden, ob die App-Annahme dem tatsächlich einzutragenden Pfandbetrag entspricht.

### Quelle
- Quelle: Kapitalbedarfsfunktionen
- Herausgeber: Projektteam RenntnerHazienda
- Link: [financialInputs.ts](../simTool/src/calculations/financialInputs.ts)
- Stand/Veröffentlichungsdatum: Projektstand 2026-06-05
- Abrufdatum: 2026-06-05
- Geltungsbereich: internes App-Modell
- Stabilität: niedrig

### Externe Quelle
- Quelle: Nebenkosten beim Wohnungs- und Grundstückskauf
- Herausgeber: oesterreich.gv.at / Bundesministerium für Justiz
- Link: https://www.oesterreich.gv.at/de/themen/bauen_und_wohnen/wohnen/8/Seite.210150
- Stand/Veröffentlichungsdatum: letzte Aktualisierung 01.01.2026
- Abrufdatum: 2026-06-05
- Geltungsbereich: Österreich, Wohnungs- und Grundstückskauf
- Stabilität: mittel

### Weitere externe Quelle
- Quelle: Eintragung des Eigentumsrechts ins Grundbuch
- Herausgeber: oesterreich.gv.at / Bundesministerium für Justiz / Österreichische Notariatskammer
- Link: https://www.oesterreich.gv.at/de/themen/bauen_und_wohnen/grundstueckskauf_und_grundbuch/grundstueckskauf/Seite.200060
- Stand/Veröffentlichungsdatum: letzte Aktualisierung 01.01.2026
- Abrufdatum: 2026-06-05
- Geltungsbereich: Österreich, Grundbuch
- Stabilität: mittel

## 5. Erwerbsnebenkosten und AT-Defaults

### Kernaussage
Die sichtbaren Standardwerte sind auf ein österreichisches Szenario ausgerichtet. Im Default-Projekt werden Grunderwerbsteuer, Grundbuch, Pfandrecht, Notar und Makler als Eingabewerte geführt. Die Werte sind Modellannahmen und müssen vor einer Kaufentscheidung mit Notariat, Rechtsanwalt, Bank und Steuerberatung geprüft werden.

### Aktuelle Default-Werte
| Kostenposition | Default im Modell | Einordnung |
|---|---:|---|
| Grunderwerbsteuer | 3,5 % | österreichischer Standardfall im Modell |
| Grundbuch Eigentum | 1,1 % | österreichischer Standardfall im Modell |
| Pfandrecht/Eintragung | 1,2 % | App-Annahme, derzeit vom Kaufpreis gerechnet |
| Notar/Vertrag/Treuhand | 1,5 % | Modellannahme innerhalb einer typischen Bandbreite |
| Makler | 0 % | Demo-Annahme für provisionsfrei |

### Quelle
- Quelle: Property-Default und Kapitalbedarfsfunktionen
- Herausgeber: Projektteam RenntnerHazienda
- Link: [property/defaults.ts](../simTool/src/modules/property/defaults.ts)
- Link: [financialInputs.ts](../simTool/src/calculations/financialInputs.ts)
- Stand/Veröffentlichungsdatum: Projektstand 2026-06-05
- Abrufdatum: 2026-06-05
- Geltungsbereich: internes App-Modell
- Stabilität: niedrig

### Externe Quelle
- Quelle: Nebenkosten beim Wohnungs- und Grundstückskauf
- Herausgeber: oesterreich.gv.at / Bundesministerium für Justiz
- Link: https://www.oesterreich.gv.at/de/themen/bauen_und_wohnen/wohnen/8/Seite.210150
- Stand/Veröffentlichungsdatum: letzte Aktualisierung 01.01.2026
- Abrufdatum: 2026-06-05
- Geltungsbereich: Österreich
- Stabilität: mittel

## 6. Darlehenslogik

### Kernaussage
Das Modell verwendet ein Annuitätendarlehen. Die monatliche Rate wird aus Darlehensbetrag, Zinssatz und Laufzeit berechnet. Der Zinsanteil sinkt im Zeitverlauf, der Tilgungsanteil steigt. Eine zusätzliche monatliche Tilgung kann addiert werden.

### App-Formel
```text
Monatszins =
  Jahreszins / 100 / 12

Laufzeitmonate =
  Laufzeitjahre * 12

Annuität =
  Darlehen * Monatszins * (1 + Monatszins)^Laufzeitmonate
  / ((1 + Monatszins)^Laufzeitmonate - 1)
  + zusätzliche monatliche Tilgung

Zins im Monat =
  offene Restschuld zu Monatsbeginn * Monatszins

Tilgung im Monat =
  monatliche Zahlung - Zins im Monat

Restschuld Monatsende =
  Restschuld Monatsbeginn - Tilgung im Monat
```

Bei Zinssatz `0 %` teilt das Modell den Darlehensbetrag linear durch die Laufzeitmonate und addiert eine zusätzliche Tilgung.

### Quelle
- Quelle: Annuitäten- und Darlehensberechnung
- Herausgeber: Projektteam RenntnerHazienda
- Link: [loanMath.ts](../simTool/src/calculations/loanMath.ts)
- Link: [calculateDebt.ts](../simTool/src/calculations/calculateDebt.ts)
- Stand/Veröffentlichungsdatum: Projektstand 2026-06-05
- Abrufdatum: 2026-06-05
- Geltungsbereich: internes App-Modell
- Stabilität: mittel

### Externe Quelle
- Quelle: FMA erwartet nach Auslaufen der KIM-V solide Wohnkreditvergabe
- Herausgeber: Finanzmarktaufsicht Österreich
- Link: https://www.fma.gv.at/kim-v-ende-fma-erwartet-stabile-kreditvergabe/
- Stand/Veröffentlichungsdatum: 26.06.2025
- Abrufdatum: 2026-06-05
- Geltungsbereich: Österreich, private Wohnimmobilienkredite
- Stabilität: mittel

## 7. Start-EK, Kapitalruecklage / Anlage und Unternehmensanteil

### Kernaussage
Das Modell trennt Eigentums-/Unternehmensanteile von Nutzungsrechten. Start-EK und ausdrücklich kapitalwirksame Kapitalruecklagen bzw. Anlagezahlungen können zum Unternehmensanteil zählen. Nutzungsentgelte zählen nicht zum Unternehmensanteil.

### Begriffe
| Begriff | Bedeutung im Modell | Wirkung auf Unternehmensanteil |
|---|---|---|
| Start-EK | einmalige Einlage zu Projektbeginn | ja |
| Kapitalruecklage / Anlage | monatlicher Vermögensaufbau, je nach Modus manuell oder als Tilgungsanteil | nur bei ausdrücklich definierter Beteiligungswirkung |
| Nutzungsentgelt | monatlicher EUR-Beitrag für Nutzungspunkte/Zimmernächte | nein |
| Kostenbeitrag | laufender Beitrag für Zins, Betriebskosten, Verwaltung und sonstige Kosten | nein |
| Liquiditätsreserve | Beitrag zum Bankkonto-Puffer | nein, solange nur Bankkonto-Reserve |

### Modus `scheduledPrincipal`
Im Default-Modus wird die laufende Tilgung des Bankdarlehens als Kapitalwirkung interpretiert. Die Tilgung wird im Verhältnis der Start-EK-Quoten auf die Eigner verteilt.

Seit Projektstand 2026-06-05 steuert der Schalter `Tilgung verändert Unternehmensanteile`, ob diese Kapitalwirkung tatsächlich in den Unternehmensanteil einfließt. Wenn der Schalter aus ist, wird die Tilgung als nicht verwässernde Kapitalzuführung ausgewiesen und verändert die Beteiligungstabelle nicht.

```text
Start-EK-Quote Eigner =
  Start-EK Eigner / Summe Start-EK * 100

Tilgungsanteil Eigner je Monat =
  Tilgung Bankdarlehen je Monat * Start-EK-Quote Eigner / 100
```

Für den finalen Unternehmensanteil werden Start-EK und die zugerechneten Tilgungsanteile bis zum Darlehensende mit dem eingestellten Bewertungszins aufgezinst. Der Bewertungszins ist eine interne Bewertungsannahme, keine steuerliche oder bankseitige Verzinsungszusage.

```text
Kapitalwert Eigner =
  aufgezinster Start-EK-Wert
  + aufgezinste Tilgungsanteile

Unternehmensanteil Eigner =
  Kapitalwert Eigner / Summe Kapitalwerte * 100
```

### Modus `manualMonthly`
Im manuellen Modus wird nicht die Banktilgung verteilt. Stattdessen zählt die je Eigner eingetragene monatliche Kapitalruecklage / Anlage zum Unternehmensanteil, wenn diese Beteiligungswirkung in der Struktur so festgelegt ist.

Der Schalter `Kapitalruecklage / Anlage verändert Unternehmensanteile` legt fest, ob die manuelle monatliche Zahlung anteilswirksam ist. Wenn der Schalter aus ist, zeigt die App den Kapitalwert separat als nicht verwässernde Kapitalzuführung.

### Quelle
- Quelle: Kapitalanteilsberechnung
- Herausgeber: Projektteam RenntnerHazienda
- Link: [calculateCapitalShares.ts](../simTool/src/calculations/calculateCapitalShares.ts)
- Stand/Veröffentlichungsdatum: Projektstand 2026-06-05
- Abrufdatum: 2026-06-05
- Geltungsbereich: internes App-Modell
- Stabilität: niedrig

## 8. Laufende Beiträge

### Kernaussage
Die Beitragsrechnung bestimmt, welche monatlichen Zahlungen die Eigner leisten müssen. Die App unterscheidet Kostenbeitrag, Kapitalruecklage / Anlage, Nutzungsentgelt und Liquiditätsreserve.

### Jahresweise Berechnung
Die App bildet für jedes Projektjahr eine durchschnittliche Monatsbasis. Dafür werden die Monatswerte des jeweiligen Jahres aggregiert.

Im Modus `scheduledPrincipal` gilt:
```text
Kostenbasis =
  Zins
  + Betriebskosten
  - anrechenbare Mieterträge, falls aktiviert
  - Summe Nutzungsentgelte

Anlagebasis =
  Tilgung
```

Im Modus `manualMonthly` gilt:
```text
Kostenbasis =
  Zins
  + Tilgung
  + Betriebskosten
  - anrechenbare Mieterträge, falls aktiviert
  - Summe Nutzungsentgelte
  - Summe manuelle Kapitalruecklagen / Anlagezahlungen

Anlagebasis =
  Summe manuelle Kapitalruecklagen / Anlagezahlungen
```

Negative Kostenbasis wird auf `0` begrenzt. Das Nutzungsentgelt reduziert die zu verteilende Kostenbasis, weil es als Zahlung an das Projektkonto modelliert wird. Es erhöht aber nicht den Unternehmensanteil.

### Verteilung auf Eigner
Im Default-Modus werden Kostenbeitrag, Tilgungs-/Anlagebasis und Reservebedarf nach Start-EK-Quote verteilt. Das Nutzungsentgelt wird dagegen direkt aus dem je Eigner eingetragenen monatlichen Nutzungsentgelt übernommen.

### Liquiditätsreserve
Die App prüft für jedes Jahr, ob die laufenden Beiträge ausreichen, um den eingestellten Reserve-Zielwert zu halten. Wenn nicht, wird ein monatlicher Reservebeitrag ergänzt.

```text
Reserveziel =
  max(Mindestliquidität, Ziel-Liquidität, Monatskostenbasis * Reserve-Monate)
```

### Quelle
- Quelle: Beitragsberechnung
- Herausgeber: Projektteam RenntnerHazienda
- Link: [calculateContributions.ts](../simTool/src/calculations/calculateContributions.ts)
- Stand/Veröffentlichungsdatum: Projektstand 2026-06-05
- Abrufdatum: 2026-06-05
- Geltungsbereich: internes App-Modell
- Stabilität: niedrig

## 9. Betriebskosten und laufende Rechtsformkosten

### Kernaussage
Betriebskosten-Positionen können als fixe Jahreskosten, als Kosten je vermietbarer Fläche, als Kosten je Grundstücksfläche oder als Prozentsatz des Immobilienwerts modelliert werden. Laufende Buchhaltungs-, Verwaltungs- und Compliancekosten der Rechtsform werden zusätzlich als monatliche Betriebskosten in den Zahlungsfluss aufgenommen.

### Betriebskosten-Berechnung
```text
bei period = monthly: Jahresbetrag = Betrag * 12
bei period = quarterly: Jahresbetrag = Betrag * 4
bei period = yearly: Jahresbetrag = Betrag

bei annualCostMode = fixed:
  Jahresbetrag = Basisbetrag

bei annualCostMode = rentableArea:
  Jahresbetrag = Basisbetrag * vermietbare Fläche

bei annualCostMode = plotArea:
  Jahresbetrag = Basisbetrag * Grundstücksfläche

bei annualCostMode = propertyValue:
  Jahresbetrag = Kaufpreis * Basisbetrag / 100

Monatsbetrag =
  Jahresbetrag / 12 * (1 + Inflation %)^(Monat / 12)
```

### Rücklagenpositionen
Betriebskosten-Positionen mit Kategorie `reserve` werden im operativen Zahlungsfluss nicht als laufender Abfluss behandelt. Die Logik folgt der Annahme, dass eine interne Instandhaltungsrücklage auf dem Bankkonto bleibt und damit Liquidität bzw. zweckgebundene Reserve ist. Echte Zahlungen an Dritte, Reparaturen oder Renovierungen müssen als konkrete Betriebskosten- oder Renovierungspositionen erfasst werden.

### Quelle
- Quelle: Zahlungsfluss- und Betriebskosten-Berechnung
- Herausgeber: Projektteam RenntnerHazienda
- Link: [calculateCashflow.ts](../simTool/src/calculations/calculateCashflow.ts)
- Link: [financialInputs.ts](../simTool/src/calculations/financialInputs.ts)
- Link: [legal-form/defaults.ts](../simTool/src/modules/legal-form/defaults.ts)
- Stand/Veröffentlichungsdatum: Projektstand 2026-06-05
- Abrufdatum: 2026-06-05
- Geltungsbereich: internes App-Modell
- Stabilität: niedrig

## 10. Operativer Zahlungsfluss

### Kernaussage
Der operative Zahlungsfluss zeigt das Ergebnis aus Vermietungsertrag, Leerstand, Betriebskosten und Darlehensdienst vor den Eigentümerbeiträgen.

### App-Formel
```text
Leerstandsverlust =
  erwartete Monatsmiete * Leerstand % / 100

Effektiver Mietertrag =
  erwartete Monatsmiete - Leerstandsverlust

Operatives Ergebnis =
  effektiver Mietertrag
  - umlagefähige Betriebskosten
  - nicht umlagefähige Betriebskosten

Netto-Zahlungsfluss nach Darlehensdienst =
  operatives Ergebnis
  - Zins
  - Tilgung
```

Die App führt umlagefähige und nicht umlagefähige Betriebskosten getrennt. Ob eine Kostenposition tatsächlich umlagefähig, steuerlich abzugsfähig oder umsatzsteuerlich relevant ist, wird dadurch nicht rechtlich entschieden.

### Quelle
- Quelle: Zahlungsfluss-Berechnung
- Herausgeber: Projektteam RenntnerHazienda
- Link: [calculateCashflow.ts](../simTool/src/calculations/calculateCashflow.ts)
- Stand/Veröffentlichungsdatum: Projektstand 2026-06-05
- Abrufdatum: 2026-06-05
- Geltungsbereich: internes App-Modell
- Stabilität: niedrig

## 11. Bankkonto-Zahlungsfluss und Liquidität

### Kernaussage
Der Tab `Bankkonto-Zahlungsfluss` zeigt eine Bankkonto-Sicht. Dort werden tatsächliche modellierte Einzahlungen und Auszahlungen gruppiert. Der jährliche Kontostand ist der Endstand des letzten Monats im jeweiligen Jahr.

### Einnahmen-Stack
```text
Einnahmen =
  Start-EK
  + Kostenbeiträge
  + Anlagebeiträge
  + Nutzungsentgelte
  + Reservebeiträge
  + Darlehensauszahlung
  + effektive Mieterträge
  + USt-Erstattung
```

### Ausgaben-Stack
```text
Ausgaben =
  Kaufpreis
  + USt beim Kauf
  + Erwerbsnebenkosten
  + Pfandrecht-/Eintragungsannahme
  + Renovierungen
  + Betriebskosten
  + Zins
  + Tilgung
```

### Liquiditätsformel
```text
Kontostand Monatsende =
  Kontostand Monatsbeginn
  + Einzahlungen
  - Auszahlungen
```

Wenn ein Monat negativ wird, erzeugt die App eine Liquiditätswarnung. Die Bankkonto-Sicht verwendet den berechneten monatlichen Liquiditätsendstand als `closingBalance`.

### Rücklagenwirkung
Reservebeiträge sind in der Bankkonto-Sicht Einzahlungen. Sie erhöhen den Kontostand, solange keine tatsächliche Ausgabe dagegensteht. Die Zuführung in eine interne Rücklage ist daher nicht automatisch "weg", sondern zunächst Liquidität mit Zweckbindung. Erst eine Reparatur-, Renovierungs- oder andere Drittzahlung reduziert den Bankkontostand als Ausgabe.

### Quelle
- Quelle: Liquiditäts- und Bankkonto-Zahlungsfluss
- Herausgeber: Projektteam RenntnerHazienda
- Link: [calculateLiquidity.ts](../simTool/src/calculations/calculateLiquidity.ts)
- Link: [calculateCashflow.ts](../simTool/src/calculations/calculateCashflow.ts)
- Stand/Veröffentlichungsdatum: Projektstand 2026-06-05
- Abrufdatum: 2026-06-05
- Geltungsbereich: internes App-Modell
- Stabilität: niedrig

## 12. Umsatzsteuer im Modell

### Kernaussage
Das Modell kann eine Umsatzsteuer beim Kauf und eine spätere USt-Erstattung als Liquiditätsposition abbilden. Es entscheidet nicht, ob ein Vorsteuerabzug tatsächlich möglich ist, welcher Steuersatz anzuwenden ist oder ob eine Vermietung umsatzsteuerpflichtig, steuerfrei oder als Beherbergung einzuordnen ist.

### App-Logik
```text
USt beim Kauf =
  Kaufpreis * USt-Satz % / 100

USt-Erstattung =
  USt beim Kauf * erstattbarer Anteil % / 100

USt-Erstattung fließt im eingestellten Erstattungsmonat in das Bankkonto.
```

### Prüfpunkte
- Ob beim Kauf überhaupt Umsatzsteuer anfällt.
- Ob und in welcher Höhe Vorsteuerabzug möglich ist.
- Ob Eigennutzung eine Vorsteuerkorrektur oder Eigenverbrauchsfolgen auslösen kann.
- Ob kurzfristige Vermietung, Beherbergung, Wohnraumvermietung, Parkplatz-/Garagenanteile oder Kleinunternehmerregelung relevant sind.

### Quelle
- Quelle: USt- und Liquiditätsberechnung
- Herausgeber: Projektteam RenntnerHazienda
- Link: [financialInputs.ts](../simTool/src/calculations/financialInputs.ts)
- Link: [calculateLiquidity.ts](../simTool/src/calculations/calculateLiquidity.ts)
- Stand/Veröffentlichungsdatum: Projektstand 2026-06-05
- Abrufdatum: 2026-06-05
- Geltungsbereich: internes App-Modell
- Stabilität: niedrig

### Externe Quelle
- Quelle: Vermietung und Verpachtung in der Umsatzsteuer
- Herausgeber: Bundesministerium für Finanzen
- Link: https://www.bmf.gv.at/themen/steuern/immobilien-grundstuecke/vermietung-verpachtung/vermietung-und-verpachtung-in-der-umsatzsteuer.html
- Stand/Veröffentlichungsdatum: letzte Aktualisierung 01.01.2026
- Abrufdatum: 2026-06-05
- Geltungsbereich: Österreich, Umsatzsteuer
- Stabilität: mittel

## 19. Aktuelle Erweiterung: vier Sichten und Kennungen

### Kernaussage
Die aktuelle App ergänzt das Projektmodell um Objektkennung, Fallkennung, Szenariokennung und Annahmenquelle. Die Auswertung fasst die Ergebnisse zusätzlich in vier Sichten zusammen: Objektsicht, Rechtsträgersicht, Mitgliedersicht und Banksicht.

### App-Felder
```text
Objektkennung = property.data.objektkennung
Fallkennung = strategy.data.fallkennung
Szenariokennung = strategy.data.szenariokennung
Annahmenquelle = strategy.data.annahmenquelle
```

### Quelle
- Quelle: Sichtenzusammenfassung
- Herausgeber: Projektteam RenntnerHazienda
- Link: ../simTool/src/calculations/calculateSichten.ts
- Link: ../simTool/src/modules/property/schema.ts
- Link: ../simTool/src/modules/strategy/schema.ts
- Stand/Veröffentlichungsdatum: Projektstand 2026-06-05
- Abrufdatum: 2026-06-05
- Geltungsbereich: internes App-Modell
- Stabilität: niedrig

## 20. Aktuelle Erweiterung: saldierte Mittelherkunft und Mittelverwendung

### Kernaussage
Die Darlehenshöhe entsteht jetzt aus saldierter Mittelherkunft und Mittelverwendung. Im automatischen Modus wird das Bankdarlehen als Restgröße berechnet. Im manuellen Modus erzeugt ein zu niedriges oder zu hohes Bankdarlehen eine Finanzierungslücke oder einen Überschuss.

### App-Formeln
```text
Gesamtmittelverwendung =
  Summe Bruttobeträge aller Mittelverwendungen

Nicht-Bank-Mittelherkunft =
  Summe Mittelherkunft ohne Zahlungsklasse Bankdarlehen

Automatisch saldiertes Bankdarlehen =
  max(0, Gesamtmittelverwendung - Nicht-Bank-Mittelherkunft)

Finanzierungslücke =
  max(0, Gesamtmittelverwendung - Gesamtmittelherkunft)
```

### Quelle
- Quelle: Mittelherkunft-/Mittelverwendungsberechnung
- Herausgeber: Projektteam RenntnerHazienda
- Link: ../simTool/src/calculations/financialInputs.ts
- Link: ../simTool/src/modules/financing/schema.ts
- Stand/Veröffentlichungsdatum: Projektstand 2026-06-05
- Abrufdatum: 2026-06-05
- Geltungsbereich: internes App-Modell
- Stabilität: niedrig

## 21. Aktuelle Erweiterung: operativer Wasserfall, Ergebnisrechnung und Vermögensübersicht

### Kernaussage
Der Bankkonto-Zahlungsfluss bleibt eine Liquiditätssicht. Zusätzlich werden operative Wasserfälle, Ergebnisrechnung und Vermögensübersicht berechnet, damit Bank, Steuerberatung und Beteiligte unterschiedliche Fragen prüfen können.

### App-Logik
```text
Bankprüfungs-Zahlungsfluss =
  operative Einzahlungen
  - variable Betriebskosten
  - fixe Betriebskosten
  - Instandhaltungs- und Ausbaureserve
  - Verwaltung / Recht / Buchhaltung

Ergebnis vor Steuern =
  Erlöse
  - Betriebskosten
  - Abschreibung
  - Zinsaufwand

Eigenkapital laut Vermögensübersicht =
  Vermögen
  - Verbindlichkeiten
```

### Quelle
- Quelle: Bankkonto- und Jahresauswertungen
- Herausgeber: Projektteam RenntnerHazienda
- Link: ../simTool/src/calculations/calculateCashflow.ts
- Stand/Veröffentlichungsdatum: Projektstand 2026-06-05
- Abrufdatum: 2026-06-05
- Geltungsbereich: internes App-Modell
- Stabilität: niedrig

## 22. Aktuelle Erweiterung: Banksicht

### Kernaussage
Die Banksicht berechnet Beleihungsauslauf, Kapitaldienst, Kapitaldienstdeckungsgrad, persönliche Belastungsquote, Laufzeit und Stressfälle. Die FMA-Leitplanken werden als Richtwerte angezeigt, nicht als automatisches Rechtsurteil. Die persönliche Belastungsquote bleibt `offen`, wenn keine Monatsnettoeinkommen je Beteiligtem eingetragen sind.

### App-Formeln
```text
Beleihungsauslauf =
  Bankdarlehen / Wertbasis der Bank * 100

Kapitaldienstdeckungsgrad =
  Bankprüfungs-Zahlungsfluss Jahr 1 / Kapitaldienst Jahr 1

Persönliche Belastungsquote =
  Summe Monatszahlungen Beteiligte / Summe Monatsnettoeinkommen Beteiligte * 100
```

### Stressfälle
Die App berechnet vier Stressfälle:

- `Zins +2 Prozentpunkte`: Annuität wird mit zwei Prozentpunkten höherem Zinssatz neu gerechnet.
- `Fremderlös -50 %`: Bankprüfungs-Zahlungsfluss wird um 50 % des Fremderlöses reduziert.
- `Betriebskosten +20 %`: Bankprüfungs-Zahlungsfluss wird um 20 % der Betriebskosten reduziert.
- `Ausfall größter Beteiligtenbeitrag`: Bankprüfungs-Zahlungsfluss wird um den höchsten Jahresbeitrag eines Beteiligten reduziert.

Jeder Stressfall bekommt einen Kapitaldienstdeckungsgrad und den Status `tragfähig`, `angespannt` oder `kritisch`.

### Quelle
- Quelle: Banksicht-Berechnung
- Herausgeber: Projektteam RenntnerHazienda
- Link: ../simTool/src/calculations/calculateBankView.ts
- Stand/Veröffentlichungsdatum: Projektstand 2026-06-05
- Abrufdatum: 2026-06-05
- Geltungsbereich: internes App-Modell
- Stabilität: niedrig

### Externe Quelle
- Quelle: FMA erwartet nach Auslaufen der KIM-V solide Wohnkreditvergabe
- Herausgeber: Finanzmarktaufsicht Österreich
- Link: https://www.fma.gv.at/kim-v-ende-fma-erwartet-stabile-kreditvergabe/
- Stand/Veröffentlichungsdatum: 26.06.2025
- Abrufdatum: 2026-06-05
- Geltungsbereich: Österreich, private Wohnimmobilienkredite
- Stabilität: mittel

## 23. Aktuelle Erweiterung: Eigennutzungswert und Fremdvermietung

### Kernaussage
Die Belegungsrechnung trennt Eigennutzung und Fremdvermietung. Eigennutzung wird über Marktwertverdrängung und Kostenuntergrenze bewertet; der höhere Wert ist der wirtschaftliche Eigennutzungswert. Fremdgastnächte sind Zimmernächte.

### Quelle
- Quelle: Belegungsberechnung
- Herausgeber: Projektteam RenntnerHazienda
- Link: ../simTool/src/calculations/calculateOccupancy.ts
- Stand/Veröffentlichungsdatum: Projektstand 2026-06-05
- Abrufdatum: 2026-06-05
- Geltungsbereich: internes App-Modell
- Stabilität: niedrig

## 13. Nutzungsentgelt, Nutzungspunkte und Zimmernächte

### Kernaussage
Das Nutzungsentgelt ist ein monatlicher EUR-Betrag. Daraus entsteht ein Jahres-Nutzungsbudget. Dieses Budget wird in interne Nutzungspunkte bzw. leistbare Zimmernächte umgerechnet. Eine Nutzungspunkt-Nacht entspricht einer Zimmernacht, nicht einer ganzen Hausnacht.

### App-Formel
```text
Jahres-Nutzungsbudget Eigner =
  monatliches Nutzungsentgelt * 12

Nutzungsquote Eigner =
  Jahres-Nutzungsbudget Eigner / Summe Jahres-Nutzungsbudgets * 100

Interne Nutzungspunkte, technischer Alias `annualPoints` =
  Jahres-Nutzungsbudget
```

Die aktuelle interne Basiseinheit ist damit:
```text
1 EUR Jahres-Nutzungsbudget = 1 interner Nutzungspunkt
```

### Zimmernachtpreis
```text
Zimmernachtpreis =
  Basispreis pro Zimmernacht
  * Wochenend-/Wochentagsmultiplikator
  * Saisonmultiplikator
```

Die App unterscheidet:
- Montag bis Donnerstag
- Freitag
- Samstag/Sonntag
- Winter/Ski
- Sommer
- Frühling
- Herbst

### Leistbare Zimmernächte
Für die Anzeige wird ein Durchschnitt aus Beispielnacht-Typen berechnet. Dieser Wert ist ein grober Orientierungswert und keine echte Buchungsplanung.

```text
leistbare Zimmernächte je Beispieltyp =
  floor(Jahres-Nutzungsbudget / Zimmernachtpreis des Beispieltyps)

durchschnittlich leistbare Zimmernächte =
  Durchschnitt der Beispieltyp-Ergebnisse
```

### Quelle
- Quelle: Punkte- und Nutzungsberechnung
- Herausgeber: Projektteam RenntnerHazienda
- Link: [calculatePoints.ts](../simTool/src/calculations/calculatePoints.ts)
- Link: [property/defaults.ts](../simTool/src/modules/property/defaults.ts)
- Stand/Veröffentlichungsdatum: Projektstand 2026-06-05
- Abrufdatum: 2026-06-05
- Geltungsbereich: internes App-Modell
- Stabilität: niedrig

## 14. Belegung und Wochenenddruck

### Kernaussage
Die Belegung wird in Zimmernächten gerechnet. Die Kapazität eines Hauses ergibt sich primär aus der Zahl der Schlafzimmer. Wenn Schlafzimmer fehlen, wird aus Betten eine Zimmerkapazität abgeleitet. Ohne Schlafzimmer- oder Bettenangabe wird die Kapazität als unvollständig markiert.

### App-Formel
```text
Zimmerkapazität =
  Schlafzimmer
  oder ceil(Betten / 2)

Zimmernacht-Kapazität Jahr =
  Zimmerkapazität * 365

Wochenend-Zimmernacht-Kapazität =
  Zimmerkapazität * Anzahl Freitag/Samstag/Sonntag im Modelljahr 2026

Eigennutzung Zimmernächte =
  Summe durchschnittlich leistbare Zimmernächte aller Eigner

Fremdgast-Zimmernächte =
  Hauswert oder Projektwert, Default 60

Belegte Zimmernächte =
  Eigennutzung Zimmernächte + Fremdgast-Zimmernächte

Freie Zimmernächte =
  max(0, Zimmernacht-Kapazität Jahr - belegte Zimmernächte)
```

### Wochenendmodell
Das Modell nimmt an, dass Eigentümer überwiegend am Wochenende nutzen. Der Default liegt bei `80 %` Eigentümer-Wochenendanteil und `50 %` Fremdgast-Wochenendanteil.

```text
Wochenendbedarf =
  Eigennutzung Zimmernächte * Eigentümer-Wochenendanteil
  + Fremdgast-Zimmernächte * Fremdgast-Wochenendanteil
```

Der Belegungsdruck wird aus Gesamtbelegung und Wochenendbelegung abgeleitet. Maßgeblich ist der höhere Wert.

| Wert | Label |
|---:|---|
| ab 95 % | kritisch |
| ab 75 % | angespannt |
| ab 50 % | realistisch |
| darunter | komfortabel |

### Quelle
- Quelle: Belegungsberechnung
- Herausgeber: Projektteam RenntnerHazienda
- Link: [calculateOccupancy.ts](../simTool/src/calculations/calculateOccupancy.ts)
- Link: [strategy/defaults.ts](../simTool/src/modules/strategy/defaults.ts)
- Stand/Veröffentlichungsdatum: Projektstand 2026-06-05
- Abrufdatum: 2026-06-05
- Geltungsbereich: internes App-Modell
- Stabilität: niedrig

## 15. Hausvergleich

### Kernaussage
Der Hausvergleich ist eine Vergleichsansicht für Kandidatenhäuser. Er verwendet Objektfelder wie Preis, Wohnfläche, Grundstück, Schlafzimmer, Entfernung, Skigebietsdaten, Nebenkosten und Gästeannahmen. Der aktive Kandidat kann in das aktive Objekt übernommen werden.

### Modellgrenze
Der Hausvergleich ist derzeit eine grobe Scoring- und Vergleichsansicht. Der detaillierte Belegungsrechner arbeitet separat mit Zimmernächten und Wochenenddruck. Vergleichswerte aus Excel- oder Maps-Fallbackdaten müssen als Datenqualität `Excel/Fallback` oder vergleichbar gekennzeichnet und vor einer Entscheidung geprüft werden.

### Quelle
- Quelle: Hausvergleichsberechnung
- Herausgeber: Projektteam RenntnerHazienda
- Link: [calculateHouseComparison.ts](../simTool/src/calculations/calculateHouseComparison.ts)
- Link: [property/houseCandidates.ts](../simTool/src/modules/property/houseCandidates.ts)
- Stand/Veröffentlichungsdatum: Projektstand 2026-06-05
- Abrufdatum: 2026-06-05
- Geltungsbereich: internes App-Modell
- Stabilität: niedrig

## 16. Rechtsformkosten im Modell

### Kernaussage
Die Rechtsform wird im Modell nicht juristisch bewertet. Die App kann aber Gründungskosten und laufende Buchhaltungs-, Verwaltungs- und Compliancekosten berücksichtigen. Wenn belastbare Kosten fehlen, kann der Kostenstatus auf `missing` stehen; dann sollen Kostenannahmen nicht verdeckt als geprüfte Werte erscheinen.

### App-Logik
```text
Rechtsform-Gründungskosten =
  foundingCostAmount

laufende Rechtsformkosten pro Jahr =
  annualAccountingCostAmount
  + annualAdministrationCostAmount
  + annualComplianceCostAmount

monatliche laufende Rechtsformkosten =
  laufende Rechtsformkosten pro Jahr / 12
```

Die Gründungskosten erhöhen den Kapitalbedarf. Laufende Kosten gehen in den operativen Zahlungsfluss ein.

### Quelle
- Quelle: Rechtsform-Default und Finanzinput
- Herausgeber: Projektteam RenntnerHazienda
- Link: [legal-form/defaults.ts](../simTool/src/modules/legal-form/defaults.ts)
- Link: [financialInputs.ts](../simTool/src/calculations/financialInputs.ts)
- Stand/Veröffentlichungsdatum: Projektstand 2026-06-05
- Abrufdatum: 2026-06-05
- Geltungsbereich: internes App-Modell
- Stabilität: niedrig

### Externe Quelle
- Quelle: eGründung / Unternehmensformen online gründen
- Herausgeber: Unternehmensserviceportal / Bundeskanzleramt
- Link: https://www.usp.gv.at/en/services/egruendung.html
- Stand/Veröffentlichungsdatum: letzte Aktualisierung 01.01.2026
- Abrufdatum: 2026-06-05
- Geltungsbereich: Österreich, Unternehmensgründung
- Stabilität: mittel

## 17. Standard-Demo-Szenario

### Kernaussage
Das Default-Projekt ist als Demo-Szenario gekennzeichnet. Es verwendet konkrete Objekt- und Eignerdaten aus dem Projektkontext. Diese Daten sind keine objektneutrale Wiki-Aussage und keine Kaufempfehlung.

### Aktuelle Demo-Werte aus Tests und Defaults
| Kennzahl | Wert im aktuellen Default |
|---|---:|
| Kaufpreis | 670.000 EUR |
| Nebenkosten | 40.870 EUR |
| Pfandrecht-/Eintragungsannahme | 8.040 EUR |
| Initiale Reserve | 30.000 EUR |
| Gesamtprojektbedarf | 748.910 EUR |
| Summe Start-EK | 225.000 EUR |
| Darlehensbetrag | 523.910 EUR |
| erste monatliche Annuität bei 4 %, 25 Jahre | ca. 2.765,39 EUR |
| erster Monatszins | ca. 1.746,37 EUR |
| Default-Zimmerkapazität | 5 Schlafzimmer |
| Fremdgast-Zimmernächte/Jahr | 60 |

### Quelle
- Quelle: Default-Templates und Regressionsdaten
- Herausgeber: Projektteam RenntnerHazienda
- Link: [property/defaults.ts](../simTool/src/modules/property/defaults.ts)
- Link: [ownership/defaults.ts](../simTool/src/modules/ownership/defaults.ts)
- Link: [financing/defaults.ts](../simTool/src/modules/financing/defaults.ts)
- Link: [calculations.test.ts](../simTool/src/calculations/calculations.test.ts)
- Stand/Veröffentlichungsdatum: Projektstand 2026-06-05
- Abrufdatum: 2026-06-05
- Geltungsbereich: internes Demo-Szenario
- Stabilität: niedrig

## 18. Plausibilitäts- und Prüfpunkte

### Kernaussage
Die App kann rechnerische Zusammenhänge sichtbar machen, aber sie ersetzt keine Einzelfallprüfung. Besonders kritisch sind Finanzierungsfähigkeit, Rechtsform, steuerliche Behandlung von Nutzungsbeiträgen, Vermietung, Vorsteuer, Grundverkehr, Widmung und lokale Abgaben.

### Prüfliste
- Stimmen Kaufpreis, Nebenkosten, Pfandbetrag und tatsächliche Bankspesen?
- Ist die Pfandrecht-/Eintragungsannahme auf den richtigen Pfandbetrag bezogen?
- Ist USt beim Kauf relevant und ist Vorsteuerabzug realistisch?
- Sind Nutzungsbeiträge steuerlich als Entgelt, Umlage, Privatnutzung oder anders zu behandeln?
- Sind Mieteinnahmen konservativ genug angesetzt?
- Sind Betriebskosten-Positionen vollständig und realistisch?
- Wird die interne Rücklage tatsächlich auf dem Bankkonto gehalten?
- Sind Sonderumlagen, Ausfall eines Eigners und größere Reparaturen abbildbar?
- Passt die Darlehensrate zur Bankprüfung der Beteiligten?
- Ist die Nutzung als Ferienhaus, Eigennutzung und/oder Vermietung lokal zulässig?

### Quelle
- Quelle: Projektinterne Berechnungsmodule
- Herausgeber: Projektteam RenntnerHazienda
- Link: [calculateAll.ts](../simTool/src/calculations/calculateAll.ts)
- Link: [calculateCashflow.ts](../simTool/src/calculations/calculateCashflow.ts)
- Link: [calculateLiquidity.ts](../simTool/src/calculations/calculateLiquidity.ts)
- Stand/Veröffentlichungsdatum: Projektstand 2026-06-05
- Abrufdatum: 2026-06-05
- Geltungsbereich: internes App-Modell
- Stabilität: niedrig

### Externe Quellen
- Quelle: Nebenkosten beim Wohnungs- und Grundstückskauf
- Herausgeber: oesterreich.gv.at / Bundesministerium für Justiz
- Link: https://www.oesterreich.gv.at/de/themen/bauen_und_wohnen/wohnen/8/Seite.210150
- Stand/Veröffentlichungsdatum: letzte Aktualisierung 01.01.2026
- Abrufdatum: 2026-06-05
- Geltungsbereich: Österreich, Immobilienkauf
- Stabilität: mittel

- Quelle: FMA erwartet nach Auslaufen der KIM-V solide Wohnkreditvergabe
- Herausgeber: Finanzmarktaufsicht Österreich
- Link: https://www.fma.gv.at/kim-v-ende-fma-erwartet-stabile-kreditvergabe/
- Stand/Veröffentlichungsdatum: 26.06.2025
- Abrufdatum: 2026-06-05
- Geltungsbereich: Österreich, Wohnimmobilienkreditvergabe
- Stabilität: mittel

- Quelle: Vermietung und Verpachtung in der Umsatzsteuer
- Herausgeber: Bundesministerium für Finanzen
- Link: https://www.bmf.gv.at/themen/steuern/immobilien-grundstuecke/vermietung-verpachtung/vermietung-und-verpachtung-in-der-umsatzsteuer.html
- Stand/Veröffentlichungsdatum: letzte Aktualisierung 01.01.2026
- Abrufdatum: 2026-06-05
- Geltungsbereich: Österreich, Umsatzsteuer
- Stabilität: mittel
