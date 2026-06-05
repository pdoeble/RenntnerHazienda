import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
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
    case "timeline":
      return <TimelineView result={result} />;
  }
}

function PointsView({ result }: { result: CalculationResult }) {
  const chartData = result.points.owners.map((owner) => ({
    owner: owner.ownerName,
    budget: owner.annualUsageBudget,
    zimmernaechte: owner.affordableNightsAverage
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
      <ChartFrame>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="owner" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="budget" name="Jahres-Nutzungsbudget" fill="#0f766e" />
            <Bar dataKey="zimmernaechte" name="Leistbare Zimmernaechte" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </ChartFrame>
      <DataTable
        headers={[
          "Eigner",
          "Nutzungsbeitrag mtl.",
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
  const recurringContribution =
    result.contributions.recurringContributions[0]?.contributions.find(
      (contribution) => contribution.ownerId === owner?.ownerId
    );
  const monthlyContribution = recurringContribution?.totalMonthlyContribution ?? 0;
  const monthlyCostContribution =
    recurringContribution?.costContributionMonthly ??
    recurringContribution?.baseMonthlyObligation ??
    0;
  const capitalShareOwner = result.capitalShares.owners.find(
    (candidate) => candidate.ownerId === owner?.ownerId
  );
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
          ["Unternehmensanteil", `${owner.companySharePct.toFixed(2)}%`],
          ["Start-EK", formatMoney(initialContribution?.amount ?? 0)],
          [
            "Anlagebeitrag mtl.",
            `${formatMoney(capitalShareOwner?.monthlyCapitalContribution ?? 0)}/Monat`
          ],
          ["Kostenbeitrag mtl.", `${formatMoney(monthlyCostContribution)}/Monat`],
          [
            "Nutzungsbeitrag mtl.",
            `${formatMoney(owner.monthlyUsageContribution)}/Monat`
          ],
          ["Jahres-Nutzungsbudget", formatMoney(owner.annualUsageBudget)],
          ["Zimmernaechte", owner.affordableNightsAverage.toString()]
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
          ["Auslastung gesamt", `${occupancy.occupancyPct.toFixed(1)}%`],
          ["Wochenenddruck", `${occupancy.weekendOccupancyPct.toFixed(1)}%`],
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

function ContributionsView({ result }: { result: CalculationResult }) {
  const chartData = result.contributions.initialContributions.map(
    (contribution) => ({
      owner: contribution.ownerName,
      startEk: contribution.amount,
      kosten:
        result.contributions.recurringContributions[0]?.contributions.find(
          (candidate) => candidate.ownerId === contribution.ownerId
        )?.costContributionMonthly ?? 0,
      anlage:
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
      <ChartFrame>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="owner" />
            <YAxis tickFormatter={(value) => formatMoney(Number(value))} width={92} />
            <Tooltip formatter={(value) => formatMoney(Number(value))} />
            <Legend />
            <Bar dataKey="startEk" name="Start-EK" fill="#0f766e" />
            <Bar dataKey="kosten" name="Kostenbeitrag mtl." fill="#b45309" />
            <Bar dataKey="anlage" name="Anlagebeitrag mtl." fill="#7c3aed" />
            <Bar dataKey="nutzung" name="Nutzungsbeitrag mtl." fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </ChartFrame>
      <DataTable
        headers={[
          "Eigner",
          "Unternehmensanteil",
          "Start-EK",
          "Kostenbeitrag mtl.",
          "Anlagebeitrag mtl.",
          "Nutzungsbeitrag mtl.",
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

function CashflowView({ result }: { result: CalculationResult }) {
  const firstMonth = result.cashflow.monthly[0];
  const firstMonthOpex = firstMonth
    ? firstMonth.recoverableOpex + firstMonth.nonRecoverableOpex
    : 0;
  const chartData = clampItems(result.cashflow.bankAccountYearly, 10).map((year) => ({
    year: year.year,
    startEk: year.startEquity,
    kostenbeitraege: year.costContributions,
    anlagebeitraege: year.capitalContributions,
    nutzungsbeitraege: year.usageContributions,
    reservebeitraege: year.reserveContributions,
    darlehen: year.debtDrawdown,
    miete: year.rentalIncome,
    erstattung: year.vatRefund,
    kauf: year.acquisition,
    renovierung: year.renovation,
    opex: year.opex,
    zins: year.interest,
    tilgung: year.principalRepayment,
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
          ["Opex Monat 1", formatMoney(firstMonthOpex)],
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
      <ChartFrame>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis tickFormatter={(value) => formatMoney(Number(value))} width={92} />
            <Tooltip formatter={(value) => formatMoney(Number(value))} />
            <Legend />
            <Bar dataKey="startEk" name="Start-EK" stackId="einnahmen" fill="#0f766e" />
            <Bar dataKey="kostenbeitraege" name="Kostenbeitrag" stackId="einnahmen" fill="#14b8a6" />
            <Bar dataKey="anlagebeitraege" name="Anlagebeitrag" stackId="einnahmen" fill="#7c3aed" />
            <Bar dataKey="nutzungsbeitraege" name="Nutzungsbeitrag" stackId="einnahmen" fill="#2563eb" />
            <Bar dataKey="reservebeitraege" name="Liquiditaetsreserve" stackId="einnahmen" fill="#64748b" />
            <Bar dataKey="darlehen" name="Darlehen" stackId="einnahmen" fill="#0891b2" />
            <Bar dataKey="miete" name="Miete" stackId="einnahmen" fill="#22c55e" />
            <Bar dataKey="erstattung" name="Erstattung" stackId="einnahmen" fill="#84cc16" />
            <Bar dataKey="kauf" name="Kauf/Nebenkosten" stackId="ausgaben" fill="#991b1b" />
            <Bar dataKey="renovierung" name="Renovierung" stackId="ausgaben" fill="#dc2626" />
            <Bar dataKey="opex" name="Opex" stackId="ausgaben" fill="#b45309" />
            <Bar dataKey="zins" name="Zins" stackId="ausgaben" fill="#f97316" />
            <Bar dataKey="tilgung" name="Tilgung" stackId="ausgaben" fill="#6d28d9" />
          </BarChart>
        </ResponsiveContainer>
      </ChartFrame>
      <ChartFrame>
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
        headers={["Monat 1 Kostenblock", "Art", "Betrag"]}
        rows={firstMonthCostRows(firstMonth)}
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
          ["Gezahlte Zinsen", formatMoney(result.debt.totalInterestPaid)]
        ]}
      />
      <ChartFrame>
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
              stroke="#7c3aed"
              strokeWidth={2}
              dot={false}
            />
            <Bar
              yAxisId="payment"
              dataKey="zins"
              name="Zins"
              fill="#b45309"
            />
            <Bar
              yAxisId="payment"
              dataKey="tilgung"
              name="Tilgung"
              fill="#2563eb"
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

function looksLikeHtml(text: string): boolean {
  const preview = text.trimStart().slice(0, 200).toLowerCase();
  return preview.startsWith("<!doctype") || preview.startsWith("<html");
}
