-- ════════════════════════════════════════════════════════════════════════════
-- Paradox ERP — demo seed (FAKE data only).
--
-- Runs via the service role / superuser (bypasses RLS). Idempotent.
-- Demo logins (LOCAL ONLY):
--   sc644795@gmail.com   (owner / founder)  password: Paradox@16
--   member1@example.com  (member)           password: Paradox@16
--   member2@example.com  (member)           password: Paradox@16
--
-- All names, emails, and phone numbers are fictional. No real personal data.
-- ════════════════════════════════════════════════════════════════════════════

-- Evaluate current_date / now() in the app's timezone so the seed's "today" and
-- "this month" line up with the dashboard (which reckons in Asia/Kolkata).
set time zone 'Asia/Kolkata';

-- ── Auth users (email + password, pre-confirmed) ────────────────────────────
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values
  ('00000000-0000-0000-0000-000000000000','b0000000-0000-0000-0000-000000000001','authenticated','authenticated','sc644795@gmail.com',   crypt('Paradox@16', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}','{"full_name":"Founder"}',          now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','b0000000-0000-0000-0000-000000000002','authenticated','authenticated','member1@example.com',  crypt('Paradox@16', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}','{"full_name":"Member One"}',       now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','b0000000-0000-0000-0000-000000000003','authenticated','authenticated','member2@example.com',  crypt('Paradox@16', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}','{"full_name":"Member Two"}',       now(), now(), '', '', '', '')
on conflict (id) do nothing;

insert into auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at) values
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000001','{"sub":"b0000000-0000-0000-0000-000000000001","email":"sc644795@gmail.com","email_verified":true}',  'email', now(), now(), now()),
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000002','b0000000-0000-0000-0000-000000000002','{"sub":"b0000000-0000-0000-0000-000000000002","email":"member1@example.com","email_verified":true}', 'email', now(), now(), now()),
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000003','b0000000-0000-0000-0000-000000000003','{"sub":"b0000000-0000-0000-0000-000000000003","email":"member2@example.com","email_verified":true}', 'email', now(), now(), now())
on conflict (provider_id, provider) do nothing;

-- Profiles (belt-and-braces; the on_auth_user_created trigger also creates these)
insert into public.profiles (id, full_name, locale) values
  ('b0000000-0000-0000-0000-000000000001','Founder','en'),
  ('b0000000-0000-0000-0000-000000000002','Member One','en'),
  ('b0000000-0000-0000-0000-000000000003','Member Two','en')
on conflict (id) do update set full_name = excluded.full_name;

-- ── Organization + settings + memberships ───────────────────────────────────
insert into organizations (id, name, slug) values
  ('a0000000-0000-0000-0000-000000000001','Paradox ERP','paradox-erp')
on conflict (id) do nothing;

insert into org_settings (org_id, cash_balance_paise, monthly_burn_paise) values
  ('a0000000-0000-0000-0000-000000000001', 85000000, null)  -- ₹850,000 cash on hand
on conflict (org_id) do nothing;

insert into memberships (org_id, user_id, role) values
  ('a0000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000001','owner'),
  ('a0000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000002','member'),
  ('a0000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000003','member')
on conflict (user_id, org_id) do nothing;

-- ── CRM: clients ────────────────────────────────────────────────────────────
insert into clients (id, org_id, name, industry, source, notes, owner) values
  ('c0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000001','Blue Tokai Coffee Roasters','F&B / Retail','Referral','SME coffee roaster, branches across India. Wants a WhatsApp bot.','b0000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000001','Haldiram''s Franchise Partners','FMCG / Retail','WhatsApp Business','Large franchise network. Need automation for stock updates.','b0000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000001','Gurukul EdTech','Education','Webinar','JEE/NEET coaching center. Needs student onboarding + community automation.','b0000000-0000-0000-0000-000000000002'),
  ('c0000000-0000-0000-0000-000000000004','a0000000-0000-0000-0000-000000000001','Godrej Properties Brokers','Real Estate','Cold outreach','Property agency in Mumbai. Drowning in lead follow-ups.','b0000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000001','Patanjali Distributors','FMCG / Ayurvedic','Referral','Ayurvedic product distributors. Wants meeting summaries + ops automation.','b0000000-0000-0000-0000-000000000003'),
  ('c0000000-0000-0000-0000-000000000006','a0000000-0000-0000-0000-000000000001','Tata Motors Dealership','Automotive','Cold outreach','Car dealership network in Delhi. Need WhatsApp test drive booking system.','b0000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000007','a0000000-0000-0000-0000-000000000001','Zomato Cloud Kitchens','F&B / Tech','Referral','Cloud kitchen operator running 5 brands. Need automated finance syncing.','b0000000-0000-0000-0000-000000000002')
on conflict (id) do nothing;

-- ── CRM: contacts ───────────────────────────────────────────────────────────
insert into contacts (org_id, client_id, name, email, phone, role) values
  ('a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000001','Rajesh Kumar','rajesh@example.com','+91-9876543210','Owner'),
  ('a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000001','Priya Sharma','priya@example.com','+91-9876543211','Marketing Lead'),
  ('a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000002','Vikram Singh','vikram@example.com','+91-9876543212','Operations Manager'),
  ('a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000003','Dr. Arvind Patel','arvind@example.com','+91-9876543213','Founder'),
  ('a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000004','Sanjay Gupta','sanjay@example.com','+91-9876543214','Sales Director'),
  ('a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000005','Ananya Desai','ananya@example.com','+91-9876543215','Co-founder'),
  ('a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000006','Ravi Malhotra','ravi.m@example.com','+91-9876543216','General Manager'),
  ('a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000007','Neha Kapoor','neha.k@example.com','+91-9876543217','Head of Operations')
on conflict do nothing;

-- ── CRM: deals (mix of stages) ──────────────────────────────────────────────
insert into deals (id, org_id, client_id, title, stage, value_paise, expected_close_date, next_follow_up_date, source, notes, owner) values
  ('d0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000001','WhatsApp Chai-Bot Support',    'won',        18000000, current_date - 20, null,               'Referral','Closed. Moving to delivery.','b0000000-0000-0000-0000-000000000001'),
  ('d0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000002','Franchise Stock CRM Setup',  'won',        25000000, current_date - 10, null,               'WhatsApp Business','Closed. Kickoff next week.','b0000000-0000-0000-0000-000000000001'),
  ('d0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000003','JEE Aspirant Onboarding Flow',    'won',        15000000, current_date - 35, null,               'Webinar','Closed last month. In support.','b0000000-0000-0000-0000-000000000002'),
  ('d0000000-0000-0000-0000-000000000004','a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000004','Broker Leads Gen System','proposal',   22000000, current_date + 14, current_date,       'Cold outreach','Proposal sent. Follow up today.','b0000000-0000-0000-0000-000000000001'),
  ('d0000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000005','Ayurveda Supply Chain Bot',     'negotiation',32000000, current_date + 7,  current_date - 2,   'Referral','Negotiating scope. Follow-up overdue!','b0000000-0000-0000-0000-000000000003'),
  ('d0000000-0000-0000-0000-000000000006','a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000003','NEET Prep AI Tutor',               'discovery',  12000000, current_date + 30, current_date + 3,   'Webinar','Exploring an AI tutor module.','b0000000-0000-0000-0000-000000000002'),
  ('d0000000-0000-0000-0000-000000000007','a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000002','Diwali Promo Automation',   'lead',        8000000, current_date + 45, current_date + 5,   'WhatsApp Business','New lead for Diwali festival season.','b0000000-0000-0000-0000-000000000001'),
  ('d0000000-0000-0000-0000-000000000008','a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000004','Property Listings Scraper',        'lost',        9000000, current_date - 5,  null,               'Cold outreach','Lost to in-house build.','b0000000-0000-0000-0000-000000000001'),
  ('d0000000-0000-0000-0000-000000000009','a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000006','Test Drive Booking via WhatsApp',  'won',        20000000, current_date - 2, null,               'Cold outreach','Contract signed. Ready to build.','b0000000-0000-0000-0000-000000000001'),
  ('d0000000-0000-0000-0000-000000000010','a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000007','Cloud Kitchen Finance Sync',  'proposal',   45000000, current_date + 10, current_date + 1,   'Referral','Sent architecture diagram. Waiting for approval.','b0000000-0000-0000-0000-000000000002')
on conflict (id) do nothing;

-- ── CRM: activities / follow-ups ────────────────────────────────────────────
insert into activities (org_id, client_id, deal_id, type, due_date, done, body, owner) values
  ('a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000004','d0000000-0000-0000-0000-000000000004','follow_up', current_date,     false,'Call Sanjay Gupta re: proposal feedback.','b0000000-0000-0000-0000-000000000001'),
  ('a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000005','d0000000-0000-0000-0000-000000000005','call',      current_date - 2, false,'Overdue: confirm scope + budget with Patanjali distributors.','b0000000-0000-0000-0000-000000000003'),
  ('a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000003','d0000000-0000-0000-0000-000000000006','meeting',   current_date + 3, false,'Discovery call for NEET AI tutor add-on.','b0000000-0000-0000-0000-000000000002'),
  ('a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000001',null,                                   'note',      null,             true, 'Sent thank-you note after kickoff.','b0000000-0000-0000-0000-000000000001'),
  ('a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000002','d0000000-0000-0000-0000-000000000007','follow_up', current_date + 5, false,'Send Diwali promo campaign one-pager.','b0000000-0000-0000-0000-000000000001')
on conflict do nothing;

-- ── Projects (from won deals) ───────────────────────────────────────────────
insert into projects (id, org_id, deal_id, client_id, name, status, deadline, budget_paise, owner) values
  ('e0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000001','d0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000001','WhatsApp Chai-Bot Ordering — Blue Tokai','in_progress', current_date + 12, 12000000,'b0000000-0000-0000-0000-000000000002'),
  ('e0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000001','d0000000-0000-0000-0000-000000000002','c0000000-0000-0000-0000-000000000002','Franchise CRM Automation — Haldiram''s','not_started', current_date + 30, 16000000,'b0000000-0000-0000-0000-000000000003'),
  ('e0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000001','d0000000-0000-0000-0000-000000000003','c0000000-0000-0000-0000-000000000003','Student Onboarding Portal — Gurukul EdTech','support', current_date - 10, 10000000,'b0000000-0000-0000-0000-000000000002'),
  ('e0000000-0000-0000-0000-000000000004','a0000000-0000-0000-0000-000000000001',null,'c0000000-0000-0000-0000-000000000005','Internal: Ayurveda Supply Chain Pilot','review', current_date + 5, 5000000,'b0000000-0000-0000-0000-000000000001'),
  ('e0000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000001','d0000000-0000-0000-0000-000000000009','c0000000-0000-0000-0000-000000000006','Tata Motors WhatsApp Test Drive Booking','in_progress', current_date + 25, 20000000,'b0000000-0000-0000-0000-000000000001')
on conflict (id) do nothing;

-- ── Project tasks ───────────────────────────────────────────────────────────
insert into project_tasks (org_id, project_id, title, status, assignee, due_date, done) values
  ('a0000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000001','Design chai menu conversation flow','done','b0000000-0000-0000-0000-000000000002', current_date - 5, true),
  ('a0000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000001','Build WhatsApp webhook + Razorpay payment link','in_progress','b0000000-0000-0000-0000-000000000002', current_date + 3, false),
  ('a0000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000001','UAT with Blue Tokai staff','todo','b0000000-0000-0000-0000-000000000003', current_date + 9, false),
  ('a0000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000002','Kickoff + requirements','todo','b0000000-0000-0000-0000-000000000003', current_date + 7, false),
  ('a0000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000003','Monthly support check-in','todo','b0000000-0000-0000-0000-000000000002', current_date + 2, false),
  ('a0000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000005','Integrate Tata Motors dealership CRM API','in_progress','b0000000-0000-0000-0000-000000000001', current_date + 10, false)
on conflict do nothing;

-- ── Milestones / checklist ──────────────────────────────────────────────────
insert into milestones (org_id, project_id, title, done, due_date) values
  ('a0000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000001','Phase 1: Flow approved', true,  current_date - 6),
  ('a0000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000001','Phase 2: Razorpay live in staging', false, current_date + 4),
  ('a0000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000001','Phase 3: Production handover', false, current_date + 12),
  ('a0000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000002','Signed SOW', false, current_date + 6)
on conflict do nothing;

-- ── Finance: invoices (varied statuses) ─────────────────────────────────────
insert into invoices (id, org_id, client_id, project_id, number, status, issue_date, due_date, amount_paise, is_recurring, recurring_interval, notes) values
  ('f0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000001','INV-2026-001','paid',          current_date - 25, current_date - 10,  9000000, false, null,     'Deposit 50% — WhatsApp bot project'),
  ('f0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000002','e0000000-0000-0000-0000-000000000002','INV-2026-002','sent',          current_date - 8,  current_date + 7,  12500000, false, null,     'Deposit — CRM automation'),
  ('f0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000004',null,                                   'INV-2026-003','overdue',       current_date - 30, current_date - 8,   5500000, false, null,     'Discovery workshop — Godrej Properties Brokers'),
  ('f0000000-0000-0000-0000-000000000004','a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000003','e0000000-0000-0000-0000-000000000003','INV-2026-004','partially_paid',current_date - 15, current_date + 5,   8000000, false, null,     'Course onboarding — milestone 2'),
  ('f0000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000003',null,                                   'INV-2026-005','sent',          current_date - 3,  current_date + 27,  3500000, true,  'monthly','Gurukul EdTech — monthly support retainer'),
  ('f0000000-0000-0000-0000-000000000006','a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000002',null,                                   'INV-2026-006','draft',         current_date,      current_date + 30,  4000000, true,  'monthly','Haldiram''s — monthly automation retainer (draft)'),
  ('f0000000-0000-0000-0000-000000000007','a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000006','e0000000-0000-0000-0000-000000000005','INV-2026-007','paid',          current_date - 1,  current_date + 14, 10000000, false, null,     'Tata Motors - Initial 50% Milestone')
on conflict (id) do nothing;

-- ── Finance: payments ───────────────────────────────────────────────────────
insert into payments (org_id, invoice_id, amount_paise, paid_at, method, notes) values
  ('a0000000-0000-0000-0000-000000000001','f0000000-0000-0000-0000-000000000001', 9000000, date_trunc('month', now()) + interval '9 hours',  'transfer','Paid in full'),
  ('a0000000-0000-0000-0000-000000000001','f0000000-0000-0000-0000-000000000004', 4000000, now(),  'upi','Partial — 50% via UPI'),
  ('a0000000-0000-0000-0000-000000000001','f0000000-0000-0000-0000-000000000007', 10000000, now() - interval '2 hours',  'transfer','Paid NEFT')
on conflict do nothing;

-- ── Finance: costs (this month + history) ───────────────────────────────────
insert into costs (org_id, project_id, category, amount_paise, incurred_on, vendor, notes) values
  ('a0000000-0000-0000-0000-000000000001',null,                                   'salary',     12000000, date_trunc('month', current_date)::date,        'Payroll','Junior dev salaries (2)'),
  ('a0000000-0000-0000-0000-000000000001',null,                                   'software',    1500000, current_date,                                   'OpenAI / Anthropic','LLM API usage'),
  ('a0000000-0000-0000-0000-000000000001',null,                                   'infra',        800000, current_date,                                   'Supabase / AWS India','Hosting'),
  ('a0000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000001','contractor',  2500000, date_trunc('month', current_date)::date,        'Freelance designer','Bot UI/UX'),
  ('a0000000-0000-0000-0000-000000000001',null,                                   'marketing',   2000000, current_date,                                   'Meta Ads','Lead-gen campaign'),
  ('a0000000-0000-0000-0000-000000000001',null,                                   'salary',     12000000, (date_trunc('month', current_date) - interval '10 days')::date, 'Payroll','Junior dev salaries (last month)')
on conflict do nothing;

-- ── Templates: categories + automation templates ───────────────────────────
insert into template_categories (id, org_id, name, slug) values
  ('11110000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000001','Sales & Support','sales-support'),
  ('11110000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000001','CRM & Follow-up','crm-followup'),
  ('11110000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000001','Education & Community','education')
on conflict (id) do nothing;

insert into automation_templates (org_id, category_id, name, description, internal_value_paise, price_paise, reusable_notes, implementation_checklist, tags) values
  ('a0000000-0000-0000-0000-000000000001','11110000-0000-0000-0000-000000000001','WhatsApp Sales-Support Bot','WhatsApp bot that answers FAQs, captures leads, and routes to a human.', 18000000, 25000000, 'Reusable n8n + WhatsApp Messaging API flow. Swap the FAQ knowledge base per client.', '["Connect WhatsApp channel","Import n8n flow","Load FAQ knowledge base","Set human-handoff keyword","Test on staging"]'::jsonb, array['whatsapp','bot','sales','n8n']),
  ('a0000000-0000-0000-0000-000000000001','11110000-0000-0000-0000-000000000002','n8n CRM Follow-up','Auto-creates follow-up tasks and reminders when a deal stage changes.', 12000000, 18000000, 'Webhook from CRM -> n8n -> WhatsApp/email reminder. Map stages to cadences.', '["Expose deal webhook","Build n8n schedule","Configure reminder channel","Map stage -> cadence"]'::jsonb, array['crm','n8n','follow-up']),
  ('a0000000-0000-0000-0000-000000000001','11110000-0000-0000-0000-000000000002','Invoice Overdue Reminder','Watches invoice due dates and nudges clients before/after due.', 9000000, 15000000, 'Cron + invoices table -> templated reminders at -3/0/+3/+7 days.', '["Connect invoice source","Set reminder schedule","Write message templates","Add escalation to owner"]'::jsonb, array['finance','invoice','reminder']),
  ('a0000000-0000-0000-0000-000000000001','11110000-0000-0000-0000-000000000001','Meeting Summary Workflow','Transcribes a call and posts an AI summary + action items to WhatsApp.', 8000000, 12000000, 'Whisper -> LLM summary -> WhatsApp/Notion. Great upsell after a bot project.', '["Capture recording","Transcribe","Summarize + extract actions","Post to channel"]'::jsonb, array['ai','meeting','summary']),
  ('a0000000-0000-0000-0000-000000000001','11110000-0000-0000-0000-000000000003','Course & Community Onboarding','Onboards new students: welcome, drip content, and community invite.', 15000000, 20000000, 'Payment webhook -> enrol -> drip sequence -> community auto-invite.', '["Hook payment provider","Build welcome sequence","Schedule drip content","Auto-invite to community"]'::jsonb, array['education','onboarding','community'])
on conflict do nothing;

-- ── V3: Quotations + line items ─────────────────────────────────────────────
insert into quotes (id, org_id, client_id, project_id, number, status, issue_date, valid_until, subtotal_paise, discount_paise, total_paise, notes, owner) values
  ('90000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000002','e0000000-0000-0000-0000-000000000002','QUO-2026-001','sent',    current_date - 4, current_date + 26, 17000000, 1000000, 16000000, 'CRM automation proposal — build + training', 'b0000000-0000-0000-0000-000000000001'),
  ('90000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000001','QUO-2026-002','accepted',current_date - 9, current_date + 14,  8000000,       0,  8000000, 'WhatsApp bot — phase 2 scope', 'b0000000-0000-0000-0000-000000000002')
on conflict (id) do nothing;

insert into quote_items (org_id, quote_id, description, quantity, unit_price_paise, amount_paise, position) values
  ('a0000000-0000-0000-0000-000000000001','90000000-0000-0000-0000-000000000001','CRM automation build (n8n + CRM)', 1, 15000000, 15000000, 0),
  ('a0000000-0000-0000-0000-000000000001','90000000-0000-0000-0000-000000000001','Team training session',            2,  1000000,  2000000, 1),
  ('a0000000-0000-0000-0000-000000000001','90000000-0000-0000-0000-000000000002','WhatsApp bot — phase 2 build',         1,  8000000,  8000000, 0)
on conflict do nothing;

-- ── V3: Invoice line items (sum to the invoice amount) ──────────────────────
insert into invoice_items (org_id, invoice_id, description, quantity, unit_price_paise, amount_paise, position) values
  ('a0000000-0000-0000-0000-000000000001','f0000000-0000-0000-0000-000000000001','Discovery & conversation-flow design', 1, 4000000, 4000000, 0),
  ('a0000000-0000-0000-0000-000000000001','f0000000-0000-0000-0000-000000000001','WhatsApp bot build (50% deposit)',         1, 5000000, 5000000, 1),
  ('a0000000-0000-0000-0000-000000000001','f0000000-0000-0000-0000-000000000002','CRM automation — deposit',             1, 12500000, 12500000, 0)
on conflict do nothing;

-- ── V3: Timesheets ──────────────────────────────────────────────────────────
insert into time_entries (org_id, project_id, task_id, user_id, work_date, minutes, billable, rate_paise, notes) values
  ('a0000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000001',null,'b0000000-0000-0000-0000-000000000002', current_date - 5, 240, true, 100000, 'Conversation flow design'),
  ('a0000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000001',null,'b0000000-0000-0000-0000-000000000002', current_date - 3, 180, true, 100000, 'n8n webhook wiring'),
  ('a0000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000001',null,'b0000000-0000-0000-0000-000000000003', current_date - 1, 300, true,  80000, 'WhatsApp integration + tests'),
  ('a0000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000003',null,'b0000000-0000-0000-0000-000000000002', current_date - 2, 120, false,   null, 'Monthly support check-in (non-billable)')
on conflict do nothing;

-- ── V3: Subscriptions (recurring billing → feeds MRR) ───────────────────────
insert into subscriptions (id, org_id, client_id, project_id, name, amount_paise, interval, status, start_date, next_run_date, last_generated_on, auto_generate, notes) values
  ('80000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000003','e0000000-0000-0000-0000-000000000003','Gurukul EdTech — monthly support', 3500000, 'monthly','active', date_trunc('month', current_date)::date, current_date + 27, date_trunc('month', current_date)::date, true, 'Monthly support retainer'),
  ('80000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000002',null,                                   'Haldiram''s — automation retainer', 4000000, 'monthly','active', current_date, current_date + 30, null, true, 'Monthly automation retainer')
on conflict (id) do nothing;
