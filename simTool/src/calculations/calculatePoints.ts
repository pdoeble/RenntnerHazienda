import { diagnostic } from "../validation/diagnostics";
import { roundPct } from "./rounding";
import type {
  OwnerPointResult,
  PointNightType,
  PointsResult,
  ProjectSnapshot
} from "./types";

type Season = "winterSki" | "summer" | "spring" | "autumn";

export function calculatePoints(snapshot: ProjectSnapshot): PointsResult {
  const capacity = Math.max(
    1,
    snapshot.property.data.beds ??
      snapshot.property.data.rooms ??
      snapshot.property.data.units ??
      4
  );
  const annualPointPool = Math.round(
    capacity * snapshot.property.data.pointRules.basePointsPerBedPerYear
  );
  const nightTypes = sampleNightTypes(snapshot);
  const owners = calculateOwnerPoints(snapshot, annualPointPool, nightTypes);
  const diagnostics = [];

  if (snapshot.strategy.data.pointShareMode === "blended") {
    const weightTotal =
      snapshot.strategy.data.pointTierWeight +
      snapshot.strategy.data.pointEquityWeight;
    if (weightTotal <= 0) {
      diagnostics.push(
        diagnostic(
          "points.zero-weights",
          "error",
          "strategy",
          "Point weights are zero; point shares cannot be allocated."
        )
      );
    }
  }

  return {
    capacity,
    annualPointPool,
    propertyValue: snapshot.property.data.purchasePrice,
    appreciationPercentPerYear: snapshot.strategy.data.appreciationPercentPerYear,
    shareMode: snapshot.strategy.data.pointShareMode,
    owners,
    nightTypes,
    diagnostics
  };
}

function calculateOwnerPoints(
  snapshot: ProjectSnapshot,
  annualPointPool: number,
  nightTypes: PointNightType[]
): OwnerPointResult[] {
  const tierTotal = snapshot.ownership.data.owners.reduce(
    (total, owner) => total + owner.participationTier,
    0
  );
  const equityTotal = snapshot.ownership.data.owners.reduce(
    (total, owner) => total + owner.equityContribution,
    0
  );
  const weightTotal =
    snapshot.strategy.data.pointTierWeight +
    snapshot.strategy.data.pointEquityWeight;

  return snapshot.ownership.data.owners.map((owner) => {
    const tierSharePct =
      tierTotal > 0 ? (owner.participationTier / tierTotal) * 100 : 0;
    const equitySharePct =
      equityTotal > 0 ? (owner.equityContribution / equityTotal) * 100 : 0;
    let pointSharePct = equitySharePct;

    if (snapshot.strategy.data.pointShareMode === "tier") {
      pointSharePct = tierSharePct;
    } else if (
      snapshot.strategy.data.pointShareMode === "blended" &&
      weightTotal > 0
    ) {
      pointSharePct =
        (snapshot.strategy.data.pointTierWeight * tierSharePct +
          snapshot.strategy.data.pointEquityWeight * equitySharePct) /
        weightTotal;
    }

    const annualPoints = (annualPointPool * pointSharePct) / 100;
    const affordableNightsAverage = averageAffordableNights(
      annualPoints,
      nightTypes
    );

    return {
      ownerId: owner.id,
      ownerName: owner.displayName,
      tierSharePct: roundPct(tierSharePct),
      equitySharePct: roundPct(equitySharePct),
      pointSharePct: roundPct(pointSharePct),
      annualPoints: Math.round(annualPoints),
      affordableNightsAverage
    };
  });
}

function sampleNightTypes(snapshot: ProjectSnapshot): PointNightType[] {
  const samples = [
    { label: "Wochentag Fruehling", date: new Date(2026, 3, 8) },
    { label: "Wochenende Winter/Ski", date: new Date(2026, 0, 10) },
    { label: "Wochenende Sommer", date: new Date(2026, 6, 11) }
  ];

  return samples.map(({ label, date }) => ({
    label,
    pointsPerNight: Math.round(nightPoints(date, snapshot) * 10) / 10
  }));
}

export function nightPoints(date: Date, snapshot: ProjectSnapshot): number {
  const capacity = Math.max(
    1,
    snapshot.property.data.beds ??
      snapshot.property.data.rooms ??
      snapshot.property.data.units ??
      4
  );
  const season = seasonFromMonth(date.getMonth() + 1);
  return (
    capacity *
    snapshot.property.data.pointRules.basePerBedPerNight *
    weekendMultiplier(date, snapshot) *
    snapshot.property.data.pointRules.seasonMultipliers[season]
  );
}

function seasonFromMonth(month: number): Season {
  if (month === 12 || month <= 3) {
    return "winterSki";
  }
  if (month >= 6 && month <= 8) {
    return "summer";
  }
  if (month >= 4 && month <= 5) {
    return "spring";
  }
  return "autumn";
}

function weekendMultiplier(date: Date, snapshot: ProjectSnapshot): number {
  const day = date.getDay();
  if (day === 0 || day === 6) {
    return snapshot.property.data.pointRules.weekendMultipliers.satSun;
  }
  if (day === 5) {
    return snapshot.property.data.pointRules.weekendMultipliers.fri;
  }
  return snapshot.property.data.pointRules.weekendMultipliers.monThu;
}

function averageAffordableNights(
  annualPoints: number,
  nightTypes: PointNightType[]
): number {
  if (nightTypes.length === 0) {
    return 0;
  }

  const average =
    nightTypes.reduce(
      (total, nightType) =>
        total +
        (nightType.pointsPerNight > 0
          ? Math.floor(annualPoints / nightType.pointsPerNight)
          : 0),
      0
    ) / nightTypes.length;

  return Math.round(average);
}
