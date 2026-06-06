import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import {
  OWNER_HOME_LOCATIONS
} from "../../modules/property/houseCandidates";
import type {
  CandidateHouse,
  HouseCoordinates
} from "../../modules/property/types";
import {
  coordinatesForHouse,
  houseAddressQuery
} from "../../maps/locationCoordinates";
import {
  hasRouteProxy,
  loadStreetRoutes,
  type RouteProxyResult
} from "../../maps/routeProxy";

type InteractiveRoadMapProps = {
  houses: CandidateHouse[];
  activeHouse?: CandidateHouse;
  onCoordinatesResolved: (
    houseId: string,
    coordinates: HouseCoordinates
  ) => void;
};

const ROUTE_COLORS = [
  "#5b8f8a",
  "#7aa7c7",
  "#a58ac9",
  "#d3a06b",
  "#d7837f",
  "#77b7c5"
] as const;

export function InteractiveRoadMap({
  houses,
  activeHouse,
  onCoordinatesResolved
}: InteractiveRoadMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const coordinatesCallbackRef = useRef(onCoordinatesResolved);
  const [routeState, setRouteState] = useState<{
    houseId: string;
    result: RouteProxyResult;
  }>();
  const [statusState, setStatusState] = useState<{
    houseId: string;
    message: string;
  }>();
  const routeResult =
    routeState && routeState.houseId === activeHouse?.id
      ? routeState.result
      : undefined;
  const status = !activeHouse
    ? "Kein aktives Haus ausgewaehlt."
    : !hasRouteProxy()
      ? "Routing ist nicht konfiguriert; Marker und Karte bleiben nutzbar."
      : statusState?.houseId === activeHouse.id
        ? statusState.message
        : "Strassenrouten werden geladen.";

  useEffect(() => {
    coordinatesCallbackRef.current = onCoordinatesResolved;
  }, [onCoordinatesResolved]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const map = L.map(containerRef.current, {
      scrollWheelZoom: true
    }).setView([47.25, 10.75], 7);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende',
      maxZoom: 19
    }).addTo(map);
    mapRef.current = map;
    layerRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!activeHouse || !hasRouteProxy()) {
      return;
    }

    let cancelled = false;
    const coordinates = coordinatesForHouse(activeHouse);
    void loadStreetRoutes(
      {
        origins: OWNER_HOME_LOCATIONS.map((location) => ({
          id: location.id,
          label: location.label,
          latitude: location.latitude,
          longitude: location.longitude
        })),
        destination: coordinates
          ? {
              latitude: coordinates.latitude,
              longitude: coordinates.longitude,
              label: activeHouse.title
            }
          : {
              address: houseAddressQuery(activeHouse),
              label: activeHouse.title
            }
      }
    )
      .then((result) => {
        if (cancelled) {
          return;
        }
        setRouteState({ houseId: activeHouse.id, result });
        setStatusState({
          houseId: activeHouse.id,
          message:
            result.errors.length > 0
              ? `${result.routes.length} Routen geladen, ${result.errors.length} nicht verfuegbar.`
              : `${result.routes.length} Strassenrouten geladen.`
        });
        if (!activeHouse.coordinates) {
          coordinatesCallbackRef.current(activeHouse.id, {
            latitude: result.destination.latitude,
            longitude: result.destination.longitude,
            source:
              result.destination.source === "geocoded"
                ? "openRouteService"
                : coordinates?.source ?? "default",
            fetchedAt:
              result.destination.source === "geocoded"
                ? new Date().toISOString()
                : coordinates?.fetchedAt
          });
        }
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }
        setStatusState({
          houseId: activeHouse.id,
          message:
            error instanceof Error
              ? `Routen nicht verfuegbar: ${error.message}`
              : "Routen nicht verfuegbar."
        });
      });

    return () => {
      cancelled = true;
    };
  }, [activeHouse]);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) {
      return;
    }

    layer.clearLayers();
    const bounds = L.latLngBounds([]);

    houses.forEach((house) => {
      const coordinates = coordinatesForHouse(house);
      if (!coordinates) {
        return;
      }
      const active = house.id === activeHouse?.id;
      const marker = L.circleMarker(
        [coordinates.latitude, coordinates.longitude],
        {
          radius: active ? 10 : 7,
          color: active ? "#243447" : "#ffffff",
          weight: active ? 3 : 2,
          fillColor: active ? "#d7837f" : "#6f9c95",
          fillOpacity: 0.95
        }
      );
      marker.bindPopup(
        popupContent(house.title, [
          house.place,
          `${house.purchasePrice.toLocaleString("de-DE")} EUR`,
          active ? "Aktives Haus" : "Kandidatenhaus"
        ])
      );
      marker.addTo(layer);
      bounds.extend([coordinates.latitude, coordinates.longitude]);
    });

    OWNER_HOME_LOCATIONS.forEach((location, index) => {
      const route = routeResult?.routes.find(
        (candidate) => candidate.originId === location.id
      );
      const marker = L.circleMarker(
        [location.latitude, location.longitude],
        {
          radius: 7,
          color: "#ffffff",
          weight: 2,
          fillColor: ROUTE_COLORS[index % ROUTE_COLORS.length],
          fillOpacity: 0.95
        }
      );
      marker.bindPopup(
        popupContent(location.label, [
          "Wohnort",
          route
            ? `${Math.round(route.durationMinutes)} min / ${route.distanceKm.toFixed(1)} km`
            : "Route nicht geladen"
        ])
      );
      marker.addTo(layer);
      bounds.extend([location.latitude, location.longitude]);
    });

    routeResult?.routes.forEach((route) => {
      const routeIndex = OWNER_HOME_LOCATIONS.findIndex(
        (location) => location.id === route.originId
      );
      L.geoJSON(route.geometry, {
        style: {
          color: ROUTE_COLORS[Math.max(0, routeIndex) % ROUTE_COLORS.length],
          opacity: 0.82,
          weight: 4
        }
      })
        .bindPopup(
          popupContent(route.originLabel, [
            `${Math.round(route.durationMinutes)} min`,
            `${route.distanceKm.toFixed(1)} km`
          ])
        )
        .addTo(layer);
    });

    if (routeResult) {
      bounds.extend([
        routeResult.destination.latitude,
        routeResult.destination.longitude
      ]);
    }
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [28, 28], maxZoom: 10 });
    }
    window.setTimeout(() => map.invalidateSize(), 0);
  }, [activeHouse?.id, houses, routeResult]);

  return (
    <div className="road-map-card">
      <div className="subsection-header">
        <div>
          <h3>Interaktive Strassenkarte</h3>
          <p className="muted">
            OpenStreetMap-Karte mit Kandidatenhaeusern und Wohnorten. Routen
            werden nur zum aktiven Haus geladen.
          </p>
        </div>
      </div>
      <div
        className="road-map"
        ref={containerRef}
        role="application"
        aria-label="Interaktive Karte mit Wohnorten und Kandidatenhaeusern"
      />
      <p className="map-status" role="status">
        {status}
      </p>
    </div>
  );
}

function popupContent(title: string, lines: string[]): HTMLElement {
  const container = document.createElement("div");
  const heading = document.createElement("strong");
  heading.textContent = title;
  container.append(heading);
  lines.forEach((line) => {
    const paragraph = document.createElement("p");
    paragraph.textContent = line;
    paragraph.style.margin = "4px 0 0";
    container.append(paragraph);
  });
  return container;
}
