# Paradox ERP

A modern Enterprise Resource Planning (ERP) application focused on managing clients, projects, deals, and finances.

## Features

- **Dashboard** - Overview of metrics, pipeline value, and active projects.
- **CRM & Deals** - Client management and visual sales pipeline.
- **Projects & Delivery** - Track tasks, milestones, and project delivery.
- **Finance** - Quote generation, invoicing, and expense tracking.
- **Automation** - Webhooks and automated follow-ups.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4, shadcn/ui
- **Database & Auth:** Supabase (PostgreSQL, RLS)
- **Validation:** Zod, React Hook Form
- **Testing:** Vitest, Playwright

## Local Development

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start the local database (requires Docker):
   ```bash
   npx supabase start
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Fill in the required Supabase keys in .env.local
   ```

4. Run the development server:
   ```bash
   pnpm dev
   ```

The application will be available at [http://localhost:3000](http://localhost:3000).

## License

Proprietary - Copyright © 2026 Paradox ERP. All rights reserved.
