/**
 * One-time setup script for Retell AI resources.
 * Creates a Custom LLM agent and buys a US phone number.
 *
 * Usage: RETELL_API_KEY=key_xxx npx tsx scripts/setup-retell.ts
 *
 * Output: prints RETELL_AGENT_ID and RETELL_FROM_NUMBER for your .env file.
 */

import Retell from "retell-sdk";

const API_KEY = process.env.RETELL_API_KEY;
if (!API_KEY) {
  console.error("Missing RETELL_API_KEY environment variable");
  process.exit(1);
}

const client = new Retell({ apiKey: API_KEY });

const AREA_CODE = process.argv[2] || "415"; // Default: San Francisco
const LLM_WS_URL =
  process.argv[3] || "wss://localhost:4000/llm-websocket/{call_id}";

async function main(): Promise<void> {
  console.log("=== Retell AI Setup ===\n");

  // 1. Create Custom LLM agent
  console.log("Creating Custom LLM agent...");
  const agent = await client.agent.create({
    agent_name: "Celato Director Agent",
    response_engine: {
      type: "custom-llm",
      llm_websocket_url: LLM_WS_URL,
    },
    voice_id: "11labs-Adrian",
    language: "en-US",
  });

  console.log(`  Agent created: ${agent.agent_id}`);
  console.log(`  WebSocket URL: ${LLM_WS_URL}`);

  // 2. Buy a phone number
  console.log(`\nBuying phone number (area code ${AREA_CODE}, Twilio)...`);
  const phone = await client.phoneNumber.create({
    area_code: Number(AREA_CODE),
    number_provider: "twilio",
    nickname: "Celato Dev",
    outbound_agents: [{ agent_id: agent.agent_id, weight: 1 }],
  });

  const phoneNumber =
    "phone_number" in phone ? (phone as Record<string, string>).phone_number : "unknown";
  console.log(`  Number purchased: ${phoneNumber}`);

  // 3. Print .env values
  console.log("\n=== Add these to your .env file ===\n");
  console.log(`RETELL_AGENT_ID=${agent.agent_id}`);
  console.log(`RETELL_FROM_NUMBER=${phoneNumber}`);
  console.log(`\n=== Setup complete ===`);
}

main().catch((err: unknown) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
