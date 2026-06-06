import type { CandidateHouse, HouseCoordinates } from "../modules/property/types";

const HOUSE_PLACE_COORDINATES: Record<string, HouseCoordinates> = {
  telfes: coordinate(47.166, 11.358),
  flaurling: coordinate(47.291, 11.122),
  axams: coordinate(47.228, 11.278),
  omes: coordinate(47.222, 11.273),
  faggen: coordinate(47.083, 10.667),
  pfunds: coordinate(46.969, 10.541),
  oetz: coordinate(47.204, 10.897),
  taxegg: coordinate(47.191, 10.874),
  sautens: coordinate(47.209, 10.864)
};

export function coordinatesForHouse(
  house: CandidateHouse
): HouseCoordinates | undefined {
  if (house.coordinates) {
    return house.coordinates;
  }

  const normalized = house.place.toLowerCase();
  return Object.entries(HOUSE_PLACE_COORDINATES).find(([key]) =>
    normalized.includes(key)
  )?.[1];
}

export function houseAddressQuery(house: CandidateHouse): string {
  return [house.postalCode, house.place, house.federalState, "Oesterreich"]
    .filter(Boolean)
    .join(", ");
}

function coordinate(
  latitude: number,
  longitude: number
): HouseCoordinates {
  return {
    latitude,
    longitude,
    source: "default"
  };
}
