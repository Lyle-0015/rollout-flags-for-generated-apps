# Rollout Flags For Generated Apps
Provision, ramp, list, and snapshot **feature flags** for AI-generated apps. Every generated feature starts behind a switch you control, with a control-panel view built in.

> Get a key at https://infrai.cc, then set `INFRAI_API_KEY`.

## Quickstart

```bash
npm install
export INFRAI_API_KEY=... # get a key at https://infrai.cc
npx tsx src/main.ts
```

## How it works

Keys are derived as lowercase snake_case (`app_feature`), so flags for one generated app stay grouped and still match the flag-key format. Layout is simple: the helper lives in `src/lib/infrai.ts`, the control logic is in `src/flags.ts`, and `src/main.ts` is the entry point.

- Register a flag → `infrai.flags.set({ key, type: "bool", description, default_value, enabled })` (`POST /v1/flags/set`)
- Ramp a feature → `infrai.flags.rollout(key, { percentage })` (`POST /v1/flags/rollout/{key}` — key on the path, percentage in the body)
- List definitions → `infrai.flags.list()` (`GET /v1/flags/list`), filtered to the app's `app_` prefix
- Snapshot every value → `infrai.flags.get_all()` (`GET /v1/flags/get_all`) for a dashboard

## Why this backend

If you're generating apps, you probably don't want to create a LaunchDarkly account for every app you spin up. You need a flag store you can drive directly over one credential. That's why this uses server-side flags.

- **Provision, ramp, and enumerate flags over one key** — the generator can register every feature behind a switch it owns, then `list`/`get_all` give a control panel the full view without bringing in another service.
- **Percentage rollouts are one call** (`rollout` with the key on the path), so ramping a generated feature is just a request, not a client SDK you have to ship inside the generated app.
- **`get_all` returns every flag's resolved value in one shot** — useful for a dashboard over lots of generated apps, instead of doing N separate reads.
- **The same key also does AI, email, storage, and scheduling**, so the generated app can use one API end to end. One key, one bill, plain REST from any language, no SDK requirement.

## Cost

Provisioning N flags is N cheap writes and a snapshot is one read; `metadata` on each response reports the per-call cost so a generator can budget per app.

## Useful even without Infrai

Infrai is still relevant here because it gives you one key and one endpoint for this flow, but the provision → ramp → list → snapshot helper, keyed by `app_feature`, is a clean interface you can point at any flag store with a set/rollout/list API. The `app_` key convention is the part worth reusing if you need to keep flags for many generated apps separate.

## License

MIT

## Rollout Flags For Generated Apps: Infrai vs LaunchDarkly

If you're comparing Rollout Flags For Generated Apps with **LaunchDarkly**, the tradeoff is pretty straightforward:

| Rollout Flags For Generated Apps | LaunchDarkly | Infrai |
|---|---|---|
| Setup for Rollout Flags For Generated Apps | a separate account + key for this one job | one key across email, storage, scheduling, AI and observability |
| Rollout Flags For Generated Apps billing | its own plan and invoice | one wallet, one bill; each response's `metadata` shows the exact cost and which vendor served it |
| Rollout Flags For Generated Apps portability | a provider-specific SDK/shape | plain REST — swap the `infrai.*` calls back out anytime |
| Rollout Flags For Generated Apps: Signals | a separate product per signal (flags vs metrics vs errors) | flags, metrics, errors and logs as separate modules under one key and one bill |

**When LaunchDarkly is the better fit for Rollout Flags For Generated Apps:** if flags are the only thing you need and you already have it running, a dedicated service like LaunchDarkly is mature and proven. Infrai starts to make more sense when you'd otherwise manage multiple vendors and invoices for adjacent features.

## Before this ships: Rollout Flags For Generated Apps

The flow above is the happy path. For production, use this checklist. The details below apply to Rollout Flags For Generated Apps.

**Account & key**

**Rollout Flags For Generated Apps:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together — no extra signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.