import { z } from "zod";
import { TEMPLATE_SCHEMA_IDS } from "../../domain/templates";
import {
  idSchema,
  monthIndexSchema,
  nonEmptyStringSchema,
  nonNegativeNumberSchema,
  percentSchema,
  templateEnvelopeSchema
} from "../../validation/commonSchemas";

export const austrianFederalStateSchema = z.enum([
  "BGLD",
  "KTN",
  "NOE",
  "OOE",
  "SBG",
  "STMK",
  "T",
  "VBG",
  "W"
]);

export const propertyUseTypeSchema = z.enum([
  "holidayHome",
  "touristicRental",
  "mixedUse",
  "companyUse",
  "privateUse",
  "unknown"
]);

export const propertyAddressSchema = z
  .object({
    postalCode: z.string().optional(),
    place: z.string().optional(),
    region: z.string().optional(),
    country: z.literal("AT").default("AT")
  })
  .strict();

export const propertyEnergySchema = z
  .object({
    hwb: nonNegativeNumberSchema.optional(),
    fgee: nonNegativeNumberSchema.optional()
  })
  .strict();

export const propertyPointRulesSchema = z
  .object({
    basePointsPerBedPerYear: nonNegativeNumberSchema.default(365),
    basePerBedPerNight: nonNegativeNumberSchema.default(6),
    weekendMultipliers: z
      .object({
        monThu: nonNegativeNumberSchema.default(1),
        fri: nonNegativeNumberSchema.default(1.2),
        satSun: nonNegativeNumberSchema.default(1.5)
      })
      .strict()
      .default({ monThu: 1, fri: 1.2, satSun: 1.5 }),
    seasonMultipliers: z
      .object({
        winterSki: nonNegativeNumberSchema.default(1.8),
        summer: nonNegativeNumberSchema.default(1.4),
        spring: nonNegativeNumberSchema.default(1),
        autumn: nonNegativeNumberSchema.default(1)
      })
      .strict()
      .default({ winterSki: 1.8, summer: 1.4, spring: 1, autumn: 1 })
  })
  .strict()
  .default({
    basePointsPerBedPerYear: 365,
    basePerBedPerNight: 6,
    weekendMultipliers: { monThu: 1, fri: 1.2, satSun: 1.5 },
    seasonMultipliers: { winterSki: 1.8, summer: 1.4, spring: 1, autumn: 1 }
  });

export const mapDataQualitySchema = z.enum([
  "excelFallback",
  "googleMaps",
  "manual",
  "missing"
]);

export const travelTimeSchema = z
  .object({
    originId: idSchema,
    originLabel: nonEmptyStringSchema,
    minutes: nonNegativeNumberSchema.optional(),
    distanceKm: nonNegativeNumberSchema.optional(),
    mapsUrl: z.string().optional(),
    provider: z.string().default("excel"),
    dataQuality: mapDataQualitySchema.default("excelFallback"),
    fetchedAt: z.string().optional()
  })
  .strict();

export const skiAreaSchema = z
  .object({
    id: idSchema,
    name: nonEmptyStringSchema,
    stationPlace: z.string().optional(),
    distanceKm: nonNegativeNumberSchema.optional(),
    driveMinutes: nonNegativeNumberSchema.optional(),
    mapsUrl: z.string().optional(),
    sourceUrl: z.string().optional(),
    provider: z.string().default("excel"),
    dataQuality: mapDataQualitySchema.default("excelFallback"),
    fetchedAt: z.string().optional()
  })
  .strict();

export const candidateHouseSchema = z
  .object({
    id: idSchema,
    title: nonEmptyStringSchema,
    place: nonEmptyStringSchema,
    postalCode: z.string().optional(),
    federalState: z.string().optional(),
    purchasePrice: nonNegativeNumberSchema,
    rentableAreaSqm: nonNegativeNumberSchema.optional(),
    plotAreaSqm: nonNegativeNumberSchema.optional(),
    pricePerSqm: nonNegativeNumberSchema.optional(),
    rooms: nonNegativeNumberSchema.optional(),
    bedrooms: nonNegativeNumberSchema.optional(),
    beds: nonNegativeNumberSchema.optional(),
    bathrooms: nonNegativeNumberSchema.optional(),
    toilets: nonNegativeNumberSchema.optional(),
    yearBuilt: z.number().int().positive().optional(),
    propertyType: z.string().optional(),
    condition: z.string().optional(),
    floors: nonNegativeNumberSchema.optional(),
    parking: z.string().optional(),
    energy: z.string().optional(),
    heating: z.string().optional(),
    brokerPct: nonNegativeNumberSchema.default(0),
    closingCostsPctRough: nonNegativeNumberSchema.default(0),
    totalCostRough: nonNegativeNumberSchema.optional(),
    averageDriveMinutes: nonNegativeNumberSchema.optional(),
    nearestSkiArea: z.string().optional(),
    nearestSkiMinutes: nonNegativeNumberSchema.optional(),
    tourismStatus: z.string().optional(),
    holidayUseNotes: z.string().optional(),
    unitsAndUse: z.string().optional(),
    highlights: z.string().optional(),
    risks: z.string().optional(),
    sourceUrl: z.string().optional(),
    guestNightsPerYear: nonNegativeNumberSchema.default(60),
    travelTimes: z.array(travelTimeSchema).default([]),
    skiAreas: z.array(skiAreaSchema).default([])
  })
  .strict();

export const mapEnrichmentSchema = z
  .object({
    provider: z.string().default("none"),
    status: z.string().default("fallback"),
    message: z.string().optional(),
    fetchedAt: z.string().optional()
  })
  .strict();

export const propertyClosingCostItemSchema = z
  .object({
    id: idSchema,
    label: nonEmptyStringSchema,
    amount: nonNegativeNumberSchema,
    timingMonth: monthIndexSchema.optional(),
    notes: z.string().optional()
  })
  .strict();

export const propertyClosingCostsSchema = z
  .object({
    realEstateTransferTaxPct: nonNegativeNumberSchema.default(0),
    notaryPct: nonNegativeNumberSchema.default(0),
    landRegistryPct: nonNegativeNumberSchema.default(0),
    brokerPct: nonNegativeNumberSchema.default(0),
    otherCosts: z.array(propertyClosingCostItemSchema).default([])
  })
  .strict()
  .default({
    realEstateTransferTaxPct: 0,
    notaryPct: 0,
    landRegistryPct: 0,
    brokerPct: 0,
    otherCosts: []
  });

export const propertyRenovationCategorySchema = z.enum([
  "renovation",
  "modernization",
  "energy",
  "furniture",
  "planning",
  "permits",
  "contingency",
  "technicalEquipment",
  "other"
]);

export const propertyRenovationItemSchema = z
  .object({
    id: idSchema,
    label: nonEmptyStringSchema,
    category: propertyRenovationCategorySchema.default("renovation"),
    amount: nonNegativeNumberSchema,
    timingMonth: monthIndexSchema,
    notes: z.string().optional()
  })
  .strict();

export const propertyDataSchema = z
  .object({
    objektkennung: z.string().optional(),
    title: z.string().optional(),
    sourceUrl: z.string().optional(),
    sourcePortal: z.string().optional(),
    commissionFree: z.boolean().optional(),
    pricePerM2Eur: nonNegativeNumberSchema.optional(),
    purchasePrice: nonNegativeNumberSchema,
    country: z.literal("AT").default("AT"),
    federalState: austrianFederalStateSchema.optional(),
    municipality: z.string().optional(),
    addressData: propertyAddressSchema.optional(),
    useType: propertyUseTypeSchema.default("holidayHome"),
    address: z.string().optional(),
    rentableAreaSqm: nonNegativeNumberSchema.optional(),
    plotAreaSqm: nonNegativeNumberSchema.optional(),
    gardenAreaSqm: nonNegativeNumberSchema.optional(),
    units: z.number().int().positive().optional(),
    rooms: nonNegativeNumberSchema.optional(),
    bedrooms: nonNegativeNumberSchema.optional(),
    beds: nonNegativeNumberSchema.optional(),
    bathrooms: nonNegativeNumberSchema.optional(),
    toilets: nonNegativeNumberSchema.optional(),
    guestWc: z.boolean().optional(),
    kitchens: nonNegativeNumberSchema.optional(),
    garage: z.boolean().optional(),
    parkingSpaces: nonNegativeNumberSchema.optional(),
    yearBuilt: z.number().int().positive().optional(),
    condition: z.string().optional(),
    constructionType: z.string().optional(),
    availableFrom: z.string().optional(),
    heating: z.array(z.string()).default([]),
    energy: propertyEnergySchema.optional(),
    features: z.array(z.string()).default([]),
    expectedMonthlyRent: nonNegativeNumberSchema.optional(),
    vacancyRatePct: percentSchema.optional(),
    purchaseMonth: monthIndexSchema.optional(),
    reserveMonths: nonNegativeNumberSchema.default(3),
    tourismFeeAnnualAmount: nonNegativeNumberSchema.default(0),
    vatRatePct: percentSchema.default(0),
    vatRecoverablePct: percentSchema.default(0),
    vatRefundMonth: monthIndexSchema.default(12),
    mortgageRegistrationFeePct: nonNegativeNumberSchema.default(0),
    closingCosts: propertyClosingCostsSchema,
    renovationItems: z.array(propertyRenovationItemSchema).default([]),
    pointRules: propertyPointRulesSchema,
    activeHouseId: z.string().optional(),
    guestNightsPerYear: nonNegativeNumberSchema.default(60),
    candidateHouses: z.array(candidateHouseSchema).default([]),
    mapEnrichment: mapEnrichmentSchema.optional(),
    notes: z.string().optional()
  })
  .strict();

export const propertyTemplateSchema = templateEnvelopeSchema(
  TEMPLATE_SCHEMA_IDS.property,
  propertyDataSchema
);
