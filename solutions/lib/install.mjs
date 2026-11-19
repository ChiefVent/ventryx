import { SOLUTIONS, SUPPORT } from "../templates/index.mjs";
import { workflowName } from "./build.mjs";
import { CRED_ENV_FIELDS, CRED_FIXED_DATA, CRED_TYPES, enabledSolutions, neededCredentials } from "./config.mjs";

const PLACEHOLDER = "SET-AT-INSTALL";

/** The workflows a client can have, in install order. Error alerts go first so the rest can point at it. */
function workflowPlan(config) {
  const on = (name) => config.solutions[name].enabled;
  const live = (name) => config.solutions[name].active;
  const any = enabledSolutions(config);
  const mc = config.solutions.missedCalls;
  return [
    { template: SUPPORT.errorAlerts, wanted: any.length > 0, active: any.some(live), options: {} },
    { template: SOLUTIONS.quoteChase, wanted: on("quoteChase"), active: live("quoteChase"), options: config.solutions.quoteChase.options },
    { template: SOLUTIONS.emailDrafts, wanted: on("emailDrafts"), active: live("emailDrafts"), options: config.solutions.emailDrafts.options },
    { template: SOLUTIONS.missedCalls, wanted: on("missedCalls"), active: live("missedCalls"), options: mc.options },
    { template: SUPPORT.missedCallApprovals, wanted: on("missedCalls"), active: live("missedCalls"), options: mc.options },
  ];
}

function makeCtx(config, options, creds, errorWorkflowId) {
  return {
    client: config.client,
    llm: config.llm,
    alerts: config.alerts,
    options,
    errorWorkflowId,
    cred(key) {
      const ref = creds[key];
      if (!ref) throw new Error(`Template asked for credential "${key}" that was not resolved.`);
      return { [CRED_TYPES[key]]: { id: ref.id, name: ref.name } };
    },
  };
}

/** Renders every wanted workflow without touching n8n. Credential ids are placeholders. */
export function renderOffline(config) {
  const creds = {};
  for (const key of neededCredentials(config)) {
    creds[key] = { id: config.credentials[key].id ?? PLACEHOLDER, name: config.credentials[key].name };
  }
  return workflowPlan(config)
    .filter((w) => w.wanted)
    .map((w) => w.template.build(makeCtx(config, w.options, creds, undefined)));
}

async function resolveCredentials(config, { api, env, apply, report }) {
  const needed = neededCredentials(config);
  const creds = {};
  if (needed.length === 0) return creds;

  let existing = null;
  try {
    existing = await api.listCredentials();
  } catch (error) {
    report.warnings.push(`Could not list credentials (${error.message}). Give each credential an "id" in the config, or use an owner or admin API key.`);
  }

  for (const key of needed) {
    const spec = config.credentials[key];
    const type = CRED_TYPES[key];
    if (spec.id) {
      creds[key] = { id: spec.id, name: spec.name };
      report.credentials.push({ key, name: spec.name, action: "use (id from config)" });
      continue;
    }
    const matches = (existing ?? []).filter((c) => c.name === spec.name && c.type === type);
    if (matches.length > 1) {
      report.errors.push(`More than one ${type} credential is named "${spec.name}". Rename one, or set credentials.${key}.id.`);
      continue;
    }
    if (matches.length === 1) {
      creds[key] = { id: matches[0].id, name: spec.name };
      report.credentials.push({ key, name: spec.name, action: "use existing" });
      continue;
    }
    if (!spec.env) {
      report.errors.push(
        key === "gmail"
          ? `No Gmail credential named "${spec.name}" was found. Gmail uses Google sign-in, so the client connects it once in n8n (Credentials → Gmail OAuth2, named exactly "${spec.name}"), then run this again.`
          : `No ${type} credential named "${spec.name}" was found. Add credentials.${key}.env so the installer can create it, or create it in n8n.`,
      );
      continue;
    }
    const data = { ...(CRED_FIXED_DATA[key] ?? {}) };
    const missing = [];
    for (const field of CRED_ENV_FIELDS[key]) {
      const value = env[spec.env[field]];
      if (value) data[field] = value;
      else missing.push(spec.env[field]);
    }
    if (missing.length > 0) {
      report.errors.push(`Credential "${spec.name}" needs these environment variables set: ${missing.join(", ")}.`);
      continue;
    }
    if (!apply) {
      creds[key] = { id: PLACEHOLDER, name: spec.name };
      report.credentials.push({ key, name: spec.name, action: "create" });
      continue;
    }
    const created = await api.createCredential({
      name: spec.name,
      type,
      data,
      ...(config.n8n.projectId ? { projectId: config.n8n.projectId } : {}),
    });
    creds[key] = { id: created.id, name: spec.name };
    report.credentials.push({ key, name: spec.name, action: "created" });
  }
  return creds;
}

/**
 * Brings one client's n8n workflows in line with their config.
 * Without `apply` it only reads from n8n and reports what it would do.
 * It never deletes anything: a solution that is switched off is deactivated and left in place.
 */
export async function install(config, { api, env = {}, apply = false }) {
  const report = { apply, credentials: [], workflows: [], webhooks: [], warnings: [], errors: [] };
  const creds = await resolveCredentials(config, { api, env, apply, report });
  if (report.errors.length > 0) return report;

  let errorWorkflowId;
  for (const item of workflowPlan(config)) {
    const { template } = item;
    const name = workflowName(config.client, template.label);
    const found = await api.findWorkflows(name, config.n8n.projectId);
    if (found.length > 1) {
      report.errors.push(`More than one workflow is named "${name}". Archive the extras, then run this again.`);
      continue;
    }
    const existing = found[0];

    if (!item.wanted) {
      if (!existing) continue;
      if (existing.active) {
        if (apply) await api.deactivateWorkflow(existing.id);
        report.workflows.push({ name, id: existing.id, action: apply ? "switched off" : "switch off", active: false });
      } else {
        report.workflows.push({ name, id: existing.id, action: "left off", active: false });
      }
      continue;
    }

    const built = template.build(makeCtx(config, item.options, creds, template.key === "errorAlerts" ? undefined : errorWorkflowId));
    const body = { name: built.name, nodes: built.nodes, connections: built.connections, settings: built.settings };
    let id = existing?.id;
    let action;
    if (!apply) {
      action = existing ? "update" : "create";
    } else if (existing) {
      await api.updateWorkflow(existing.id, body);
      action = "updated";
    } else {
      const created = await api.createWorkflow({
        ...body,
        ...(config.n8n.projectId ? { projectId: config.n8n.projectId } : {}),
        ...(config.n8n.folderId ? { parentFolderId: config.n8n.folderId } : {}),
      });
      id = created.id;
      action = "created";
    }
    if (template.key === "errorAlerts") errorWorkflowId = id;

    const wasActive = existing?.active === true;
    if (apply && id && item.active !== wasActive) {
      try {
        if (item.active) await api.activateWorkflow(id);
        else await api.deactivateWorkflow(id);
      } catch (error) {
        report.errors.push(`"${name}" was saved but could not be ${item.active ? "switched on" : "switched off"}: ${error.message}`);
        report.workflows.push({ name, id, action, active: wasActive });
        continue;
      }
    }
    report.workflows.push({ name, id, action, active: item.active });

    for (const node of built.nodes) {
      if (node.type === "n8n-nodes-base.webhook") {
        report.webhooks.push({ workflow: name, url: `${config.n8n.baseUrl}/webhook/${node.parameters.path}` });
      }
    }
  }
  return report;
}

export function formatReport(report, config) {
  const lines = [];
  const mode = report.apply ? "Applied" : "Dry run (nothing was changed; add --apply to make these changes)";
  lines.push(`${config.client.businessName} on ${config.n8n.baseUrl}`, mode, "");
  if (report.credentials.length > 0) {
    lines.push("Credentials");
    for (const c of report.credentials) lines.push(`  ${c.action.padEnd(22)} ${c.name} (${c.key})`);
    lines.push("");
  }
  if (report.workflows.length > 0) {
    lines.push("Workflows");
    for (const w of report.workflows) lines.push(`  ${w.action.padEnd(22)} ${w.name}  [${w.active ? "ON" : "off"}]`);
    lines.push("");
  }
  if (report.webhooks.length > 0) {
    lines.push("Webhook addresses to give Twilio (basic auth: the webhook credential)");
    for (const w of report.webhooks) lines.push(`  ${w.url}`);
    lines.push("");
  }
  for (const w of report.warnings) lines.push(`Warning: ${w}`);
  for (const e of report.errors) lines.push(`Error: ${e}`);
  return lines.join("\n").trimEnd();
}
