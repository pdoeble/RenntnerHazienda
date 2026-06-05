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
  const capacity = calculateRoomCapacity(snapshot);
  const annualPointPool = Math.round(
    capacity * snapshot.property.data.pointRules.basePointsPerBedPerYear
  );
  const nightTypes = sampleNightTypes(snapshot);
  const owners = calculateOwnerPoints(snapshot, nightTypes, capitalShares);
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
      (total, owner) => total + owner.monthlyUsageContribution,
      0
    ) <= 0
  ) {
    diagnostics.push(
      diagnostic(
        "points.no-usage-budget",
        "warning",
        "ownership",
        "Keine Nutzungsbeitraege hinterlegt; Nutzung kann nicht in Zimmernaechte umgerechnet werden."
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
  nightTypes: PointNightType[],
  capitalShares?: CapitalShareResult
): OwnerPointResult[] {
  const usageTotal = snapshot.ownership.data.owners.reduce(
    (total, owner) => total + owner.monthlyUsageContribution * 12,
    0
  );
  const equityTotal = snapshot.ownership.data.owners.reduce(
    (total, owner) => total + owner.startEquityContribution,
    0
  );

  return snapshot.ownership.data.owners.map((owner) => {
    const annualUsageBudget = owner.monthlyUsageContribution * 12;
    const usageSharePct =
      usageTotal > 0 ? (annualUsageBudget / usageTotal) * 100 : 0;
    const equitySharePct =
      equityTotal > 0 ? (owner.startEquityContribution / equityTotal) * 100 : 0;
    const companySharePct =
      capitalShares?.owners.find((candidate) => candidate.ownerId === owner.id)
        ?.companySharePct ?? owner.companySharePct ?? equitySharePct;
    const pointSharePct = usageSharePct;
    const annualPoints = annualUsageBudget;
    const affordableNightsAverage = averageAffordableNights(
      annualPoints,
      nightTypes
    );

    return {
      ownerId: owner.id,
      ownerName: owner.displayName,
      monthlyUsageContribution: Math.round(owner.monthlyUsageContribution),
      annualUsageBudget: Math.round(annualUsageBudget),
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

  return samples.map(({ label, date }) => {
    const roomNightPrice = Math.round(nightPoints(date, snapshot) * 10) / 10;
    return {
      label,
      pointsPerNight: roomNightPrice,
      roomNightPrice
    };
  });
}

export function nightPoints(date: Date, snapshot: ProjectSnapshot): number {
  const season = seasonFromMonth(date.getMonth() + 1);
  return (
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

function calculateRoomCapacity(snapshot: ProjectSnapshot): number {
  if (snapshot.property.data.bedrooms && snapshot.property.data.bedrooms > 0) {
    return snapshot.property.data.bedrooms;
  }
  if (snapshot.property.data.beds && snapshot.property.data.beds > 0) {
    return Math.max(1, Math.ceil(snapshot.property.data.beds / 2));
  }
  return Math.max(
    1,
    snapshot.property.data.rooms ?? snapshot.property.data.units ?? 1
  );
}
