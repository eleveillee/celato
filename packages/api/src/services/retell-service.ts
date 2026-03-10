/**
 * Retell API client for creating phone calls and web calls.
 * Creates calls via Retell's REST API; Retell then connects back to our /llm-websocket/:call_id.
 * Web calls (create-web-call) don't require KYC or a phone number.
 */

import { pino } from "pino";

const logger = pino({ name: "retell-service" });

const RETELL_API_BASE = "https://api.retellai.com";

export interface CreateRetellCallParams {
  apiKey: string;
  agentId: string;
  toNumber: string;
  fromNumber?: string | undefined;
}

export interface CreateRetellCallResult {
  callId: string;
}

export interface CreateRetellWebCallParams {
  apiKey: string;
  agentId: string;
}

export interface CreateRetellWebCallResult {
  callId: string;
  accessToken: string;
}

export async function createRetellCall(
  params: CreateRetellCallParams
): Promise<CreateRetellCallResult> {
  const body: { agent_id: string; to_number: string; from_number?: string } = {
    agent_id: params.agentId,
    to_number: params.toNumber,
  };
  if (params.fromNumber) {
    body.from_number = params.fromNumber;
  }

  const response = await fetch(`${RETELL_API_BASE}/v2/create-phone-call`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    logger.error({ status: response.status, body: text }, "Retell API error (phone call)");
    throw new Error(`Retell API error: ${response.status}`);
  }

  const data = (await response.json()) as { call_id: string };
  logger.info({ callId: data.call_id }, "Retell phone call created");

  return { callId: data.call_id };
}

/**
 * Create a web-based call via Retell's create-web-call API.
 * No phone number or KYC required — browser acts as the caller.
 * Returns an access_token the browser uses to connect via Retell Web SDK.
 */
export async function createRetellWebCall(
  params: CreateRetellWebCallParams
): Promise<CreateRetellWebCallResult> {
  const response = await fetch(`${RETELL_API_BASE}/v2/create-web-call`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.apiKey}`,
    },
    body: JSON.stringify({ agent_id: params.agentId }),
  });

  if (!response.ok) {
    const text = await response.text();
    logger.error({ status: response.status, body: text }, "Retell API error (web call)");
    throw new Error(`Retell API error: ${response.status}`);
  }

  const data = (await response.json()) as { call_id: string; access_token: string };
  logger.info(
    { callId: data.call_id, agentId: params.agentId, tokenPrefix: data.access_token.slice(0, 20) },
    "Retell web call created — Retell should connect to /llm-websocket/%s",
    data.call_id,
  );

  return { callId: data.call_id, accessToken: data.access_token };
}
