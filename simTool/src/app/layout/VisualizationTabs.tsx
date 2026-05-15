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
import type { ReactNode } from "react";
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
    case "cashflow":
      return <CashflowView result={result} />;
    case "debt":
      return <DebtView result={result} />;
    case "timeline":
      return <TimelineView result={result} />;
  }
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
  const chartData = clampItems(result.cashflow.yearly, 10).map((year) => ({
    year: year.year,
    operativ: year.operatingResult,
    zinsen: year.interest,
    tilgung: year.principalRepayment,
    liquiditaet: year.netCashflowAfterDebtService
  }));

  return (
    <div className="visualization-view">
      <MetricGrid
        metrics={[
          ["Liquiditaets-Cashflow kumuliert", formatMoney(result.cashflow.cumulativeCashflow)],
          [
            "Jahr 1 operativ",
            formatMoney(result.cashflow.yearly[0]?.operatingResult ?? 0)
          ],
          [
            "Jahr 1 nach Kapitaldienst",
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
            <Bar dataKey="operativ" fill="#15803d" />
            <Bar dataKey="zinsen" fill="#b45309" />
            <Bar dataKey="tilgung" fill="#7c3aed" />
            <Bar dataKey="liquiditaet" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </ChartFrame>
      <DataTable
        headers={["Jahr", "Operativ", "Zinsen", "Tilgung", "Liquiditaet"]}
        rows={clampItems(result.cashflow.yearly, 5).map((year) => [
          year.year.toString(),
          formatMoney(year.operatingResult),
          formatMoney(year.interest),
          formatMoney(year.principalRepayment),
          formatMoney(year.netCashflowAfterDebtService)
        ])}
      />
    </div>
  );
}

function DebtView({ result }: { result: CalculationResult }) {
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
