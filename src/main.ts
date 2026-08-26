import { provisionFlags, rampFeature, listFlags } from "./flags.ts";

// Entry point: provision a generated app's flags, ramp one, then list them back.
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const app = "gen-app-42";
    await provisionFlags(app, ["dark-mode", "csv-export", "ai-summary"]);
    await rampFeature(app, "ai-summary", 25);
    console.log("flags for", app, await listFlags(app));
  })();
}
