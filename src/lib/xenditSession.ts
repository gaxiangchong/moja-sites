const XENDIT_SESSIONS_URL = "https://api.xendit.co/sessions";

export type CreateSessionInput = {
  secretKey: string;
  referenceId: string;
  /** Amount in smallest currency unit (sen for MYR), as string per Xendit API. */
  amountSen: number;
  description: string;
  customer: {
    givenNames: string;
    surname: string;
    email?: string;
    mobileNumber: string;
  };
  successReturnUrl: string;
  cancelReturnUrl: string;
  metadata?: Record<string, string>;
};

export type CreateSessionResult =
  | {
      ok: true;
      paymentSessionId: string;
      paymentLinkUrl: string;
      status: string;
      raw: unknown;
    }
  | { ok: false; status: number; body: string };

function basicAuthHeader(secretKey: string): string {
  const token = Buffer.from(`${secretKey}:`).toString("base64");
  return `Basic ${token}`;
}

export async function createXenditPaymentSession(
  input: CreateSessionInput,
): Promise<CreateSessionResult> {
  const { givenNames, surname, email, mobileNumber } = input.customer;
  const body: Record<string, unknown> = {
    reference_id: input.referenceId,
    session_type: "PAY",
    mode: "PAYMENT_LINK",
    amount: String(input.amountSen),
    currency: "MYR",
    country: "MY",
    capture_method: "AUTOMATIC",
    locale: "en",
    description: input.description.slice(0, 500),
    customer: {
      reference_id: `cust_${input.referenceId.slice(0, 24)}`,
      type: "INDIVIDUAL",
      individual_detail: {
        given_names: givenNames.slice(0, 120),
        surname: surname.slice(0, 120),
      },
      mobile_number: mobileNumber,
      ...(email?.trim() ? { email: email.trim() } : {}),
    },
    success_return_url: input.successReturnUrl,
    cancel_return_url: input.cancelReturnUrl,
    ...(input.metadata ? { metadata: input.metadata } : {}),
  };

  const res = await fetch(XENDIT_SESSIONS_URL, {
    method: "POST",
    headers: {
      Authorization: basicAuthHeader(input.secretKey),
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let json: unknown;
  try {
    json = JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { ok: false, status: res.status, body: text.slice(0, 2000) };
  }

  if (!res.ok) {
    return { ok: false, status: res.status, body: text.slice(0, 2000) };
  }

  const j = json as Record<string, unknown>;
  const paymentSessionId = String(j.payment_session_id ?? "");
  const paymentLinkUrl = String(j.payment_link_url ?? "");
  const status = String(j.status ?? "");

  if (!paymentSessionId || !paymentLinkUrl) {
    return {
      ok: false,
      status: res.status,
      body: `Missing payment_link_url or payment_session_id: ${text.slice(0, 500)}`,
    };
  }

  return {
    ok: true,
    paymentSessionId,
    paymentLinkUrl,
    status,
    raw: json,
  };
}
