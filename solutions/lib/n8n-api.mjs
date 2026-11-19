/** Minimal client for the n8n public API (/api/v1). The API key is never logged. */
export class N8nApiError extends Error {
  constructor(method, path, status, detail) {
    super(`n8n ${method} ${path} failed (${status}): ${detail}`);
    this.status = status;
  }
}

export function createApi({ baseUrl, apiKey, fetchImpl = fetch }) {
  async function request(method, path, { query, body } = {}) {
    const url = new URL(`${baseUrl}/api/v1${path}`);
    for (const [k, v] of Object.entries(query ?? {})) {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
    }
    const res = await fetchImpl(url, {
      method,
      headers: {
        "X-N8N-API-KEY": apiKey,
        Accept: "application/json",
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const raw = await res.text();
    let data = null;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      data = null;
    }
    if (!res.ok) {
      const detail = (data && (data.message || data.error)) || raw.slice(0, 300) || res.statusText;
      throw new N8nApiError(method, path, res.status, detail);
    }
    return data;
  }

  async function listAll(path, query = {}) {
    const out = [];
    let cursor;
    do {
      const page = await request("GET", path, { query: { ...query, limit: 100, cursor } });
      out.push(...(page?.data ?? []));
      cursor = page?.nextCursor || undefined;
    } while (cursor);
    return out;
  }

  return {
    request,
    listCredentials: () => listAll("/credentials"),
    createCredential: (body) => request("POST", "/credentials", { body }),
    /** Exact-name match among workflows that are not archived. */
    async findWorkflows(name, projectId) {
      const found = await listAll("/workflows", { name, projectId, excludePinnedData: "true" });
      return found.filter((w) => w.name === name && !w.isArchived);
    },
    createWorkflow: (body) => request("POST", "/workflows", { body }),
    updateWorkflow: (id, body) => request("PUT", `/workflows/${encodeURIComponent(id)}`, { body }),
    activateWorkflow: (id) => request("POST", `/workflows/${encodeURIComponent(id)}/activate`),
    deactivateWorkflow: (id) => request("POST", `/workflows/${encodeURIComponent(id)}/deactivate`),
  };
}
