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
import { HelpPopover } from "../../ui/HelpPopover";
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
  const monthlyCostContribution =
    recurringContribution?.costContributionMonthly ??
    recurringContribution?.baseMonthlyObligation ??
    0;
  const monthlyCapitalContribution =
    recurringContribution?.capitalContributionMonthly ?? 0;
  const monthlyUsageContribution =
    recurringContribution?.usageContributionMonthly ?? owner?.monthlyUsageContribution ?? 0;
  const capitalShareOwner = result.capitalShares.owners.find(
    (candidate) => candidate.ownerId === owner?.ownerId
  );
  const companySharePct = owner?.companySharePct ?? 0;
  const projectedValue =
    (companySharePct / 100) *
    result.points.propertyValue *
    Math.pow(1 + result.points.appreciationPercentPerYear / 100, projectionYears);
  const cumulativeCostPayments = monthlyCostContribution * 12 * projectionYears;
  const cumulativeCapitalPayments =
    monthlyCapitalContribution * 12 * projectionYears;
  const cumulativeUsagePayments = monthlyUsageContribution * 12 * projectionYears;
  const cumulativePayments =
    cumulativeCostPayments + cumulativeCapitalPayments + cumulativeUsagePayments;

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
        <NumberInput
          label="Projektionsjahre"
          value={projectionYears}
          min={1}
          max={30}
          onChange={setProjectionYears}
        />
        <MetricGrid
          metrics={[
            ["Kumulierte Kostenumlage", formatMoney(cumulativeCostPayments)],
            ["Kumulierte Kapitalzahlungen", formatMoney(cumulativeCapitalPayments)],
            ["Kumuliertes Nutzungsentgelt", formatMoney(cumulativeUsagePayments)],
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
            <Bar
              dataKey="kapital"
              name="Kapitalruecklage / Anlage mtl."
              fill="#7c3aed"
            />
            <Bar dataKey="nutzung" name="Nutzungsentgelt mtl." fill="#2563eb" />
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

function CashflowView({ result }: { result: CalculationResult }) {
  const firstMonth = result.cashflow.monthly[0];
  const firstMonthOpex = firstMonth
    ? firstMonth.recoverableOpex + firstMonth.nonRecoverableOpex
    : 0;
  const chartData = clampItems(result.cashflow.bankAccountYearly, 10).map((year) => ({
    year: year.year,
    startEk: year.startEquity,
    kostenbeitraege: year.costContributions,
    kapitalruecklagen: year.capitalContributions,
    nutzungsentgelte: year.usageContributions,
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
            <Bar
              dataKey="kapitalruecklagen"
              name="Kapitalruecklage / Anlage"
              stackId="einnahmen"
              fill="#7c3aed"
            />
            <Bar
              dataKey="nutzungsentgelte"
              name="Nutzungsentgelt"
              stackId="einnahmen"
              fill="#2563eb"
            />
            <Bar dataKey="reservebeitraege" name="Liquiditaetsreserve" stackId="einnahmen" fill="#64748b" />
            <Bar dataKey="darlehen" name="Darlehen" stackId="einnahmen" fill="#0891b2" />
            <Bar dataKey="miete" name="Miete" stackId="einnahmen" fill="#22c55e" />
            <Bar dataKey="erstattung" name="Erstattung" stackId="einnahmen" fill="#84cc16" />
            <Bar dataKey="kauf" name="Kauf/Nebenkosten" stackId="ausgaben" fill="#991b1b" />
            <Bar dataKey="renovierung" name="Renovierung" stackId="ausgaben" fill="#dc2626" />
            <Bar dataKey="opex" name="Betriebskosten" stackId="ausgaben" fill="#b45309" />
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
      <DataTable
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
    "Diese Zahlung ist Vermoegenszufuehrung. Ob sie Unternehmensanteile aendert oder als Ruecklage/Darlehen laeuft, muss vertraglich festgelegt sein."
};

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

function looksLikeHtml(text: string): boolean {
  const preview = text.trimStart().slice(0, 200).toLowerCase();
  return preview.startsWith("<!doctype") || preview.startsWith("<html");
}
