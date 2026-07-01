This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Supabase Setup

This project now uses Supabase for student records and document storage.

Create these environment variables in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=student-documents
```

Create a `students` table with columns that match the `StudentData` shape in `src/lib/supabase.ts`, and create a public storage bucket matching `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET` for uploaded files.

In Supabase, create the bucket with the exact name `student-documents` and mark it public, or change `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET` to match your own bucket name. If you do not want file uploads in Supabase yet, clear that env var and the app will stay in local fallback mode.

Add a server-only secret for the submission route:

```bash
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

The public form posts to `/api/students`, which uses this server key to upload files and insert rows without hitting RLS.

## Required RLS Policies

If you see `new row violates row-level security policy`, add these policies in Supabase SQL editor. The public form submits as `anon`, while the admin dashboard reads as `authenticated`.

```sql
alter table public.students enable row level security;

drop policy if exists "Allow public student inserts" on public.students;
create policy "Allow public student inserts"
on public.students
for insert
to anon, authenticated
with check (true);

drop policy if exists "Allow authenticated student reads" on public.students;
create policy "Allow authenticated student reads"
on public.students
for select
to authenticated
using (true);

alter table storage.objects enable row level security;

drop policy if exists "Allow public uploads to student-documents" on storage.objects;
create policy "Allow public uploads to student-documents"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'student-documents');

drop policy if exists "Allow read access to student-documents" on storage.objects;
create policy "Allow read access to student-documents"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'student-documents');

drop policy if exists "Allow authenticated deletes from student-documents" on storage.objects;
create policy "Allow authenticated deletes from student-documents"
on storage.objects
for delete
to authenticated
using (bucket_id = 'student-documents');
```

Example SQL:

```sql
create table if not exists public.students (
	id uuid primary key default gen_random_uuid(),
	student_name text not null,
	gender text not null,
	abc_id text not null,
	enrollment_no text not null,
	year_of_admission text not null,
	dob text not null,
	dob_proof_url text not null,
	dob_proof_name text,
	programme_name text not null,
	programme_code text not null,
	specialization text not null,
	career_type text not null,
	programme_duration text not null,
	current_year text not null,
	lateral_entry text not null,
	department text not null,
	school text not null,
	differently_abled text not null,
	disability_cert_url text,
	disability_cert_name text,
	social_category text not null,
	category_cert_url text,
	category_cert_name text,
	religion text not null,
	ews text not null,
	ews_cert_url text,
	ews_cert_name text,
	household_income numeric not null,
	state text not null,
	country text not null,
	scholarship_full_source text not null,
	scholarship_full_name text not null,
	scholarship_full_amount numeric not null,
	scholarship_partial_source text not null,
	scholarship_partial_name text not null,
	scholarship_partial_amount numeric not null,
	final_year_status text not null,
	father_qualification text not null,
	mother_qualification text not null,
	first_graduation text not null,
	submitted_at timestamptz not null default now()
);
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
