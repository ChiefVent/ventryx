import { installerNote, makeBuilder } from "../lib/build.mjs";

export const key = "errorAlerts";
export const label = "Error alerts";

/** One per client. Every other installed workflow points its error setting here. */
export function build(ctx) {
  const { client, alerts } = ctx;
  const b = makeBuilder(ctx, key);

  b.node("On Workflow Error", "n8n-nodes-base.errorTrigger", 1, [0, 0], {});

  const summary =
    '{{ $json.workflow.name }} at "{{ $json.execution.lastNodeExecuted }}" – {{ ($json.execution.error && $json.execution.error.message ? $json.execution.error.message : "unknown error").slice(0, 160) }}. Exec {{ $json.execution.id }}';

  if (alerts.via === "sms") {
    b.node(
      "Alert Ventryx",
      "n8n-nodes-base.twilio",
      1,
      [224, 0],
      {
        resource: "sms",
        operation: "send",
        from: alerts.fromNumber,
        to: alerts.phone,
        message: `=${client.businessName} FAILED: ${summary}`,
      },
      { credentials: ctx.cred("twilio") },
    );
  } else {
    b.node(
      "Alert Ventryx",
      "n8n-nodes-base.gmail",
      2.2,
      [224, 0],
      {
        resource: "message",
        operation: "send",
        sendTo: alerts.email,
        subject: `${client.businessName}: a workflow failed`,
        emailType: "text",
        message: `=${summary}`,
      },
      { credentials: ctx.cred("gmail") },
    );
  }

  b.note(
    [0, 200],
    installerNote(
      `${client.businessName}: error alerts`,
      `Tells Ventryx when one of this client's workflows fails (${alerts.via === "sms" ? `SMS to ${alerts.phone}` : `email to ${alerts.email}`}). It never contacts a customer.`,
      "error-alerts.mjs",
    ),
  );

  b.link("On Workflow Error", "Alert Ventryx");
  return b.done(label);
}
