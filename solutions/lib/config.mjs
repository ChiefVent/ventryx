import { SOLUTIONS } from "../templates/index.mjs";

export const CRED_TYPES = {
  gmail: "gmailOAuth2",
  anthropic: "anthropicApi",
  twilio: "twilioApi",
  openai: "openAiApi",
  webhook: "httpBasicAuth",
};

/** Secret fields the installer can fill from environment variables. Gmail is OAuth, so it is connected in n8n. */
export const CRED_ENV_FIELDS = {
  anthropic: ["apiKey"],
  twilio: ["accountSid", "authToken"],
  openai: ["apiKey"],
  webhook: ["user", "password"],
};

export const CRED_FIXED_DATA = {
  twilio: { authType: "authToken" },
};

const DEFAULT_MODEL = "claude-sonnet-4-6";
const PHONE = /^\+[1-9]\d{6,14}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const text = (v) => (typeof v === "string" ? v.trim() : "");

/**
 * Checks a client config and fills in defaults.
 * Returns { config, errors }. The config holds no secrets: keys are named by
 * environment variable and read only when a credential is created.
 */
export function loadConfig(raw, { offline = false } = {}) {
  const errors = [];
  const need = (cond, message) => {
    if (!cond) errors.push(message);
  };
  if (!isObject(raw)) return { config: null, errors: ["The config must be a JSON object."] };

  const c = isObject(raw.client) ? raw.client : {};
  const client = {
    id: text(c.id),
    businessName: text(c.businessName),
    ownerName: text(c.ownerName),
    trade: text(c.trade),
    serviceArea: text(c.serviceArea),
    timezone: text(c.timezone) || "Europe/Dublin",
    voice: text(c.voice) || "Warm, plain-spoken Irish tone.",
  };
  client.description =
    text(c.description) || `a ${client.trade.toLowerCase()} business covering ${client.serviceArea}`;
  need(/^[a-z0-9]+(-[a-z0-9]+)*$/.test(client.id), 'client.id must be a short slug such as "lawlor-electrical".');
  for (const field of ["businessName", "ownerName", "trade", "serviceArea"]) {
    need(client[field], `client.${field} is required.`);
  }

  const n = isObject(raw.n8n) ? raw.n8n : {};
  const n8n = {
    baseUrl: text(n.baseUrl).replace(/\/+$/, ""),
    apiKeyEnv: text(n.apiKeyEnv) || "N8N_API_KEY",
    projectId: text(n.projectId) || undefined,
    folderId: text(n.folderId) || undefined,
  };
  if (!offline) need(/^https:\/\/[^\s/]+/.test(n8n.baseUrl), "n8n.baseUrl must be the https address of the n8n instance.");

  const llm = { model: text(raw.llm?.model) || DEFAULT_MODEL };

  const rawSolutions = isObject(raw.solutions) ? raw.solutions : {};
  for (const name of Object.keys(rawSolutions)) {
    need(name in SOLUTIONS, `solutions.${name} is not a known solution. Known: ${Object.keys(SOLUTIONS).join(", ")}.`);
  }
  const solutions = {};
  for (const [name, template] of Object.entries(SOLUTIONS)) {
    const s = isObject(rawSolutions[name]) ? rawSolutions[name] : {};
    const { enabled, active, ...rest } = s;
    for (const option of Object.keys(rest)) {
      need(
        option in template.defaults || (template.required ?? []).includes(option),
        `solutions.${name}.${option} is not an option of this solution.`,
      );
    }
    const options = { ...template.defaults, ...rest };
    solutions[name] = { enabled: enabled === true, active: enabled === true && active === true, options };
    if (!solutions[name].enabled) continue;
    for (const field of template.required ?? []) {
      need(text(options[field]), `solutions.${name}.${field} is required when ${name} is enabled.`);
    }
    for (const [option, fallback] of Object.entries(template.defaults)) {
      need(
        typeof options[option] === typeof fallback && Array.isArray(options[option]) === Array.isArray(fallback),
        `solutions.${name}.${option} must be the same kind of value as its default (${JSON.stringify(fallback)}).`,
      );
    }
  }

  const q = solutions.quoteChase;
  if (q.enabled) {
    const o = q.options;
    need(Number.isInteger(o.hour) && o.hour >= 0 && o.hour <= 23, "solutions.quoteChase.hour must be 0 to 23.");
    need(Number.isInteger(o.minute) && o.minute >= 0 && o.minute <= 59, "solutions.quoteChase.minute must be 0 to 59.");
    need(o.weekdays.length > 0 && o.weekdays.every((d) => Number.isInteger(d) && d >= 0 && d <= 6), "solutions.quoteChase.weekdays must list days 0 (Sunday) to 6.");
    need(o.minDaysQuiet >= 1 && o.maxDaysQuiet > o.minDaysQuiet, "solutions.quoteChase needs 1 <= minDaysQuiet < maxDaysQuiet.");
    for (const field of ["maxChases", "maxReviewedPerRun", "maxDraftsPerRun"]) {
      need(Number.isInteger(o[field]) && o[field] >= 1, `solutions.quoteChase.${field} must be a whole number of 1 or more.`);
    }
  }
  if (solutions.emailDrafts.enabled) {
    const m = solutions.emailDrafts.options.pollMinutes;
    need(Number.isInteger(m) && m >= 1 && m <= 59, "solutions.emailDrafts.pollMinutes must be 1 to 59.");
  }
  const mc = solutions.missedCalls;
  if (mc.enabled) {
    need(PHONE.test(text(mc.options.approvalPhone)), "solutions.missedCalls.approvalPhone must be in international format, e.g. +353851234567.");
    need(PHONE.test(text(mc.options.twilioFromNumber)), "solutions.missedCalls.twilioFromNumber must be in international format.");
  }

  const a = isObject(raw.alerts) ? raw.alerts : {};
  const alerts = {
    via: text(a.via) || "email",
    email: text(a.email),
    phone: text(a.phone),
    fromNumber: text(a.fromNumber) || text(mc.options.twilioFromNumber),
  };
  need(["email", "sms"].includes(alerts.via), 'alerts.via must be "email" or "sms".');
  if (alerts.via === "sms") {
    need(PHONE.test(alerts.phone), "alerts.phone must be in international format when alerts.via is sms.");
    need(PHONE.test(alerts.fromNumber), "alerts.fromNumber (or solutions.missedCalls.twilioFromNumber) is required when alerts.via is sms.");
  }
  if (alerts.via === "email" || q.enabled) {
    need(EMAIL.test(alerts.email), "alerts.email is required: it is where failures are reported.");
  }

  const rawCreds = isObject(raw.credentials) ? raw.credentials : {};
  const credentials = {};
  for (const [key, spec] of Object.entries(rawCreds)) {
    if (!(key in CRED_TYPES)) {
      errors.push(`credentials.${key} is not a known credential. Known: ${Object.keys(CRED_TYPES).join(", ")}.`);
      continue;
    }
    const s = isObject(spec) ? spec : {};
    const env = isObject(s.env) ? s.env : undefined;
    credentials[key] = { name: text(s.name), id: text(s.id) || undefined, env };
    need(credentials[key].name, `credentials.${key}.name is required.`);
    if (env) {
      const fields = CRED_ENV_FIELDS[key];
      if (!fields) {
        errors.push(`credentials.${key} cannot be created from keys. Connect it in n8n, then give its name here.`);
      } else {
        for (const field of fields) {
          need(/^[A-Z][A-Z0-9_]*$/.test(text(env[field])), `credentials.${key}.env.${field} must name an environment variable, e.g. ACME_${field.toUpperCase()}. Never put the key itself in the config.`);
        }
      }
    }
  }

  const config = { client, n8n, llm, alerts, credentials, solutions };
  for (const key of neededCredentials(config)) {
    need(credentials[key], `credentials.${key} is required by the solutions you enabled.`);
  }
  return { config, errors };
}

export function enabledSolutions(config) {
  return Object.keys(SOLUTIONS).filter((name) => config.solutions[name].enabled);
}

/** Which credentials the enabled solutions, and the alert route, need. */
export function neededCredentials(config) {
  const keys = new Set();
  const enabled = enabledSolutions(config);
  for (const name of enabled) {
    const template = SOLUTIONS[name];
    for (const key of template.needs) keys.add(key);
    for (const key of template.optionalNeeds?.(config.solutions[name].options) ?? []) keys.add(key);
  }
  if (enabled.length > 0) keys.add(config.alerts.via === "sms" ? "twilio" : "gmail");
  return [...keys];
}
