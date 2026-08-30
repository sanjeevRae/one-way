# One Way Nepal — CMS & Website

Next.js app with an **admin panel** to edit blogs, privacy policy, terms &
conditions, and careers. Content persists to **either** a local JSON file
(no setup needed) **or** a MySQL database (for Spaceship hosting).

## Quick start (local, no database)

```bash
npm install
npm run dev
```

The site uses `src/data/content.json` automatically when no database env vars
are set — nothing else to configure.

- Website: http://localhost:3000
- Admin: http://localhost:3000/admin
- API: http://localhost:3000/api/content (GET / PUT)

## What the admin can edit

| Tab | Content |
|---|---|
| Blogs | add / edit / delete posts (title, slug, date, excerpt, image, markdown body) |
| Privacy Policy | page title + markdown body (headings build the on-page TOC) |
| Terms & Conditions | page title + markdown body (headings build the on-page TOC) |
| Careers | add / edit / delete jobs (title, location, type, markdown description) |

### Supported markdown in all text areas

```
## Section heading          →  builds the table of contents
### Sub heading
- bullet item              →  <ul>
1. numbered item           →  <ol>
[link text](https://url)   →  hyperlink
![alt text](/img.png)      →  image
**bold**, *italic*         →  inline styling
`inline code`
> a quoted paragraph       →  <blockquote>
---                        →  horizontal rule
https://example.com        →  auto-linked
```

## Deployment on Spaceship (Node.js + MySQL)

### 1. Create the MySQL database & tables

In the Spaceship panel, create a MySQL database (e.g. `oneway_nepal`). Then run
the schema file from this repository as your database user:

```bash
mysql -u <USERNAME> -p -h <HOST> <DATABASE_NAME> < src/data/schema.sql
```

The file creates `blogs`, `careers`, `legal_pages` and `site_settings`, and
seeds the two legal pages. It is idempotent — safe to re-run.

### 2. Set environment variables on Spaceship

Add these env vars to your Node.js app in the Spaceship dashboard
(see `.env.example`):

```bash
DATABASE_HOST=your-db-host
DATABASE_PORT=3306
DATABASE_USER=your-db-user
DATABASE_PASSWORD=your-db-password
DATABASE_NAME=oneway_nepal
```

Or a single connection string:

```bash
DATABASE_URL=mysql://USER:PASS@HOST:3306/oneway_nepal
```

### 3. Build & run

```bash
npm run build
npm run start
```

When env vars are set, the site reads/writes MySQL. Without them it falls back
to the JSON file — so the same code works on local and server.

## Project structure

```
src/
├── app/
│   ├── admin/page.tsx          # admin panel (client component)
│   ├── api/content/route.ts    # GET/PUT API
│   ├── blogs/                  # blog list + detail
│   ├── privacy-policy/         # legal page with sidebar TOC
│   ├── terms-and-conditions/   # legal page with sidebar TOC
│   └── careers/                # job listings
├── components/
│   ├── ContentShell.tsx        # shared subpage layout
│   ├── ContentRenderer.tsx     # markdown → HTML + TOC
│   └── SmoothToc.tsx           # client scroll-spy sidebar TOC
├── data/
│   ├── content.json            # JSON fallback store (local)
│   └── schema.sql              # MySQL schema + seed (Spaceship)
└── lib/
    ├── content.ts              # types + JSON read/write
    ├── db.ts                   # MySQL ⇄ JSON abstraction
    └── format.ts               # date helpers
```

## Security note

`/admin` currently has **no authentication**. Add a password gate before
exposing publicly. The `/api/content` PUT endpoint should be protected too.

## Scripts

```bash
npm run dev      # development
npm run build    # production build
npm run start    # run production build
npm run lint     # eslint
```
