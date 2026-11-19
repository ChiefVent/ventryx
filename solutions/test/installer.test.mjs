import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import http from "node:http";
import { test } from "node:test";
import { loadConfig, neededCredentials } from "../lib/config.mjs";
import { formatReport, install, renderOffline } from "../lib/install.mjs";
import { createApi } from "../lib/n8n-api.mjs";

const example = JSON.parse(await readFile(new URL("../clients/example.json", import.meta.url), "utf8"));
const clone = (v) => JSON.parse(JSON.stringify(v));

const ENV = {
  EXAMPLE_ANTHROPIC_KEY: "sk-ant-secret-value",
  EXAMPLE_TWILIO_SID: "AC-secret-sid",
  EXAMPLE_TWILIO_TOKEN: "twilio-secret-token",
  EXAMPLE_WEBHOOK_USER: "hook-user",
  EXAMPLE_WEBHOOK_PASSWORD: "hook-secret-password",
};

/** A small stand-in for the n8n public API that keeps state in memory. */
async function fakeN8n({ gmail = true } = {}) {
  const state = { credentials: [], workflows: [], calls: [], nextId: 1 };
  if (gmail) state.credentials.push({ id: "gm1", name: "Example Electrical Gmail", type: "gmailOAuth2" });
  const server = http.createServer(async (req, res) => {
    let raw = "";
    for await (const chunk of req) raw += chunk;
    const body = raw ? JSON.parse(raw) : undefined;
    const url = new URL(req.url, "http://x");
    const route = `${req.method} ${url.pathname.replace("/api/v1", "")}`;
    state.calls.push({ route, body, key: req.headers["x-n8n-api-key"] });
    const send = (code, data) => {
      res.writeHead(code, { "Content-Type": "application/json" });
      res.end(JSON.stringify(data));
    };
    const wf = /\/workflows\/([^/]+)(?:\/(activate|deactivate))?$/.exec(url.pathname);
    if (route === "GET /credentials") return send(200, { data: state.credentials.map(({ data, ...c }) => c), nextCursor: null });
    if (route === "POST /credentials") {
      const c = { id: `c${state.nextId++}`, ...body };
      state.credentials.push(c);
      return send(200, { id: c.id, name: c.name, type: c.type });
    }
    if (route === "GET /workflows") {
      const name = url.searchParams.get("name");
      // Partial match on purpose: the installer must filter to the exact name itself.
      return send(200, { data: state.workflows.filter((w) => !name || w.name.includes(name)), nextCursor: null });
    }
    if (route === "POST /workflows") {
      const allowed = ["name", "nodes", "connections", "settings", "projectId", "parentFolderId"];
      const extra = Object.keys(body).filter((k) => !allowed.includes(k));
      if (extra.length) return send(400, { message: `request/body must NOT have additional properties: ${extra}` });
      const w = { id: `w${state.nextId++}`, active: false, isArchived: false, ...body };
      state.workflows.push(w);
      return send(200, w);
    }
    if (wf && req.method === "PUT") {
      const w = state.workflows.find((x) => x.id === wf[1]);
      Object.assign(w, body);
      return send(200, w);
    }
    if (wf && req.method === "POST" && wf[2]) {
      const w = state.workflows.find((x) => x.id === wf[1]);
      w.active = wf[2] === "activate";
      return send(200, w);
    }
    send(404, { message: "not found" });
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  return { state, baseUrl, api: createApi({ baseUrl, apiKey: "n8n-api-secret" }), close: () => new Promise((r) => server.close(r)) };
}

function configFor(baseUrl, edit = (c) => c) {
  const raw = clone(example);
  raw.solutions.missedCalls.dataTableId = "tbl123";
  edit(raw);
  const { config, errors } = loadConfig(raw, { offline: true });
  assert.deepEqual(errors, []);
  config.n8n.baseUrl = baseUrl;
  return config;
}

test("example config is valid and needs the expected credentials", () => {
  const { config, errors } = loadConfig(example);
  assert.deepEqual(errors, []);
  assert.deepEqual(neededCredentials(config).sort(), ["anthropic", "gmail", "twilio", "webhook"]);
});

test("config problems are reported in plain words, all at once", () => {
  const raw = clone(example);
  raw.client.id = "Bad Id";
  raw.solutions.missedCalls.approvalPhone = "0851234567";
  raw.solutions.quoteChase.hour = 30;
  raw.solutions.faxBlaster = { enabled: true };
  raw.solutions.emailDrafts.pollMinuts = 5;
  raw.credentials.anthropic.env.apiKey = "sk-ant-real-key-pasted-here";
  delete raw.credentials.twilio;
  const { errors } = loadConfig(raw);
  const all = errors.join("\n");
  for (const expected of ["client.id", "approvalPhone", "quoteChase.hour", "faxBlaster", "pollMinuts", "Never put the key itself", "credentials.twilio is required"]) {
    assert.match(all, new RegExp(expected.replace(".", "\\.")));
  }
});

test("a solution that is off needs no credentials or options", () => {
  const raw = clone(example);
  raw.solutions = { quoteChase: { enabled: true } };
  raw.credentials = { gmail: raw.credentials.gmail, anthropic: raw.credentials.anthropic };
  const { config, errors } = loadConfig(raw);
  assert.deepEqual(errors, []);
  assert.deepEqual(renderOffline(config).map((w) => w.key), ["errorAlerts", "quoteChase"]);
});

test("every rendered workflow is internally consistent", () => {
  const config = configFor("https://n8n.example", (raw) => {
    raw.solutions.missedCalls.transcribeVoicemail = true;
    raw.credentials.openai = { name: "Example OpenAI", env: { apiKey: "EXAMPLE_OPENAI_KEY" } };
  });
  const workflows = renderOffline(config);
  assert.equal(workflows.length, 5);
  for (const w of workflows) {
    const names = new Set(w.nodes.map((n) => n.name));
    assert.equal(names.size, w.nodes.length, `${w.key}: node names are unique`);
    assert.equal(new Set(w.nodes.map((n) => n.id)).size, w.nodes.length, `${w.key}: node ids are unique`);
    const targets = new Set();
    for (const [from, byType] of Object.entries(w.connections)) {
      assert.ok(names.has(from), `${w.key}: connection source "${from}" exists`);
      for (const outputs of Object.values(byType)) {
        for (const links of outputs) for (const l of links) {
          assert.ok(names.has(l.node), `${w.key}: connection target "${l.node}" exists`);
          targets.add(l.node);
        }
      }
    }
    for (const n of w.nodes) {
      const isStart = /Trigger$|\.webhook$|stickyNote$|lmChat|outputParser/.test(n.type);
      if (!isStart) assert.ok(targets.has(n.name), `${w.key}: "${n.name}" is wired in`);
      // Expressions must not reference a node that is not in the workflow.
      for (const m of JSON.stringify(n.parameters).matchAll(/\$\(\\?['"]([^'"\\]+)\\?['"]\)/g)) {
        assert.ok(names.has(m[1]), `${w.key}: "${n.name}" refers to missing node "${m[1]}"`);
      }
    }
    assert.equal(w.settings.timezone, "Europe/Dublin");
    assert.match(w.name, /^SOL — Example Electrical — /);
  }
});

test("rendering is stable, so re-running updates in place", () => {
  const config = configFor("https://n8n.example");
  assert.deepEqual(renderOffline(config), renderOffline(config));
});

test("only the approvals workflow can text a customer, and email workflows only draft", () => {
  const workflows = Object.fromEntries(renderOffline(configFor("https://n8n.example")).map((w) => [w.key, w]));
  const customerSms = (w) => w.nodes.filter((n) => n.type.endsWith(".twilio") && /caller_number/.test(n.parameters.to));
  assert.equal(customerSms(workflows.missedCalls).length, 0);
  assert.equal(customerSms(workflows.missedCallApprovals).length, 2);
  for (const key of ["quoteChase", "emailDrafts", "errorAlerts"]) {
    for (const n of workflows[key].nodes.filter((x) => x.type === "n8n-nodes-base.gmail" && x.parameters.operation === "send")) {
      assert.equal(n.parameters.sendTo, "alerts@example.com", `${key}: the only mail sent goes to the alert address`);
    }
  }
});

test("dry run changes nothing; apply creates everything switched off; a second apply updates in place", async () => {
  const n8n = await fakeN8n();
  try {
    const config = configFor(n8n.baseUrl);

    const dry = await install(config, { api: n8n.api, env: ENV, apply: false });
    assert.deepEqual(dry.errors, []);
    assert.equal(n8n.state.workflows.length, 0);
    assert.equal(n8n.state.credentials.length, 1);
    assert.ok(n8n.state.calls.every((c) => c.route.startsWith("GET ")));
    assert.deepEqual(dry.workflows.map((w) => w.action), ["create", "create", "create", "create", "create"]);

    const first = await install(config, { api: n8n.api, env: ENV, apply: true });
    assert.deepEqual(first.errors, []);
    assert.equal(n8n.state.workflows.length, 5);
    assert.ok(n8n.state.workflows.every((w) => w.active === false));
    assert.deepEqual(n8n.state.credentials.map((c) => c.type).sort(), ["anthropicApi", "gmailOAuth2", "httpBasicAuth", "twilioApi"]);
    assert.deepEqual(n8n.state.credentials.find((c) => c.type === "twilioApi").data, {
      authType: "authToken",
      accountSid: "AC-secret-sid",
      authToken: "twilio-secret-token",
    });
    const errorWf = n8n.state.workflows.find((w) => w.name.endsWith("Error alerts"));
    for (const w of n8n.state.workflows.filter((x) => x !== errorWf)) assert.equal(w.settings.errorWorkflow, errorWf.id);
    const chase = n8n.state.workflows.find((w) => w.name.endsWith("Quote chase"));
    assert.deepEqual(chase.nodes.find((x) => x.name === "Create Draft").credentials, { gmailOAuth2: { id: "gm1", name: "Example Electrical Gmail" } });
    assert.equal(first.webhooks.length, 2);

    const printed = formatReport(first, config) + JSON.stringify(first);
    for (const secret of [...Object.values(ENV).filter((v) => v.includes("secret")), "n8n-api-secret"]) {
      assert.ok(!printed.includes(secret), "no secret appears in the report");
    }
    assert.ok(n8n.state.calls.every((c) => c.key === "n8n-api-secret"));

    const ids = n8n.state.workflows.map((w) => w.id);
    const second = await install(config, { api: n8n.api, env: ENV, apply: true });
    assert.deepEqual(second.workflows.map((w) => w.action), ["updated", "updated", "updated", "updated", "updated"]);
    assert.deepEqual(n8n.state.workflows.map((w) => w.id), ids);
    assert.equal(n8n.state.credentials.length, 4, "credentials are reused, not duplicated");
  } finally {
    await n8n.close();
  }
});

test("switching a solution on and off from the config", async () => {
  const n8n = await fakeN8n();
  try {
    const on = configFor(n8n.baseUrl, (raw) => {
      raw.solutions.quoteChase.active = true;
      raw.solutions.missedCalls.active = true;
    });
    await install(on, { api: n8n.api, env: ENV, apply: true });
    const active = () => n8n.state.workflows.filter((w) => w.active).map((w) => w.name.split(" — ")[2]).sort();
    assert.deepEqual(active(), ["Error alerts", "Missed call approvals", "Missed calls", "Quote chase"]);

    const off = configFor(n8n.baseUrl, (raw) => {
      raw.solutions.quoteChase.active = true;
      raw.solutions.missedCalls.enabled = false;
    });
    const report = await install(off, { api: n8n.api, env: ENV, apply: true });
    assert.deepEqual(report.errors, []);
    assert.deepEqual(active(), ["Error alerts", "Quote chase"]);
    assert.equal(n8n.state.workflows.length, 5, "nothing is deleted");
    assert.equal(report.workflows.filter((w) => w.action === "switched off").length, 2);
  } finally {
    await n8n.close();
  }
});

test("a missing Gmail connection or missing key stops the install before any workflow is written", async () => {
  const n8n = await fakeN8n({ gmail: false });
  try {
    const config = configFor(n8n.baseUrl);
    const { EXAMPLE_ANTHROPIC_KEY: _omit, ...env } = ENV;
    const report = await install(config, { api: n8n.api, env, apply: true });
    const all = report.errors.join("\n");
    assert.match(all, /Gmail uses Google sign-in/);
    assert.match(all, /EXAMPLE_ANTHROPIC_KEY/);
    assert.equal(n8n.state.workflows.length, 0);
  } finally {
    await n8n.close();
  }
});
