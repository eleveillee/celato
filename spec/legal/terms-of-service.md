# Terms of Service — Requirements Outline

> **This is NOT the final TOS.** It's a requirements document for what the TOS must cover,
> based on technical decisions. A lawyer should draft the actual legal text.

---

## Required Sections

### 1. AI Disclosure
**Source:** D-006-PER (Persona System), project rules

- Transparent mode: Agent announces AI identity at call start
- Semi-Transparent mode: Agent acts on behalf of user, no AI disclosure unless asked
- Proxy mode: Agent speaks as user — **user accepts full responsibility for agent's statements**
- User must acknowledge they understand the difference between modes

### 2. User Responsibility
**Source:** D-019-ABS (Abuse Prevention)

- User is responsible for all calls made through their account
- User must not use Celato for: harassment, fraud, impersonation with malicious intent, spam calls, illegal activities
- User must comply with local laws regarding AI-assisted phone calls
- User acknowledges that agent output is AI-generated and may contain errors

### 3. Call Recording & Transcripts
**Source:** D-021-CLR (Sensitive Info), audit finding (call recording consent)

- All calls are transcribed for service functionality
- Transcripts may be stored for call history features (VS-3)
- User is responsible for compliance with local recording consent laws
- In two-party consent jurisdictions, user must ensure business is informed
- Sensitive information (CC numbers, SSN) entered via DTMF or passthrough mode is NOT recorded or stored

### 4. Data Privacy
**Source:** BL-020-GDP (GDPR), general compliance

- What data we collect: call metadata, transcripts, usage metrics, account info
- What data we DO NOT collect: credit card numbers (DTMF-only), passthrough audio content
- Data retention period: [TBD — define in VS-3]
- Data export: users can request full data export (GDPR right)
- Data deletion: users can request account and data deletion (GDPR right)
- Third-party data sharing: Retell AI (telephony), OpenAI (LLM), Supabase (storage)

### 5. Rate Limits & Usage
**Source:** D-019-ABS (Abuse Prevention)

- Free tier: 10 calls/day, 5 min max per call
- Paid tier: Unlimited calls, configurable duration
- Celato reserves the right to throttle or suspend accounts for abuse
- Abuse includes: mass dialing, automated usage beyond API limits, harassment patterns

### 6. Service Limitations
**Source:** D-005-ERR (Error Handling), D-013-LLM (Multi-model)

- Agent responses are AI-generated and may be inaccurate
- Service depends on third-party providers (Retell, OpenAI) and may experience outages
- Latency targets are best-effort, not guaranteed
- Celato is not a substitute for professional advice (legal, medical, financial)

### 7. Cost Transparency
**Source:** F-008-CST (Cost Tracking)

- Real-time cost display during calls
- Per-call cost breakdown (telephony + LLM + transcription)
- User can set spending limits (VS-3)
- No hidden fees — all costs visible before and during call

---

## Legal Review Checklist

- [ ] AI-specific disclosure requirements by jurisdiction
- [ ] Call recording consent requirements (one-party vs two-party states)
- [ ] GDPR compliance (if serving EU users)
- [ ] CCPA compliance (if serving California users)
- [ ] FCC regulations for AI-assisted phone calls
- [ ] Payment processing compliance (PCI-DSS for DTMF path)
- [ ] Intellectual property (who owns transcripts?)
- [ ] Liability limitations (agent says something wrong)
- [ ] Age restrictions (18+ for phone calls?)

---

## Implementation Timeline

| Requirement | VS | Notes |
|-------------|-----|-------|
| Basic TOS (accept before first call) | VS-1 | In-app agreement, covers AI disclosure + user responsibility |
| Recording consent toggle | VS-1 | Agent announces "This call is being transcribed" (configurable) |
| Data export/deletion | VS-3 | GDPR compliance |
| Spending limits | VS-3 | Cost control features |
| Full legal review | Pre-launch | Before any public release |
