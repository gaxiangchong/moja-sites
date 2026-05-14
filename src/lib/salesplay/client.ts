import type {
  SalesPlayCreateCustomerRequest,
  SalesPlayCreateOnlineOrderRequest,
  SalesPlayCreateOnlineOrderResponse,
  SalesPlayCustomersListResponse,
} from "./types";

const DEFAULT_BASE = "https://api.salesplaypos.com/v1.0";

export type SalesPlayHttpResult<T> =
  | { ok: true; status: number; body: T }
  | { ok: false; status: number; body: unknown; text: string };

function joinUrl(base: string, path: string) {
  const b = base.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

export class SalesPlayClient {
  private readonly baseUrl: string;
  private readonly accessToken: string;

  constructor(opts?: { baseUrl?: string; accessToken?: string }) {
    const token = opts?.accessToken ?? process.env.SALESPLAY_ACCESS_TOKEN?.trim();
    if (!token) {
      throw new Error("SALESPLAY_ACCESS_TOKEN is not configured");
    }
    this.accessToken = token;
    this.baseUrl = (
      opts?.baseUrl ?? process.env.SALESPLAY_API_BASE_URL ?? DEFAULT_BASE
    ).replace(/\/$/, "");
  }

  private async request<T>(
    method: "GET" | "POST",
    path: string,
    body?: unknown,
  ): Promise<SalesPlayHttpResult<T>> {
    const url = joinUrl(this.baseUrl, path);
    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let parsed: unknown = null;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = { raw: text };
    }
    if (!res.ok) {
      return { ok: false, status: res.status, body: parsed, text };
    }
    return { ok: true, status: res.status, body: parsed as T };
  }

  async createOrUpdateCustomer(
    data: SalesPlayCreateCustomerRequest,
  ): Promise<SalesPlayHttpResult<unknown>> {
    return this.request<unknown>("POST", "/customers", data);
  }

  async listCustomers(params: {
    email?: string;
    customerIds?: string[];
    limit?: number;
    cursor?: string;
  }): Promise<SalesPlayHttpResult<SalesPlayCustomersListResponse>> {
    const q = new URLSearchParams();
    if (params.email) q.set("email", params.email);
    if (params.customerIds?.length) {
      q.set("customer_ids", params.customerIds.join(","));
    }
    if (params.limit != null) q.set("limit", String(params.limit));
    if (params.cursor) q.set("cursor", params.cursor);
    const qs = q.toString();
    const path = qs ? `/customers?${qs}` : "/customers";
    return this.request<SalesPlayCustomersListResponse>("GET", path);
  }

  async createOnlineOrder(
    data: SalesPlayCreateOnlineOrderRequest,
  ): Promise<SalesPlayHttpResult<SalesPlayCreateOnlineOrderResponse>> {
    return this.request<SalesPlayCreateOnlineOrderResponse>(
      "POST",
      "/online_orders",
      data,
    );
  }
}
