# Docker development environment

This setup runs the Next.js development server and PostgreSQL together with
Docker Compose. Source files are mounted into the app container, so edits on the
host trigger Next.js hot reload without rebuilding the image.

## Prerequisites

- Docker Desktop is running.
- `.env.local` contains the application secrets you use locally, such as
  `AUTH_SECRET`, Google OAuth credentials, and `OPENAI_API_KEY`. The Compose
  configuration supplies its own container-only `DATABASE_URL`.

For Google sign-in, configure this local callback URL with the provider:

```text
http://localhost:3000/api/auth/callback/google
```

## Start development

```bash
npm run docker:dev
```

Open <http://localhost:3000>. PostgreSQL is also available to host database
tools at `localhost:5433` by default.

On startup, the app waits for PostgreSQL, generates the Prisma client, applies
existing migrations, and starts `next dev`.

## Useful commands

```bash
# Follow the application logs
docker compose logs -f app

# Open a shell in the application container
docker compose exec app sh

# Run the test suite in the container
docker compose exec app npm run test:run

# Stop the environment
npm run docker:down
```

To override the development database defaults, provide any of these variables
when invoking Compose:

```text
POSTGRES_USER
POSTGRES_PASSWORD
POSTGRES_DB
POSTGRES_PORT
```

For example:

```bash
POSTGRES_PORT=5434 npm run docker:dev
```

## Reset the development database

The PostgreSQL data is stored in the `postgres-data` Docker volume. To remove
all development database data and start fresh:

```bash
docker compose down --volumes
npm run docker:dev
```

This permanently deletes the database stored in the Docker volume.
