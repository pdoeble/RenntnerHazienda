import type { CandidateHouse, TravelTime } from "./types";

export const OWNER_HOME_LOCATIONS = [
  {
    id: "esslingen",
    label: "Esslingen am Neckar",
    query: "Esslingen am Neckar"
  },
  {
    id: "muenchen",
    label: "Muenchen",
    query: "Muenchen"
  },
  {
    id: "neuburg",
    label: "Neuburg an der Donau",
    query: "Neuburg an der Donau"
  },
  {
    id: "hinwil",
    label: "Hinwil CH",
    query: "Hinwil CH"
  },
  {
    id: "innsbruck",
    label: "Innsbruck",
    query: "Innsbruck"
  }
] as const;

export type OwnerHomeLocationId =
  (typeof OWNER_HOME_LOCATIONS)[number]["id"];

const FALLBACK_QUALITY = "excelFallback" as const;

export const defaultCandidateHouses: CandidateHouse[] = [
  {
    id: "IS24-165475678",
    title: "Luxurioeses Traumhaus in Tirol (Neustift / Kampl)",
    place: "Telfes im Stubai / Stubaital",
    postalCode: "6167",
    federalState: "Tirol",
    purchasePrice: 1250000,
    rentableAreaSqm: 347.31,
    plotAreaSqm: 475,
    pricePerSqm: 3599.09,
    rooms: 8,
    bathrooms: 4,
    toilets: 4,
    yearBuilt: 2009,
    propertyType: "Einfamilienhaus, freistehend",
    condition: "Gepflegt",
    floors: 3,
    parking: "2 Stellplaetze",
    energy: "EA in Auftrag / keine Werte im Expose",
    heating: "nicht angegeben",
    brokerPct: 3.6,
    closingCostsPctRough: 10,
    totalCostRough: 1375000,
    averageDriveMinutes: 149.4,
    nearestSkiArea: "Serlesbahnen Mieders",
    nearestSkiMinutes: 6,
    tourismStatus: "Potenzial, nicht rechtsverbindlich bestaetigt",
    holidayUseNotes:
      "Zwei Einliegerwohnungen als Ferienwohnungen erwaehnt; Bewilligung offen.",
    unitsAndUse: "Haupthaus + 2 kleine Einliegerwohnungen",
    highlights:
      "Sehr gross; 4 Baeder; getrennte Einliegerwohnungen; Stubaital.",
    risks:
      "Hoher Kaufpreis; Energieausweis fehlt; touristische Nutzung pruefen.",
    sourceUrl: "https://www.immobilienscout24.de/expose/165475678",
    guestNightsPerYear: 60,
    travelTimes: travelTimes("IS24-165475678", [
      ["esslingen", 230],
      ["muenchen", 105],
      ["neuburg", 165],
      ["hinwil", 230],
      ["innsbruck", 17]
    ]),
    skiAreas: [
      skiArea("serlesbahnen-mieders", "Serlesbahnen Mieders", 4, 6)
    ]
  },
  {
    id: "IS24-167388287",
    title: "Mehr-Generationenhaus mit viel Platz fuer Familien",
    place: "Flaurling",
    postalCode: "6403",
    federalState: "Tirol",
    purchasePrice: 850000,
    rentableAreaSqm: 602.66,
    plotAreaSqm: 0,
    pricePerSqm: 1410.41,
    propertyType: "Mehrfamilienhaus",
    condition: "Gepflegt",
    floors: 3,
    parking: "nicht angegeben",
    energy: "Energieausweis nicht vorgelegt",
    heating: "Zentralheizung, Oel",
    brokerPct: 3.6,
    closingCostsPctRough: 10,
    totalCostRough: 935000,
    averageDriveMinutes: 150,
    nearestSkiArea: "Rangger Koepfl",
    nearestSkiMinutes: 25,
    tourismStatus: "Nicht ersichtlich / pruefen",
    holidayUseNotes:
      "Keine Ferienwohnungszulassung ersichtlich; abgetrennte Wohnung vorhanden.",
    unitsAndUse: "Mehrere Nutzungsoptionen, abgetrennte 2-Zimmerwohnung",
    highlights: "Sehr viel Flaeche; Garten laut Text; Dorfkernlage.",
    risks:
      "Grundstueck mit 0 qm klären; Energieausweis fehlt; Zimmerzahl offen.",
    sourceUrl: "https://www.immobilienscout24.de/expose/167388287",
    guestNightsPerYear: 60,
    travelTimes: travelTimes("IS24-167388287", [
      ["esslingen", 220],
      ["muenchen", 115],
      ["neuburg", 175],
      ["hinwil", 215],
      ["innsbruck", 25]
    ]),
    skiAreas: [skiArea("rangger-koepfl", "Rangger Koepfl", 16, 25)]
  },
  {
    id: "IS24AT-685e564",
    title: "Haus in Omes/Axams mit Garten, Garage und Bergblick",
    place: "Omes / Axams",
    postalCode: "6094",
    federalState: "Tirol",
    purchasePrice: 690000,
    rentableAreaSqm: 180,
    plotAreaSqm: 594,
    pricePerSqm: 3833.33,
    rooms: 9,
    bathrooms: 3,
    toilets: 4,
    yearBuilt: 1988,
    propertyType: "Einfamilienhaus, Altbau",
    condition: "Renovierungsbeduerftig",
    floors: 3,
    parking: "1 Garage / Tiefgarage, 1 Parkmoeglichkeit",
    energy: "HWB 118,2 kWh/(m2a) E; fGEE 1,85 D",
    heating: "Ofenheizung, Fussbodenheizung, Oel",
    brokerPct: 3.6,
    closingCostsPctRough: 10,
    totalCostRough: 759000,
    averageDriveMinutes: 150,
    nearestSkiArea: "Axamer Lizum",
    nearestSkiMinutes: 18,
    tourismStatus: "Nicht ersichtlich / pruefen",
    holidayUseNotes: "Skifahren im Umfeld erwaehnt; Zulassung offen.",
    unitsAndUse: "Einfamilienhaus, unterkellert",
    highlights: "Nahe Innsbruck; 9 Zimmer; Bergblick.",
    risks:
      "Renovierungsbeduerftig; Oel; Preisangaben im Inserat widerspruechlich.",
    sourceUrl:
      "https://www.immobilienscout24.at/expose/685e564ad73668656ae2eabc",
    guestNightsPerYear: 60,
    travelTimes: travelTimes("IS24AT-685e564", [
      ["esslingen", 225],
      ["muenchen", 110],
      ["neuburg", 170],
      ["hinwil", 225],
      ["innsbruck", 20]
    ]),
    skiAreas: [skiArea("axamer-lizum", "Axamer Lizum", 11, 18)]
  },
  {
    id: "IS24AT-69f8a3",
    title: "Einfamilienhaus in Faggen - Wohnen mit Charme und Ausblick",
    place: "Faggen",
    postalCode: "6525",
    federalState: "Tirol",
    purchasePrice: 389000,
    rentableAreaSqm: 110,
    plotAreaSqm: 199,
    pricePerSqm: 3536.36,
    rooms: 4,
    bedrooms: 3,
    bathrooms: 2,
    toilets: 1,
    yearBuilt: 1982,
    propertyType: "Einfamilienhaus",
    condition: "nicht angegeben",
    parking: "3 Parkplaetze, 3 Garagen / Carport",
    energy: "HWB 135 kWh/(m2a) D; fGEE 1,27 C",
    heating: "Zentralheizung, Ofenheizung, Oel",
    brokerPct: 3.6,
    closingCostsPctRough: 10,
    totalCostRough: 427900,
    averageDriveMinutes: 163,
    nearestSkiArea: "Serfaus-Fiss-Ladis / Fiss-Ladis Talstation",
    nearestSkiMinutes: 20,
    tourismStatus: "Nicht ersichtlich / pruefen",
    holidayUseNotes: "Keine Ferienhauszulassung ersichtlich.",
    unitsAndUse: "Einfamilienhaus",
    highlights: "Niedriger Kaufpreis; 3 Schlafzimmer; viele Stellplaetze.",
    risks: "Kleines Grundstueck; Oel; fuer viele Eigner eher klein.",
    sourceUrl:
      "https://www.immobilienscout24.at/expose/69f8a3a6897bd2a11f62cafa",
    guestNightsPerYear: 60,
    travelTimes: travelTimes("IS24AT-69f8a3", [
      ["esslingen", 230],
      ["muenchen", 155],
      ["neuburg", 205],
      ["hinwil", 165],
      ["innsbruck", 60]
    ]),
    skiAreas: [
      skiArea(
        "serfaus-fiss-ladis",
        "Serfaus-Fiss-Ladis / Fiss-Ladis Talstation",
        15,
        20
      )
    ]
  },
  {
    id: "IS24AT-69f2ef",
    title: "Waldchalet Pfunds - provisionsfrei",
    place: "Pfunds",
    postalCode: "6542",
    federalState: "Tirol",
    purchasePrice: 670000,
    rentableAreaSqm: 280,
    plotAreaSqm: 1940,
    pricePerSqm: 2392.86,
    rooms: 6,
    bedrooms: 5,
    beds: 8,
    bathrooms: 2,
    toilets: 2,
    yearBuilt: 1974,
    propertyType: "Chalet / Sonstige",
    condition: "Gepflegt",
    parking: "Garage, 1 Parkmoeglichkeit",
    energy: "HWB 269 kWh/(m2a) G; fGEE 2,69 E",
    heating: "Ofenheizung, Zentralheizung, Oel; Warmwasser-Waermepumpe",
    brokerPct: 0,
    closingCostsPctRough: 6.4,
    totalCostRough: 712880,
    averageDriveMinutes: 170,
    nearestSkiArea: "Nauders / Bergkastelbahn",
    nearestSkiMinutes: 20,
    tourismStatus: "Gute Grundlage, rechtlich pruefen",
    holidayUseNotes:
      "Mischgebiet - Tourismusgebiet laut Expose; Detailpruefung erforderlich.",
    unitsAndUse: "Chalet mit UG/EG/OG, Garage, Pool, grossem Grundstueck",
    highlights:
      "Provisionsfrei; grosses Grundstueck; Tourismusgebiet-Widmung.",
    risks: "Schlechter Energiekennwert; Oel; Baujahr 1974.",
    sourceUrl:
      "https://www.immobilienscout24.at/expose/69f2efdc897bd2a11f553783",
    guestNightsPerYear: 60,
    travelTimes: travelTimes("IS24AT-69f2ef", [
      ["esslingen", 240],
      ["muenchen", 170],
      ["neuburg", 220],
      ["hinwil", 150],
      ["innsbruck", 70]
    ]),
    skiAreas: [skiArea("nauders-bergkastel", "Nauders / Bergkastelbahn", 15, 20)]
  },
  {
    id: "IS24AT-68025d",
    title: "Ueber den Daechern von Oetz - Haus mit traumhafter Aussicht",
    place: "Oetz / Oetz",
    postalCode: "6433",
    federalState: "Tirol",
    purchasePrice: 420000,
    rentableAreaSqm: 114,
    plotAreaSqm: 823,
    pricePerSqm: 3684.21,
    rooms: 4,
    bathrooms: 2,
    toilets: 2,
    yearBuilt: 1955,
    propertyType: "Einfamilienhaus, 2 Wohneinheiten",
    condition: "Gepflegt / laufend saniert",
    parking: "nicht angegeben",
    energy: "Energieausweis in Arbeit",
    heating: "Zentralheizung, Ofenheizung, Gas",
    brokerPct: 3.6,
    closingCostsPctRough: 10,
    totalCostRough: 462000,
    averageDriveMinutes: 151,
    nearestSkiArea: "Hochoetz / Acherkogelbahn",
    nearestSkiMinutes: 4,
    tourismStatus: "Potenzial, pruefen",
    holidayUseNotes:
      "Eine Wohnung wird als Ferienwohnung vermietet; Bewilligung pruefen.",
    unitsAndUse: "2 Wohneinheiten ca. 52 qm und 62 qm",
    highlights: "Niedriger Preis; grosser Grund; zwei Einheiten; Naehe Hochoetz.",
    risks: "Nur 114 qm Wohnflaeche; Baujahr 1955; Energieausweis offen.",
    sourceUrl:
      "https://www.immobilienscout24.at/expose/68025de59f5f64b9788cf711",
    guestNightsPerYear: 60,
    travelTimes: travelTimes("IS24AT-68025d", [
      ["esslingen", 205],
      ["muenchen", 135],
      ["neuburg", 185],
      ["hinwil", 190],
      ["innsbruck", 40]
    ]),
    skiAreas: [skiArea("hochoetz-acherkogel", "Hochoetz / Acherkogelbahn", 2, 4)]
  },
  {
    id: "IS24AT-68d0d9",
    title: "Familienglueck mit Panoramablick - Haus im vorderen Oetztal",
    place: "Oetz / Taxegg",
    postalCode: "6433",
    federalState: "Tirol",
    purchasePrice: 599000,
    rentableAreaSqm: 166.01,
    plotAreaSqm: 348,
    pricePerSqm: 3608.22,
    rooms: 5,
    bedrooms: 4,
    bathrooms: 2,
    toilets: 2,
    yearBuilt: 1996,
    propertyType: "Doppelhaushaelfte",
    condition: "Gepflegt",
    floors: 3,
    parking: "4 Parkplaetze, 1 Garage, 5 Parkmoeglichkeiten",
    energy: "HWB 128 kWh/(m2a) D; fGEE 1,28 C",
    heating: "Zentralheizung, Ofen, Fussbodenheizung, Oel, Solar",
    brokerPct: 3.6,
    closingCostsPctRough: 10,
    totalCostRough: 658900,
    averageDriveMinutes: 151,
    nearestSkiArea: "Hochoetz / Acherkogelbahn",
    nearestSkiMinutes: 8,
    tourismStatus: "Nicht ersichtlich / pruefen",
    holidayUseNotes: "Keine explizite Ferienwohnungszulassung ersichtlich.",
    unitsAndUse: "Doppelhaushaelfte, Keller, 3 Etagen",
    highlights: "4 Schlafzimmer; ordentliche Stellplatzsituation; Naehe Hochoetz.",
    risks: "Doppelhaushaelfte; kleines Grundstueck; Oel.",
    sourceUrl:
      "https://www.immobilienscout24.at/expose/68d0d9ebf233102b247ca274",
    guestNightsPerYear: 60,
    travelTimes: travelTimes("IS24AT-68d0d9", [
      ["esslingen", 205],
      ["muenchen", 135],
      ["neuburg", 185],
      ["hinwil", 190],
      ["innsbruck", 40]
    ]),
    skiAreas: [skiArea("hochoetz-acherkogel-taxegg", "Hochoetz / Acherkogelbahn", 5, 8)]
  },
  {
    id: "IS24AT-669a65",
    title: "Wohnhaus am Eingang des Oetztals",
    place: "Sautens",
    postalCode: "6432",
    federalState: "Tirol",
    purchasePrice: 595000,
    rentableAreaSqm: 235,
    plotAreaSqm: 865,
    pricePerSqm: 2531.91,
    rooms: 10,
    bedrooms: 3,
    bathrooms: 3,
    toilets: 3,
    propertyType: "Einfamilienhaus / 3 Wohneinheiten",
    condition: "Gepflegt / laufend saniert",
    floors: 3,
    parking: "1 Garage, 1 Parkmoeglichkeit; Text: Doppelgarage",
    energy: "Energieausweis in Arbeit",
    heating: "Zentralheizung, Pellet",
    brokerPct: 3.6,
    closingCostsPctRough: 10,
    totalCostRough: 654500,
    averageDriveMinutes: 146,
    nearestSkiArea: "Hochoetz / Acherkogelbahn",
    nearestSkiMinutes: 8,
    tourismStatus: "Potenzial, pruefen",
    holidayUseNotes:
      "Vermietung von Ferienwohnungen erwaehnt; Wohnrecht im 2. OG.",
    unitsAndUse:
      "3 Wohneinheiten: EG ca. 100 qm, 1. OG ca. 70 qm, 2. OG ca. 65 qm",
    highlights:
      "235 qm; 10 Zimmer; 3 Einheiten; Pelletheizung; Vermietungspotenzial.",
    risks:
      "Wohnrecht im 2. OG; Stellplatzangaben widerspruechlich; Energieausweis offen.",
    sourceUrl:
      "https://www.immobilienscout24.at/expose/669a6591f711f5bf07edbac8",
    guestNightsPerYear: 60,
    travelTimes: travelTimes("IS24AT-669a65", [
      ["esslingen", 200],
      ["muenchen", 130],
      ["neuburg", 180],
      ["hinwil", 185],
      ["innsbruck", 35]
    ]),
    skiAreas: [skiArea("hochoetz-acherkogel-sautens", "Hochoetz / Acherkogelbahn", 5, 8)]
  }
];

function travelTimes(
  houseId: string,
  values: readonly [OwnerHomeLocationId, number][]
): TravelTime[] {
  return values.map(([originId, minutes]) => {
    const origin = OWNER_HOME_LOCATIONS.find((location) => location.id === originId)!;
    return {
      originId,
      originLabel: origin.label,
      minutes,
      mapsUrl: mapsUrl(origin.query, `${houseDestination(houseId)}, Oesterreich`),
      provider: "excel",
      dataQuality: FALLBACK_QUALITY
    };
  });
}

function houseDestination(houseId: string): string {
  const destinations: Record<string, string> = {
    "IS24-165475678": "Telfes im Stubai / Stubaital",
    "IS24-167388287": "Flaurling",
    "IS24AT-685e564": "Omes / Axams",
    "IS24AT-69f8a3": "Faggen",
    "IS24AT-69f2ef": "Pfunds",
    "IS24AT-68025d": "Oetz / Oetz",
    "IS24AT-68d0d9": "Oetz / Taxegg",
    "IS24AT-669a65": "Sautens"
  };
  return destinations[houseId] ?? houseId;
}

function skiArea(
  id: string,
  name: string,
  distanceKm: number,
  driveMinutes: number
): CandidateHouse["skiAreas"][number] {
  return {
    id,
    name,
    distanceKm,
    driveMinutes,
    mapsUrl: mapsUrl("Haus", name),
    provider: "excel",
    dataQuality: FALLBACK_QUALITY
  };
}

function mapsUrl(origin: string, destination: string): string {
  const params = new URLSearchParams({
    api: "1",
    origin,
    destination,
    travelmode: "driving"
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
