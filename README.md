Author: Tristan Jones


# Budget Calender

Budget Calender is a personal budgeting calendar that helps track bills, paydays, purchases, and transfers to savings. It shows daily events, running balances, and monthly summaries so you can plan around upcoming expenses.

## Features

- Calendar view with daily bills, paydays, purchases, and savings moves
- Recurring events (weekly, biweekly, monthly) with months-or-forever duration
- Bank Funds and Bank Savings balances based on selected day
- Monthly analytics and between-payday projections
- Local CSV storage for users and calendar data

## Tech Stack

- Frontend: Next.js (App Router), React, Tailwind CSS
- Backend: NestJS
- Storage: CSV files in `backend/backend/db`

## Prerequisites

- Node.js and npm

## Getting Started (Local Dev)

1) Install dependencies

```bash
cd backend/backend
npm install
```

```bash
cd frontend/frontend
npm install
```

2) Start the backend (port 3001)

```bash
cd backend/backend
npm run start:dev
```

3) Start the frontend (port 3000)

```bash
cd frontend/frontend
npm run dev
```

4) Open the app

Visit `http://localhost:3000`.

## Data Storage

CSV files live in `backend/backend/db`:

- `users.csv` stores user accounts and starting balances
- `calender.csv` stores daily events
- `recurring.csv` stores recurring rules (created automatically when you add one)

## Notes

- The backend must be running for the frontend to load calendar data.
- If you change the backend port, update the fetch URLs in the frontend.
