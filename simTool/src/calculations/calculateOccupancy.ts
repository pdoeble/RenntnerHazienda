import { diagnostic } from "../validation/diagnostics";
import { roundMoney, roundPct } from "./rounding";
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
  const roomCapacity = bedrooms
    ? bedrooms
    : beds
      ? Math.max(1, Math.ceil(beds / 2))
      : 0;
  const weekendNights = countWeekendNights(2026);
  const weekdayNights = 365 - weekendNights;
  const roomNightCapacity = roomCapacity * 365;
  const weekendRoomNightCapacity = roomCapacity * weekendNights;
  const weekdayRoomNightCapacity = roomCapacity * weekdayNights;
  const capacityPersons = bedrooms ? bedrooms * 2 : beds ?? 0;
  const ownerCount = snapshot.ownership.data.owners.length;
  const ownerDemandRoomNights = points.owners.reduce(
    (total, owner) => total + owner.affordableNightsAverage,
    0
  );
  const guestRoomNights =
    activeHouse?.guestNightsPerYear ??
    snapshot.property.data.guestNightsPerYear ??
    60;
  const externalRentableRoomNights = Math.max(
    0,
    roomNightCapacity - ownerDemandRoomNights
  );
  const modeledExternalOccupiedRoomNights =
    guestRoomNights > 0
      ? guestRoomNights
      : externalRentableRoomNights *
        (snapshot.strategy.data.externalOccupancyRatePct / 100);
  const externalOccupiedRoomNights = Math.min(
    externalRentableRoomNights,
    modeledExternalOccupiedRoomNights
  );
  const averageGrossPricePerExternalRoomNight =
    snapshot.strategy.data.averageGrossPricePerExternalRoomNight;
  const netExternalRevenue = roundMoney(
    externalOccupiedRoomNights * averageGrossPricePerExternalRoomNight
  );
  const ownerUseMarketOffsetValue = roundMoney(
    ownerDemandRoomNights *
      averageGrossPricePerExternalRoomNight *
      (snapshot.strategy.data.ownerUseDisplacementFactorPct / 100)
  );
  const ownerUseCostFloorValue = roundMoney(
    ownerDemandRoomNights *
      (snapshot.strategy.data.variableCostPerRoomNightAmount +
        snapshot.strategy.data.reservePerRoomNightAmount)
  );
  const ownerUseEconomicValue = Math.max(
    ownerUseMarketOffsetValue,
    ownerUseCostFloorValue
  );
  const ownerWeekendShare = snapshot.strategy.data.ownerWeekendUsagePct / 100;
  const guestWeekendShare = snapshot.strategy.data.guestWeekendUsagePct / 100;
  const weekendDemandRoomNights =
    ownerDemandRoomNights * ownerWeekendShare +
    guestRoomNights * guestWeekendShare;
  const weekdayDemandRoomNights =
    ownerDemandRoomNights * (1 - ownerWeekendShare) +
    guestRoomNights * (1 - guestWeekendShare);
  const blockedRoomNights = ownerDemandRoomNights + guestRoomNights;
  const freeRoomNights = Math.max(0, roomNightCapacity - blockedRoomNights);
  const weekendFreeRoomNights = Math.max(
    0,
    weekendRoomNightCapacity - weekendDemandRoomNights
  );
  const weekdayFreeRoomNights = Math.max(
    0,
    weekdayRoomNightCapacity - weekdayDemandRoomNights
  );
  const occupancyPct =
    roomNightCapacity > 0
      ? roundPct((blockedRoomNights / roomNightCapacity) * 100)
      : 0;
  const externalOccupancyPct =
    externalRentableRoomNights > 0
      ? roundPct((externalOccupiedRoomNights / externalRentableRoomNights) * 100)
      : 0;
  const weekendOccupancyPct =
    weekendRoomNightCapacity > 0
      ? roundPct((weekendDemandRoomNights / weekendRoomNightCapacity) * 100)
      : 0;
  const weekdayOccupancyPct =
    weekdayRoomNightCapacity > 0
      ? roundPct((weekdayDemandRoomNights / weekdayRoomNightCapacity) * 100)
      : 0;
  const pointsPerAvailableNight =
    roomNightCapacity - guestRoomNights > 0
      ? points.annualPointPool / (roomNightCapacity - guestRoomNights)
      : 0;
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
    roomCapacity,
    roomNightCapacity: Math.round(roomNightCapacity),
    weekendRoomNightCapacity: Math.round(weekendRoomNightCapacity),
    weekdayRoomNightCapacity: Math.round(weekdayRoomNightCapacity),
    capacityDataQuality,
    ownerCount,
    ownerDemandNights: Math.round(ownerDemandRoomNights),
    ownerDemandRoomNights: Math.round(ownerDemandRoomNights),
    guestNights: Math.round(guestRoomNights),
    guestRoomNights: Math.round(guestRoomNights),
    blockedNights: Math.round(blockedRoomNights),
    blockedRoomNights: Math.round(blockedRoomNights),
    freeNights: Math.round(freeRoomNights),
    freeRoomNights: Math.round(freeRoomNights),
    weekendDemandRoomNights: Math.round(weekendDemandRoomNights),
    weekdayDemandRoomNights: Math.round(weekdayDemandRoomNights),
    weekendFreeRoomNights: Math.round(weekendFreeRoomNights),
    weekdayFreeRoomNights: Math.round(weekdayFreeRoomNights),
    weekendOccupancyPct,
    weekdayOccupancyPct,
    occupancyPct,
    pointsPerAvailableNight: Math.round(pointsPerAvailableNight * 10) / 10,
    ownerUseMarketOffsetValue,
    ownerUseCostFloorValue,
    ownerUseEconomicValue,
    externalRentableRoomNights: Math.round(externalRentableRoomNights),
    externalOccupiedRoomNights: Math.round(externalOccupiedRoomNights),
    externalOccupancyPct,
    averageGrossPricePerExternalRoomNight: roundMoney(
      averageGrossPricePerExternalRoomNight
    ),
    netExternalRevenue,
    pressureLabel: pressureLabel(Math.max(occupancyPct, weekendOccupancyPct)),
    diagnostics
  };
}

function countWeekendNights(year: number): number {
  let weekendNights = 0;
  for (let month = 0; month < 12; month += 1) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day += 1) {
      const weekday = new Date(year, month, day).getDay();
      if (weekday === 0 || weekday === 5 || weekday === 6) {
        weekendNights += 1;
      }
    }
  }
  return weekendNights;
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
