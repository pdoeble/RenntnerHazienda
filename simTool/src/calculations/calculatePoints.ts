import { diagnostic } from "../validation/diagnostics";
import { roundPct } from "./rounding";
import type {
  CapitalShareResult,
  OwnerPointResult,
  PointNightType,
  PointsResult,
  ProjectSnapshot
} from "./types";

type Season = "winterSki" | "summer" | "spring" | "autumn";

export function calculatePoints(
  snapshot: ProjectSnapshot,
  capitalShares?: CapitalShareResult
): PointsResult {
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
  const owners = calculateOwnerPoints(
    snapshot,
    annualPointPool,
    nightTypes,
    capitalShares
  );
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

  if (
    snapshot.strategy.data.pointShareMode === "usage" &&
    snapshot.ownership.data.owners.reduce(
      (total, owner) => total + owner.usagePointBudget,
      0
    ) <= 0
  ) {
    diagnostics.push(
      diagnostic(
        "points.no-usage-budget",
        "warning",
        "ownership",
        "Keine Nutzungspunkte hinterlegt; Nutzung kann nicht verteilt werden."
      )
    );
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
  nightTypes: PointNightType[],
  capitalShares?: CapitalShareResult
): OwnerPointResult[] {
  const usageTotal = snapshot.ownership.data.owners.reduce(
    (total, owner) => total + owner.usagePointBudget,
    0
  );
  const equityTotal = snapshot.ownership.data.owners.reduce(
    (total, owner) => total + owner.startEquityContribution,
    0
  );
  const weightTotal =
    snapshot.strategy.data.pointTierWeight +
    snapshot.strategy.data.pointEquityWeight;

  return snapshot.ownership.data.owners.map((owner) => {
    const usageSharePct =
      usageTotal > 0 ? (owner.usagePointBudget / usageTotal) * 100 : 0;
    const equitySharePct =
      equityTotal > 0 ? (owner.startEquityContribution / equityTotal) * 100 : 0;
    const companySharePct =
      capitalShares?.owners.find((candidate) => candidate.ownerId === owner.id)
        ?.companySharePct ?? owner.companySharePct ?? equitySharePct;
    let pointSharePct = usageSharePct;

    if (snapshot.strategy.data.pointShareMode === "tier") {
      pointSharePct = usageSharePct;
    } else if (snapshot.strategy.data.pointShareMode === "equity") {
      pointSharePct = companySharePct;
    } else if (
      snapshot.strategy.data.pointShareMode === "blended" &&
      weightTotal > 0
    ) {
      pointSharePct =
        (snapshot.strategy.data.pointTierWeight * usageSharePct +
          snapshot.strategy.data.pointEquityWeight * companySharePct) /
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
      usagePointBudget: owner.usagePointBudget,
      usageSharePct: roundPct(usageSharePct),
      companySharePct: roundPct(companySharePct),
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
