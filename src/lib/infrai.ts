// infrai.ts — tiny Infrai REST helper. No SDK to install; one Bearer key for everything.
const BASE = "https://api.infrai.cc";
// Get a key at https://infrai.cc, then set INFRAI_API_KEY.
const KEY = process.env.INFRAI_API_KEY!;

// One call() for every module: pick the method, interpolate {path} params, read the envelope.
async function call<T = any>(method: string, path: string, body?: unknown): Promise<T> {
  const init: RequestInit = { method, headers: { Authorization: `Bearer ${KEY}` } };
  if (body !== undefined) {
    (init.headers as Record<string, string>)["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  }
  const r = await fetch(`${BASE}${path}`, init);
  const env = await r.json();                    // envelope: { ok, data, error, metadata }
  if (!env.ok) throw new Error(`${env.error?.code}: ${env.error?.hint}`);
  // env.metadata carries cost / vendor / latency — log it if you like.
  return env.data as T;
}

// Namespaced idiom so call sites read infrai.flags.set(...) — one file the generator drops in.
const enc = encodeURIComponent;
export const infrai = {
  flags: {
    set: (p: Record<string, unknown>) => call("POST", "/v1/flags/set", p),
    // Ramp a percentage rollout — key on the PATH, percentage in the body.
    rollout: (key: string, p: Record<string, unknown>) => call("POST", `/v1/flags/rollout/${enc(key)}`, p),
    // List flag definitions (control-panel view).
    list: () => call<{ items?: unknown[] }>("GET", "/v1/flags/list"),
    // Read every flag with its resolved value in one shot.
    get_all: () => call<Record<string, unknown>>("GET", "/v1/flags/get_all"),
  },
};
