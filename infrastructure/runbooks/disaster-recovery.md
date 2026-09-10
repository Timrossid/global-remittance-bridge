# Disaster Recovery Runbook

## Recovery Time Objective (RTO)
- Critical services: 1 hour
- Non-critical services: 4 hours

## Recovery Point Objective (RPO)
- Database: 15 minutes
- File storage: 1 hour

## Recovery Procedures

### Database Recovery
1. Restore from latest backup: `pg_restore -U remittance -d payment_api backup.dump`
2. Verify data integrity: `SELECT COUNT(*) FROM Transaction;`
3. Restart application services

### Full System Recovery
1. Provision infrastructure using Terraform: `terraform apply`
2. Deploy applications using Helm: `helm install remittance-bridge ./helm`
3. Verify health endpoints: `curl http://payment-api/health`
4. Notify stakeholders

### Rollback Procedure
1. Identify last known good deployment
2. Rollback using Helm: `helm rollback remittance-bridge`
3. Verify health endpoints
4. Notify stakeholders
