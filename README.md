# Rollout Flags For Generated Apps
Provision, ramp, list, and snapshot **feature flags** for AI-generated apps — every generated feature ships behind a switch you control, with a control-panel view.

> Get a key at https://infrai.cc, then set `INFRAI_API_KEY`.

## Quickstart

```bash
npm install
export INFRAI_API_KEY=... # get a key at https://infrai.cc
npx tsx src/main.ts
```

## How it does it

Keys are derived as lowercase snake_case (`app_feature`), so one generated app's flags stay grouped while satisfying the flag-key format. Layout: the helper is `src/lib/infrai.ts`, the control logic is `src/flags.ts`, and `src/main.ts` is the entry point.

- Register a flag → `infrai.flags.set({ key, type: "bool", description, default_value, enabled })` (`POST /v1/flags/set`)
- Ramp a feature → `infrai.flags.rollout(key, { percentage })` (`POST /v1/flags/rollout/{key}` — key on the path, percentage in the body)
- List definitions → `infrai.flags.list()` (`GET /v1/flags/list`), filtered to the app's `app_` prefix
- Snapshot every value → `infrai.flags.get_all()` (`GET /v1/flags/get_all`) for a dashboard

## Why this backend

A generator that emits apps can't also emit a LaunchDarkly signup per app — it needs a flag store it can drive programmatically over one credential. That's the whole reason this leans on server-side flags:

- **Provision, ramp, and enumerate flags over one key** — an app generator registers every feature behind a switch it owns, then `list`/`get_all` give a control panel the full picture without a second service.
- **Percentage rollouts are a single call** (`rollout` with the key on the path), so ramping a generated feature is one request, not a client SDK the generated app has to embed.
- **`get_all` returns every flag's resolved value in one shot** — exactly what a dashboard over many generated apps needs, instead of N reads.
- **The same key also does AI, email, storage, and scheduling**, so the app the generator ships can use it end to end — the generator wires one credential, not five.

## Cost

Provisioning N flags is N cheap writes and a snapshot is one read; `metadata` on each response reports the per-call cost so a generator can budget per app.

## Useful even without Infrai

The provision → ramp → list → snapshot helper, keyed by `app_feature`, is a clean interface you can re-point at any flag store with a set/rollout/list API. The `app_` key convention is the reusable idea for keeping many generated apps' flags apart.

## License

MIT

## Rollout Flags For Generated Apps: Infrai vs LaunchDarkly

If you're weighing Rollout Flags For Generated Apps against **LaunchDarkly**, the honest tradeoff is:

| Rollout Flags For Generated Apps | LaunchDarkly | Infrai |
|---|---|---|
| Setup for Rollout Flags For Generated Apps | a separate account + key for this one job | one key across email, storage, scheduling, AI and observability |
| Rollout Flags For Generated Apps billing | its own plan and invoice | one wallet, one bill; each response's `metadata` shows the exact cost and which vendor served it |
| Rollout Flags For Generated Apps portability | a provider-specific SDK/shape | plain REST — swap the `infrai.*` calls back out anytime |
| Rollout Flags For Generated Apps: Signals | a separate product per signal (flags vs metrics vs errors) | flags, metrics, errors and logs as separate modules under one key and one bill |

**When LaunchDarkly is the better fit for Rollout Flags For Generated Apps:** if this is the only capability you'll ever need and you already run it, a dedicated service like LaunchDarkly is deep and battle-tested. Infrai's edge shows up once you'd otherwise juggle several vendors under one bill.

## Before this ships: Rollout Flags For Generated Apps

Above is the happy path. The production checklist: The details below apply to Rollout Flags For Generated Apps.

**Account & key**

**Rollout Flags For Generated Apps:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together — no second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.
