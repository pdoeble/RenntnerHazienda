import {
  DEFAULT_TEMPLATE_TIMESTAMP,
  CURRENT_TEMPLATE_VERSION
} from "../common";
import type { OwnershipTemplate } from "./types";

export const defaultOwnershipTemplate: OwnershipTemplate = {
  schema: "immo-finance.ownership",
  version: CURRENT_TEMPLATE_VERSION,
  id: "ownership-waldchalet-pfunds-demo",
  name: "Demo Eignerschaft Waldchalet Pfunds",
  description: "Demo-Szenario aus Jonas' Entwurf mit konkreten Beteiligten.",
  createdAt: DEFAULT_TEMPLATE_TIMESTAMP,
  updatedAt: DEFAULT_TEMPLATE_TIMESTAMP,
  data: {
    owners: [
      {
        id: "phil",
        displayName: "Phil",
        type: "person",
        participationTier: 100,
        equityContribution: 40000,
        ownershipSharePct: 21.62162162162162
      },
      {
        id: "jonas",
        displayName: "Jonas",
        type: "person",
        participationTier: 100,
        equityContribution: 40000,
        ownershipSharePct: 21.62162162162162
      },
      {
        id: "margarele",
        displayName: "Margerle",
        type: "person",
        participationTier: 50,
        equityContribution: 15000,
        ownershipSharePct: 8.108108108108109
      },
      {
        id: "manu",
        displayName: "Manu",
        type: "person",
        participationTier: 50,
        equityContribution: 15000,
        ownershipSharePct: 8.108108108108109
      },
      {
        id: "niels",
        displayName: "Niels",
        type: "person",
        participationTier: 50,
        equityContribution: 15000,
        ownershipSharePct: 8.108108108108109
      },
      {
        id: "nils",
        displayName: "Nils",
        type: "person",
        participationTier: 50,
        equityContribution: 15000,
        ownershipSharePct: 8.108108108108109
      },
      {
        id: "kai",
        displayName: "Kai",
        type: "person",
        participationTier: 50,
        equityContribution: 15000,
        ownershipSharePct: 8.108108108108109
      },
      {
        id: "stressi",
        displayName: "Stressi",
        type: "person",
        participationTier: 50,
        equityContribution: 15000,
        ownershipSharePct: 8.108108108108109
      },
      {
        id: "jens",
        displayName: "Jens",
        type: "person",
        participationTier: 50,
        equityContribution: 15000,
        ownershipSharePct: 8.108108108108109
      }
    ],
    contributionRules: [
      {
        id: "rule-ownership",
        name: "Nach Eigentumsanteil",
        basis: "ownershipShare"
      }
    ]
  }
};
