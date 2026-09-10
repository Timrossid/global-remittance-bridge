# Data Retention Policy

## Retention Periods

| Data Type | Retention Period | Legal Basis |
|-----------|-----------------|-------------|
| Transaction records | 7 years | Financial regulations |
| User accounts | 7 years after deletion | AML/KYC requirements |
| Audit logs | 7 years | Security and compliance |
| API logs | 90 days | Operational needs |
| Error logs | 30 days | Debugging |
| Access logs | 90 days | Security monitoring |

## Deletion Procedures

### Automated Deletion
- Daily cron job runs to delete expired data
- Soft deletes used for 30-day grace period
- Hard deletion after grace period

### Manual Deletion
- User-initiated account deletion triggers soft delete
- Admin can trigger immediate deletion for compliance
- All deletions logged in audit trail

## Data Classification
- **Restricted**: Payment data, personal information
- **Confidential**: Internal operations data
- **Internal**: Non-sensitive operational data
- **Public**: Marketing and documentation

## Compliance
- GDPR Article 17: Right to erasure
- PCI DSS: Cardholder data retention
- Local financial regulations: Transaction records
