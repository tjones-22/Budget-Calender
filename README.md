# Budget Calendar

Budget Calendar is a full-stack budgeting app built with Next.js, Auth.js, Prisma, and Postgres. The app helps users plan bills, savings transfers, purchases, and paydays on a calendar so they can see how upcoming activity affects their balance.

Live app: https://budget-calender-ashy.vercel.app

## Why this project matters

This project demonstrates practical full-stack development skills:

- Authentication with Google OAuth and credentials-based login
- Protected dashboard routes with server-side session checks
- User-scoped database reads and writes
- Postgres data modeling with Prisma relations and cascading deletes
- Server Actions for mutations instead of exposing unnecessary client-side API calls
- Calendar-based budgeting UI with bill type indicators
- Recurring bill support for daily, weekly, biweekly, and monthly schedules
- Balance and savings projections based on selected calendar dates
- AI-assisted bill type suggestions with a safe keyword fallback
- Automated tests with Vitest
- CI validation with GitHub Actions
- Production deployment through Vercel

## Features

### Authentication and onboarding

- Users can sign up or log in with Google OAuth.
- Users can also sign up with credentials.
- New users complete onboarding by entering starting balance and savings.
- Dashboard access is protected by authenticated session state.
- Idle logout behavior helps reduce stale authenticated sessions.

### Budget calendar

- Bills, paydays, purchases, and savings transfers are displayed by date.
- Each bill type has a distinct color indicator:
  - Payday: green
  - Bill: red
  - Purchase: purple
  - Savings: blue
- Calendar supports month navigation.
- Calendar UI is responsive for desktop and mobile.

### Bill management

- Users can add one-time bills.
- Users can add recurring bills.
- Users can delete one-time bills.
- Users can delete recurring bill rules.
- Bill actions are scoped to the authenticated user.

### Balance projection

- Users can click a day to simulate projected balance and savings.
- The app calculates how scheduled bills between today and the selected date affect the account.
- Applied bills are tracked so the same bill is not repeatedly applied to the bank balance.

### AI-assisted categorization

- The add-bill form suggests a bill type based on the bill name.
- Local keyword matching handles common terms like rent, wifi, payroll, savings, etc.
- An AI action can provide a smarter suggestion when configured with an OpenAI API key.
- The fallback behavior keeps the form usable even if AI is unavailable.

## Tech stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS
- Auth.js / NextAuth
- Prisma 7
- Postgres
- Neon Postgres on Vercel
- Vitest
- GitHub Actions
- Vercel

## Architecture notes

The app separates application logic into clear layers:

- `app/actions/` contains Server Actions for user, bill, bank, and analytics workflows.
- `app/lib/db/` contains database-specific Prisma operations.
- `app/lib/` contains shared utility logic for dates, formatting, bill types, and auth/session helpers.
- `app/components/` contains reusable UI components.
- `prisma/schema.prisma` defines the relational data model.

This separation keeps UI components focused on rendering and keeps database logic centralized.

## Data model

Main Prisma models:

- `User`
- `Account`
- `Session`
- `Bank`
- `Bills`
- `RecurringBill`
- `Notification`

Important database decisions:

- User-owned data is connected through `userId`.
- User deletion cascades related account, bill, bank, notification, and recurring bill data.
- Bills and notifications are indexed by user/date-related fields.
- `Bank` has a unique `userId`, so each user has one bank profile.

## Testing

The project uses Vitest for unit tests around:

- date utilities
- bill type helpers
- formatting helpers
- session helpers
- database helper functions with mocked Prisma calls
- server action behavior

Run tests:

```bash
npm run test:run
```

Other validation commands:

```bash
npm run typecheck
npm run lint
npm run build
```

## CI/CD

GitHub Actions runs CI on pushes and pull requests to `main`.

The CI workflow runs:

- dependency installation
- Prisma client generation
- TypeScript typechecking
- ESLint
- Vitest tests
- production build

Vercel handles CD by automatically deploying new pushes to the connected GitHub repository.

## Local development

Install dependencies:

```bash
npm install
```

Create environment files:

```bash
.env
.env.local
```

Required environment variables:

```env
DATABASE_URL=
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_TRUST_HOST=true
```

Optional:

```env
OPENAI_API_KEY=
```

Generate Prisma client:

```bash
npx prisma generate
```

Run migrations:

```bash
npx prisma migrate dev
```

Start the dev server:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

## Deployment notes

The production app is deployed on Vercel with Postgres through Neon.

Google OAuth requires these redirect URIs:

```txt
http://localhost:3000/api/auth/callback/google
https://your-vercel-domain.vercel.app/api/auth/callback/google
```

The deployed app also needs the matching JavaScript origins:

```txt
http://localhost:3000
https://your-vercel-domain.vercel.app
```

## Future improvements

- Add end-to-end tests with Playwright
- Add dashboard charts for monthly spending trends
- Add edit support for bills and recurring bill rules
- Add email reminders for upcoming bills
- Add stricter form validation with a schema validation library

