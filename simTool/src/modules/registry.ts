import type { TemplateKind } from "../domain/templates";
import {
  registerInputModule,
  type RegisteredInputModule
} from "./common";
import { capexModule } from "./capex";
import { closingCostsModule } from "./closing-costs";
import { legalFormModule } from "./legal-form";
import { opexModule } from "./opex";
import { ownershipModule } from "./ownership";
import { propertyModule } from "./property";

export const inputModules = [
  registerInputModule(ownershipModule),
  registerInputModule(legalFormModule),
  registerInputModule(capexModule),
  registerInputModule(propertyModule),
  registerInputModule(closingCostsModule),
  registerInputModule(opexModule)
] satisfies readonly RegisteredInputModule[];

export const modulesByKind = Object.fromEntries(
  inputModules.map((module) => [module.kind, module])
) as Record<TemplateKind, RegisteredInputModule>;

export function getInputModule(kind: TemplateKind): RegisteredInputModule {
  return modulesByKind[kind];
}
