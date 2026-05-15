import { z } from "zod";

type VersionMigration = (input: unknown) => unknown;

const versionedEnvelopeSchema = z
  .object({
    schema: z.string(),
    version: z.number().int().min(1)
  })
  .passthrough();

export function migrateVersionedEnvelope(
  input: unknown,
  currentVersion: number,
  migrations: Partial<Record<number, VersionMigration>>
): unknown {
  const envelope = versionedEnvelopeSchema.parse(input);

  if (envelope.version > currentVersion) {
    throw new Error(
      `Unsupported version ${envelope.version}; current version is ${currentVersion}.`
    );
  }

  let migrated: unknown = input;
  let version = envelope.version;

  while (version < currentVersion) {
    const migration = migrations[version];
    if (!migration) {
      throw new Error(`Missing migration from version ${version}.`);
    }

    migrated = migration(migrated);
    version += 1;
  }

  return migrated;
}
