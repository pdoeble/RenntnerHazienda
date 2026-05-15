import { VISIBLE_INPUT_KINDS, type TemplateKind } from "../domain/templates";
import {
  registerInputModule,
  type RegisteredInputModule
} from "./common";
import { capexModule } from "./capex";
import { closingCostsModule } from "./closing-costs";
import { financingModule } from "./financing";
import { legalFormModule } from "./legal-form";
import { opexModule } from "./opex";
import { ownershipModule } from "./ownership";
import { propertyModule } from "./property";
import { strategyModule } from "./strategy";

export const inputModules = [
  registerInputModule(ownershipModule),
  registerInputModule(legalFormModule),
  registerInputModule(capexModule),
  registerInputModule(propertyModule),
  registerInputModule(closingCostsModule),
  registerInputModule(financingModule),
  registerInputModule(strategyModule),
  registerInputModule(opexModule)
] satisfies readonly RegisteredInputModule[];

export const visibleInputModules = inputModules.filter((module) =>
  VISIBLE_INPUT_KINDS.includes(module.kind as (typeof VISIBLE_INPUT_KINDS)[number])
);

export const modulesByKind = Object.fromEntries(
  inputModules.map((module) => [module.kind, module])
) as Record<TemplateKind, RegisteredInputModule>;

export function getInputModule(kind: TemplateKind): RegisteredInputModule {
  return modulesByKind[kind];
}
