# AGENTS.md

## Cursor Cloud specific instructions

### Current repository state (read this first)

This repository is **documentation-only / planning stage**. There is currently **no application code**:

- No `package.json`, no lockfile, no build system.
- `src/`, `components/`, `lib/`, and `public/` contain only `.gitkeep` placeholders.
- The only real content is Markdown docs under `docs/` and the top-level `README.md`.

Because of this, there is **nothing to install, lint, test, build, or run yet**. Do not fabricate a "hello world" run against an app that does not exist. If a task asks you to run the app, first confirm whether application code has actually been added.

### Planned stack (see `docs/04_TECH/Techstack.md`)

Next.js 15 + React 19 + TypeScript 5 + Tailwind CSS 4, deployed on Vercel. Planned QA tooling: ESLint, Prettier, Vitest/Jest, Playwright. None of this is scaffolded yet.

### Toolchain available in the VM

`node` 22.x, `npm` 10.x, `pnpm` 10.x, and `yarn` 1.x are preinstalled. The techstack doc does not pin a package manager; pick the one matching whatever lockfile gets committed (fall back to `pnpm` per common Next.js convention if none is specified).

### Once application code exists

The startup update script already guards on lockfiles, so it will auto-install dependencies once a `package.json` + lockfile land. After that, use the standard scripts defined in `package.json` (typically `dev` / `lint` / `test` / `build`); a Next.js dev server defaults to `localhost:3000`.
