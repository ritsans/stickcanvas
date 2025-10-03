# Repository Guidelines

[IMPORTANT]

- Read the files in English, and always respond to conversations in 日本語 (Japanese)

## Project Structure & Module Organization

Source lives in `src`, with route handlers and pages in `src/app` (file-system routed Next.js 15). Shared UI and form logic belong in `src/components`; reusable helpers live in `src/lib`. Authentication callbacks are under `src/auth/callback`. Static assets sit in `public`, and configuration files (Next, Tailwind, ESLint, TypeScript) stay at the repo root for easy discovery.

## Build, Test, and Development Commands

Run `pnpm install` before you start. Use `pnpm dev` for the Turbopack dev server, `pnpm build` for production bundles, and `pnpm start` to serve the optimized build. Quality checks run via `pnpm lint` (ESLint + Next rules) and `pnpm format:check` (Prettier). Apply automatic fixes with `pnpm lint:fix` and `pnpm format`.
