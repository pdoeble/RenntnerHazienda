import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { useEffect, useState, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import type { CalculationResult } from "../../calculations/types";
import {
  VISUALIZATION_LABELS,
  VISUALIZATION_TAB_ORDER,
  type VisualizationTab
} from "../../state/uiStore";
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
    case "liquidity":
      return <LiquidityView result={result} />;
    case "contributions":
      return <ContributionsView result={result} />;
    case "points":
      return <PointsView result={result} />;
    case "myShare":
      return <MyShareView result={result} />;
    case "cashflow":
      return <CashflowView result={result} />;
    case "debt":
      return <DebtView result={result} />;
    case "wiki":
      return <WikiView />;
    case "timeline":
      return <TimelineView result={result} />;
  }
}

function PointsView({ result }: { result: CalculationResult }) {
  const chartData = result.points.owners.map((owner) => ({
    owner: owner.ownerName,
    punkte: owner.annualPoints,
    naechte: owner.affordableNightsAverage
  }));

  return (
    <div className="visualization-view">
      <MetricGrid
        metrics={[
          ["Jahrespunkt-Pool", result.points.annualPointPool.toLocaleString("de-DE")],
          ["Kapazitaet", `${result.points.capacity} Betten/Einheiten`],
          ["Modus", pointModeLabel(result.points.shareMode)]
        ]}
      />
      <ChartFrame>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="owner" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="punkte" fill="#0f766e" />
            <Bar dataKey="naechte" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </ChartFrame>
      <DataTable
        headers={[
          "Eigner",
          "Nutzungsbeitrag",
          "Nutzungsanteil",
          "Unternehmensanteil",
          "Punkte-Anteil",
          "Jahrespunkte",
          "Ø Naechte"
        ]}
        rows={result.points.owners.map((owner) => [
          owner.ownerName,
          owner.usagePointBudget.toLocaleString("de-DE"),
          `${owner.usageSharePct.toFixed(2)}%`,
          `${owner.companySharePct.toFixed(2)}%`,
          `${owner.pointSharePct.toFixed(2)}%`,
          owner.annualPoints.toLocaleString("de-DE"),
          owner.affordableNightsAverage.toString()
        ])}
      />
      <DataTable
        headers={["Nacht-Typ", "Punkte je Nacht"]}
        rows={result.points.nightTypes.map((nightType) => [
          nightType.label,
          nightType.pointsPerNight.toLocaleString("de-DE")
        ])}
      />
    </div>
  );
}

function MyShareView({ result }: { result: CalculationResult }) {
  const [requestedOwnerId, setRequestedOwnerId] = useState("");
  const [projectionYears, setProjectionYears] = useState(10);
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
  const monthlyContribution =
    result.contributions.recurringContributions[0]?.contributions.find(
      (contribution) => contribution.ownerId === owner?.ownerId
    )?.totalMonthlyContribution ?? 0;
  const companySharePct = owner?.companySharePct ?? 0;
  const projectedValue =
    (companySharePct / 100) *
    result.points.propertyValue *
    Math.pow(1 + result.points.appreciationPercentPerYear / 100, projectionYears);
  const cumulativePayments = monthlyContribution * 12 * projectionYears;

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
          ["Punkte-Anteil", `${owner.pointSharePct.toFixed(2)}%`],
          ["Unternehmensanteil", `${owner.companySharePct.toFixed(2)}%`],
          ["Eigenkapital", formatMoney(initialContribution?.amount ?? 0)],
          ["Monatlicher Beitrag", `${formatMoney(monthlyContribution)}/Monat`],
          ["Jahrespunkte", owner.annualPoints.toLocaleString("de-DE")],
          ["Ø Naechte", owner.affordableNightsAverage.toString()]
        ]}
      />
      <div className="form-section">
        <NumberInput
          label="Projektionsjahre"
          value={projectionYears}
          min={1}
          max={30}
          onChange={setProjectionYears}
        />
        <MetricGrid
          metrics={[
            ["Kumulierte Monatsbeitraege", formatMoney(cumulativePayments)],
            [
              `Vermoegensanteil (${projectionYears} J.)`,
              formatMoney(projectedValue)
            ],
            ["Planungssaldo", formatMoney(projectedValue - cumulativePayments)]
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

function DashboardView({ result }: { result: CalculationResult }) {
  const criticalChecks = result.diagnostics.filter(
    (diagnostic) => diagnostic.severity === "error"
  ).length;
  const monthlyNeed = result.contributions.requiredMonthlyContribution;
  const equityOk =
    result.capitalNeed.actualEquityRatioPct >=
    result.capitalNeed.targetEquityRatioPct;
  const ltv =
    result.capitalNeed.totalProjectNeed > 0
      ? (result.capitalNeed.debtPrincipal /
          result.capitalNeed.totalProjectNeed) *
        100
      : 0;

  return (
    <div className="visualization-view">
      <MetricGrid
        metrics={[
          ["EK-Ziel erreicht", equityOk ? "ja" : "offen"],
          ["EK-Quote", `${result.capitalNeed.actualEquityRatioPct.toFixed(1)}%`],
          ["LTV", `${ltv.toFixed(1)}%`],
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
            ltv <= 85 ? "vorbereitbar" : "kritisch/offen"
          ],
          [
            "Groesste Risiken",
            result.diagnostics[0]?.message ?? "Keine kritischen Diagnosen"
          ]
        ]}
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
          ["Gesamtbedarf", formatMoney(result.capitalNeed.totalProjectNeed)],
          ["Eigner-EK", formatMoney(result.capitalNeed.ownerEquity)],
          ["Darlehen", formatMoney(result.capitalNeed.debtPrincipal)],
          ["USt-Erstattung", formatMoney(result.capitalNeed.vatRefund)]
        ]}
      />
      <ChartFrame>
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
        headers={["Baustein", "Betrag"]}
        rows={result.capitalNeed.items.map((item) => [
          item.label,
          formatMoney(item.amount)
        ])}
      />
    </div>
  );
}

function LiquidityView({ result }: { result: CalculationResult }) {
  const chartData = clampItems(result.liquidity.monthly, 60).map((month) => ({
    month: month.month,
    liquiditaet: month.closingBalance
  }));

  return (
    <div className="visualization-view">
      <MetricGrid
        metrics={[
          ["Minimum", formatMoney(result.liquidity.minimumLiquidity)],
          ["Endstand", formatMoney(result.liquidity.finalLiquidity)],
          [
            "Erster negativer Monat",
            result.liquidity.firstNegativeMonth?.toString() ?? "kein Wert"
          ]
        ]}
      />
      <ChartFrame>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" label={{ value: "Monat", position: "insideBottom", offset: -3 }} />
            <YAxis tickFormatter={(value) => formatMoney(Number(value))} width={92} />
            <Tooltip formatter={(value) => formatMoney(Number(value))} />
            <Legend />
            <Line
              type="monotone"
              dataKey="liquiditaet"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartFrame>
    </div>
  );
}

function ContributionsView({ result }: { result: CalculationResult }) {
  const chartData = result.contributions.initialContributions.map(
    (contribution) => ({
      owner: contribution.ownerName,
      eigenkapital: contribution.amount,
      monatlich:
        result.contributions.recurringContributions[0]?.contributions.find(
          (candidate) => candidate.ownerId === contribution.ownerId
        )?.amount ?? 0
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
            "Initialbedarf",
            formatMoney(result.contributions.requiredInitialContribution)
          ],
          [
            "Monatsbeitrag",
            formatMoney(result.contributions.requiredMonthlyContribution)
          ],
          [
            "Eigner",
            result.contributions.initialContributions.length.toString()
          ]
        ]}
      />
      <ChartFrame>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="owner" />
            <YAxis tickFormatter={(value) => formatMoney(Number(value))} width={92} />
            <Tooltip formatter={(value) => formatMoney(Number(value))} />
            <Legend />
            <Bar dataKey="eigenkapital" fill="#0f766e" />
            <Bar dataKey="monatlich" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </ChartFrame>
      <DataTable
        headers={[
          "Eigner",
          "Anteil",
          "Initiale Einlage",
          "Basis mtl.",
          "Reserve mtl.",
          "Sonderumlage",
          "Monatlich gesamt"
        ]}
        rows={result.contributions.initialContributions.map((contribution) => [
          contribution.ownerName,
          `${contribution.sharePct.toFixed(2)}%`,
          formatMoney(contribution.amount),
          formatMoney(
            result.contributions.recurringContributions[0]?.contributions.find(
              (candidate) => candidate.ownerId === contribution.ownerId
            )?.baseMonthlyObligation ?? 0
          ),
          formatMoney(
            result.contributions.recurringContributions[0]?.contributions.find(
              (candidate) => candidate.ownerId === contribution.ownerId
            )?.reserveTopUp ?? 0
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

function CashflowView({ result }: { result: CalculationResult }) {
  const firstMonth = result.cashflow.monthly[0];
  const firstMonthOpex = firstMonth
    ? firstMonth.recoverableOpex + firstMonth.nonRecoverableOpex
    : 0;
  const chartData = clampItems(result.cashflow.yearly, 10).map((year) => ({
    year: year.year,
    vorBank: year.operatingResult,
    zinsabfluss: -year.interest,
    tilgungsabfluss: -year.principalRepayment,
    vorBeitraegen: year.netCashflowAfterDebtService
  }));

  return (
    <div className="visualization-view">
      <MetricGrid
        metrics={[
          [
            "Cashflow vor Beitraegen kumuliert",
            formatMoney(result.cashflow.cumulativeCashflow)
          ],
          ["Bankrate Monat 1", formatMoney(firstMonth?.debtService ?? 0)],
          ["Zins Monat 1", formatMoney(firstMonth?.interest ?? 0)],
          ["Tilgung Monat 1", formatMoney(firstMonth?.principalRepayment ?? 0)],
          ["Opex Monat 1", formatMoney(firstMonthOpex)],
          [
            "Jahr 1 vor Bank",
            formatMoney(result.cashflow.yearly[0]?.operatingResult ?? 0)
          ],
          [
            "Jahr 1 nach Opex und Bank",
            formatMoney(result.cashflow.yearly[0]?.netCashflowAfterDebtService ?? 0)
          ]
        ]}
      />
      <ChartFrame>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis tickFormatter={(value) => formatMoney(Number(value))} width={92} />
            <Tooltip formatter={(value) => formatMoney(Number(value))} />
            <Legend />
            <Bar dataKey="vorBank" fill="#15803d" />
            <Bar dataKey="zinsabfluss" fill="#b45309" />
            <Bar dataKey="tilgungsabfluss" fill="#7c3aed" />
            <Bar dataKey="vorBeitraegen" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </ChartFrame>
      <DataTable
        headers={[
          "Jahr",
          "Vor Bank",
          "Zinsabfluss",
          "Tilgungsabfluss",
          "Vor Beitraegen"
        ]}
        rows={clampItems(result.cashflow.yearly, 5).map((year) => [
          year.year.toString(),
          formatMoney(year.operatingResult),
          formatMoney(-year.interest),
          formatMoney(-year.principalRepayment),
          formatMoney(year.netCashflowAfterDebtService)
        ])}
      />
      <DataTable
        headers={["Monat 1 Kostenblock", "Art", "Betrag"]}
        rows={firstMonthCostRows(firstMonth)}
      />
    </div>
  );
}

function DebtView({ result }: { result: CalculationResult }) {
  const firstMonth = result.debt.monthlyDebtService[0];
  const chartData = clampItems(result.debt.monthlyDebtService, 300)
    .filter((month) => month.month % 12 === 0)
    .map((month) => ({
      year: Math.floor(month.month / 12) + 1,
      restschuld: month.remainingDebt,
      zins: month.interest,
      tilgung: month.principalRepayment
    }));

  return (
    <div className="visualization-view">
      <MetricGrid
        metrics={[
          ["Initiale Schulden", formatMoney(result.debt.totalInitialDebt)],
          ["Rate Monat 1", formatMoney(firstMonth?.totalPayment ?? 0)],
          ["Zins Monat 1", formatMoney(firstMonth?.interest ?? 0)],
          ["Tilgung Monat 1", formatMoney(firstMonth?.principalRepayment ?? 0)],
          ["Restschuld", formatMoney(result.debt.totalRemainingDebt)],
          ["Gezahlte Zinsen", formatMoney(result.debt.totalInterestPaid)]
        ]}
      />
      <ChartFrame>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis tickFormatter={(value) => formatMoney(Number(value))} width={92} />
            <Tooltip formatter={(value) => formatMoney(Number(value))} />
            <Legend />
            <Line
              type="monotone"
              dataKey="restschuld"
              stroke="#7c3aed"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartFrame>
      <DataTable
        headers={["Jahr", "Restschuld", "Zins mtl.", "Tilgung mtl."]}
        rows={clampItems(chartData, 8).map((year) => [
          year.year.toString(),
          formatMoney(year.restschuld),
          formatMoney(year.zins),
          formatMoney(year.tilgung)
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

function TimelineView({ result }: { result: CalculationResult }) {
  const rows = result.timeline.map((event) => [
    `Monat ${event.month}`,
    event.label,
    event.kind,
    formatMoney(event.amount)
  ]);

  return (
    <div className="visualization-view">
      <MetricGrid
        metrics={[
          ["Ereignisse", result.timeline.length.toString()],
          [
            "Erstes Ereignis",
            result.timeline[0] ? `Monat ${result.timeline[0].month}` : "kein Wert"
          ],
          [
            "Letztes Ereignis",
            result.timeline.at(-1)
              ? `Monat ${result.timeline.at(-1)?.month}`
              : "kein Wert"
          ]
        ]}
      />
      <DataTable
        headers={["Monat", "Ereignis", "Typ", "Betrag"]}
        rows={rows}
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
          <ReactMarkdown>{content}</ReactMarkdown>
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
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

function ChartFrame({ children }: { children: ReactNode }) {
  return <div className="chart-frame">{children}</div>;
}

function DataTable({
  headers,
  rows
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
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
        ? "Opex umlagefaehig"
        : "Opex nicht umlagefaehig",
      formatMoney(item.amount)
    ]),
    [
      "Saldo nach Opex und Bank",
      "Cashflow",
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

function pointModeLabel(mode: CalculationResult["points"]["shareMode"]): string {
  if (mode === "usage") {
    return "Nutzungsbeitrag";
  }
  if (mode === "tier") {
    return "Nutzungsbeitrag";
  }
  if (mode === "equity") {
    return "Unternehmensanteil";
  }
  return "Nutzung + Unternehmensanteil";
}

function looksLikeHtml(text: string): boolean {
  const preview = text.trimStart().slice(0, 200).toLowerCase();
  return preview.startsWith("<!doctype") || preview.startsWith("<html");
}
