# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive security hardening for Soroban smart contracts
- Batch operations for escrow and settlement contracts
- API key authentication guard for programmatic access
- Audit logging service for transaction status changes
- Soft delete service for user accounts
- Webhook queue service for reliable delivery
- Password reset and email verification services
- Two-factor authentication (2FA) support
- Role-based access control (RBAC) guards
- Transaction search and filter service
- Exchange rate service
- Pagination service for all list endpoints
- Security headers middleware
- Request logging middleware
- Idempotency middleware
- Swagger/OpenAPI documentation
- Health check endpoints with database monitoring
- Frontend theme toggle (dark/light mode)
- Toast notification system
- Internationalization support
- PWA manifest and service worker
- Optimized image component
- Bundle analyzer configuration
- Skip-to-content accessibility link
- Structured data for SEO

### Changed
- Improved rate limiter with user-specific limits
- Enhanced error handling with detailed audit logs
- Updated Docker Compose with health checks
- Improved CI/CD pipeline with security scanning

### Fixed
- Fixed reentrancy vulnerabilities in smart contracts
- Fixed missing input validation in controllers
- Fixed rate limiter memory leaks

## [1.0.0] - 2026-09-10

### Added
- Initial release of Global Remittance Bridge
- Soroban escrow and settlement smart contracts
- NestJS payment API with JWT authentication
- Next.js merchant dashboard
- Transaction indexing service
- Anchor adapter framework
- Notification service
- SDK for programmatic access
