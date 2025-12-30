# AGENT INSTRUCTIONS

## Project Overview
- **Name:** QuranLoad Mobile
- **Platform:** React Native application bootstrapped with Expo and configured for Android, iOS, and web previews.
- **UI System:** [Tamagui](https://tamagui.dev/) powers theming, layout primitives, and design tokens.
- **State & Data:** React Query handles remote caching; React Context and custom hooks manage app state. Convex powers the real-time database, file storage (via Cloudflare R2), and Expo push notifications handle background workflows.
- **Internationalisation:** `i18n-js` with locale bundles under `src/locales`.
- **Generated Clients:** OpenAPI schemas are pulled from `https://quranload-be-dev-app.azurewebsites.net/swagger/v1/swagger.json` and converted into typed clients under `src/__generated`.

## Repository Layout
- `App.tsx`: Expo entry point. Sets up providers, navigation container, and global styles.
- `src/api` & `src/services`: REST and Convex service abstractions.
- `src/navigation`: React Navigation stacks and tabs.
- `src/screens`: Feature screens organised by domain (onboarding, lessons, reminders, etc.).
- `src/components`: Shared presentational and form components. Tamagui design system wrappers live under `components/ui`.
- `src/contexts` & `src/hooks`: Cross-cutting logic for auth, settings, reminders, audio playback, and analytics.
- `src/constants` & `src/styles`: App-wide constants (colours, typography) and style helpers.
- `src/utils`: Formatting helpers (dates, currency, localisation) and API utilities.
- `convex/`: Convex functions for real-time collaboration, notifications, file storage (R2), and background jobs.

## Coding Conventions
- Use **TypeScript** for all logic files (`.ts` / `.tsx`). Prefer strongly typed props, hooks, and service responses.
- Follow Tamagui component conventions: use `Stack`, `YStack`, `XStack`, `Button`, etc. Prefer tokens (`$color`, `$space`) over raw values.
- Centralise user-facing strings in localisation files; never hard-code copy in components.
- Handle asynchronous operations with `async/await`. Wrap network and storage calls in domain services (avoid calling axios or Convex directly from UI).
- Maintain hook rules (`use` prefix, call hooks only at top level). Encapsulate complex logic in custom hooks under `src/hooks`.
- For navigation, define routes in `src/navigation/types.ts` and ensure screens register in the appropriate stack/tab navigator.
- Keep styling in Tamagui props or `styled()` helpers; avoid inline StyleSheet objects unless necessary for native modules.

## Quality Gates
Run and fix the following before committing changes:
1. `npm run lint`
2. `npm run check-types`
3. `npm run prettier-check`
4. Execute relevant unit or integration tests (none are configured yet, but add them when introducing testable logic).

CI uses Husky + lint-staged to enforce linting and formatting—ensure staged files pass locally.

## API & Schema Generation
- To refresh API clients from the backend Swagger document, run `npm run gen:api`.
- Convex types are auto-generated when running `npx convex dev`.

## Environment & Secrets
- Environment variables are managed via Expo Config Plugins; sensitive values should be stored in EAS or `.env` files ignored by git.
- `google-services.json` and other platform credentials are committed for development builds only. Do not expose production secrets.

## Git & Workflow Expectations
- Work directly on the default branch; do not create additional branches in this environment.
- Make focused commits with descriptive messages summarising the change.
- Ensure the working tree is clean before handing off. Use `npm install` to sync dependencies when package manifests change.
- Document notable architectural or dependency changes in `README.md` if they affect onboarding.

Following these guidelines keeps the project consistent and production-ready for the QuranLoad mobile experience.
