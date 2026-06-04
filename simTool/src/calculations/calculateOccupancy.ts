import { diagnostic } from "../validation/diagnostics";
import { roundPct } from "./rounding";
import type { OccupancyResult, PointsResult, ProjectSnapshot } from "./types";

export function calculateOccupancy(
  snapshot: ProjectSnapshot,
  points: PointsResult
): OccupancyResult {
  const activeHouse = snapshot.property.data.candidateHouses.find(
    (house) => house.id === snapshot.property.data.activeHouseId
  );
  const bedrooms =
    activeHouse?.bedrooms ?? snapshot.property.data.bedrooms ?? undefined;
  const beds = activeHouse?.beds ?? snapshot.property.data.beds ?? undefined;
  const capacityDataQuality = bedrooms
    ? "bedrooms"
    : beds
      ? "beds"
      : "missing";
  const capacityPersons = bedrooms ? bedrooms * 2 : beds ?? 0;
  const ownerCount = snapshot.ownership.data.owners.length;
  const ownerDemandNights = points.owners.reduce(
    (total, owner) => total + owner.affordableNightsAverage,
    0
  );
  const guestNights =
    activeHouse?.guestNightsPerYear ??
    snapshot.property.data.guestNightsPerYear ??
    60;
  const blockedNights = ownerDemandNights + guestNights;
  const freeNights = Math.max(0, 365 - blockedNights);
  const occupancyPct = roundPct((blockedNights / 365) * 100);
  const pointsPerAvailableNight =
    365 - guestNights > 0 ? points.annualPointPool / (365 - guestNights) : 0;
  const diagnostics = [];

  if (capacityDataQuality === "missing") {
    diagnostics.push(
      diagnostic(
        "occupancy.capacity-missing",
        "warning",
        "property",
        "Schlafzimmer oder Betten fehlen; Belegungskennzahlen sind unvollstaendig."
      )
    );
  }

  return {
    ...(activeHouse?.id ? { activeHouseId: activeHouse.id } : {}),
    houseTitle:
      activeHouse?.title ?? snapshot.property.data.title ?? "Aktives Objekt",
    ...(bedrooms !== undefined ? { bedrooms } : {}),
    ...(beds !== undefined ? { beds } : {}),
    capacityPersons,
    capacityDataQuality,
    ownerCount,
    ownerDemandNights,
    guestNights,
    blockedNights,
    freeNights,
    occupancyPct,
    pointsPerAvailableNight: Math.round(pointsPerAvailableNight * 10) / 10,
    pressureLabel: pressureLabel(occupancyPct),
    diagnostics
  };
}

function pressureLabel(occupancyPct: number): string {
  if (occupancyPct >= 95) {
    return "kritisch";
  }
  if (occupancyPct >= 75) {
    return "angespannt";
  }
  if (occupancyPct >= 50) {
    return "realistisch";
  }
  return "komfortabel";
}
