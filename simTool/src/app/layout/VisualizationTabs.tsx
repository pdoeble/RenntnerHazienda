import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Cell,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { CalculationResult } from "../../calculations/types";
import {
  VISUALIZATION_LABELS,
  VISUALIZATION_TAB_ORDER,
  type VisualizationTab
} from "../../state/uiStore";
import { HelpPopover } from "../../ui/HelpPopover";
import { ownerColor } from "../../ui/ownerColors";
import { formatMoney } from "../../utils/money";
import { clampItems } from "../../utils/numbers";

type VisualizationTabsProps = {
  result: CalculationResult;
  selectedTab: VisualizationTab;
  onSelectTab: (tab: VisualizationTab) => void;
};

export function VisualizationTabs({
  result,
  selectedTab,
  onSelectTab
}: VisualizationTabsProps) {
  return (
    <div className="panel">
      <div className="tabs" role="tablist" aria-label="Visualisierungs-Tabs">
        {VISUALIZATION_TAB_ORDER.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={tab === selectedTab}
            className={tab === selectedTab ? "active" : ""}
            onClick={() => onSelectTab(tab)}
          >
            {VISUALIZATION_LABELS[tab]}
          </button>
        ))}
      </div>
      <VisualizationBody result={result} selectedTab={selectedTab} />
    </div>
  );
}

function VisualizationBody({
  result,
  selectedTab
}: {
  result: CalculationResult;
  selectedTab: VisualizationTab;
}) {
  switch (selectedTab) {
    case "dashboard":
      return <DashboardView result={result} />;
    case "capitalNeed":
      return <CapitalNeedView result={result} />;
    case "contributions":
      return <ContributionsView result={result} />;
    case "points":
      return <PointsView result={result} />;
    case "myShare":
      return <MyShareView result={result} />;
    case "occupancy":
      return <OccupancyView result={result} />;
    case "cashflow":
      return <CashflowView result={result} />;
    case "debt":
      return <DebtView result={result} />;
    case "wiki":
      return <WikiView />;
  }
}

function PointsView({ result }: { result: CalculationResult }) {
  const usageShareData = result.points.owners.map((owner, index) => ({
    name: owner.ownerName,
    value: owner.usageSharePct,
    color: ownerColor(index)
  }));
  const companyShareData = result.points.owners.map((owner, index) => ({
    name: owner.ownerName,
    value: owner.companySharePct,
    color: ownerColor(index)
  }));

  return (
    <div className="visualization-view">
      <MetricGrid
        metrics={[
          [
            "Theoretischer Zimmernacht-Pool",
            result.points.annualPointPool.toLocaleString("de-DE")
          ],
          ["Zimmerkapazitaet", `${result.points.capacity} Zimmer`],
          ["Nutzungslogik", "EUR-Beitrag -> Zimmernacht-Punkte"]
        ]}
      />
      <div className="pie-chart-grid">
        <SharePieChart title="Nutzungsanteil" data={usageShareData} />
        <SharePieChart title="Unternehmensanteil" data={companyShareData} />
      </div>
      <DataTable
        headers={[
          "Eigner",
          "Nutzungsentgelt mtl.",
          "Jahres-Nutzungsbudget",
          "Nutzungsanteil",
          "Unternehmensanteil",
          "Leistbare Zimmernaechte"
        ]}
        rows={result.points.owners.map((owner) => [
          owner.ownerName,
          formatMoney(owner.monthlyUsageContribution),
          formatMoney(owner.annualUsageBudget),
          `${owner.usageSharePct.toFixed(2)}%`,
          `${owner.companySharePct.toFixed(2)}%`,
          owner.affordableNightsAverage.toString()
        ])}
      />
      <DataTable
        headers={["Zimmernacht-Typ", "Kosten je Zimmernacht"]}
        rows={result.points.nightTypes.map((nightType) => [
          nightType.label,
          formatMoney(nightType.roomNightPrice)
        ])}
      />
    </div>
  );
}

function MyShareView({ result }: { result: CalculationResult }) {
  const [requestedOwnerId, setRequestedOwnerId] = useState("");
  const [projectionYears, setProjectionYears] = useState(25);
  const selectedOwnerId = result.points.owners.some(
    (owner) => owner.ownerId === requestedOwnerId
  )
    ? requestedOwnerId
    : result.points.owners[0]?.ownerId ?? "";

  const owner =
    result.points.owners.find((candidate) => candidate.ownerId === selectedOwnerId) ??
    result.points.owners[0];
  const initialContribution = result.contributions.initialContributions.find(
    (contribution) => contribution.ownerId === owner?.ownerId
  );
  const recurringContribution =
    result.contributions.recurringContributions[0]?.contributions.find(
      (contribution) => contribution.ownerId === owner?.ownerId
    );
  const monthlyCostContribution =
    recurringContribution?.costContributionMonthly ??
    recurringContribution?.baseMonthlyObligation ??
    0;
  const capitalShareOwner = result.capitalShares.owners.find(
    (candidate) => candidate.ownerId === owner?.ownerId
  );
  const personalReturn = result.personalReturns.owners.find(
    (candidate) => candidate.ownerId === owner?.ownerId
  );
  const ownerIndex = result.points.owners.findIndex(
    (candidate) => candidate.ownerId === owner?.ownerId
  );
  const annualProjection =
    personalReturn?.annualProjection.filter(
      (point) => point.year <= projectionYears
    ) ?? [];
  const selectedProjection =
    annualProjection.at(-1) ?? personalReturn?.annualProjection.at(-1);

  if (!owner) {
    return <p className="empty-state">Keine Eigner fuer die Anteilsansicht vorhanden.</p>;
  }

  return (
    <div className="visualization-view">
      <label className="text-field">
        <span>Eigner</span>
        <select
          aria-label="Mein Anteil Eigner"
          value={owner.ownerId}
          onChange={(event) => setRequestedOwnerId(event.currentTarget.value)}
        >
          {result.points.owners.map((candidate) => (
            <option key={candidate.ownerId} value={candidate.ownerId}>
              {candidate.ownerName}
            </option>
          ))}
        </select>
      </label>
      <MetricGrid
        metrics={[
          ["Unternehmensanteil", `${owner.companySharePct.toFixed(2)}%`],
          ["Start-EK", formatMoney(initialContribution?.amount ?? 0)],
          [
            "Kapitalruecklage / Anlage mtl.",
            `${formatMoney(capitalShareOwner?.monthlyCapitalContribution ?? 0)}/Monat`
          ],
          [
            "Anteilswirksamer Kapitalwert",
            formatMoney(capitalShareOwner?.shareEffectiveCapitalValue ?? 0)
          ],
          [
            "Nicht verwaessernder Kapitalwert",
            formatMoney(capitalShareOwner?.nonDilutingCapitalValue ?? 0)
          ],
          ["Kostenbeitrag mtl.", `${formatMoney(monthlyCostContribution)}/Monat`],
          [
            "Nutzungsentgelt mtl.",
            `${formatMoney(owner.monthlyUsageContribution)}/Monat`
          ],
          ["Jahres-Nutzungsbudget", formatMoney(owner.annualUsageBudget)],
          ["Zimmernaechte", owner.affordableNightsAverage.toString()]
        ]}
      />
      <div className="form-section">
        <SectionHeading label="Wert nach 25 Jahren" />
        <MetricGrid
          metrics={[
            [
              "Vermoegenswert nach 25 Jahren",
              formatMoney(personalReturn?.projectedOwnerValue ?? 0)
            ],
            [
              "Investiertes Kapital",
              formatMoney(personalReturn?.investedCapital ?? 0)
            ],
            [
              "Nicht vermoegenswirksame Zahlungen",
              formatMoney(personalReturn?.nonWealthPayments ?? 0)
            ],
            [
              "Durchschnittliche Jahresrendite",
              `${(personalReturn?.averageAnnualReturnPct ?? 0).toFixed(2)}%`
            ],
            [
              "Projekt-Nettovermoegen nach 25 Jahren",
              formatMoney(personalReturn?.projectedProjectNetWorth ?? 0)
            ],
            [
              "Renditemethode",
              returnMethodLabel(personalReturn?.returnMethod)
            ]
          ]}
        />
      </div>
      <div className="form-section">
        <NumberInput
          label="Projektionsjahre"
          value={projectionYears}
          min={1}
          max={30}
          onChange={setProjectionYears}
        />
        <SectionHeading label="Persoenliche Wertentwicklung" />
        <ChartFrame mobileMinWidth={timelineChartWidth(annualProjection.length)}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={annualProjection}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="year"
                label={{
                  value: "Jahr",
                  position: "insideBottom",
                  offset: -2
                }}
              />
              <YAxis
                tickFormatter={(value) => formatMoney(Number(value))}
                width={92}
              />
              <Tooltip formatter={(value) => formatMoney(Number(value))} />
              <Legend />
              <Line
                type="monotone"
                dataKey="cumulativeInvestedCapital"
                name="Vermoegenswirksam eingezahlt"
                stroke="#6f9c95"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="cumulativeTotalPayments"
                name="Insgesamt gezahlt"
                stroke="#d3a06b"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="projectedOwnerValue"
                name="Eigener Nettovermoegenswert"
                stroke={ownerColor(Math.max(0, ownerIndex))}
                strokeWidth={3}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartFrame>
        <MetricGrid
          metrics={[
            [
              "Vermoegenswirksam eingezahlt",
              formatMoney(selectedProjection?.cumulativeInvestedCapital ?? 0)
            ],
            [
              "Insgesamt gezahlt",
              formatMoney(selectedProjection?.cumulativeTotalPayments ?? 0)
            ],
            [
              "Nicht vermoegenswirksam gezahlt",
              formatMoney(selectedProjection?.cumulativeNonWealthPayments ?? 0)
            ],
            [
              `Eigener Nettovermoegenswert (${projectionYears} J.)`,
              formatMoney(selectedProjection?.projectedOwnerValue ?? 0)
            ],
            [
              "Projekt-Nettovermoegen",
              formatMoney(selectedProjection?.projectedProjectNetWorth ?? 0)
            ]
          ]}
        />
      </div>
      <p className="muted">
        Die Anteilsansicht modelliert interne Planungsgroessen. Sie ersetzt keine
        Rechts-, Steuer- oder Finanzierungspruefung.
      </p>
    </div>
  );
}

function OccupancyView({ result }: { result: CalculationResult }) {
  const occupancy = result.occupancy;

  return (
    <div className="visualization-view">
      <MetricGrid
        metrics={[
          ["Haus", occupancy.houseTitle || "offen"],
          ["Kapazitaet", `${occupancy.roomCapacity} Zimmer / ${occupancy.capacityPersons} Personen`],
          ["Basis", occupancy.capacityDataQuality],
          ["Eigennutzung", `${occupancy.ownerDemandRoomNights} Zimmernaechte/Jahr`],
          ["Fremdgaeste", `${occupancy.guestRoomNights} Zimmernaechte/Jahr`],
          ["Freie Zimmernaechte", occupancy.freeRoomNights.toString()],
          [
            "Extern vermietbar",
            `${occupancy.externalRentableRoomNights} Zimmernaechte/Jahr`
          ],
          [
            "Extern belegt",
            `${occupancy.externalOccupiedRoomNights} Zimmernaechte/Jahr`
          ],
          [
            "Externe Auslastung",
            `${occupancy.externalOccupancyPct.toFixed(1)}%`
          ],
          ["Auslastung gesamt", `${occupancy.occupancyPct.toFixed(1)}%`],
          ["Wochenenddruck", `${occupancy.weekendOccupancyPct.toFixed(1)}%`],
          ["Eigennutzungswert", formatMoney(occupancy.ownerUseEconomicValue)],
          ["Belegungsdruck", occupancy.pressureLabel],
          [
            "Punkte je verfuegb. Zimmernacht",
            occupancy.pointsPerAvailableNight.toLocaleString("de-DE")
          ]
        ]}
      />
      <DataTable
        headers={["Kennzahl", "Wert"]}
        rows={[
          ["Schlafzimmer", occupancy.bedrooms?.toString() ?? "offen"],
          ["Betten", occupancy.beds?.toString() ?? "offen"],
          ["Eigner", occupancy.ownerCount.toString()],
          ["Zimmernacht-Kapazitaet", `${occupancy.roomNightCapacity} Zimmernaechte`],
          [
            "Wochenend-Kapazitaet",
            `${occupancy.weekendRoomNightCapacity} Zimmernaechte`
          ],
          [
            "Werktag-Kapazitaet",
            `${occupancy.weekdayRoomNightCapacity} Zimmernaechte`
          ],
          [
            "Eigennutzung geschaetzt",
            `${occupancy.ownerDemandRoomNights} Zimmernaechte`
          ],
          ["Fremdgaeste", `${occupancy.guestRoomNights} Zimmernaechte`],
          [
            "Netto-Fremderloes",
            formatMoney(occupancy.netExternalRevenue)
          ],
          [
            "Eigennutzung Kostenuntergrenze",
            formatMoney(occupancy.ownerUseCostFloorValue)
          ],
          [
            "Eigennutzung Marktwertverdraengung",
            formatMoney(occupancy.ownerUseMarketOffsetValue)
          ],
          [
            "Blockierte Zimmernaechte gesamt",
            `${occupancy.blockedRoomNights} Zimmernaechte`
          ],
          ["Freie Zimmernaechte", `${occupancy.freeRoomNights} Zimmernaechte`],
          [
            "Wochenende belegt",
            `${occupancy.weekendDemandRoomNights} von ${occupancy.weekendRoomNightCapacity}`
          ],
          [
            "Werktage belegt",
            `${occupancy.weekdayDemandRoomNights} von ${occupancy.weekdayRoomNightCapacity}`
          ]
        ]}
      />
      <p className="muted">
        Eine Nutzungseinheit ist eine Zimmernacht. Wochenenddruck trennt Freitag
        bis Sonntag vom restlichen Jahr; die Wochenendanteile stehen in der
        Strategie.
      </p>
    </div>
  );
}

function DashboardView({ result }: { result: CalculationResult }) {
  const criticalChecks = result.diagnostics.filter(
    (diagnostic) => diagnostic.severity === "error"
  ).length;
  const monthlyNeed = result.contributions.requiredMonthlyContribution;
  const equityOk =
    result.capitalNeed.actualEquityRatioPct >=
    result.capitalNeed.targetEquityRatioPct;
  const beleihungsauslauf =
    result.capitalNeed.totalProjectNeed > 0
      ? (result.capitalNeed.debtPrincipal /
          result.capitalNeed.totalProjectNeed) *
        100
      : 0;

  return (
    <div className="visualization-view">
      <MetricGrid
        metrics={[
          ["Objektkennung", result.sichten.objektkennung ?? "offen"],
          ["Fall", result.sichten.fallkennung],
          ["Szenario", result.sichten.szenariokennung],
          ["EK-Ziel erreicht", equityOk ? "ja" : "offen"],
          ["Eigenmittelquote", `${result.capitalNeed.actualEquityRatioPct.toFixed(1)}%`],
          ["Beleihungsauslauf", `${beleihungsauslauf.toFixed(1)}%`],
          [
            "Kapitaldienstdeckungsgrad",
            result.bank.kapitaldienstdeckungsgrad.toFixed(2)
          ],
          [
            "Bankkonto-Endstand",
            formatMoney(result.sichten.rechtstraeger.bankkontoEndstand)
          ],
          [
            "Ausschuettbarer Ueberschuss",
            formatMoney(
              result.sichten.rechtstraeger.ausschuettbarerZahlungsueberschussJahr1
            )
          ],
          ["Monatlicher Restbedarf", formatMoney(monthlyNeed)],
          ["Kritische Diagnosen", criticalChecks.toString()]
        ]}
      />
      <DataTable
        headers={["Pruefpunkt", "Status"]}
        rows={[
          ["Nutzung zulaessig", criticalChecks > 0 ? "kritisch/offen" : "offen"],
          ["Eigenkapital reicht plausibel", equityOk ? "schriftlich pruefen" : "offen"],
          [
            "Bankfaehigkeit plausibel",
            beleihungsauslauf <= 85 ? "vorbereitbar" : "kritisch/offen"
          ],
          [
            "Groesste Risiken",
            result.diagnostics[0]?.message ?? "Keine kritischen Diagnosen"
          ]
        ]}
      />
      <SectionHeading label="Kennzahlenregister" />
      <DataTable
        headers={["Kennzahl", "Berechnung / Grundlage", "Status", "Hinweis"]}
        rows={keyMetricRows(result)}
      />
    </div>
  );
}

function CapitalNeedView({ result }: { result: CalculationResult }) {
  const chartData = result.capitalNeed.items.map((item) => ({
    label: item.label,
    betrag: item.amount
  }));

  return (
    <div className="visualization-view">
      <MetricGrid
        metrics={[
          [
            "Mittelverwendung",
            formatMoney(result.capitalNeed.funding.gesamtMittelverwendung)
          ],
          [
            "Mittelherkunft",
            formatMoney(result.capitalNeed.funding.gesamtMittelherkunft)
          ],
          [
            "Finanzierungsluecke",
            formatMoney(result.capitalNeed.funding.finanzierungsluecke)
          ],
          ["Start-EK", formatMoney(result.capitalNeed.ownerEquity)],
          ["Bankdarlehen", formatMoney(result.capitalNeed.debtPrincipal)],
          ["USt-Erstattung", formatMoney(result.capitalNeed.vatRefund)]
        ]}
      />
      <ChartFrame mobileMinWidth={categoryChartWidth(chartData.length)}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis tickFormatter={(value) => formatMoney(Number(value))} width={92} />
            <Tooltip formatter={(value) => formatMoney(Number(value))} />
            <Bar dataKey="betrag" fill="#0f766e" />
          </BarChart>
        </ResponsiveContainer>
      </ChartFrame>
      <DataTable
        headers={["Bisheriger Baustein", "Betrag"]}
        rows={result.capitalNeed.items.map((item) => [
          item.label,
          formatMoney(item.amount)
        ])}
      />
      <DataTable
        headers={["Mittelverwendung", "Klasse", "Netto", "USt", "Brutto"]}
        rows={result.capitalNeed.funding.mittelverwendung.map((item) => [
          item.label,
          readableUseClass(item.klasse),
          formatMoney(item.nettoBetrag),
          formatMoney(item.umsatzsteuerBetrag),
          formatMoney(item.bruttoBetrag)
        ])}
      />
      <DataTable
        headers={["Mittelherkunft", "Zahlungsklasse", "Betrag", "Rang", "Rueckzahlbar"]}
        rows={result.capitalNeed.funding.mittelherkunft.map((item) => [
          item.label,
          readablePaymentClass(item.zahlungsklasse),
          formatMoney(item.betrag),
          item.rang,
          item.rueckzahlbar ? "ja" : "nein"
        ])}
      />
      <SectionHeading label="Buchungslogik" />
      <DataTable
        headers={["Vorgang", "Soll", "Haben", "Betrag", "Pruefhinweis"]}
        rows={clampItems(result.buchungslogik.rows, 14).map((row) => [
          row.vorgang,
          row.soll,
          row.haben,
          formatMoney(row.betrag),
          row.pruefhinweis
        ])}
      />
      <SectionHeading label="Umsatzsteuer-Matrix" />
      <DataTable
        headers={[
          "Leistungsart",
          "Steuersatz",
          "Steuerbar",
          "Vorsteuerbezug",
          "Pruefhinweis"
        ]}
        rows={result.umsatzsteuer.rows.map((row) => [
          row.leistungsart,
          row.angenommenerSteuersatz,
          readableTaxStatus(row.steuerbar),
          readableTaxStatus(row.vorsteuerbezug),
          row.pruefhinweis
        ])}
      />
    </div>
  );
}

function ContributionsView({ result }: { result: CalculationResult }) {
  const chartData = result.contributions.initialContributions.map(
    (contribution) => ({
      owner: contribution.ownerName,
      startEk: contribution.amount,
      kosten:
        result.contributions.recurringContributions[0]?.contributions.find(
          (candidate) => candidate.ownerId === contribution.ownerId
        )?.costContributionMonthly ?? 0,
      kapital:
        result.contributions.recurringContributions[0]?.contributions.find(
          (candidate) => candidate.ownerId === contribution.ownerId
        )?.capitalContributionMonthly ?? 0,
      nutzung:
        result.contributions.recurringContributions[0]?.contributions.find(
          (candidate) => candidate.ownerId === contribution.ownerId
        )?.usageContributionMonthly ?? 0
    })
  );
  const yearlyContributionRows = result.contributions.recurringContributions.map(
    (schedule) => [
      `Jahr ${Math.floor(schedule.month / 12) + 1}`,
      ...result.contributions.initialContributions.map((owner) =>
        formatMoney(
          schedule.contributions.find(
            (contribution) => contribution.ownerId === owner.ownerId
          )?.amount ?? 0
        )
      )
    ]
  );

  return (
    <div className="visualization-view">
      <MetricGrid
        metrics={[
          [
            "Start-EK gesamt",
            formatMoney(result.contributions.requiredInitialContribution)
          ],
          [
            "Monatszahlung gesamt",
            formatMoney(result.contributions.requiredMonthlyContribution)
          ],
          [
            "Eigner",
            result.contributions.initialContributions.length.toString()
          ]
        ]}
      />
      <ChartFrame mobileMinWidth={categoryChartWidth(chartData.length)}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="owner" />
            <YAxis
              yAxisId="monthly"
              tickFormatter={(value) => formatMoney(Number(value))}
              width={92}
            />
            <YAxis
              yAxisId="equity"
              orientation="right"
              tickFormatter={(value) => formatMoney(Number(value))}
              width={92}
            />
            <Tooltip formatter={(value) => formatMoney(Number(value))} />
            <Legend />
            <Bar
              yAxisId="equity"
              dataKey="startEk"
              name="Start-EK einmalig"
              fill={CONTRIBUTION_COLORS.startEk}
            />
            <Bar
              yAxisId="monthly"
              dataKey="kosten"
              name="Kostenbeitrag mtl."
              fill={CONTRIBUTION_COLORS.kosten}
            />
            <Bar
              yAxisId="monthly"
              dataKey="kapital"
              name="Kapitalruecklage / Anlage mtl."
              fill={CONTRIBUTION_COLORS.kapital}
            />
            <Bar
              yAxisId="monthly"
              dataKey="nutzung"
              name="Nutzungsentgelt mtl."
              fill={CONTRIBUTION_COLORS.nutzung}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartFrame>
      <DataTable
        headers={[
          "Eigner",
          "Unternehmensanteil",
          "Start-EK",
          "Kostenbeitrag mtl.",
          "Kapitalruecklage / Anlage mtl.",
          "Nutzungsentgelt mtl.",
          "Liquiditaetsreserve mtl.",
          "Sonderumlage",
          "Monatlich gesamt"
        ]}
        rows={result.contributions.initialContributions.map((contribution) => [
          contribution.ownerName,
          `${(
            result.capitalShares.owners.find(
              (owner) => owner.ownerId === contribution.ownerId
            )?.companySharePct ?? contribution.sharePct
          ).toFixed(2)}%`,
          formatMoney(contribution.amount),
          formatMoney(
            result.contributions.recurringContributions[0]?.contributions.find(
              (candidate) => candidate.ownerId === contribution.ownerId
            )?.costContributionMonthly ?? 0
          ),
          formatMoney(
            result.contributions.recurringContributions[0]?.contributions.find(
              (candidate) => candidate.ownerId === contribution.ownerId
            )?.capitalContributionMonthly ?? 0
          ),
          formatMoney(
            result.contributions.recurringContributions[0]?.contributions.find(
              (candidate) => candidate.ownerId === contribution.ownerId
            )?.usageContributionMonthly ?? 0
          ),
          formatMoney(
            result.contributions.recurringContributions[0]?.contributions.find(
              (candidate) => candidate.ownerId === contribution.ownerId
            )?.liquidityReserveMonthly ?? 0
          ),
          formatMoney(
            result.contributions.recurringContributions[0]?.contributions.find(
              (candidate) => candidate.ownerId === contribution.ownerId
            )?.specialAssessment ?? 0
          ),
          formatMoney(
            result.contributions.recurringContributions[0]?.contributions.find(
              (candidate) => candidate.ownerId === contribution.ownerId
            )?.totalMonthlyContribution ?? 0
          )
        ])}
      />
      <DataTable
        headers={[
          "Jahr",
          ...result.contributions.initialContributions.map(
            (contribution) => contribution.ownerName
          )
        ]}
        rows={clampItems(yearlyContributionRows, 10)}
      />
    </div>
  );
}

function returnMethodLabel(
  method: "internalRate" | "fallback" | "notAvailable" | undefined
): string {
  switch (method) {
    case "internalRate":
      return "interner Zinsfuss";
    case "fallback":
      return "vereinfachte Jahresrendite";
    case "notAvailable":
    default:
      return "nicht verfuegbar";
  }
}

function CashflowView({ result }: { result: CalculationResult }) {
  const firstMonth = result.cashflow.monthly[0];
  const firstMonthOpex = firstMonth
    ? firstMonth.recoverableOpex + firstMonth.nonRecoverableOpex
    : 0;
  const chartData = clampItems(result.cashflow.bankAccountYearly, 10).map((year) => ({
    year: year.year,
    startEkJahr1: year.year === 1 ? year.startEquity : 0,
    kostenbeitraegeJahr1: year.year === 1 ? year.costContributions : 0,
    kapitalruecklagenJahr1: year.year === 1 ? year.capitalContributions : 0,
    nutzungsentgelteJahr1: year.year === 1 ? year.usageContributions : 0,
    reservebeitraegeJahr1: year.year === 1 ? year.reserveContributions : 0,
    darlehenJahr1: year.year === 1 ? year.debtDrawdown : 0,
    mieteJahr1: year.year === 1 ? year.rentalIncome : 0,
    erstattungJahr1: year.year === 1 ? year.vatRefund : 0,
    kaufJahr1: year.year === 1 ? year.acquisition : 0,
    renovierungJahr1: year.year === 1 ? year.renovation : 0,
    opexJahr1: year.year === 1 ? year.opex : 0,
    zinsJahr1: year.year === 1 ? year.interest : 0,
    tilgungJahr1: year.year === 1 ? year.principalRepayment : 0,
    startEkFolgejahre: year.year === 1 ? 0 : year.startEquity,
    kostenbeitraegeFolgejahre: year.year === 1 ? 0 : year.costContributions,
    kapitalruecklagenFolgejahre: year.year === 1 ? 0 : year.capitalContributions,
    nutzungsentgelteFolgejahre: year.year === 1 ? 0 : year.usageContributions,
    reservebeitraegeFolgejahre: year.year === 1 ? 0 : year.reserveContributions,
    darlehenFolgejahre: year.year === 1 ? 0 : year.debtDrawdown,
    mieteFolgejahre: year.year === 1 ? 0 : year.rentalIncome,
    erstattungFolgejahre: year.year === 1 ? 0 : year.vatRefund,
    kaufFolgejahre: year.year === 1 ? 0 : year.acquisition,
    renovierungFolgejahre: year.year === 1 ? 0 : year.renovation,
    opexFolgejahre: year.year === 1 ? 0 : year.opex,
    zinsFolgejahre: year.year === 1 ? 0 : year.interest,
    tilgungFolgejahre: year.year === 1 ? 0 : year.principalRepayment,
    kontostand: year.closingBalance
  }));

  return (
    <div className="visualization-view">
      <MetricGrid
        metrics={[
          [
            "Kontostand Ende",
            formatMoney(result.liquidity.finalLiquidity)
          ],
          ["Bankrate Monat 1", formatMoney(firstMonth?.debtService ?? 0)],
          ["Zins Monat 1", formatMoney(firstMonth?.interest ?? 0)],
          ["Tilgung Monat 1", formatMoney(firstMonth?.principalRepayment ?? 0)],
          ["Betriebskosten Monat 1", formatMoney(firstMonthOpex)],
          [
            "Einnahmen Jahr 1",
            formatMoney(result.cashflow.bankAccountYearly[0]?.totalIncome ?? 0)
          ],
          [
            "Ausgaben Jahr 1",
            formatMoney(result.cashflow.bankAccountYearly[0]?.totalExpenses ?? 0)
          ]
        ]}
      />
      <ChartFrame mobileMinWidth={timelineChartWidth(chartData.length)}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis
              yAxisId="jahr1"
              tickFormatter={(value) => formatMoney(Number(value))}
              width={92}
            />
            <YAxis
              yAxisId="folgejahre"
              orientation="right"
              tickFormatter={(value) => formatMoney(Number(value))}
              width={92}
            />
            <Tooltip formatter={(value) => formatMoney(Number(value))} />
            <Bar
              yAxisId="jahr1"
              dataKey="startEkJahr1"
              name="Start-EK Jahr 1"
              stackId="einnahmenJahr1"
              fill={BANK_FLOW_COLORS.startEk}
            />
            <Bar
              yAxisId="jahr1"
              dataKey="kostenbeitraegeJahr1"
              name="Kostenbeitrag Jahr 1"
              stackId="einnahmenJahr1"
              fill={BANK_FLOW_COLORS.kostenbeitraege}
            />
            <Bar
              yAxisId="jahr1"
              dataKey="kapitalruecklagenJahr1"
              name="Kapitalruecklage Jahr 1"
              stackId="einnahmenJahr1"
              fill={BANK_FLOW_COLORS.kapitalruecklagen}
            />
            <Bar
              yAxisId="jahr1"
              dataKey="nutzungsentgelteJahr1"
              name="Nutzungsentgelt Jahr 1"
              stackId="einnahmenJahr1"
              fill={BANK_FLOW_COLORS.nutzungsentgelte}
            />
            <Bar
              yAxisId="jahr1"
              dataKey="reservebeitraegeJahr1"
              name="Liquiditaetsreserve Jahr 1"
              stackId="einnahmenJahr1"
              fill={BANK_FLOW_COLORS.reservebeitraege}
            />
            <Bar
              yAxisId="jahr1"
              dataKey="darlehenJahr1"
              name="Darlehen Jahr 1"
              stackId="einnahmenJahr1"
              fill={BANK_FLOW_COLORS.darlehen}
            />
            <Bar
              yAxisId="jahr1"
              dataKey="mieteJahr1"
              name="Miete Jahr 1"
              stackId="einnahmenJahr1"
              fill={BANK_FLOW_COLORS.miete}
            />
            <Bar
              yAxisId="jahr1"
              dataKey="erstattungJahr1"
              name="Erstattung Jahr 1"
              stackId="einnahmenJahr1"
              fill={BANK_FLOW_COLORS.erstattung}
            />
            <Bar
              yAxisId="jahr1"
              dataKey="kaufJahr1"
              name="Kauf/Startkosten Jahr 1"
              stackId="ausgabenJahr1"
              fill={BANK_FLOW_COLORS.kauf}
            />
            <Bar
              yAxisId="jahr1"
              dataKey="renovierungJahr1"
              name="Renovierung Jahr 1"
              stackId="ausgabenJahr1"
              fill={BANK_FLOW_COLORS.renovierung}
            />
            <Bar
              yAxisId="jahr1"
              dataKey="opexJahr1"
              name="Betriebskosten Jahr 1"
              stackId="ausgabenJahr1"
              fill={BANK_FLOW_COLORS.opex}
            />
            <Bar
              yAxisId="jahr1"
              dataKey="zinsJahr1"
              name="Zins Jahr 1"
              stackId="ausgabenJahr1"
              fill={BANK_FLOW_COLORS.zins}
            />
            <Bar
              yAxisId="jahr1"
              dataKey="tilgungJahr1"
              name="Tilgung Jahr 1"
              stackId="ausgabenJahr1"
              fill={BANK_FLOW_COLORS.tilgung}
            />
            <Bar
              yAxisId="folgejahre"
              dataKey="startEkFolgejahre"
              name="Start-EK Folgejahre"
              stackId="einnahmenFolgejahre"
              fill={BANK_FLOW_COLORS.startEk}
            />
            <Bar
              yAxisId="folgejahre"
              dataKey="kostenbeitraegeFolgejahre"
              name="Kostenbeitrag Folgejahre"
              stackId="einnahmenFolgejahre"
              fill={BANK_FLOW_COLORS.kostenbeitraege}
            />
            <Bar
              yAxisId="folgejahre"
              dataKey="kapitalruecklagenFolgejahre"
              name="Kapitalruecklage Folgejahre"
              stackId="einnahmenFolgejahre"
              fill={BANK_FLOW_COLORS.kapitalruecklagen}
            />
            <Bar
              yAxisId="folgejahre"
              dataKey="nutzungsentgelteFolgejahre"
              name="Nutzungsentgelt Folgejahre"
              stackId="einnahmenFolgejahre"
              fill={BANK_FLOW_COLORS.nutzungsentgelte}
            />
            <Bar
              yAxisId="folgejahre"
              dataKey="reservebeitraegeFolgejahre"
              name="Liquiditaetsreserve Folgejahre"
              stackId="einnahmenFolgejahre"
              fill={BANK_FLOW_COLORS.reservebeitraege}
            />
            <Bar
              yAxisId="folgejahre"
              dataKey="darlehenFolgejahre"
              name="Darlehen Folgejahre"
              stackId="einnahmenFolgejahre"
              fill={BANK_FLOW_COLORS.darlehen}
            />
            <Bar
              yAxisId="folgejahre"
              dataKey="mieteFolgejahre"
              name="Miete Folgejahre"
              stackId="einnahmenFolgejahre"
              fill={BANK_FLOW_COLORS.miete}
            />
            <Bar
              yAxisId="folgejahre"
              dataKey="erstattungFolgejahre"
              name="Erstattung Folgejahre"
              stackId="einnahmenFolgejahre"
              fill={BANK_FLOW_COLORS.erstattung}
            />
            <Bar
              yAxisId="folgejahre"
              dataKey="kaufFolgejahre"
              name="Kauf/Startkosten Folgejahre"
              stackId="ausgabenFolgejahre"
              fill={BANK_FLOW_COLORS.kauf}
            />
            <Bar
              yAxisId="folgejahre"
              dataKey="renovierungFolgejahre"
              name="Renovierung Folgejahre"
              stackId="ausgabenFolgejahre"
              fill={BANK_FLOW_COLORS.renovierung}
            />
            <Bar
              yAxisId="folgejahre"
              dataKey="opexFolgejahre"
              name="Betriebskosten Folgejahre"
              stackId="ausgabenFolgejahre"
              fill={BANK_FLOW_COLORS.opex}
            />
            <Bar
              yAxisId="folgejahre"
              dataKey="zinsFolgejahre"
              name="Zins Folgejahre"
              stackId="ausgabenFolgejahre"
              fill={BANK_FLOW_COLORS.zins}
            />
            <Bar
              yAxisId="folgejahre"
              dataKey="tilgungFolgejahre"
              name="Tilgung Folgejahre"
              stackId="ausgabenFolgejahre"
              fill={BANK_FLOW_COLORS.tilgung}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartFrame>
      <CompactChartLegend
        items={BANK_FLOW_LEGEND}
        note="Linke Achse skaliert Jahr 1, rechte Achse skaliert die Folgejahre. Der Tooltip zeigt die exakten Euro-Betraege."
      />
      <ChartFrame mobileMinWidth={timelineChartWidth(chartData.length)}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis tickFormatter={(value) => formatMoney(Number(value))} width={92} />
            <Tooltip formatter={(value) => formatMoney(Number(value))} />
            <Legend />
            <Line
              type="monotone"
              dataKey="kontostand"
              name="Kontostand"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartFrame>
      <DataTable
        title="Bankkonto nach Jahren"
        headers={[
          "Jahr",
          "Einnahmen",
          "Ausgaben vom Bankkonto",
          "Netto",
          "Kontostand"
        ]}
        rows={clampItems(result.cashflow.bankAccountYearly, 10).map((year) => [
          year.year.toString(),
          formatMoney(year.totalIncome),
          formatMoney(year.totalExpenses),
          formatMoney(year.netMovement),
          formatMoney(year.closingBalance)
        ])}
      />
      <DataTable
        title="Monat 1: Zahlungswirksame Kosten"
        headers={["Monat 1 Kostenblock", "Art", "Betrag"]}
        rows={firstMonthCostRows(firstMonth)}
      />
      <DataTable
        title="Bankpruefungs-Zahlungsfluss"
        headers={[
          "Jahr",
          "Bankpruefungs-Zahlungsfluss",
          "Zins",
          "Tilgung",
          "Ausschuettbarer Ueberschuss"
        ]}
        rows={clampItems(result.cashflow.operatingWaterfallYearly, 10).map((year) => [
          year.year.toString(),
          formatMoney(year.bankpruefungsZahlungsfluss),
          formatMoney(year.zins),
          formatMoney(year.planmaessigeTilgung),
          formatMoney(year.ausschuettbarerZahlungsueberschuss)
        ])}
      />
      <DataTable
        title="Ergebnisrechnung"
        headers={["Jahr", "Erloese", "Betriebskosten", "Abschreibung", "Zinsaufwand", "Ergebnis vor Steuern"]}
        rows={clampItems(result.cashflow.ergebnisrechnungYearly, 10).map((year) => [
          year.year.toString(),
          formatMoney(year.erloese),
          formatMoney(year.betriebskosten),
          formatMoney(year.abschreibung),
          formatMoney(year.zinsaufwand),
          formatMoney(year.ergebnisVorSteuern)
        ])}
      />
      <DataTable
        title="Vermoegensuebersicht"
        headers={["Jahr", "Vermoegen", "Bankguthaben", "Verbindlichkeiten", "Eigenkapital", "Saldendifferenz"]}
        rows={clampItems(result.cashflow.vermoegensuebersichtYearly, 10).map((year) => [
          year.year.toString(),
          formatMoney(year.vermoegen),
          formatMoney(year.bankguthaben),
          formatMoney(year.verbindlichkeiten),
          formatMoney(year.eigenkapital),
          formatMoney(year.saldendifferenz)
        ])}
      />
    </div>
  );
}

function DebtView({ result }: { result: CalculationResult }) {
  const firstMonth = result.debt.monthlyDebtService[0];
  const chartData = clampItems(result.debt.monthlyDebtService, 300)
    .reduce<
      {
        year: number;
        restschuld: number;
        zins: number;
        tilgung: number;
      }[]
    >((years, month) => {
      const year = Math.floor(month.month / 12) + 1;
      const existing = years.find((candidate) => candidate.year === year);
      if (existing) {
        existing.zins += month.interest;
        existing.tilgung += month.principalRepayment;
        existing.restschuld = month.remainingDebt;
        return years;
      }
      years.push({
        year,
        restschuld: month.remainingDebt,
        zins: month.interest,
        tilgung: month.principalRepayment
      });
      return years;
    }, []);

  return (
    <div className="visualization-view">
      <MetricGrid
        metrics={[
          ["Initiale Schulden", formatMoney(result.debt.totalInitialDebt)],
          ["Rate Monat 1", formatMoney(firstMonth?.totalPayment ?? 0)],
          ["Zins Monat 1", formatMoney(firstMonth?.interest ?? 0)],
          ["Tilgung Monat 1", formatMoney(firstMonth?.principalRepayment ?? 0)],
          ["Restschuld", formatMoney(result.debt.totalRemainingDebt)],
          ["Gezahlte Zinsen", formatMoney(result.debt.totalInterestPaid)],
          [
            "Kapitaldienstdeckungsgrad",
            result.bank.kapitaldienstdeckungsgrad.toFixed(2)
          ],
          [
            "Beleihungsauslauf",
            `${result.bank.beleihungsauslaufPct.toFixed(1)}%`
          ],
          [
            "FMA-Leitplanke Beleihung",
            `${result.bank.zielBeleihungsauslaufPct.toFixed(0)}%`
          ],
          [
            "Persoenliche Belastungsquote",
            formatOptionalPercent(result.bank.persoenlicheBelastungsquotePct)
          ],
          [
            "Monatszahlungen Beteiligte",
            formatMoney(result.bank.persoenlicheMonatszahlungen)
          ],
          [
            "Monatsnettoeinkommen modelliert",
            formatMoney(result.bank.persoenlichesMonatsnettoeinkommen)
          ],
          [
            "FMA-Leitplanke Laufzeit",
            `${result.bank.fmaLaufzeitRichtwertJahre} Jahre`
          ]
        ]}
      />
      <ChartFrame mobileMinWidth={timelineChartWidth(chartData.length)}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis
              yAxisId="debt"
              tickFormatter={(value) => formatMoney(Number(value))}
              width={92}
            />
            <YAxis
              yAxisId="payment"
              orientation="right"
              tickFormatter={(value) => formatMoney(Number(value))}
              width={92}
            />
            <Tooltip formatter={(value) => formatMoney(Number(value))} />
            <Legend />
            <Line
              yAxisId="debt"
              type="monotone"
              dataKey="restschuld"
              name="Restschuld"
              stroke={DEBT_COLORS.restschuld}
              strokeWidth={2}
              dot={false}
            />
            <Bar
              yAxisId="payment"
              dataKey="zins"
              name="Zins"
              fill={DEBT_COLORS.zins}
            />
            <Bar
              yAxisId="payment"
              dataKey="tilgung"
              name="Tilgung"
              fill={DEBT_COLORS.tilgung}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartFrame>
      <DataTable
        headers={["Jahr", "Restschuld", "Zins p.a.", "Tilgung p.a."]}
        rows={clampItems(chartData, 8).map((year) => [
          year.year.toString(),
          formatMoney(year.restschuld),
          formatMoney(year.zins),
          formatMoney(year.tilgung)
        ])}
      />
      <DataTable
        headers={[
          "Stressfall",
          "Annahme",
          "Bankpruefungs-Zahlungsfluss",
          "Kapitaldienst",
          "Kapitaldienstdeckungsgrad",
          "Status"
        ]}
        rows={result.bank.stressfaelle.map((stressfall) => [
          stressfall.label,
          stressfall.annahme,
          formatMoney(stressfall.bankpruefungsZahlungsfluss),
          formatMoney(stressfall.kapitaldienst),
          stressfall.kapitaldienstdeckungsgrad.toFixed(2),
          stressfall.status
        ])}
      />
      <DataTable
        headers={["Monat", "Rate", "Zins", "Tilgung", "Restschuld"]}
        rows={clampItems(result.debt.monthlyDebtService, 12).map((month) => [
          (month.month + 1).toString(),
          formatMoney(month.totalPayment),
          formatMoney(month.interest),
          formatMoney(month.principalRepayment),
          formatMoney(month.remainingDebt)
        ])}
      />
    </div>
  );
}

const WIKI_DOCS = [
  { path: "wiki/01_overall.md", title: "Gesamtueberblick" },
  { path: "wiki/02_legal.md", title: "Recht" },
  { path: "wiki/03_tax.md", title: "Steuern" },
  { path: "wiki/04_ownership.md", title: "Eigentum" },
  { path: "wiki/05_finance.md", title: "Finanzierung" },
  { path: "wiki/06_usage.md", title: "Nutzung" },
  { path: "wiki/07_operational.md", title: "Betrieb" },
  { path: "wiki/08_calculation_logic.md", title: "Berechnungslogik" },
  { path: "references/260515-DeepResearch1.md", title: "DeepResearch 1" },
  { path: "references/260515-DeepResearch2.md", title: "DeepResearch 2" }
];

function WikiView() {
  const [selectedPath, setSelectedPath] = useState(WIKI_DOCS[0]!.path);
  const [wikiState, setWikiState] = useState({
    path: "",
    content: "",
    status: ""
  });
  const isLoading = wikiState.path !== selectedPath;
  const content = isLoading ? "" : wikiState.content;
  const status = isLoading ? "Laedt..." : wikiState.status;

  useEffect(() => {
    const base = import.meta.env.BASE_URL;
    let cancelled = false;

    fetch(`${base}wiki/${selectedPath}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.text();
      })
      .then((text) => {
        if (looksLikeHtml(text)) {
          throw new Error("HTML fallback erhalten");
        }
        if (!cancelled) {
          setWikiState({
            path: selectedPath,
            content: text,
            status: ""
          });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setWikiState({
            path: selectedPath,
            content: "",
            status:
              error instanceof Error
                ? `Wiki konnte nicht geladen werden: ${error.message}`
                : "Wiki konnte nicht geladen werden."
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedPath]);

  return (
    <div className="visualization-view">
      <label className="text-field">
        <span>Wiki-Dokument</span>
        <select
          aria-label="Wiki-Dokument"
          value={selectedPath}
          onChange={(event) => setSelectedPath(event.currentTarget.value)}
        >
          {WIKI_DOCS.map((doc) => (
            <option key={doc.path} value={doc.path}>
              {doc.title}
            </option>
          ))}
        </select>
      </label>
      {status ? <p className="empty-state">{status}</p> : null}
      {content ? (
        <article className="wiki-document">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </article>
      ) : null}
    </div>
  );
}

function MetricGrid({ metrics }: { metrics: [string, string][] }) {
  return (
    <div className="metric-grid">
      {metrics.map(([label, value]) => (
        <div className="metric" key={label}>
          <span className="metric-label">
            {label}
            {HELP_TEXTS[label] ? (
              <HelpPopover label={label}>{HELP_TEXTS[label]}</HelpPopover>
            ) : null}
          </span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

function SectionHeading({ label }: { label: string }) {
  return (
    <h3 className="section-heading">
      {label}
      {HELP_TEXTS[label] ? (
        <HelpPopover label={label}>{HELP_TEXTS[label]}</HelpPopover>
      ) : null}
    </h3>
  );
}

type SharePieDatum = {
  name: string;
  value: number;
  color: string;
};

const CONTRIBUTION_COLORS = {
  startEk: "#6f9c95",
  kosten: "#d3a06b",
  kapital: "#a58ac9",
  nutzung: "#7aa7c7"
} as const;

const DEBT_COLORS = {
  restschuld: "#65758b",
  zins: "#d8a15f",
  tilgung: "#8bb6d6"
} as const;

const BANK_FLOW_COLORS = {
  startEk: "#6f9c95",
  kostenbeitraege: "#8fbf9f",
  kapitalruecklagen: "#a58ac9",
  nutzungsentgelte: "#7aa7c7",
  reservebeitraege: "#9aa6b2",
  darlehen: "#75a8b8",
  miete: "#8fbd7f",
  erstattung: "#b7c979",
  kauf: "#c87979",
  renovierung: "#d69a86",
  opex: "#d3a06b",
  zins: "#e2b479",
  tilgung: "#9d8bc2"
} as const;

const BANK_FLOW_LEGEND = [
  { label: "Start-EK", color: BANK_FLOW_COLORS.startEk },
  { label: "Kostenbeitrag", color: BANK_FLOW_COLORS.kostenbeitraege },
  { label: "Kapitalruecklage", color: BANK_FLOW_COLORS.kapitalruecklagen },
  { label: "Nutzungsentgelt", color: BANK_FLOW_COLORS.nutzungsentgelte },
  { label: "Darlehen", color: BANK_FLOW_COLORS.darlehen },
  { label: "Miete/Erstattung", color: BANK_FLOW_COLORS.miete },
  { label: "Kauf/Ausbau", color: BANK_FLOW_COLORS.kauf },
  { label: "Betrieb/Bank", color: BANK_FLOW_COLORS.opex }
];

function SharePieChart({
  title,
  data
}: {
  title: string;
  data: SharePieDatum[];
}) {
  return (
    <div className="pie-chart-card">
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height={360}>
        <PieChart margin={{ top: 24, right: 82, bottom: 24, left: 82 }}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={88}
            label={sharePieLabel}
            labelLine
          >
            {data.map((entry) => (
              <Cell key={`${title}-${entry.name}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => `${Number(value).toFixed(2)}%`}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function sharePieLabel(entry: { name?: string; value?: number }): string {
  if (!entry.name || entry.value === undefined) {
    return "";
  }
  return `${entry.name} ${entry.value.toFixed(1)}%`;
}

const HELP_TEXTS: Record<string, string> = {
  "Mittelherkunft":
    "Mittelherkunft zeigt, woher das Projekt Geld bekommt, zum Beispiel Start-EK, Bankdarlehen oder Gesellschafterdarlehen.",
  "Mittelverwendung":
    "Mittelverwendung zeigt, wofuer Geld gebraucht wird, zum Beispiel Kaufpreis, Nebenkosten, Ruecklage oder Ausbau.",
  "Finanzierungsluecke":
    "Eine Finanzierungsluecke entsteht, wenn Mittelverwendung und Mittelherkunft nicht saldieren.",
  "Start-EK":
    "Start-EK ist die einmalige Anfangseinlage und kann Unternehmensanteile begruenden.",
  "Eigenmittelquote":
    "Die Eigenmittelquote zeigt den Anteil echter Eigenmittel an der Gesamtmittelverwendung.",
  "Beleihungsauslauf":
    "Der Beleihungsauslauf setzt Bankdarlehen ins Verhaeltnis zur Wertbasis des Objekts.",
  "Kapitaldienstdeckungsgrad":
    "Der Kapitaldienstdeckungsgrad vergleicht Bankpruefungs-Zahlungsfluss mit Zins und Tilgung.",
  "Persoenliche Belastungsquote":
    "Die persoenliche Belastungsquote setzt modellierte Monatszahlungen der Beteiligten ins Verhaeltnis zum eingetragenen Monatsnettoeinkommen.",
  "Nutzungsentgelt mtl.":
    "Das Nutzungsentgelt bezahlt Nutzungsrechte oder Zimmernaechte und erzeugt keine Unternehmensanteile.",
  "Kostenbeitrag mtl.":
    "Der Kostenbeitrag deckt laufende Kosten wie Zins, Betriebskosten, Verwaltung und Buchhaltung.",
  "Bankkonto-Endstand":
    "Der Bankkonto-Endstand ist Liquiditaet auf dem Projektkonto, nicht steuerlicher Gewinn.",
  "Betriebskosten Monat 1":
    "Betriebskosten sind laufende Ausgaben fuer Betrieb, Verwaltung und Abgaben.",
  "Eigennutzungswert":
    "Der Eigennutzungswert bewertet die Nutzung durch Beteiligte als Kostenuntergrenze oder verdraengten Fremdertrag.",
  "Zimmernacht-Kapazitaet":
    "Eine Zimmernacht ist ein Schlafzimmer oder buchbares Zimmer fuer eine Nacht.",
  "Ausschuettbarer Ueberschuss":
    "Der ausschuettbare Ueberschuss bleibt nach Betrieb, Ruecklagen, Verwaltung, Kapitaldienst und Mindestliquiditaet.",
  "Buchungslogik":
    "Die Buchungslogik ist ein Arbeitsmodell fuer Soll/Haben-Einordnung. Sie ersetzt keinen Kontenplan und keine Steuerberatung.",
  "Umsatzsteuer-Matrix":
    "Die Umsatzsteuer-Matrix markiert je Leistungsart, was steuerlich zu pruefen ist. Offene Felder sind bewusst keine Steuerentscheidung.",
  "Kapitalruecklage / Anlage mtl.":
    "Diese Zahlung ist Vermoegenszufuehrung. Ob sie Unternehmensanteile aendert oder als Ruecklage/Darlehen laeuft, muss vertraglich festgelegt sein.",
  "Anteilswirksamer Kapitalwert":
    "Dieser Wert ist die aufgezinste Kapitalbasis, die in der App tatsaechlich den Unternehmensanteil bestimmt.",
  "Nicht verwaessernder Kapitalwert":
    "Dieser Wert zeigt Kapitalzufuehrungen, die wirtschaftlich sichtbar sind, aber die Unternehmensanteile nicht veraendern.",
  "Wert nach 25 Jahren":
    "Diese Sicht schaetzt den Vermoegenswert nach 25 Jahren. Formel Projekt-Nettovermoegen = Objektwert + Bankkonto - Restschuld.",
  "Vermoegenswert nach 25 Jahren":
    "Eigener Vermoegenswert = Unternehmensanteil * Projekt-Nettovermoegen nach 25 Jahren.",
  "Investiertes Kapital":
    "Investiertes Kapital = Start-EK + vermoegenswirksame Kapitalruecklage oder Anlage bis Jahr 25.",
  "Nicht vermoegenswirksame Zahlungen":
    "Kostenumlage und Nutzungsentgelt sind Zahlungsabfluesse, aber keine eigene Renditebasis.",
  "Durchschnittliche Jahresrendite":
    "Bevorzugt interner Zinsfuss aus Start-EK, laufenden Kapitalzahlungen und Endwert; sonst vereinfachte Formel (Endwert / Investition)^(1/25) - 1.",
  "Projekt-Nettovermoegen nach 25 Jahren":
    "Projekt-Nettovermoegen = geschaetzter Objektwert + Bankkonto-Endstand - Restschuld.",
  "Kennzahlenregister":
    "Das Kennzahlenregister sammelt die wichtigsten Pruefwerte aus Objekt-, Rechtstraeger-, Mitglieder- und Banksicht."
};

function ChartFrame({
  children,
  mobileMinWidth = 720
}: {
  children: ReactNode;
  mobileMinWidth?: number;
}) {
  return (
    <div className="chart-scroll">
      <div
        className="chart-frame"
        style={{ "--chart-mobile-width": `${mobileMinWidth}px` } as CSSProperties}
      >
        {children}
      </div>
    </div>
  );
}

function timelineChartWidth(pointCount: number): number {
  return Math.max(720, pointCount * 38 + 160);
}

function categoryChartWidth(categoryCount: number): number {
  return Math.max(720, categoryCount * 70 + 160);
}

function CompactChartLegend({
  items,
  note
}: {
  items: { label: string; color: string }[];
  note?: string;
}) {
  return (
    <div className="compact-chart-legend">
      <div>
        {items.map((item) => (
          <span className="legend-chip" key={item.label}>
            <span
              className="legend-swatch"
              style={{ backgroundColor: item.color }}
              aria-hidden="true"
            />
            {item.label}
          </span>
        ))}
      </div>
      {note ? <p>{note}</p> : null}
    </div>
  );
}

function DataTable({
  title,
  headers,
  rows
}: {
  title?: string;
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className="table-block">
      {title ? <h3>{title}</h3> : null}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {headers.map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={`${rowIndex}-${row.join("|")}`}>
                {row.map((cell, cellIndex) => (
                  <td key={`${rowIndex}-${cellIndex}`}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function firstMonthCostRows(
  month: CalculationResult["cashflow"]["monthly"][number] | undefined
): string[][] {
  if (!month) {
    return [["Keine Monatswerte", "offen", formatMoney(0)]];
  }

  return [
    ["Mieteinnahmen", "Zufluss", formatMoney(month.effectiveIncome)],
    ["Bank Zins", "Abfluss Bank", formatMoney(month.interest)],
    ["Bank Tilgung", "Abfluss Bank", formatMoney(month.principalRepayment)],
    ...month.opexBreakdown.map((item) => [
      item.label,
      item.recoverableFromTenants
        ? "Betriebskosten umlagefaehig"
        : "Betriebskosten nicht umlagefaehig",
      formatMoney(item.amount)
    ]),
    [
      "Saldo nach Betriebskosten und Bank",
      "Zahlungsfluss",
      formatMoney(month.netCashflowAfterDebtService)
    ]
  ];
}

function NumberInput({
  label,
  value,
  min,
  max,
  onChange
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="text-field">
      <span>{label}</span>
      <input
        aria-label={label}
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
      />
    </label>
  );
}

function readablePaymentClass(value: string): string {
  const labels: Record<string, string> = {
    echtesEigenkapital: "echtes Eigenkapital",
    kapitalruecklage: "Kapitalruecklage",
    nachschuss: "Nachschuss",
    gesellschafterdarlehen: "Gesellschafterdarlehen",
    bankdarlehen: "Bankdarlehen",
    nutzungsentgelt: "Nutzungsentgelt",
    kostenumlage: "Kostenumlage",
    liquiditaetsreserve: "Liquiditaetsreserve",
    vermietungserloes: "Vermietungserloes",
    foerderung: "Foerderung",
    sonstige: "sonstige Zahlung"
  };

  return labels[value] ?? value;
}

function readableUseClass(value: string): string {
  const labels: Record<string, string> = {
    kaufpreis: "Kaufpreis",
    grunderwerbsteuer: "Grunderwerbsteuer",
    grundbuchEigentum: "Grundbuch Eigentum",
    pfandrecht: "Pfandrecht",
    eingabegebuehr: "Eingabegebuehr",
    makler: "Makler",
    vertragNotar: "Vertrag / Notar",
    beglaubigung: "Beglaubigung",
    technischePruefung: "technische Pruefung",
    renovierung: "Renovierung",
    einrichtung: "Einrichtung",
    finanzierungsgebuehr: "Finanzierungsgebuehr",
    sicherheitspuffer: "Sicherheitspuffer",
    anfangsliquiditaet: "Anfangsliquiditaet",
    anfangsruecklage: "Anfangsruecklage",
    gruendungskosten: "Gruendungskosten",
    sonstige: "sonstige Verwendung"
  };

  return labels[value] ?? value;
}

function readableTaxStatus(value: string): string {
  const labels: Record<string, string> = {
    ja: "ja",
    nein: "nein",
    offen: "offen / pruefen"
  };

  return labels[value] ?? value;
}

function formatOptionalPercent(value: number | null): string {
  return value === null ? "offen" : `${value.toFixed(1)}%`;
}

function keyMetricRows(result: CalculationResult): string[][] {
  const fundingGap = result.capitalNeed.funding.finanzierungsluecke;
  const minimumBankAccount = result.liquidity.minimumLiquidity;
  const weekendPressure = result.occupancy.weekendOccupancyPct;
  const vatWarnings = result.umsatzsteuer.diagnostics.length;
  const legalWarnings = result.diagnostics.filter(
    (diagnostic) => diagnostic.domain === "legalForm"
  ).length;
  const criticalStressCases = result.bank.stressfaelle.filter(
    (stressfall) => stressfall.status === "kritisch"
  ).length;

  return [
    [
      "Finanzierungsluecke",
      "Mittelverwendung minus Mittelherkunft",
      fundingGap <= 0 ? "ok" : "kritisch",
      formatMoney(fundingGap)
    ],
    [
      "Kapitaldienstdeckungsgrad",
      "Bankpruefungs-Zahlungsfluss / Kapitaldienst",
      result.bank.kapitaldienstdeckungsgrad >= 1.1 ? "ok" : "kritisch",
      result.bank.kapitaldienstdeckungsgrad.toFixed(2)
    ],
    [
      "Beleihungsauslauf",
      "Bankdarlehen / Wertbasis",
      result.bank.beleihungsauslaufPct <= result.bank.zielBeleihungsauslaufPct
        ? "ok"
        : "kritisch",
      `${result.bank.beleihungsauslaufPct.toFixed(1)}%`
    ],
    [
      "Persoenliche Belastungsquote",
      "Monatszahlungen / Monatsnettoeinkommen",
      result.bank.persoenlicheBelastungsquotePct === null
        ? "offen"
        : result.bank.persoenlicheBelastungsquotePct <=
            result.bank.fmaBelastungsquoteRichtwertPct
          ? "ok"
          : "kritisch",
      formatOptionalPercent(result.bank.persoenlicheBelastungsquotePct)
    ],
    [
      "Mindestliquiditaet",
      "niedrigster Bankkonto-Kontostand",
      minimumBankAccount >= 0 ? "ok" : "kritisch",
      formatMoney(minimumBankAccount)
    ],
    [
      "Wochenenddruck",
      "Wochenend-Zimmernaechte belegt / verfuegbar",
      weekendPressure <= 85 ? "ok" : "kritisch",
      `${weekendPressure.toFixed(1)}%`
    ],
    [
      "Umsatzsteuer-Pruefungen",
      "offene Leistungsarten und Vorsteuerannahmen",
      vatWarnings === 0 ? "ok" : "offen / pruefen",
      `${vatWarnings} Hinweise`
    ],
    [
      "Rechtsform-Pruefungen",
      "Kosten, Zweck, Haftung und Struktur",
      legalWarnings === 0 ? "ok" : "offen / pruefen",
      `${legalWarnings} Hinweise`
    ],
    [
      "Stressfaelle",
      "Zins, Fremderloes, Betriebskosten, Ausfall",
      criticalStressCases === 0 ? "ok" : "kritisch",
      `${criticalStressCases} kritisch`
    ]
  ];
}

function looksLikeHtml(text: string): boolean {
  const preview = text.trimStart().slice(0, 200).toLowerCase();
  return preview.startsWith("<!doctype") || preview.startsWith("<html");
}
