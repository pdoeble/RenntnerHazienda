import {
  CURRENT_TEMPLATE_VERSION,
  DEFAULT_TEMPLATE_TIMESTAMP
} from "../common";
import { defaultCandidateHouses } from "./houseCandidates";
import type { PropertyTemplate } from "./types";

export const defaultPropertyTemplate: PropertyTemplate = {
  schema: "immo-finance.property",
  version: CURRENT_TEMPLATE_VERSION,
  id: "property-waldchalet-pfunds-demo",
  name: "Waldchalet Pfunds Demo",
  description: "Konkretes Demo-Szenario aus Jonas' Entwurf; kein objektneutraler Wiki-Inhalt.",
  createdAt: DEFAULT_TEMPLATE_TIMESTAMP,
  updatedAt: DEFAULT_TEMPLATE_TIMESTAMP,
  data: {
    title:
      "Waldchalet Pfunds - provisionsfrei - inmitten der atemberaubenden Berglandschaft Tirols",
    sourceUrl:
      "https://www.immobilienscout24.at/expose/69f2efdc897bd2a11f553783",
    sourcePortal: "immobilienscout24",
    commissionFree: true,
    pricePerM2Eur: 2392.86,
    purchasePrice: 670000,
    country: "AT",
    federalState: "T",
    municipality: "Pfunds",
    addressData: {
      postalCode: "6542",
      place: "Pfunds",
      region: "Tirol",
      country: "AT"
    },
    useType: "mixedUse",
    rentableAreaSqm: 280,
    plotAreaSqm: 1940,
    gardenAreaSqm: 635,
    units: 1,
    rooms: 6,
    bedrooms: 5,
    beds: 8,
    bathrooms: 2,
    toilets: 2,
    guestWc: true,
    kitchens: 1,
    garage: true,
    parkingSpaces: 1,
    yearBuilt: 1974,
    condition: "gepflegt",
    constructionType: "Holzbauweise",
    availableFrom: "sofort",
    heating: ["Oel", "Zentralheizung", "Ofenheizung"],
    energy: {
      hwb: 269,
      fgee: 2.69
    },
    features: [
      "Garten",
      "Kamin",
      "Swimmingpool",
      "Garage",
      "Provisionsfrei",
      "Holzbauweise"
    ],
    expectedMonthlyRent: 0,
    vacancyRatePct: 0,
    purchaseMonth: 0,
    reserveMonths: 3,
    tourismFeeAnnualAmount: 0,
    vatRatePct: 0,
    vatRecoverablePct: 0,
    vatRefundMonth: 12,
    mortgageRegistrationFeePct: 1.2,
    closingCosts: {
      realEstateTransferTaxPct: 3.5,
      notaryPct: 1.5,
      landRegistryPct: 1.1,
      brokerPct: 0,
      otherCosts: []
    },
    renovationItems: [],
    activeHouseId: "IS24AT-69f2ef",
    guestNightsPerYear: 60,
    candidateHouses: defaultCandidateHouses,
    mapEnrichment: {
      provider: "excel",
      status: "fallback",
      message: "Excel-Fallbackwerte aus immobilienvergleich_ferienhaus_tirol.xlsx"
    },
    pointRules: {
      basePointsPerBedPerYear: 365,
      basePerBedPerNight: 1,
      weekendMultipliers: {
        monThu: 1,
        fri: 1.2,
        satSun: 1.5
      },
      seasonMultipliers: {
        winterSki: 1.8,
        summer: 1.4,
        spring: 1,
        autumn: 1
      }
    },
    notes:
      "Demo-Szenario mit konkretem Objekt. Nutzungszulassung, USt, Abgaben, Gemeindeauskunft und Bankfaehigkeit sind separat zu pruefen."
  }
};
