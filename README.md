# Finance Analytics

A full-stack personal finance tracker built with React, TypeScript, Django REST Framework and PostgreSQL.

Users can record income and expenses, organise transactions into categories, and view their spending through an interactive dashboard. The application also includes monthly reports with spending breakdowns and comparisons against previous months.

I built this project to get hands-on experience with full-stack development, particularly REST APIs, database design, authentication and connecting a React frontend to a Django backend.

## Features

- User registration and login using JWT authentication
- Create, view, update and delete financial transactions
- Search, filter, sort and paginate transactions
- Default categories and custom user-created categories
- Dashboard showing income, expenses, balance and spending trends
- Monthly reports with category breakdowns and month-to-month comparisons
- Responsive layout for desktop and mobile
- Docker Compose setup for running the frontend, backend and database together

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Backend | Python, Django, Django REST Framework |
| Authentication | JWT, SimpleJWT |
| Database | PostgreSQL |
| Containerisation | Docker, Docker Compose |

## Architecture

The application has three main parts:

- **Frontend:** React and TypeScript handle the user interface and communicate with the backend through API requests.
- **Backend:** Django REST Framework handles authentication, transaction management, validation and financial calculations.
- **Database:** PostgreSQL stores user accounts, categories and transactions.

Financial summaries and reports are calculated by the backend using Django ORM aggregation queries.

## Database Design

The main models are:

- **User:** Stores account details and authentication information.
- **Category:** Stores shared default categories and categories created by individual users.
- **Transaction:** Stores income and expense records, including amount, date, merchant, category and notes.

A few implementation details:

- Used `DECIMAL` for transaction amounts to avoid floating-point rounding issues with currency.
- Used UUIDs for transaction IDs.
- Scoped transaction queries to the authenticated user.
- Added database indexes for commonly used transaction filters, including user, date and category.

## Running Locally

### Docker

```bash
cp .env.example .env
docker compose up --build
```

The application runs the frontend, Django backend and PostgreSQL database through Docker Compose.

### Backend only

```bash
cd backend
python -m venv venv
pip install -r requirements/dev.txt
python manage.py migrate
python manage.py runserver
```

### Frontend only

```bash
cd frontend
npm install
npm run dev
```

## Testing

**Backend:** From `backend/`, run `pytest`.

**Frontend:** From `frontend/`, run `npm test`, `npm run lint`, and `npm run build`.

These checks still need to be verified in a clean environment.

## Current Status

The main features are implemented. I still want to improve deployment and the user experience.

Some potential improvements I'd like to work on next:

- CSV transaction import and export
- Budget tracking
- Recurring transactions
- Spending notifications
- GitHub Actions for automated testing

## Screenshots

I haven't added screenshots yet.
