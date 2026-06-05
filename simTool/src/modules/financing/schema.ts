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

export const paymentClassSchema = z.enum([
  "echtesEigenkapital",
  "kapitalruecklage",
  "nachschuss",
  "gesellschafterdarlehen",
  "bankdarlehen",
  "nutzungsentgelt",
  "kostenumlage",
  "liquiditaetsreserve",
  "vermietungserloes",
  "foerderung",
  "sonstige"
]);

export const paymentRankSchema = z.enum([
  "vorrangig",
  "gleichrangig",
  "nachrangig",
  "eigenkapitalnah",
  "offen"
]);

export const fundingUseClassSchema = z.enum([
  "kaufpreis",
  "grunderwerbsteuer",
  "grundbuchEigentum",
  "pfandrecht",
  "eingabegebuehr",
  "makler",
  "vertragNotar",
  "beglaubigung",
  "technischePruefung",
  "renovierung",
  "einrichtung",
  "finanzierungsgebuehr",
  "sicherheitspuffer",
  "anfangsliquiditaet",
  "anfangsruecklage",
  "gruendungskosten",
  "sonstige"
]);

export const fundingAmountSchema = z
  .object({
    nettoBetrag: nonNegativeNumberSchema.default(0),
    umsatzsteuerBetrag: nonNegativeNumberSchema.default(0),
    bruttoBetrag: nonNegativeNumberSchema
  })
  .strict();

export const fundingSourceSchema = z
  .object({
    id: idSchema,
    bezeichnung: nonEmptyStringSchema,
    zahlungsklasse: paymentClassSchema,
    bruttoBetrag: nonNegativeNumberSchema,
    monat: monthIndexSchema.default(0),
    rang: paymentRankSchema.default("offen"),
    rueckzahlbar: z.boolean().default(false),
    zinssatzPct: z.number().finite().default(0),
    besichert: z.boolean().default(false),
    wirktAufUnternehmensanteil: z.boolean().default(false),
    wirktAufNutzungsrechte: z.boolean().default(false),
    umsatzsteuerRelevant: z.boolean().default(false),
    buchungsvorlage: z.string().optional(),
    notizen: z.string().optional()
  })
  .strict();

export const fundingUseSchema = z
  .object({
    id: idSchema,
    bezeichnung: nonEmptyStringSchema,
    verwendungsklasse: fundingUseClassSchema,
    betrag: fundingAmountSchema,
    monat: monthIndexSchema.default(0),
    aktivierbar: z.boolean().default(false),
    umsatzsteuerRelevant: z.boolean().default(false),
    buchungsvorlage: z.string().optional(),
    notizen: z.string().optional()
  })
  .strict();

export const bankLoanModeSchema = z.enum(["automatischSaldieren", "manuell"]);

export const financingDataSchema = z
  .object({
    loanName: nonEmptyStringSchema,
    equitySharePct: percentSchema,
    annualInterestRatePct: nonNegativeNumberSchema.max(25),
    termYears: z.number().int().min(1).max(60),
    startMonth: monthIndexSchema,
    additionalMonthlyRepayment: nonNegativeNumberSchema,
    bankdarlehenModus: bankLoanModeSchema.default("automatischSaldieren"),
    mittelherkunft: z.array(fundingSourceSchema).default([]),
    mittelverwendung: z.array(fundingUseSchema).default([])
  })
  .strict();

export const financingTemplateSchema = templateEnvelopeSchema(
  TEMPLATE_SCHEMA_IDS.financing,
  financingDataSchema
);
