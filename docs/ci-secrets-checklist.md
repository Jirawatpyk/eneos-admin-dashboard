# CI Secrets Checklist

## Required Secrets

Configure in **GitHub → Repository Settings → Secrets and variables → Actions**.

### Currently Required

**None** - The pipeline currently uses dummy values for CI. No real secrets needed yet.

### Test Environment (hardcoded in CI - NOT secrets)

| Variable | Value | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_E2E_TEST_MODE` | `true` | Enable E2E bypass mode |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:3000` | Backend API URL for E2E |
| `NEXTAUTH_URL` | `http://localhost:3001` | NextAuth base URL |
| `NEXTAUTH_SECRET` | `ci-test-secret` | NextAuth session encryption (test only) |

### Future Secrets (when deployment is added)

| Secret | Required By | Description |
|--------|------------|-------------|
| `VERCEL_TOKEN` | Vercel deployment | Vercel API token |
| `VERCEL_ORG_ID` | Vercel deployment | Vercel organization ID |
| `VERCEL_PROJECT_ID` | Vercel deployment | Vercel project ID |
| `NEXTAUTH_SECRET` | Production | Session encryption key |
| `GOOGLE_CLIENT_ID` | Production | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Production | Google OAuth client secret |

## Security Best Practices

1. **Never commit `.env` or `.env.e2e`** - use GitHub Secrets for production values
2. **Separate test vs. production secrets** - CI uses dummy values, production uses real ones
3. **Rotate secrets regularly** - especially OAuth credentials
4. **Audit access** - review who has access to repository secrets
