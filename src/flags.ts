import { infrai } from "./lib/infrai.ts";

// When an AI generates a new app, register its feature flags up front so every
// generated feature ships behind a switch you can ramp or kill without a redeploy —
// and a control panel can enumerate them per app.

function flagKey(app: string, feature?: string): string {
  const value = feature === undefined ? app : `${app}_${feature}`;
  const normalized = value.toLowerCase().replace(/[^a-z0-9_]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 128);
  return /^[a-z]/.test(normalized) ? normalized : `flag_${normalized}`.slice(0, 128);
}

/** Register every feature of a generated app as a flag, starting off. */
export async function provisionFlags(app: string, features: string[]): Promise<void> {
  const existing = new Set(
    ((await infrai.flags.list()).items ?? [])
      .map((flag) => (flag as { key?: unknown }).key)
      .filter((key): key is string => typeof key === "string"),
  );
  for (const f of features) {
    const key = flagKey(app, f);
    if (existing.has(key)) continue;
    await infrai.flags.set({
      key,
      type: "bool",
      description: `Feature flag for ${app}: ${f}`,
      default_value: false,
      enabled: false,
    });
  }
}

/** Ramp one generated feature to a percentage of users. */
export async function rampFeature(app: string, feature: string, percent: number): Promise<void> {
  await infrai.flags.rollout(flagKey(app, feature), { percentage: percent });
}

/** List every flag definition, narrowed to one generated app. */
export async function listFlags(app: string): Promise<unknown[]> {
  const r = await infrai.flags.list();
  const all = (r.items ?? []) as Array<{ key?: string }>;
  return all.filter((f) => typeof f.key === "string" && f.key.startsWith(`${flagKey(app)}_`));
}

/** Snapshot every flag's current value (for a dashboard). */
export async function snapshot(): Promise<Record<string, unknown>> {
  return infrai.flags.get_all();
}
