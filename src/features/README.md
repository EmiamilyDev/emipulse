# Features

Feature-first modules should live here.

Suggested structure per feature:

- `components/` reusable UI for the feature
- `server/` server-side actions and data orchestration
- `client/` client-side interactive behavior
- `types/` feature-local types
- `validation/` zod schemas and guards

Keep business logic inside feature modules and keep `src/app` focused on routing and composition.
