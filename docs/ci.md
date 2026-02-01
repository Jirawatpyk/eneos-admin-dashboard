# CI/CD Pipeline Guide

## Overview

The ENEOS Admin Dashboard CI/CD pipeline runs on **GitHub Actions** and enforces quality gates for a Next.js + React application.

**Pipeline architecture:**

```
quality (lint + type-check)
  ├─► test (Vitest, 4 shards)
  │     └─► burn-in (PR only - flaky detection)
  ├─► test-e2e (Playwright Chromium)
  └─► build (Next.js production build, after test + test-e2e)
```

**Configuration file:** `.github/workflows/ci.yml`

## Pipeline Stages

### 1. Quality Gate (`quality`)

**Timeout:** 5 minutes

- `npm run lint` - ESLint (Next.js + React rules)
- `npm run type-check` - TypeScript strict mode

### 2. Unit Tests (`test`) - 4 Shards

**Timeout:** 10 minutes per shard

Splits 3,354 Vitest tests across 4 parallel jobs (~1 min each vs. ~4.5 min sequential).

- `npx vitest run --shard=N/4` per shard
- Coverage report uploaded from shard 1 (14-day retention)
- `fail-fast: false` - all shards run to completion

### 3. E2E Tests (`test-e2e`)

**Timeout:** 15 minutes

Runs Playwright tests against a local Next.js dev server.

- Installs Chromium browser
- Starts `npm run dev:e2e` via Playwright `webServer` config
- 4 spec files: campaign-table, lead-date-filter, lead-mobile-filters, lead-trend-chart
- **Artifacts on failure:** Playwright HTML report + traces (14-day retention)

### 4. Burn-In (`burn-in`)

**Trigger:** Pull requests only
**Timeout:** 20 minutes

- **Changed test files:** 5 iterations on changed `.test.ts/.test.tsx` files
- **No test changes:** 2 iterations of full suite (reduced from backend's 3 due to longer runtime)

### 5. Production Build (`build`)

**Trigger:** Push to main/develop only
**Timeout:** 10 minutes

- `npm run build` - validates Next.js production compilation
- Runs after both unit and E2E tests pass

## Triggers

| Event | quality | test | test-e2e | burn-in | build |
|-------|---------|------|----------|---------|-------|
| Push to main | Yes | Yes | Yes | No | Yes |
| Push to develop | Yes | Yes | Yes | No | Yes |
| PR to main | Yes | Yes | Yes | Yes | No |
| Weekly cron (Sun 04:00 UTC) | Yes | Yes | Yes | No | No |

## Running Locally

### Full CI Mirror

```bash
bash scripts/ci-local.sh
```

### Burn-In Changed Tests

```bash
bash scripts/burn-in-changed.sh         # 5 iterations, compare to main
bash scripts/burn-in-changed.sh 10 develop  # 10 iterations, compare to develop
```

## Debugging Failed CI Runs

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Lint fails | ESLint violation | `npm run lint -- --fix` |
| Type-check fails | TypeScript error | `npm run type-check` locally |
| Test shard fails | Test regression | `npx vitest run --shard=N/4` locally |
| E2E fails | UI regression or flaky test | Download `playwright-report` artifact, run `npx playwright test --ui` locally |
| Build fails | Next.js compilation error | `npm run build` locally |
| Burn-in fails | Flaky test | Fix non-deterministic behavior |

## Secrets

See [ci-secrets-checklist.md](ci-secrets-checklist.md) for required configuration.
