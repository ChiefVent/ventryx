import { installerNote, makeBuilder } from "../lib/build.mjs";

export const key = "missedCallApprovals";
export const label = "Missed call approvals";

export function webhookPath(client) {
  return `missed-call-reply-${client.id}`;
}

const ifOptions = { caseSensitive: true, leftValue: "", typeValidation: "loose" };

const RESOLVE_SCHEMA = [
  ["status", "string"],
  ["final_sms", "string"],
  ["resolved_on", "dateTime"],
].map(([id, type]) => ({
  id,
  displayName: id,
  required: false,
  defaultMatch: false,
  display: true,
  type,
  canBeUsedToMatch: true,
}));

/**
 * The owner's SMS reply decides what happens to the latest pending draft:
 * YES sends it, NO drops it, anything else is sent to the customer as the owner's own wording.
 * Installed alongside missed calls; it has no switch of its own.
 */
export function build(ctx) {
  const o = ctx.options;
  const { client } = ctx;
  const b = makeBuilder(ctx, key);
  const twilio = { credentials: ctx.cred("twilio") };
  const table = { __rl: true, mode: "id", value: o.dataTableId };
  const reply = '$("Normalize Owner Reply").item.json';
  const pending = '$("Find Latest Pending Item").item.json';

  const sms = (name, position, to, message) =>
    b.node(
      name,
      "n8n-nodes-base.twilio",
      1,
      position,
      { resource: "sms", operation: "send", from: `={{ ${reply}.twilio_from_number }}`, to, message },
      twilio,
    );

  const mark = (name, position, value) =>
    b.node(name, "n8n-nodes-base.dataTable", 1.1, position, {
      resource: "row",
      operation: "update",
      dataTableId: table,
      matchType: "allConditions",
      filters: { conditions: [{ keyName: "id", condition: "eq", keyValue: `={{ ${pending}.id }}` }] },
      columns: { mappingMode: "defineBelow", value, schema: RESOLVE_SCHEMA },
    });

  b.node(
    "Owner SMS Reply Webhook",
    "n8n-nodes-base.webhook",
    2.2,
    [0, 224],
    {
      httpMethod: "POST",
      path: webhookPath(client),
      responseMode: "onReceived",
      authentication: "basicAuth",
      options: {
        responseCode: { values: { responseCode: 200 } },
        responseData: "<Response></Response>",
        responseHeaders: { entries: [{ name: "Content-Type", value: "text/xml" }] },
      },
    },
    { webhookId: b.webhookId("Owner SMS Reply Webhook"), credentials: ctx.cred("webhook") },
  );

  b.node("Normalize Owner Reply", "n8n-nodes-base.set", 3.5, [272, 224], {
    mode: "manual",
    assignments: {
      assignments: [
        { id: "r1", name: "from_number", type: "string", value: '={{ String($json.body.From || "").trim() }}' },
        { id: "r2", name: "reply_text", type: "string", value: '={{ String($json.body.Body || "").trim() }}' },
        { id: "r3", name: "twilio_from_number", type: "string", value: o.twilioFromNumber },
        { id: "r4", name: "reply_word", type: "string", value: '={{ String($json.body.Body || "").toLowerCase().replace(/[^a-z]/g, "") }}' },
      ],
    },
  });

  // Only the configured owner phone can approve, and only this client's rows are matched.
  b.node("From Owner Phone?", "n8n-nodes-base.if", 2.2, [496, 224], {
    conditions: {
      combinator: "and",
      options: ifOptions,
      conditions: [
        {
          leftValue: "={{ $json.from_number }}",
          rightValue: o.approvalPhone,
          operator: { type: "string", operation: "equals" },
        },
      ],
    },
  });

  b.node(
    "Find Latest Pending Item",
    "n8n-nodes-base.dataTable",
    1.1,
    [720, 224],
    {
      resource: "row",
      operation: "get",
      dataTableId: table,
      matchType: "allConditions",
      filters: {
        conditions: [
          { keyName: "approval_phone", condition: "eq", keyValue: "={{ $json.from_number }}" },
          { keyName: "tradesman_id", condition: "eq", keyValue: client.id },
          { keyName: "status", condition: "eq", keyValue: "pending" },
        ],
      },
      returnAll: false,
      limit: 1,
      orderBy: true,
      orderByColumn: "createdAt",
      orderByDirection: "DESC",
    },
    { alwaysOutputData: true },
  );

  b.node("Pending Item Found?", "n8n-nodes-base.if", 2.2, [944, 224], {
    conditions: {
      combinator: "and",
      options: ifOptions,
      conditions: [{ leftValue: "={{ $json.id }}", rightValue: "", operator: { type: "number", operation: "exists", singleValue: true } }],
    },
  });

  b.node("Reply Is YES?", "n8n-nodes-base.if", 2.2, [1168, 128], {
    conditions: {
      combinator: "or",
      options: ifOptions,
      conditions: [
        {
          leftValue: `={{ ['yes','y','ok','okay','send','sendit','go'].includes(${reply}.reply_word) }}`,
          rightValue: "",
          operator: { type: "boolean", operation: "true", singleValue: true },
        },
      ],
    },
  });

  b.node("Reply Is NO?", "n8n-nodes-base.if", 2.2, [1392, 320], {
    conditions: {
      combinator: "and",
      options: ifOptions,
      conditions: [
        {
          leftValue: `={{ ['no','n','skip','ignore','leave','stop','dont','donotsend'].includes(${reply}.reply_word) }}`,
          rightValue: "",
          operator: { type: "boolean", operation: "true", singleValue: true },
        },
      ],
    },
  });

  sms("SMS Customer – Approved Draft", [1392, 32], `={{ ${pending}.caller_number }}`, `={{ ${pending}.draft_sms }}`);
  mark("Mark Item 'sent'", [1616, 32], {
    status: "sent",
    final_sms: `={{ ${pending}.draft_sms }}`,
    resolved_on: "={{ $now.toISO() }}",
  });

  sms("SMS Customer – Owner's Own Text", [1616, 416], `={{ ${pending}.caller_number }}`, `={{ ${reply}.reply_text }}`);
  mark("Mark Item 'sent_edited'", [1840, 416], {
    status: "sent_edited",
    final_sms: `={{ ${reply}.reply_text }}`,
    resolved_on: "={{ $now.toISO() }}",
  });

  mark("Mark Item 'skipped'", [1616, 224], {
    status: "skipped",
    final_sms: "",
    resolved_on: "={{ $now.toISO() }}",
  });
  sms("SMS Owner – Skipped", [1840, 224], `={{ ${reply}.from_number }}`, `=OK, nothing sent to {{ ${pending}.customer_name }}.`);

  sms("SMS Owner – Nothing Waiting", [1168, 416], `={{ ${reply}.from_number }}`, "Nothing waiting for approval.");

  b.note(
    [0, 480],
    installerNote(
      `${client.businessName}: missed call approvals`,
      `Point the Twilio number's incoming-message webhook at this workflow. Texts from any number other than ${o.approvalPhone} are ignored. YES sends the latest pending draft to the customer, NO drops it, any other reply is sent to the customer as the owner's own wording.`,
      "missed-call-approvals.mjs",
    ),
  );

  b.link("Owner SMS Reply Webhook", "Normalize Owner Reply");
  b.link("Normalize Owner Reply", "From Owner Phone?");
  b.link("From Owner Phone?", "Find Latest Pending Item", { output: 0 });
  b.link("Find Latest Pending Item", "Pending Item Found?");
  b.link("Pending Item Found?", "Reply Is YES?", { output: 0 });
  b.link("Pending Item Found?", "SMS Owner – Nothing Waiting", { output: 1 });
  b.link("Reply Is YES?", "SMS Customer – Approved Draft", { output: 0 });
  b.link("Reply Is YES?", "Reply Is NO?", { output: 1 });
  b.link("SMS Customer – Approved Draft", "Mark Item 'sent'");
  b.link("Reply Is NO?", "Mark Item 'skipped'", { output: 0 });
  b.link("Reply Is NO?", "SMS Customer – Owner's Own Text", { output: 1 });
  b.link("Mark Item 'skipped'", "SMS Owner – Skipped");
  b.link("SMS Customer – Owner's Own Text", "Mark Item 'sent_edited'");

  return b.done(label, ctx.errorWorkflowId ? { errorWorkflow: ctx.errorWorkflowId } : {});
}
