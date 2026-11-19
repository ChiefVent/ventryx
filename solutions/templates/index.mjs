import * as emailDrafts from "./email-drafts.mjs";
import * as errorAlerts from "./error-alerts.mjs";
import * as missedCallApprovals from "./missed-call-approvals.mjs";
import * as missedCalls from "./missed-calls.mjs";
import * as quoteChase from "./quote-chase.mjs";

/** The solutions a client config can switch on. */
export const SOLUTIONS = { quoteChase, emailDrafts, missedCalls };

/** Support workflows the installer adds by itself. */
export const SUPPORT = { errorAlerts, missedCallApprovals };
