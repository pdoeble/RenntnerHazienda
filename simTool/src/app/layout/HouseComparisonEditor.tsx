import { MapPin } from "lucide-react";
import { useMemo, useState } from "react";
import {
  enrichHouseWithGoogleMaps,
  hasGoogleMapsKey
} from "../../maps/googleMapsEnrichment";
import type { CandidateHouse } from "../../modules/property/types";
import type { ProjectState } from "../../state/projectStore";
import { formatMoney } from "../../utils/money";

type HouseComparisonEditorProps = {
  projectState: ProjectState;
  updatePropertyData: (data: ProjectState["property"]["data"]) => void;
};

type ScatterMetricKey =
  | "purchasePrice"
  | "totalCostRough"
  | "rentableAreaSqm"
  | "plotAreaSqm"
  | "rooms"
  | "bedrooms"
  | "averageDriveMinutes"
  | "nearestSkiMinutes"
  | "guestNightsPerYear"
  | "capacityPersons";

const SCATTER_METRICS: { key: ScatterMetricKey; label: string }[] = [
  { key: "purchasePrice", label: "Kaufpreis" },
  { key: "totalCostRough", label: "Gesamtkosten grob" },
  { key: "rentableAreaSqm", label: "Wohnflaeche" },
  { key: "plotAreaSqm", label: "Grundstueck" },
  { key: "rooms", label: "Zimmer" },
  { key: "bedrooms", label: "Schlafzimmer" },
  { key: "averageDriveMinutes", label: "Ø Fahrzeit" },
  { key: "nearestSkiMinutes", label: "Ski-Minuten" },
  { key: "guestNightsPerYear", label: "Gaestennaechte" },
  { key: "capacityPersons", label: "Kapazitaet" }
];

export function HouseComparisonEditor({
  projectState,
  updatePropertyData
}: HouseComparisonEditorProps) {
  const [xMetric, setXMetric] = useState<ScatterMetricKey>("purchasePrice");
  const [yMetric, setYMetric] = useState<ScatterMetricKey>("averageDriveMinutes");
  const [sizeMetric, setSizeMetric] =
    useState<ScatterMetricKey>("rentableAreaSqm");
  const [shapeMetric, setShapeMetric] = useState<ScatterMetricKey>("bedrooms");
  const [status, setStatus] = useState("");
  const houses = projectState.property.data.candidateHouses;
  const activeHouse =
    houses.find((house) => house.id === projectState.property.data.activeHouseId) ??
    houses[0];
  const scatterPoints = useMemo(
    () =>
      houses.map((house) => ({
        house,
        x: metricValue(house, xMetric),
        y: metricValue(house, yMetric),
        size: metricValue(house, sizeMetric),
        shape: metricValue(house, shapeMetric)
      })),
    [houses, xMetric, yMetric, sizeMetric, shapeMetric]
  );

  function updateHouse(updatedHouse: CandidateHouse) {
    updatePropertyData({
      ...projectState.property.data,
      candidateHouses: houses.map((house) =>
        house.id === updatedHouse.id ? updatedHouse : house
      ),
      ...(projectState.property.data.activeHouseId === updatedHouse.id
        ? { guestNightsPerYear: updatedHouse.guestNightsPerYear }
        : {})
    });
  }

  async function enrichActiveHouse() {
    if (!activeHouse) {
      return;
    }
    setStatus("Google Maps wird abgefragt...");
    try {
      const result = await enrichHouseWithGoogleMaps(activeHouse);
      updateHouse(result.house);
      setStatus(result.message);
    } catch (error) {
      setStatus(
        error instanceof Error
          ? `Google Maps fehlgeschlagen: ${error.message}`
          : "Google Maps fehlgeschlagen."
      );
    }
  }

  return (
    <div className="form-grid">
      <div className="form-section">
        <div className="subsection-header">
          <div>
            <h3>Hausvergleich</h3>
            <p className="muted">
              Seed-Daten aus immobilienvergleich_ferienhaus_tirol.xlsx. Maps
              ueberschreibt nur Werte, wenn ein Google-Key gesetzt ist.
            </p>
          </div>
          <button
            className="icon-button"
            type="button"
            onClick={() => void enrichActiveHouse()}
            disabled={!activeHouse}
            title={
              hasGoogleMapsKey()
                ? "Aktives Haus mit Google Maps aktualisieren"
                : "Ohne VITE_GOOGLE_MAPS_API_KEY bleibt der Excel-Fallback aktiv"
            }
          >
            <MapPin aria-hidden="true" size={16} />
            <span>Maps aktualisieren</span>
          </button>
        </div>
        {status ? <p className="muted">{status}</p> : null}
        <SchematicRoadMap
          houses={houses}
          activeHouseId={projectState.property.data.activeHouseId}
        />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Aktiv</th>
                <th>Titel</th>
                <th>Ort</th>
                <th>Kaufpreis</th>
                <th>Wohnfl.</th>
                <th>Grund</th>
                <th>Zimmer</th>
                <th>Schlafz.</th>
                <th>Gaeste</th>
                <th>Ø Fahrt</th>
                <th>Ski</th>
                <th>Risiko</th>
                <th>Quelle</th>
              </tr>
            </thead>
            <tbody>
              {houses.map((house) => (
                <tr key={house.id}>
                  <td>
                    <button
                      className="icon-button"
                      type="button"
                      onClick={() => applyHouse(house, projectState, updatePropertyData)}
                    >
                      {projectState.property.data.activeHouseId === house.id
                        ? "aktiv"
                        : "waehlen"}
                    </button>
                  </td>
                  <td>{house.title}</td>
                  <td>{house.place}</td>
                  <td>{formatMoney(house.purchasePrice)}</td>
                  <td>{numberCell(house.rentableAreaSqm, "qm")}</td>
                  <td>{numberCell(house.plotAreaSqm, "qm")}</td>
                  <td>{numberCell(house.rooms, "")}</td>
                  <td>{numberCell(house.bedrooms, "")}</td>
                  <td>
                    <input
                      aria-label={`${house.title} Gaestennaechte`}
                      className="compact-number"
                      type="number"
                      min={0}
                      max={365}
                      value={house.guestNightsPerYear}
                      onChange={(event) =>
                        updateHouse({
                          ...house,
                          guestNightsPerYear: Number(event.currentTarget.value)
                        })
                      }
                    />
                  </td>
                  <td>{minutesCell(house.averageDriveMinutes)}</td>
                  <td>{house.nearestSkiArea ?? "offen"} / {minutesCell(house.nearestSkiMinutes)}</td>
                  <td>{house.risks ?? "offen"}</td>
                  <td>
                    {house.sourceUrl ? (
                      <a href={house.sourceUrl} target="_blank" rel="noreferrer">
                        Inserat
                      </a>
                    ) : (
                      "offen"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="form-section">
        <h3>Punktplot</h3>
        <div className="plot-controls">
          <MetricSelect label="X" value={xMetric} onChange={setXMetric} />
          <MetricSelect label="Y" value={yMetric} onChange={setYMetric} />
          <MetricSelect label="Groesse" value={sizeMetric} onChange={setSizeMetric} />
          <MetricSelect label="Form" value={shapeMetric} onChange={setShapeMetric} />
        </div>
        <ScatterPlot
          points={scatterPoints}
          activeHouseId={projectState.property.data.activeHouseId}
        />
      </div>
    </div>
  );
}

type MapPoint = {
  id: string;
  label: string;
  kind: "Wohnort" | "Haus";
  lat: number;
  lon: number;
  active?: boolean;
};

const HOME_LOCATION_POINTS: MapPoint[] = [
  { id: "home-esslingen", label: "Esslingen", kind: "Wohnort", lat: 48.742, lon: 9.311 },
  { id: "home-neuburg", label: "Neuburg a.d. Donau", kind: "Wohnort", lat: 48.733, lon: 11.187 },
  { id: "home-muenchen", label: "Muenchen", kind: "Wohnort", lat: 48.137, lon: 11.576 },
  { id: "home-innsbruck", label: "Innsbruck", kind: "Wohnort", lat: 47.269, lon: 11.404 },
  { id: "home-zuerich", label: "Zuerich", kind: "Wohnort", lat: 47.376, lon: 8.541 },
  { id: "home-hinwil", label: "Hinwil", kind: "Wohnort", lat: 47.303, lon: 8.844 }
];

const HOUSE_PLACE_COORDINATES: Record<string, { lat: number; lon: number }> = {
  telfes: { lat: 47.166, lon: 11.358 },
  flaurling: { lat: 47.291, lon: 11.122 },
  axams: { lat: 47.228, lon: 11.278 },
  omes: { lat: 47.222, lon: 11.273 },
  faggen: { lat: 47.083, lon: 10.667 },
  pfunds: { lat: 46.969, lon: 10.541 },
  oetz: { lat: 47.204, lon: 10.897 },
  taxegg: { lat: 47.191, lon: 10.874 },
  sautens: { lat: 47.209, lon: 10.864 }
};

function SchematicRoadMap({
  houses,
  activeHouseId
}: {
  houses: CandidateHouse[];
  activeHouseId?: string;
}) {
  const housePoints = houses.map((house) => {
    const coordinate = coordinateForHouse(house);
    return {
      id: house.id,
      label: shortHouseLabel(house),
      kind: "Haus" as const,
      lat: coordinate.lat,
      lon: coordinate.lon,
      active: house.id === activeHouseId
    };
  });
  const points = [...HOME_LOCATION_POINTS, ...housePoints];
  const projection = createMapProjection(points);
  const innsbruck = HOME_LOCATION_POINTS.find((point) => point.id === "home-innsbruck")!;

  return (
    <div className="schematic-map-card">
      <div className="subsection-header">
        <div>
          <h3>Schematische Strassenkarte</h3>
          <p className="muted">
            Grobe Lagebeziehungen der Wohnorte und Kandidatenhaeuser; keine
            Navigation und keine echte Kartenkachel.
          </p>
        </div>
      </div>
      <svg
        className="schematic-map"
        role="img"
        aria-label="Schematische Karte mit Wohnorten und Kandidatenhaeusern"
        viewBox="0 0 760 360"
      >
        <rect x="0" y="0" width="760" height="360" rx="8" />
        {HOME_LOCATION_POINTS.filter((point) => point.id !== innsbruck.id).map(
          (home) => (
            <SchematicLine
              key={`${home.id}-innsbruck`}
              from={projection(home)}
              to={projection(innsbruck)}
              className="schematic-road major"
            />
          )
        )}
        {housePoints.map((house) => (
          <SchematicLine
            key={`${house.id}-route`}
            from={projection(innsbruck)}
            to={projection(house)}
            className={house.active ? "schematic-road active" : "schematic-road"}
          />
        ))}
        {points.map((point) => {
          const projected = projection(point);
          const isHome = point.kind === "Wohnort";
          return (
            <g
              key={point.id}
              className={[
                "schematic-map-point",
                isHome ? "home" : "house",
                point.active ? "active" : ""
              ].join(" ")}
              transform={`translate(${projected.x} ${projected.y})`}
            >
              <circle r={isHome ? 7 : 8} />
              <text x={10} y={point.active ? -10 : 4}>
                {point.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="map-legend">
        <span><i className="home" /> Wohnort</span>
        <span><i className="house" /> Kandidatenhaus</span>
        <span><i className="active" /> aktives Objekt</span>
      </div>
    </div>
  );
}

function SchematicLine({
  from,
  to,
  className
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  className: string;
}) {
  const midX = (from.x + to.x) / 2;
  const midY = Math.min(from.y, to.y) - 18;
  return (
    <path
      className={className}
      d={`M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`}
    />
  );
}

function createMapProjection(points: MapPoint[]) {
  const padding = 44;
  const width = 760;
  const height = 360;
  const latitudes = points.map((point) => point.lat);
  const longitudes = points.map((point) => point.lon);
  const minLat = Math.min(...latitudes) - 0.08;
  const maxLat = Math.max(...latitudes) + 0.08;
  const minLon = Math.min(...longitudes) - 0.12;
  const maxLon = Math.max(...longitudes) + 0.12;
  const latSpan = maxLat - minLat || 1;
  const lonSpan = maxLon - minLon || 1;

  return (point: Pick<MapPoint, "lat" | "lon">) => ({
    x: padding + ((point.lon - minLon) / lonSpan) * (width - padding * 2),
    y: padding + ((maxLat - point.lat) / latSpan) * (height - padding * 2)
  });
}

function coordinateForHouse(house: CandidateHouse): { lat: number; lon: number } {
  const normalized = house.place.toLowerCase();
  const match = Object.entries(HOUSE_PLACE_COORDINATES).find(([key]) =>
    normalized.includes(key)
  );
  return match?.[1] ?? { lat: 47.2, lon: 10.95 };
}

function shortHouseLabel(house: CandidateHouse): string {
  return house.place.split("/")[0]?.trim() || house.title;
}

function applyHouse(
  house: CandidateHouse,
  projectState: ProjectState,
  updatePropertyData: (data: ProjectState["property"]["data"]) => void
) {
  updatePropertyData({
    ...projectState.property.data,
    activeHouseId: house.id,
    title: house.title,
    sourceUrl: house.sourceUrl,
    sourcePortal: house.sourceUrl?.includes("immobilienscout24")
      ? "immobilienscout24"
      : projectState.property.data.sourcePortal,
    commissionFree: house.brokerPct === 0,
    pricePerM2Eur: house.pricePerSqm,
    purchasePrice: house.purchasePrice,
    federalState: house.federalState === "Tirol" ? "T" : projectState.property.data.federalState,
    municipality: house.place,
    addressData: {
      postalCode: house.postalCode,
      place: house.place,
      region: house.federalState,
      country: "AT"
    },
    rentableAreaSqm: house.rentableAreaSqm,
    plotAreaSqm: house.plotAreaSqm,
    rooms: house.rooms,
    bedrooms: house.bedrooms,
    beds: house.beds ?? (house.bedrooms ? house.bedrooms * 2 : undefined),
    bathrooms: house.bathrooms,
    toilets: house.toilets,
    yearBuilt: house.yearBuilt,
    condition: house.condition,
    heating: house.heating ? [house.heating] : [],
    features: [house.highlights, house.unitsAndUse].filter(
      (value): value is string => Boolean(value)
    ),
    guestNightsPerYear: house.guestNightsPerYear,
    closingCosts: {
      ...projectState.property.data.closingCosts,
      brokerPct: house.brokerPct
    },
    mapEnrichment: {
      provider: hasGoogleMapsKey() ? "googleMaps" : "excel",
      status: hasGoogleMapsKey() ? "key-configured" : "fallback",
      message: hasGoogleMapsKey()
        ? "Google Maps Key erkannt; Werte koennen aktualisiert werden."
        : "Excel-Fallbackwerte aktiv."
    }
  });
}

function MetricSelect({
  label,
  value,
  onChange
}: {
  label: string;
  value: ScatterMetricKey;
  onChange: (value: ScatterMetricKey) => void;
}) {
  return (
    <label className="text-field">
      <span>{label}</span>
      <select
        aria-label={`Plot ${label}`}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value as ScatterMetricKey)}
      >
        {SCATTER_METRICS.map((metric) => (
          <option key={metric.key} value={metric.key}>
            {metric.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ScatterPlot({
  points,
  activeHouseId
}: {
  points: { house: CandidateHouse; x: number; y: number; size: number; shape: number }[];
  activeHouseId?: string;
}) {
  const plotWidth = 680;
  const plotHeight = 320;
  const padding = 36;
  const xScale = scale(points.map((point) => point.x), padding, plotWidth - padding);
  const yScale = scale(points.map((point) => point.y), plotHeight - padding, padding);
  const sizeScale = scale(points.map((point) => point.size), 5, 16);

  return (
    <svg
      className="scatter-plot"
      role="img"
      aria-label="Interaktiver Hausvergleich Punktplot"
      viewBox={`0 0 ${plotWidth} ${plotHeight}`}
    >
      <line x1={padding} y1={plotHeight - padding} x2={plotWidth - padding} y2={plotHeight - padding} />
      <line x1={padding} y1={padding} x2={padding} y2={plotHeight - padding} />
      {points.map((point) => {
        const x = xScale(point.x);
        const y = yScale(point.y);
        const radius = sizeScale(point.size);
        const active = point.house.id === activeHouseId;
        return (
          <g key={point.house.id} className={active ? "plot-point active" : "plot-point"}>
            <title>{`${point.house.title}: ${formatMoney(point.house.purchasePrice)}`}</title>
            {shapeForValue(point.shape) === "square" ? (
              <rect x={x - radius} y={y - radius} width={radius * 2} height={radius * 2} />
            ) : shapeForValue(point.shape) === "diamond" ? (
              <path d={`M ${x} ${y - radius} L ${x + radius} ${y} L ${x} ${y + radius} L ${x - radius} ${y} Z`} />
            ) : shapeForValue(point.shape) === "triangle" ? (
              <path d={`M ${x} ${y - radius} L ${x + radius} ${y + radius} L ${x - radius} ${y + radius} Z`} />
            ) : (
              <circle cx={x} cy={y} r={radius} />
            )}
            <text x={x + radius + 3} y={y + 4}>
              {point.house.place}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function metricValue(house: CandidateHouse, metric: ScatterMetricKey): number {
  if (metric === "capacityPersons") {
    return house.bedrooms ? house.bedrooms * 2 : house.beds ?? 0;
  }
  if (metric === "totalCostRough") {
    return (
      house.totalCostRough ??
      house.purchasePrice * (1 + house.closingCostsPctRough / 100)
    );
  }
  return Number(house[metric] ?? 0);
}

function scale(values: number[], minOut: number, maxOut: number) {
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const span = max - min || 1;
  return (value: number) => minOut + ((value - min) / span) * (maxOut - minOut);
}

function shapeForValue(value: number): "circle" | "square" | "diamond" | "triangle" {
  if (value >= 8) {
    return "diamond";
  }
  if (value >= 5) {
    return "square";
  }
  if (value >= 3) {
    return "triangle";
  }
  return "circle";
}

function numberCell(value: number | undefined, unit: string): string {
  if (value === undefined || value === 0) {
    return "offen";
  }
  return `${value.toLocaleString("de-DE")}${unit ? ` ${unit}` : ""}`;
}

function minutesCell(value: number | undefined): string {
  if (value === undefined) {
    return "offen";
  }
  return `${Math.round(value).toLocaleString("de-DE")} min`;
}
