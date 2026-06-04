import type { CandidateHouse } from "../modules/property/types";
import { roundMoney, roundPct } from "./rounding";
import type {
  HouseComparisonResult,
  HouseComparisonRow,
  ProjectSnapshot
} from "./types";

export function calculateHouseComparison(
  snapshot: ProjectSnapshot
): HouseComparisonResult {
  const houses = snapshot.property.data.candidateHouses.map((house) =>
    toComparisonRow(house)
  );

  return {
    ...(snapshot.property.data.activeHouseId
      ? { activeHouseId: snapshot.property.data.activeHouseId }
      : {}),
    houses,
    diagnostics: []
  };
}

function toComparisonRow(house: CandidateHouse): HouseComparisonRow {
  const capacityPersons = house.bedrooms
    ? house.bedrooms * 2
    : house.beds ?? 0;
  const blockedNights = expectedOwnerNights(house) + house.guestNightsPerYear;
  return {
    id: house.id,
    title: house.title,
    place: house.place,
    purchasePrice: roundMoney(house.purchasePrice),
    totalCostRough: roundMoney(
      house.totalCostRough ??
        house.purchasePrice * (1 + house.closingCostsPctRough / 100)
    ),
    ...(house.rentableAreaSqm !== undefined
      ? { rentableAreaSqm: house.rentableAreaSqm }
      : {}),
    ...(house.plotAreaSqm !== undefined ? { plotAreaSqm: house.plotAreaSqm } : {}),
    ...(house.rooms !== undefined ? { rooms: house.rooms } : {}),
    ...(house.bedrooms !== undefined ? { bedrooms: house.bedrooms } : {}),
    capacityPersons,
    ...(house.averageDriveMinutes !== undefined
      ? { averageDriveMinutes: house.averageDriveMinutes }
      : {}),
    ...(house.nearestSkiArea ? { nearestSkiArea: house.nearestSkiArea } : {}),
    ...(house.nearestSkiMinutes !== undefined
      ? { nearestSkiMinutes: house.nearestSkiMinutes }
      : {}),
    guestNightsPerYear: house.guestNightsPerYear,
    occupancyPressurePct: roundPct((blockedNights / 365) * 100),
    ...(house.sourceUrl ? { sourceUrl: house.sourceUrl } : {})
  };
}

function expectedOwnerNights(house: CandidateHouse): number {
  const capacity = house.bedrooms ? house.bedrooms * 2 : house.beds ?? 1;
  return Math.min(240, Math.max(60, capacity * 18));
}
