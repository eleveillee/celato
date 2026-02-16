# VS-003-POL: Smart Cost & Polish

## Status: ⬚ Not Started

## Philosophy

VS-3 takes the validated mobile prototype (VS-2) and makes it viable for daily use. The whisper interaction works, mobile apps ship, VoIP integration is solid. Now we add the intelligence layer: smart cost optimization, call history, contacts integration, and multi-platform polish.

**Key principle:** Optimize for real-world usage. Users shouldn't pay GPT-4o-mini rates for simple confirmations ("Yes, I'm still here"). They should review past calls to learn from agent performance. They should save favorite contacts with context ("Mario's Pizza - always order large pepperoni, tip well").

---

## Goal

Production-ready mobile and web apps with smart cost optimization, call history, contacts, and multi-language support.

---

## Success Criteria

VS-003 is DONE when:

| # | Criterion | Verification |
|---|-----------|--------------|
| 1 | Cost tier switching works | Start call in "Parrot" mode (cheap) → complex negotiation → agent auto-switches to "Negotiator" mode (smart) → cost displayed updates |
| 2 | Call history loads | Open app → tap "History" → see last 20 calls with business name, duration, cost, date |
| 3 | Call history search works | Search "pizza" → see all calls to pizza places |
| 4 | Transcript review works | Tap call → see full conversation (Business/Agent turns) with timestamps |
| 5 | Transcript export works | Tap "Copy" → full markdown transcript in clipboard |
| 6 | Contact save works | After call → "Save Contact" → enter name + notes → saved |
| 7 | Contact quick-dial works | Open "Contacts" → tap "Mario's Pizza" → pre-fills number + loads context notes |
| 8 | Multi-language works | Set persona to "French Translator" → call French restaurant → agent speaks French, whispers translated to English |
| 9 | Settings persist | Change default persona to "Professional" → close app → reopen → still "Professional" |
| 10 | Supabase sync works | Make call on iPhone → open web app → same call appears in history |
| 11 | Cost analytics work | Tap "Analytics" → see total spend this month, average cost per call, breakdown by persona |
| 12 | User registration works | New user → sign up with email → email verification → logged in |

**Test scenario:**
```
1. New user registers via email (Supabase Auth)
2. Sets default persona to "Parrot" (cheap mode)
3. Calls pizza place to order delivery
4. Simple conversation → stays in Parrot mode (~$0.01/min)
5. Business asks complex question about allergies
6. Agent auto-switches to Negotiator mode (~$0.08/min)
7. Cost display updates in real-time
8. After call: transcript saved to Supabase
9. User taps "Save Contact": "Mario's Pizza - pepperoni, no mushrooms"
10. User taps "History" → sees call with $0.45 total cost
11. User opens web app on desktop → same call history synced
12. Next day: taps contact → quick-dials with context loaded
```

---

## Key Differences from VS-2

| Feature | VS-2 (Mobile MVP) | VS-3 (Polish) |
|---------|-------------------|---------------|
| **Cost Model** | Fixed rate (~$0.08/min) | Smart switching (cheap → expensive when needed) |
| **Call History** | ❌ None (ephemeral) | ✅ Persistent with search |
| **Contacts** | ❌ Manual phone number entry | ✅ Saved contacts with context notes |
| **User Auth** | ❌ Anonymous sessions | ✅ Email auth with Supabase |
| **Data Sync** | ❌ Local-only | ✅ Cross-device sync (mobile ↔ web) |
| **Multi-Language** | ❌ English only | ✅ 5+ languages with translation |
| **Analytics** | ❌ No tracking | ✅ Cost analytics, usage stats |
| **Settings** | ❌ In-memory | ✅ Persistent preferences |

---

## Features

### F-021-AUT: User Authentication
Supabase Auth integration for email signup, login, and session management.

**What's new:**
- Email/password registration with verification
- Magic link login (passwordless)
- Session persistence across app restarts
- Anonymous → authenticated migration (preserve call history)

**Why Supabase Auth:**
- Built-in email verification
- RLS (Row Level Security) for data isolation
- JWT-based sessions work with Fastify middleware
- Magic links reduce friction

### F-022-HIS: Call History
Persistent call logs stored in Supabase with search and filtering.

**What's new:**
- `calls` table: user_id, business_phone, business_name, duration, cost, started_at, ended_at
- `transcript_entries` table: call_id, speaker (business/agent), text, translated_text, timestamp
- Pagination (20 calls per page)
- Search by business name or phone number
- Filter by date range, cost, duration

**Schema:**
```sql
-- calls table
create table calls (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  business_phone text not null,
  business_name text,
  persona_mode text not null, -- 'transparent' | 'proxy'
  language text not null default 'en',
  duration_seconds integer not null,
  cost_usd numeric(10,4) not null,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  created_at timestamptz default now()
);

-- transcript_entries table
create table transcript_entries (
  id uuid primary key default uuid_generate_v4(),
  call_id uuid references calls on delete cascade not null,
  speaker text not null, -- 'business' | 'agent'
  text text not null,
  translated_text text, -- if language != 'en'
  timestamp timestamptz not null,
  created_at timestamptz default now()
);

-- Enable RLS
alter table calls enable row level security;
alter table transcript_entries enable row level security;

-- RLS policies (users can only see their own calls)
create policy "Users can view own calls"
  on calls for select
  using (auth.uid() = user_id);

create policy "Users can view own transcripts"
  on transcript_entries for select
  using (exists (
    select 1 from calls
    where calls.id = transcript_entries.call_id
    and calls.user_id = auth.uid()
  ));
```

### F-023-CNT: Contacts Integration
Save business contacts with context notes for quick-dial.

**What's new:**
- `contacts` table: user_id, business_name, phone_number, context_notes, call_count, last_called_at
- Quick-dial from contact (pre-fills phone + loads context)
- Auto-suggest contact name after call (if phone number matches)
- Contact edit/delete

**Schema:**
```sql
create table contacts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  business_name text not null,
  phone_number text not null,
  context_notes text, -- "Always order large pepperoni, tip 20%"
  call_count integer default 0,
  last_called_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table contacts enable row level security;

create policy "Users can manage own contacts"
  on contacts for all
  using (auth.uid() = user_id);
```

### F-024-OPT: Cost Optimization (Model Switching)
Automatic switching between cheap "Parrot" mode and expensive "Negotiator" mode.

**What's new:**
- Two persona tiers:
  - **Parrot (GPT-4o-mini):** ~$0.01/min — simple confirmations, straightforward requests
  - **Negotiator (GPT-4o):** ~$0.08/min — complex negotiations, nuanced language, interruptions
- Auto-detection: LLM analyzes conversation complexity every 30 seconds
- User override: Force Negotiator mode for critical calls
- Cost display updates in real-time when tier switches

**Switching Logic:**
```typescript
// packages/api/src/features/cost-optimization/tier-detector.ts
interface ConversationComplexity {
  turnCount: number;
  businessInterruptions: number;
  negotiationKeywords: string[]; // "discount", "refund", "exception"
  userOverride: boolean;
}

function detectTier(complexity: ConversationComplexity): 'parrot' | 'negotiator' {
  // User forced Negotiator
  if (complexity.userOverride) return 'negotiator';

  // Simple conversation: under 3 turns, no interruptions
  if (complexity.turnCount < 3 && complexity.businessInterruptions === 0) {
    return 'parrot';
  }

  // Negotiation keywords detected
  if (complexity.negotiationKeywords.length > 0) {
    return 'negotiator';
  }

  // Business interrupted agent (complex turn-taking)
  if (complexity.businessInterruptions > 1) {
    return 'negotiator';
  }

  // Default: Parrot (cheaper)
  return 'parrot';
}
```

**Cost Breakdown:**
| Tier | Model | Retell | LLM | Total/min |
|------|-------|--------|-----|-----------|
| Parrot | GPT-4o-mini | $0.005 | $0.005 | **~$0.01** |
| Negotiator | GPT-4o | $0.005 | $0.075 | **~$0.08** |

### F-025-I18: Multi-Language Support
Agent speaks foreign language, whispers translated back to user.

**What's new:**
- Language selection: English, Spanish, French, Mandarin, Japanese
- Retell AI handles language detection (business speaks foreign language)
- OpenAI Realtime API responds in target language
- Whispers translated to English for user display
- Transcript shows both original + translated text

**Flow:**
```
1. User sets persona to "Spanish Translator"
2. Calls Mexican restaurant
3. Business: "Hola, ¿en qué puedo ayudarle?" (Spanish)
4. Agent: "Hola, me gustaría hacer una reserva..." (Spanish)
5. User whispers: "Ask if they have outdoor seating"
6. App displays: "Ask if they have outdoor seating" (English)
7. Agent: "¿Tienen mesas al aire libre?" (Spanish)
8. Business responds in Spanish
9. Transcript shows:
   - Business: "Sí, tenemos patio" | Translated: "Yes, we have a patio"
   - Agent: "Perfecto, ¿para cuántas personas?" | Translated: "Perfect, for how many people?"
```

**Implementation:**
- OpenAI Realtime API supports multilingual audio natively
- Translation via OpenAI API (separate call): `translate(text, from: 'es', to: 'en')`
- Cost: +$0.0001/turn for translation (negligible)

### F-026-SET: Settings & Preferences
User customization with persistent storage.

**What's new:**
- Default persona (Transparent vs Proxy)
- Default language
- Cost tier preference (Auto vs Always Negotiator)
- Notification preferences (VoIP push, call end alerts)
- Audio settings (mic sensitivity, speaker volume)

**Storage:**
- Supabase `user_preferences` table
- Mobile: synced to local AsyncStorage for offline access
- Web: synced to localStorage

**Schema:**
```sql
create table user_preferences (
  user_id uuid primary key references auth.users,
  default_persona text not null default 'transparent',
  default_language text not null default 'en',
  cost_tier_preference text not null default 'auto', -- 'auto' | 'always_negotiator'
  notifications_enabled boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table user_preferences enable row level security;

create policy "Users can manage own preferences"
  on user_preferences for all
  using (auth.uid() = user_id);
```

### F-027-ANA: Cost Analytics
Visual breakdown of call costs and usage patterns.

**What's new:**
- Total spend this month/week/all-time
- Average cost per call
- Breakdown by persona tier (Parrot vs Negotiator)
- Call duration histogram
- Top 5 most-called contacts
- Export to CSV

**UI:**
```
┌─────────────────────────────────────┐
│ Cost Analytics                      │
├─────────────────────────────────────┤
│ This Month: $23.45                  │
│ Last Month: $18.20                  │
│ Average/Call: $0.67                 │
├─────────────────────────────────────┤
│ Breakdown by Tier:                  │
│ ■■■■■■■■□□ Parrot: $8.50 (36%)      │
│ ■■■■■■■■■■ Negotiator: $14.95 (64%) │
├─────────────────────────────────────┤
│ Top Contacts:                       │
│ 1. Mario's Pizza (8 calls, $5.20)  │
│ 2. Doctor's Office (3 calls, $9.45)│
│ 3. Hotel Front Desk (2 calls, $3.10)
└─────────────────────────────────────┘
```

**Implementation:**
- Query `calls` table with aggregations
- Chart library: Recharts (web), Victory Native (mobile)

---

## System Design (Light)

### Supabase Integration Architecture

**Data Flow:**
```
Mobile/Web App
    ↓
Supabase Client SDK (auth, realtime subscriptions)
    ↓
Supabase (PostgreSQL + RLS + Auth)
    ↑
API Orchestrator (service role key for backend writes)
```

**Why Supabase:**
- Built-in Auth (email, magic links, OAuth)
- Row Level Security (data isolation without backend logic)
- Realtime subscriptions (call history updates live)
- Generous free tier (50k monthly active users)
- PostgREST API (auto-generated REST endpoints)

**API Orchestrator Role:**
- Writes call logs + transcripts during active calls (service role key bypasses RLS)
- Doesn't handle auth (Supabase client does)
- Validates user owns the call before writing

### Cost Optimization Strategy

**Tier Detection Algorithm:**
1. Start every call in Parrot mode (cheap)
2. Every 30 seconds, analyze conversation:
   - Turn count
   - Business interruptions (VAD signals from Retell)
   - Negotiation keywords ("discount", "refund", "exception", "manager")
   - User whisper complexity (if whisper length > 50 words → likely complex)
3. If complexity threshold crossed → switch to Negotiator
4. Once switched, stay in Negotiator (don't downgrade mid-call)
5. Display tier switch notification: "⚡ Switched to Smart mode for better negotiation"

**User Override:**
- Settings: "Always use Negotiator for important calls"
- In-call: "Upgrade to Smart" button (one-way, can't downgrade)

**Cost Savings:**
- Simple calls (confirmations, hours checks): ~90% cost reduction
- Complex calls (negotiations): same cost as before, but only when needed
- Estimated average: ~$0.03/min (vs fixed $0.08/min)

### Multi-Language Implementation

**Translation Flow:**
```
Business speaks Spanish
    ↓
Retell AI transcribes (Spanish text)
    ↓
API Orchestrator stores original Spanish + calls OpenAI translate API
    ↓
User sees: "Hola, ¿en qué puedo ayudarle?" → "Hello, how can I help you?"
    ↓
User whispers in English: "Ask for outdoor seating"
    ↓
LLM prompt includes: [DIRECTOR: User wants outdoor seating. Respond in Spanish.]
    ↓
Agent responds in Spanish: "¿Tienen mesas al aire libre?"
```

**Language Detection:**
- Retell AI auto-detects language from business speech
- Fallback: user sets expected language in persona settings

**Supported Languages (VS-3):**
- English (native)
- Spanish (high demand, Latin America + Spain)
- French (Europe, Canada)
- Mandarin (China, business travel)
- Japanese (business travel)

**Future Languages (VS-4+):** German, Italian, Portuguese, Korean, Arabic

---

## Deployment

### Supabase Project Setup

**Steps:**
1. Create Supabase project: `celato-production`
2. Run schema migrations (SQL above)
3. Enable Auth providers: Email, Magic Link
4. Configure email templates (verification, magic link)
5. Set up environment variables:
   ```bash
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_ANON_KEY=ey... # Client-side (RLS enforced)
   SUPABASE_SERVICE_KEY=ey... # Backend-only (bypasses RLS)
   ```

**RLS Security:**
- Users can only see their own calls, contacts, preferences
- API orchestrator uses service role key to write call logs (validated by session)
- Supabase Auth JWTs embedded in mobile/web requests

### Database Migrations

**Tool:** Supabase CLI (`supabase db push`)

**Migration Files:**
```
supabase/migrations/
├── 20260301_create_calls.sql
├── 20260302_create_transcript_entries.sql
├── 20260303_create_contacts.sql
├── 20260304_create_user_preferences.sql
└── 20260305_enable_rls.sql
```

**Rollback Strategy:**
- Every migration has a corresponding `down.sql`
- Test migrations on staging project first
- Use Supabase branching for schema changes

---

## Blocking Decisions

| ID | Question | Recommendation | Status |
|----|----------|----------------|--------|
| D-010-TIR | Cost tier switching: manual only vs auto-detect | Auto-detect with manual override (best UX + cost savings) | ⬚ To be resolved in VS-3 Phase 1 |
| D-011-TRL | Translation: client-side vs server-side | Server-side (consistent, enables cost tracking) | ⬚ To be resolved in VS-3 Phase 1 |
| D-012-ANA | Analytics: real-time aggregation vs pre-computed | Pre-computed nightly (better performance, simpler queries) | ⬚ To be resolved in VS-3 Phase 2 |

_Note: These decisions will be expanded in [decisions.md](../decisions.md) when VS-3 implementation begins._

---

## Transition Checklist

Before moving to VS-004:

- [ ] All features ✅ or explicitly deferred
- [ ] All blocking decisions resolved
- [ ] VS-3 tested on real devices (iOS + Android) and web
- [ ] Supabase schema deployed and RLS verified
- [ ] Cost analytics accurate (verified against actual bills)
- [ ] Multi-language tested with native speakers
- [ ] Learnings documented (model switching latency, translation accuracy)
- [ ] Both platforms (mobile + web) fully synced and polished

---

## Future Enhancements (Post-VS-3)

**Not in scope for VS-3, but documented for VS-4+:**
- Voice cloning (user can train agent to sound like them)
- Context library (pre-built templates for Doctor Visit, Job Interview, Tech Support)
- Team accounts (shared contacts + call history for families/businesses)
- Desktop apps (Electron/Tauri wrappers)
- Browser extension (quick-dial from any phone number on web)
- CarPlay + Android Auto integration
