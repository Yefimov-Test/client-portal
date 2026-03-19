@AGENTS.md

# CRM Project

## Overview

Demo CRM system for a stream. Landing page for a fictional consulting company "Apex Strategy" is already built. The CRM dashboard needs to be built on stream.

## Stack

- Next.js 16 (App Router, src/ dir)
- Supabase (PostgreSQL + RLS)
- shadcn/ui + Tailwind CSS v4
- OpenAI API (lead classification)
- Telegram Bot API (notifications)
- Vercel (deployment)

## Project Structure

- `(marketing)/` - landing page (done)
- `(crm)/dashboard/` - CRM kanban board (TODO)
- `api/leads/` - webhook endpoint (stub, needs Supabase + AI + Telegram)
- `components/marketing/` - landing components
- `components/crm/` - CRM components (TODO)
- `types/index.ts` - Lead, LeadFormData types

## What Needs to Be Built (Stream)

### 1. Supabase Setup
- Create `leads` table matching the `Lead` type in `types/index.ts`
- Enable RLS
- Connect to `api/leads/route.ts`

### 2. CRM Dashboard (`(crm)/dashboard/`)
- Kanban board with columns: New, Contacted, Qualified, Proposal, Closed Won, Closed Lost
- Drag & drop cards between columns
- Each card shows: name, email, topic, priority badge, time since created
- Click card to see full details

### 3. AI Classification
- When a new lead comes in via `/api/leads`, call OpenAI to classify priority (hot/warm/cold)
- Based on message content and topic
- Save priority to Supabase

### 4. Telegram Notifications
- When a new lead comes in, send a Telegram message
- Format: name, email, topic, priority, message preview

### 5. Deploy
- `vercel deploy --prod`

## Integrations (MCP Plugins)

All integrations are connected via MCP plugins. Do NOT hardcode credentials or use env vars for these:

- **Supabase**: use `mcp__plugin_supabase_supabase__*` tools. Project: `zdshojzpbcgzekubsvbi` (eu-north-1). **All tables must be created in schema `crm_demo`** (not public).
- **Vercel**: use `mcp__plugin_vercel_vercel__*` tools. Team: `team_6c3b4199VB4COoMFq9wZuU8X`, Project: `crm-demo` (`prj_nqfvnSt25dzOmqu9LNWlRuUdzvUJ`).
- **n8n**: use `n8nac` CLI (`npx n8nac list/pull/push`). Workflow: `CRM Demo Project` (`EVWxhQU8oExU8UA7`).

## Environment Variables (.env)

Only variables that are NOT managed by MCP plugins:

- `TELEGRAM_BOT_TOKEN` - Telegram bot token for notifications
- `TELEGRAM_CHAT_ID` - Chat ID to send notifications to
- `OPENAI_API_KEY` - OpenAI API key for lead classification (TODO: add on stream)

## Design

- Dark mode by default
- Warm stone/amber palette (oklch)
- Geist Sans typography
