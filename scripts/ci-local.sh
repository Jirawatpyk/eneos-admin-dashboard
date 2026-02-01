#!/bin/bash
# ===========================================
# Local CI Mirror - ENEOS Admin Dashboard
# Mirrors the GitHub Actions pipeline locally
# Usage: bash scripts/ci-local.sh
# ===========================================

set -e

echo "============================================"
echo "  ENEOS Admin Dashboard - Local CI Runner"
echo "============================================"
echo ""

# Stage 1: Quality Gate
echo "--- Stage 1/4: Quality Gate ---"
echo "Running linter..."
npm run lint || { echo "LINT FAILED"; exit 1; }
echo "Linter passed"
echo ""

echo "Running type check..."
npm run type-check || { echo "TYPECHECK FAILED"; exit 1; }
echo "Type check passed"
echo ""

# Stage 2: Unit Tests
echo "--- Stage 2/4: Unit Tests ---"
echo "Running all Vitest tests..."
npx vitest run || { echo "TESTS FAILED"; exit 1; }
echo "Tests passed"
echo ""

# Stage 3: E2E Tests
echo "--- Stage 3/4: E2E Tests (Playwright) ---"
echo "Running Playwright tests..."
npx playwright test || { echo "E2E TESTS FAILED"; exit 1; }
echo "E2E tests passed"
echo ""

# Stage 4: Build
echo "--- Stage 4/4: Production Build ---"
echo "Building Next.js..."
npm run build || { echo "BUILD FAILED"; exit 1; }
echo "Build passed"
echo ""

echo "============================================"
echo "  LOCAL CI PIPELINE PASSED"
echo "============================================"
echo ""
echo "All stages completed successfully."
echo "Safe to push to remote."
