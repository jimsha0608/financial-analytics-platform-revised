# Code review notes

This pass focused on reducing unnecessary explanatory comments and making the README more straightforward. It did **not** intentionally weaken authentication, permissions, validation, or money calculations.

## Areas to understand before an interview

- `backend/apps/transactions/views.py`: how each query is limited to the signed-in user.
- `backend/apps/analytics/services.py`: how income, expenses and category totals are aggregated.
- `frontend/src/api/client.ts`: how expired access tokens are refreshed, including concurrent requests.
- `frontend/src/pages/DashboardPage.tsx`: how date ranges trigger analytics requests.
- `backend/apps/categories/models.py`: default versus user-owned categories.

## Follow-up work

- Run backend and frontend tests in your own environment and fix any failures.
- Add real screenshots after starting the app.
- Consider switching refresh tokens from localStorage to a secure cookie for a production deployment; XSS can expose localStorage tokens.
- Add a CI workflow when tests and builds pass reliably.

This is an editorial cleanup, not proof of human authorship. Be transparent about AI assistance if asked.
