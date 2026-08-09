# Database

PostgreSQL schema for Web App Intelligence (Step 1).

## Migrations

- Location: `database/migrations/`
- Naming: `NNN_description.sql` (zero-padded, ascending)
- Each file is plain SQL, applied once in order
- Applied versions are recorded in `schema_migrations`

## Local DB

See root `docker-compose.yml` and `.env.example`.

```bash
npm run db:up