@AGENTS.md

# Client Portal Project

## О проекте

Стримовый проект. Клиентский портал для консалтинговой компании **"Apex Strategy"** (тот же бренд, что в CRM Project).

**История для аудитории:** компания предлагает клиентам личный кабинет — с документами, статусом проекта, тарифом. Это реальный кейс для предпринимателей (агентство, консалтинг, коуч): закрытая зона для своих клиентов с авторизацией.

**Цель стрима:** показать 4 метода аутентификации в Next.js + Supabase вживую.

## Stack

- Next.js 16 (App Router, src/ dir)
- Supabase (PostgreSQL + RLS) — `@supabase/ssr`
- shadcn/ui + Tailwind CSS v4
- Vercel (деплой)

## Структура маршрутов

- `(marketing)/` — лендинг Apex Strategy (лендинг из CRM Project, добавить кнопку "Личный кабинет")
- `(portal)/login/` — страница с 4 способами входа
- `(portal)/dashboard/` — защищённый клиентский кабинет
- `api/auth/callback/` — Supabase OAuth callback (Google, GitHub)
- `api/auth/telegram/` — Telegram Login Widget handler

## Что показывает дашборд после входа

- Имя пользователя
- Каким методом вошёл
- Тариф клиента
- Список документов (заглушки или реальные — по ходу стрима)

## Supabase

- Проект: `zdshojzpbcgzekubsvbi` (eu-north-1)
- Schema: **public** (не отдельная схема)
- Все таблицы с префиксом `portal_`
- MCP инструменты: `mcp__plugin_supabase_supabase__*`

### Таблица `portal_profiles`

```sql
create table portal_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  auth_method text, -- 'password' | 'google' | 'github' | 'telegram'
  telegram_id bigint unique,
  telegram_username text,
  role text default 'client', -- 'client' | 'admin'
  plan text default 'basic',  -- 'basic' | 'pro' | 'enterprise'
  created_at timestamptz default now()
);
-- RLS включён: каждый видит только свою строку (auth.uid() = id)
```

## 4 метода аутентификации

### 1. Email/Password

- `supabase.auth.signInWithPassword({ email, password })`
- `supabase.auth.signUp({ email, password })`
- Ключевой момент на стриме: `getUser()` vs `getSession()` — на сервере всегда `getUser()`, потому что JWT верифицируется с Supabase, а не берётся из куки

### 2. Google OAuth

- `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: '/auth/callback' } })`
- Callback роут: `supabase.auth.exchangeCodeForSession(code)`
- Один `/auth/callback` работает для Google и GitHub

### 3. GitHub OAuth

- Тот же флоу, что Google — показываем единообразие Supabase OAuth
- Ключевой момент: один callback роут на все OAuth провайдеры

### 4. Telegram Login Widget

- HTML виджет от Telegram (`<script data-telegram-login="...">`)
- POST `/api/auth/telegram/` — верификация HMAC-SHA256

**Верификация Telegram:**
```typescript
// secretKey = SHA256(botToken) — не HMAC, а именно хэш
const secretKey = crypto.createHash('sha256').update(botToken).digest()

// checkString = отсортированные key=value через \n (без поля hash)
const checkString = Object.entries(fields)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([k, v]) => `${k}=${v}`)
  .join('\n')

const expectedHash = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex')

// Также проверить: auth_date не старше 24 часов
if (now - data.auth_date > 86400) return false
```

**КРИТИЧЕСКИЙ НЮАНС — роли при upsert:**
```typescript
// ПРАВИЛЬНО: сначала проверить существующую роль в БД
const { data: existing } = await supabase
  .from('portal_profiles')
  .select('role')
  .eq('telegram_id', body.id)
  .single()

// Не понижать вручную повышенные роли
const role = existing?.role === 'admin' ? 'admin' : 'client'

// НЕПРАВИЛЬНО (часто делают так):
// const role = 'client' // ← сотрёт ручное повышение при каждом входе!
```

Почему это важно: после upsert при каждом входе роль перезаписывается. Если ты вручную поставил кому-то `admin` в БД, следующий вход через Telegram вернёт `client`. Нужно всегда проверять текущее значение перед записью.

**Сессия Telegram:** custom cookie (base64 JSON + HMAC подпись через `SESSION_SECRET`), НЕ Supabase native session. У Telegram нет Supabase JWT.

## Middleware

`src/middleware.ts` — защита `(portal)/dashboard/`:
- Supabase-методы: `supabase.auth.getUser()`
- Telegram: проверка кастомной куки
- Редирект на `/login` если не авторизован

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
TELEGRAM_BOT_TOKEN=
SESSION_SECRET=
```

## Дизайн

- Тёмная тема по умолчанию
- Warm stone/amber палитра (oklch) — те же токены что в CRM Project
- Geist Sans типографика
- shadcn/ui компоненты

## Деплой и репозиторий (обновлено 2026-03-26)

- **GitHub:** https://github.com/Yefimov-Test/client-portal
- **Vercel:** проект `client-portal`, team `testhookah2-7820s-projects`
- **Live URL:** https://client-portal-amber-nu.vercel.app
- **Git integration:** включена — push в master = автодеплой
- **Vercel project ID:** создан с нуля (не crm-demo), `.vercel/project.json` обновлён

## Статус на старте стрима (2026-03-26)

Что уже есть:
- Репо создано как копия CRM Project, очищено от CRM-роутов (`(crm)/`, `api/leads/`)
- Осталось: `(marketing)/` — лендинг Apex Strategy + структура Next.js 16
- Задеплоено на Vercel, билд зелёный

Что ещё НЕ сделано (делать на стриме):
- Таблица `portal_profiles` в Supabase (schema: public, префикс `portal_`)
- Маршруты `(portal)/login/` и `(portal)/dashboard/`
- Middleware защита дашборда
- 4 метода аутентификации
- Добавить кнопку "Личный кабинет" на лендинг `(marketing)/`
- Env variables на Vercel (Supabase + Telegram + SESSION_SECRET)
