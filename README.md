<div align="center">

# Paradox ERP

### The Next-Generation Company OS for AI Studios — CRM · Deals · Projects · Finance · Automation · Founder Dashboard

*The "Operating Layer" of your business — the only place where the entire company can actually be seen and orchestrated.*

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20RLS-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
<br/>
[![Status](https://img.shields.io/badge/status-internal%20MVP-blue)](#-project-status)
[![License](https://img.shields.io/badge/license-proprietary%20·%20open--core%20planned-orange)](./LICENSE.md)

<br/>

[**Roadmap**](#-roadmap) · [**Documentation**](./docs) · [**Report a Bug**](https://github.com/paradox-erp/paradox-erp/issues)

</div>

> [!NOTE]
> Paradox ERP is an **"Operating System"** for your company, not a statutory tax/accounting system. Operational financial matters are handled here to give you real-time visibility into Runway and MRR, while statutory accounting remains with dedicated tools like Xero or QuickBooks.

---

## 📑 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Open-Core Strategy](#-open-core-strategy)
- [License](#-license)

---

## 🎯 About the Project

**Paradox ERP** is a lightweight, AI-native Company OS designed for modern studios, agencies, and workflow automation teams. It brings everything into one unified pane of glass: clients, deals, project delivery, operational finance, reusable automation templates, and a founder dashboard that highlights cash flow, burn rate, and runway.

Designed with clean architecture and Row Level Security (RLS) from day one, it functions perfectly for a single organization while being fully structured to scale into a multi-tenant SaaS application (Open-Core model).

---

## ✨ Features

### Core Modules

- 📊 **Founder Dashboard** — Cash on hand, monthly burn, revenue, outstanding invoices, MRR, pipeline value, active projects, runway, and overdue tasks.
- 👥 **CRM & Deals** — Client database, contacts, and a visual Kanban board for the sales pipeline.
- 📁 **Projects & Delivery** — Delivery board, tasks, milestones, and direct conversion from a "Won" deal into an active project.
- 💰 **Operational Finance** — Quotes, invoices, payments, cost tracking, and gross profit margins.
- 🧩 **Automation Templates** — A library of reusable automation workflows with built-in checklists and pricing.
- 🔗 **Webhooks & Cron** — Inbound webhook endpoints for external tools (e.g., n8n) and internal chron jobs to automatically scan for due follow-ups.
- 🔐 **Security & Roles** — Powered by Supabase Auth with strict roles (Owner, Admin, Member) and organization-level data isolation.

### Advanced Capabilities

- 📝 **Audit Logs** — A comprehensive, immutable ledger of all critical changes within the system.
- 📤 **Reporting & Export** — Export invoices, costs, and deals to CSV with custom URL-based filtering and saved views.
- 🤖 **AI Assistant** — Native integration with Anthropic (Claude) to summarize deals, draft outbound messages, and generate structured meeting notes. (Degrades gracefully if no API key is provided).
- ⏰ **Automated Follow-ups** — The system automatically queues outbound reminders when deals or invoices are overdue.

---

## 🧱 Tech Stack

| Domain | Technology |
|---|---|
| **Framework** | **Next.js 16** (App Router, Server Actions) · **TypeScript** |
| **Styling & UI** | **Tailwind CSS v4** · **shadcn/ui** · lucide-react · sonner |
| **Backend & Auth** | **Supabase** — Postgres + Auth + Row Level Security (RLS) |
| **Forms** | **Zod** · React Hook Form |
| **AI Integration** | **@anthropic-ai/sdk** (Claude) |
| **Testing** | **Vitest** (Unit) · **Playwright** (E2E) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 20+**
- **pnpm**
- **Docker** (for local Supabase)
- **Supabase CLI**

### Local Development Setup

```bash
# 1) Clone the repository
git clone https://github.com/paradox-erp/paradox-erp.git
cd paradox-erp

# 2) Install dependencies
pnpm install

# 3) Start local Supabase container (requires Docker)
supabase start

# 4) Run migrations and seed data
supabase db reset

# 5) Set up environment variables
cp .env.example .env.local
supabase status          # Copy API URL and keys into .env.local

# 6) Start the development server
pnpm dev                 # http://localhost:3000
```

### Demo Login

When you run `supabase db reset`, the following local demo account is provisioned for you:

| Email | Password | Role |
|---|---|---|
| `sc644795@gmail.com` | `Paradox@16` | Owner |

---

## 🔑 Environment Variables

Copy `.env.example` to `.env.local` and populate the necessary keys. 

* **Required:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (Server-only).
* **Optional:** `ANTHROPIC_API_KEY` (for AI features), `RESEND_API_KEY` (for email delivery).

---

## 🗂️ Project Structure

```
app/
  (app)/              # Authenticated layout & core modules
    dashboard/  clients/  deals/  projects/  finance/
    settings/  audit/  automation/  intake/
  api/webhooks/n8n/   # Inbound webhooks
  api/cron/followups/ # Automated cron scanners
  login/  signup/
components/           # Reusable UI, Layout, and Registry
lib/
  supabase/           # Clients for Server, Browser, and Admin
  metrics/            # Pure business logic (unit-tested)
supabase/
  migrations/         # Postgres schemas, functions, triggers, and RLS
  seed.sql            # Local development seed data
```

---

## 🧩 Open-Core Strategy

Paradox ERP is designed with an Open-Core philosophy. The foundational layer (CRM, Projects, Finance) serves as the Community Edition, while advanced features (e.g., Client Portals, Advanced RBAC, SSO) are designated for a future Pro tier. 

---

## 📄 License

> [!IMPORTANT]
> This software is currently **Proprietary**.

Copyright © 2026 Paradox ERP Contributors. All rights reserved.
