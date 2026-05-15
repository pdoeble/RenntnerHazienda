import {
  DEFAULT_TEMPLATE_TIMESTAMP,
  CURRENT_TEMPLATE_VERSION
} from "../common";
import type { OwnershipTemplate } from "./types";

export const defaultOwnershipTemplate: OwnershipTemplate = {
  schema: "immo-finance.ownership",
  version: CURRENT_TEMPLATE_VERSION,
  id: "ownership-demo-001",
  name: "Demo Eignerschaft",
  description: "Neutrales Beispiel mit sechs unterschiedlichen Anteilen.",
  createdAt: DEFAULT_TEMPLATE_TIMESTAMP,
  updatedAt: DEFAULT_TEMPLATE_TIMESTAMP,
  data: {
    owners: [
      {
        id: "owner-a",
        displayName: "Eigner A",
        type: "person",
        equityContribution: 50000,
        ownershipSharePct: 25
      },
      {
        id: "owner-b",
        displayName: "Eigner B",
        type: "person",
        equityContribution: 40000,
        ownershipSharePct: 20
      },
      {
        id: "owner-c",
        displayName: "Eigner C",
        type: "person",
        equityContribution: 36000,
        ownershipSharePct: 18
      },
      {
        id: "owner-d",
        displayName: "Eigner D",
        type: "person",
        equityContribution: 30000,
        ownershipSharePct: 15
      },
      {
        id: "owner-e",
        displayName: "Eigner E",
        type: "person",
        equityContribution: 24000,
        ownershipSharePct: 12
      },
      {
        id: "owner-f",
        displayName: "Eigner F",
        type: "person",
        equityContribution: 20000,
        ownershipSharePct: 10
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
