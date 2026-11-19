#!/usr/bin/env node
// Ventryx solutions installer. See solutions/README.md.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { loadConfig } from "./lib/config.mjs";
import { formatReport, install, renderOffline } from "./lib/install.mjs";
import { createApi } from "./lib/n8n-api.mjs";

const USAGE = `Usage: node solutions/install.mjs <client-config.json> [--apply] [--offline [--out <dir>]]

  (no flag)   Dry run: reads from n8n and prints what would change.
  --apply     Create or update the credentials and workflows.
  --offline   Do not contact n8n. Write the workflow JSON to --out (default solutions/out/<client id>)
              so it can be checked or imported by hand.`;

async function main(argv) {
  const args = argv.slice(2);
  const flags = new Set(args.filter((a) => a.startsWith("--")));
  const outIndex = args.indexOf("--out");
  const outDir = outIndex >= 0 ? args[outIndex + 1] : undefined;
  const file = args.find((a, i) => !a.startsWith("--") && i !== outIndex + 1);
  for (const flag of flags) {
    if (!["--apply", "--offline", "--out", "--help"].includes(flag)) {
      console.error(`Unknown option ${flag}\n\n${USAGE}`);
      return 2;
    }
  }
  if (!file || flags.has("--help")) {
    console.error(USAGE);
    return file ? 0 : 2;
  }
  const offline = flags.has("--offline");
  if (offline && flags.has("--apply")) {
    console.error("--offline and --apply cannot be used together.");
    return 2;
  }

  let raw;
  try {
    raw = JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    console.error(`Could not read ${file}: ${error.message}`);
    return 2;
  }
  const { config, errors } = loadConfig(raw, { offline });
  if (errors.length > 0) {
    console.error(`${file} has ${errors.length} problem(s):\n${errors.map((e) => `  - ${e}`).join("\n")}`);
    return 1;
  }

  if (offline) {
    const dir = outDir ?? path.join(path.dirname(new URL(import.meta.url).pathname), "out", config.client.id);
    await mkdir(dir, { recursive: true });
    const workflows = renderOffline(config);
    for (const w of workflows) {
      const { key, ...body } = w;
      await writeFile(path.join(dir, `${key}.json`), `${JSON.stringify(body, null, 2)}\n`);
    }
    console.log(`Wrote ${workflows.length} workflow file(s) to ${dir}. Credential ids are placeholders; n8n asks you to pick the credentials when you import.`);
    return 0;
  }

  const apiKey = process.env[config.n8n.apiKeyEnv];
  if (!apiKey) {
    console.error(`Set ${config.n8n.apiKeyEnv} to an n8n API key for ${config.n8n.baseUrl}, or use --offline to only write the workflow files.`);
    return 1;
  }
  const api = createApi({ baseUrl: config.n8n.baseUrl, apiKey });
  const report = await install(config, { api, env: process.env, apply: flags.has("--apply") });
  console.log(formatReport(report, config));
  return report.errors.length > 0 ? 1 : 0;
}

main(process.argv).then(
  (code) => process.exit(code),
  (error) => {
    console.error(error.message);
    process.exit(1);
  },
);
