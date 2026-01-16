# Changelog

All notable changes to ENEOS Admin Dashboard will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Role-based Access Control (Single Source of Truth)**
  - New `/api/admin/me` endpoint in Backend returns user role from Google Sheets
  - Frontend fetches role from Backend API during login (not from env vars)
  - Added `manager` role support (3 roles: admin, manager, viewer)
  - 6 new unit tests for `/api/admin/me` proxy route
  - Test for manager role in `session-role.test.ts`

- **Sales Performance API Improvements**
  - Query params forwarding (period, sortBy, etc.) to Backend API
  - Response transformation from Backend format to Frontend format

### Changed
- `src/lib/auth.ts` - Role now fetched from Backend API with 5s timeout
- `src/config/roles.ts` - Added MANAGER role, updated documentation
- `src/app/api/admin/sales-performance/route.ts` - Transform response + forward query params
- Conditional logging (only in development mode)

### Deprecated
- `getUserRole()` function in `src/config/roles.ts` - Use Backend API instead
- `getAdminEmails()` function - No longer primary source for role resolution

### Fixed
- Role displayed as "viewer" even when user is admin in Google Sheets
- Missing query params in sales-performance API calls
- Potential hang on login if Backend is slow (added 5s timeout)

## [0.1.0] - 2026-01-13

### Added
- Initial release with Epic 1 (Authentication) and Epic 2 (Dashboard Overview)
- Google OAuth login with domain restriction
- Dashboard with KPI cards, charts, and tables
- Role-based UI components
