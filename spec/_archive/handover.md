# Project Handover: Celato (The "Bionic Director")

**Status**: Concept / Spec Phase
**Owner**: Eric
**Last Updated**: 2026-02-12

## 1. Executive Summary

**Project Celato** is a mobile application that acts as a **real-time collaborative voice agent** for phone calls. Unlike standard translation apps or fully autonomous agents, Celato keeps the user in the loop as a "Director." The user listens to the translated conversation and can "whisper" instructions to the AI agent, who then negotiates with the third party on the user's behalf.

**Key Value Prop**: "Don't just translate for me; handle it for me, but let me guide you."

## 2. Core Documentation

All specifications are located in `spec/products/celato/`:

*   **[Concept & Competitors](spec/products/celato/concept.md)**: Why this exists, gap analysis vs. Google/Samsung AI.
*   **[UX Design](spec/products/celato/ux_design.md)**: The "Director's Chair" interface, "Whisper" interactions, and "Smart Cost" strategy.
*   **[Architecture](spec/products/celato/architecture.md)**: Technical stack (React Native + Retell AI + OpenAI Realtime), data flow, and components.
*   **[Roadmap](spec/products/celato/roadmap.md)**: Phased implementation plan (Prototype -> MVP -> Polish).

## 3. Technology Stack (Recommended)

*   **Mobile App**: React Native (Expo) - leveraging Eric's existing TS knowledge.
*   **Telephony**: **Retell AI** (Best-in-class for agent-based calls, handles interruption/VAD).
*   **Intelligence**: **OpenAI Realtime API** (GPT-4o Audio) for low-latency negotiation.
*   **Backend**: Node.js (Next.js API Routes or Fastify) for orchestration.
*   **Database**: Supabase (PostgreSQL) for user data and call logs.

## 4. Immediate Next Steps (Action Items)

1.  **Prototype Phase**:
    *   Set up a Retell AI account.
    *   Create a simple web client using Retell's SDK.
    *   Implement the "Whisper" logic: Inject text instructions into the running agent's context.
    *   **Goal**: Validate that "directing" the agent feels natural.

2.  **Design Phase**:
    *   Mock up the "Director Control Panel" in Figma/Cursor.
    *   Refine the "Whisper" vs "Passthrough" UI states.

## 5. Required Credentials / Accounts

To proceed, the following accounts will be needed:
*   **OpenAI Platform**: API Key with access to Realtime API (GPT-4o Audio).
*   **Retell AI**: Account for phone number provisioning and agent orchestration.
*   **Supabase**: For database and auth.
*   **Expo (Optional)**: For easy app builds/deployments.

## 6. Open Questions / Risks

*   **Latency**: Can we keep the "Whisper" -> Agent -> Business loop under 1-2 seconds?
    *   *Mitigation*: Use OpenAI Realtime Audio directly; avoid transcribing whisper to text if possible (audio-to-audio).
*   **Cost**: GPT-4o Audio is expensive.
    *   *Mitigation*: Implement the "Smart Cost" tiering (switch to cheaper models for simple turns).
*   **Legal**: Call recording laws vary by jurisdiction.
    *   *Mitigation*: Agent must announce it is an AI assistant at the start of the call.

## 7. Vision

The ultimate goal is to enable a user to navigate complex foreign situations (bureaucracy, reservations, support) with the confidence of a local expert, powered by an AI that takes cues perfectly.
