# Database Schema

> **Supabase (PostgreSQL)** — Used starting in VS-3 for persistent data.
> VS-1 and VS-2 operate without a database (stateless sessions, no persistence).
>
> This spec defines the schema BEFORE implementation. Code must match this spec.

---

## Schema Overview

```
users ──< calls ──< transcript_entries
  │
  └──< contacts
  │
  └──< user_settings
```

---

## Tables

### users

User accounts managed by Supabase Auth.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key (matches Supabase Auth UID) |
| email | text | No | | Email address |
| displayName | text | Yes | | Display name |
| tier | text | No | 'free' | 'free' \| 'paid' |
| totalSpend | numeric(10,4) | No | 0 | Cumulative USD spent (updated after each call) |
| monthlySpend | numeric(10,4) | No | 0 | Current month USD spent (reset monthly) |
| callCountToday | integer | No | 0 | Calls made today (reset daily, enforces rate limit) |
| createdAt | timestamptz | No | now() | Account creation |
| updatedAt | timestamptz | No | now() | Last modification |

**RLS Policy:** Users can only read/update their own row.

---

### contacts

Saved business numbers with context for repeat calls.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| userId | uuid | No | | FK → users.id |
| name | text | No | | Business name ("Mario's Pizza") |
| phoneNumber | text | No | | E.164 format ("+15551234567") |
| contextNotes | text | Yes | | Persistent context ("Always order large pepperoni. Tip 20%.") |
| commonPhrases | jsonb | Yes | '[]' | Pre-cached phrases for this contact |
| callCount | integer | No | 0 | Times called via Celato |
| lastCalledAt | timestamptz | Yes | | Last call timestamp |
| createdAt | timestamptz | No | now() | |
| updatedAt | timestamptz | No | now() | |

**Index:** `(userId, phoneNumber)` unique — one contact entry per phone number per user.
**RLS Policy:** Users can only CRUD their own contacts.

---

### calls

Call log with metadata, cost, and state.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| userId | uuid | No | | FK → users.id |
| contactId | uuid | Yes | | FK → contacts.id (null if unsaved number) |
| retellCallId | text | Yes | | Retell's call ID (for correlation) |
| phoneNumber | text | No | | E.164 format |
| personaMode | text | No | 'transparent' | 'transparent' \| 'semi_transparent' \| 'proxy' |
| purpose | text | Yes | | Pre-call context ("Order dinner") |
| userNotes | text | Yes | | Pre-call notes ("Mention nut allergies") |
| state | text | No | 'initiated' | 'initiated' \| 'connecting' \| 'active' \| 'ended' \| 'error' |
| duration | integer | Yes | | Call duration in seconds |
| costTotal | numeric(10,4) | Yes | | Total USD cost |
| costRetell | numeric(10,4) | Yes | | Retell telephony cost |
| costLlm | numeric(10,4) | Yes | | LLM token cost |
| costTranscription | numeric(10,4) | Yes | | Deepgram cost (VS-2+, audio whispers) |
| llmModel | text | Yes | | Model used ("gpt-4o-mini") |
| whisperCount | integer | No | 0 | Number of whisper instructions sent |
| startedAt | timestamptz | Yes | | Call start time |
| endedAt | timestamptz | Yes | | Call end time |
| createdAt | timestamptz | No | now() | Record creation |

**Index:** `(userId, createdAt DESC)` — call history queries.
**RLS Policy:** Users can only read their own calls.

---

### transcript_entries

Individual transcript lines within a call.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| callId | uuid | No | | FK → calls.id |
| speaker | text | No | | 'business' \| 'agent' \| 'whisper' \| 'system' |
| text | text | No | | Transcript content |
| isHidden | boolean | No | false | true for whisper instructions (not shown in shared view) |
| sequenceNumber | integer | No | | Order within call (1, 2, 3...) |
| timestamp | timestamptz | No | | When this was spoken |

**Note:** `speaker: 'whisper'` entries have `isHidden: true`. Business never sees these. Transcript display filters by `isHidden` based on view context.

**Note:** Sensitive info entered via DTMF shows as `[SECURE INPUT - DTMF]` placeholder, not actual digits (D-021-CLR).

**Index:** `(callId, sequenceNumber)` — ordered transcript retrieval.
**RLS Policy:** Users can only read transcripts for their own calls.

---

### user_settings

User preferences and configuration.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| userId | uuid | No | | FK → users.id (unique) |
| defaultPersonaMode | text | No | 'transparent' | Default persona for new calls |
| defaultLanguage | text | No | 'en' | ISO 639-1 language code |
| whisperLanguage | text | No | 'en' | Language for whisper input |
| announceTranscription | boolean | No | true | Agent announces "This call is being transcribed" |
| spendLimitMonthly | numeric(10,4) | Yes | | Monthly spending cap (null = unlimited) |
| spendLimitPerCall | numeric(10,4) | Yes | | Per-call spending cap (null = unlimited) |
| llmPreference | text | No | 'auto' | 'auto' \| 'gpt-4o-mini' \| 'gpt-4o' \| etc. |
| createdAt | timestamptz | No | now() | |
| updatedAt | timestamptz | No | now() | |

**Constraint:** `userId` is unique — one settings row per user.
**RLS Policy:** Users can only read/update their own settings.

---

## Row-Level Security (RLS)

All tables use Supabase RLS with this pattern:

```sql
-- Example: users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

**Service role** (backend API) bypasses RLS for admin operations (usage tracking, cost finalization).

---

## Migrations Timeline

| VS | Tables | Notes |
|----|--------|-------|
| **VS-3** | users, calls, transcript_entries, contacts, user_settings | Full schema, Supabase Auth integration |
| **VS-3+** | (schema additions as needed) | Cost analytics views, search indexes |

---

## Design Decisions

- **jsonb for commonPhrases:** Flexible structure for cached phrase libraries per contact. Avoids separate table for small data.
- **Separate transcript_entries table:** Normalized for query efficiency (filter by speaker, search text). NOT embedded in calls.
- **Cost columns as numeric(10,4):** 4 decimal places for micro-cost tracking ($0.0002/whisper).
- **No soft deletes:** Hard delete with GDPR export-before-delete. Simpler schema.
- **ISO 8601 timestamps:** All dates as `timestamptz`, formatted as ISO 8601 in API responses (per api-contracts.md conventions).
