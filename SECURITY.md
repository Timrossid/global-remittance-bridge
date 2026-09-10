# Security Policy

## Supported Versions

We actively support the current major version of the Global Micro-Remittance Bridge.

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.x.x | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability, please **do not open a public issue**. Instead, please report it privately via one of the following methods:

- **Email:** security@global-remittance-bridge.example.com
- **GitHub Private Vulnerability Reporting:** Use the "Private vulnerability reporting" feature on GitHub.

Please include as much detail as possible:
- Description of the vulnerability.
- Steps to reproduce.
- Potential impact.
- Affected versions and components.

We will investigate the report and provide a timeline for a fix. We will also coordinate with you to ensure the fix is tested before being made public.

## Security Considerations for Contributors

- **Never commit secrets.** API keys, private keys, database credentials, and JWT secrets must remain in environment variables or a secrets manager.
- **Soroban contracts are pre-audit.** All contract changes must undergo an independent security review before mainnet deployment.
- **Input validation.** All DTOs must use class-validator decorators. Never trust client input.
- **Rate limiting.** All API endpoints must be protected by the RateLimitMiddleware.
- **CORS.** Set CORS_ORIGIN to explicit origins in production. Never leave it as `*`.
- **Dependencies.** Run `npm audit` and `cargo audit` before merging. Update dependencies weekly via Dependabot.
- **Audit logging.** All admin actions, state transitions, and sensitive operations must be logged via AuditLogService.

## Pre-Mainnet Checklist

Before promoting to mainnet, verify all items in `docs/SECURITY_REVIEW_SCOPE.md` are complete, including:
- Independent security audit of all Soroban contracts
- Penetration testing of the payment-api
- SOC 2 Type II compliance review
- Incident response plan documented and tested
