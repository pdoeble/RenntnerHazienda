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
  description: "Neutrales Beispiel mit zwei gleich großen Anteilen.",
  createdAt: DEFAULT_TEMPLATE_TIMESTAMP,
  updatedAt: DEFAULT_TEMPLATE_TIMESTAMP,
  data: {
    owners: [
      {
        id: "owner-a",
        displayName: "Eigner A",
        type: "person",
        ownershipSharePct: 50
      },
      {
        id: "owner-b",
        displayName: "Eigner B",
        type: "person",
        ownershipSharePct: 50
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
