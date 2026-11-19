# Solutions installer

Switches a Ventryx solution on for a customer from one config file, using the customer's own keys.
The workflow logic lives here, in `templates/`. Nobody hand-copies or hand-edits a client's workflows:
change the config or the template, run the installer again, and it updates what is there.

| Solution | Config key | What it does | Sends to customers? |
| --- | --- | --- | --- |
| Quote chasing | `quoteChase` | Weekday scan of sent mail. Writes a short chase as a Gmail draft on quiet quote threads. | No. Drafts only. |
| Email drafts | `emailDrafts` | Polls the inbox. A job enquiry gets a reply saved as a Gmail draft. | No. Drafts only. |
| Missed calls | `missedCalls` | Missed call or voicemail is sorted, and the owner is texted. | Only after the owner replies YES or with their own wording. |

Two support workflows are added automatically: **Error alerts** (one per client, tells Ventryx when
something fails) and **Missed call approvals** (handles the owner's YES / NO reply).

## Use

```bash
# 1. Copy the example and fill it in. Real configs are git-ignored.
cp solutions/clients/example.json solutions/clients/acme-plumbing.json

# 2. Put the keys in the environment, under the names the config gives.
export N8N_API_KEY=...            # n8n → Settings → n8n API (owner or admin)
export ACME_ANTHROPIC_KEY=...     # the customer's own keys

# 3. Dry run: reads from n8n, prints what would change, changes nothing.
node solutions/install.mjs solutions/clients/acme-plumbing.json

# 4. Make the changes.
node solutions/install.mjs solutions/clients/acme-plumbing.json --apply
```

No API key to hand? `--offline` writes the workflow JSON to `solutions/out/<client id>/` so you can
read it or import it in n8n by hand.

## The config

- `client`: who the customer is. `id` is a short slug and ends up in webhook addresses and the
  missed-call log, so do not change it after install. `description` and `voice` are optional and
  feed the prompts; set them for a business that is not a trade.
- `n8n`: `baseUrl` of the instance, the name of the environment variable holding its API key, and
  optionally `projectId` and `folderId` for new workflows.
- `llm.model`: the Claude model every solution uses.
- `alerts`: where failures go. `via` is `email` (sent from the client's Gmail to `email`) or `sms`
  (sent from their Twilio number to `phone`).
- `credentials`: one entry per service, each with the `name` it has in n8n.
- `solutions`: `enabled` installs it, `active` switches it on. Everything installs **switched off**
  until you set `active: true`, so you can dry-run in n8n first.

Set `enabled: false` (or remove the block) and run again to switch a solution off. Its workflow is
deactivated and left in place. The installer never deletes anything.

### Keys

The config never holds a key. It names environment variables, and the installer reads them only to
create the credential in n8n. Keys are not printed or written to disk.

| Credential | How it gets into n8n |
| --- | --- |
| `gmail` | The customer signs in with Google once in n8n (Credentials → Gmail OAuth2). Give it the `name` from the config. |
| `anthropic` | Created from `env.apiKey`. |
| `twilio` | Created from `env.accountSid` and `env.authToken`. |
| `webhook` | Basic-auth user and password that protect the missed-call webhooks. Created from `env.user` and `env.password`. |
| `openai` | Only when `missedCalls.transcribeVoicemail` is true (Whisper). Created from `env.apiKey`. |

A credential that already exists under that name is reused, not replaced. To rotate a key, change it
in n8n. If the API key cannot list credentials, add each credential's `id` to the config.

### Missed calls set-up

1. Create a data table in n8n once (it can be shared by every client; rows carry the client id) with
   these columns, and put its id in `missedCalls.dataTableId`:
   `caller_number`, `customer_name`, `job_summary`, `draft_sms`, `tradesman_id`, `approval_phone`,
   `status`, `final_sms` (text); `needs_review` (boolean); `created_on`, `resolved_on` (date).
2. Run the installer. It prints two webhook addresses.
3. In Twilio, post missed calls and voicemails to `.../webhook/missed-call-<client id>` and the
   number's incoming messages to `.../webhook/missed-call-reply-<client id>`, both with the webhook
   user and password.
4. The call greeting must tell callers the voicemail is recorded and transcribed, and why.

## Changing a solution for everyone

Edit the file in `templates/`, run `npm test`, then run the installer with `--apply` for each client
config. Node ids are stable, so n8n sees an update, not a new workflow.

## What has and has not been checked

- `npm test` runs the installer against a stand-in n8n API: dry run, create, update in place,
  switching on and off, missing keys, and that no secret reaches the output.
- The node settings that differ from the original Ops and Front Desk workflows were checked against
  the live n8n node schemas.
- It has **not** yet been run with `--apply` against a real n8n instance. Do the first real install
  on a test client with everything `active: false`, and run each workflow by hand in n8n before
  switching it on.
