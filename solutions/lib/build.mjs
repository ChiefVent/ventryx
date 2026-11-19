import { createHash } from "node:crypto";

/** Same inputs always give the same id, so re-running the installer updates nodes in place. */
export function stableId(...parts) {
  const h = createHash("sha1").update(parts.join("|")).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

export const WORKFLOW_PREFIX = "SOL";

export function workflowName(client, label) {
  return `${WORKFLOW_PREFIX} — ${client.businessName} — ${label}`;
}

/** Small helper the templates use to declare nodes and wire them together. */
export function makeBuilder(ctx, key) {
  const nodes = [];
  const connections = {};
  return {
    node(name, type, typeVersion, position, parameters = {}, extra = {}) {
      if (nodes.some((n) => n.name === name)) throw new Error(`Duplicate node name "${name}" in ${key}`);
      nodes.push({
        id: stableId(ctx.client.id, key, name),
        name,
        type,
        typeVersion,
        position,
        parameters,
        ...extra,
      });
      return name;
    },
    link(from, to, { output = 0, type = "main" } = {}) {
      const byType = (connections[from] ??= {});
      const outputs = (byType[type] ??= []);
      while (outputs.length <= output) outputs.push([]);
      outputs[output].push({ node: to, type, index: 0 });
    },
    note(position, content, size = {}) {
      this.node("Installer note", "n8n-nodes-base.stickyNote", 1, position, { content, color: 4, ...size });
    },
    webhookId(name) {
      return stableId(ctx.client.id, key, name, "webhook");
    },
    done(label, settings = {}) {
      return {
        key,
        name: workflowName(ctx.client, label),
        nodes,
        connections,
        settings: { executionOrder: "v1", timezone: ctx.client.timezone, ...settings },
      };
    },
  };
}

export function installerNote(title, body, templateFile) {
  return [
    `## ${title}`,
    "",
    body,
    "",
    `Installed by the Ventryx solutions installer from \`solutions/templates/${templateFile}\`.`,
    "Do not edit this workflow by hand: change the client config and run the installer again, or the next run will overwrite your edit.",
  ].join("\n");
}
