# Incident Response Runbook

## Severity Levels
- P0: Complete outage - all hands on deck
- P1: Major degradation - core functionality affected
- P2: Minor degradation - non-critical functionality affected
- P3: Low impact - cosmetic or minor issues

## Response Procedure

### 1. Detect
- Monitor alerts from Prometheus/Grafana
- Check application logs in ELK stack
- Review error rates in Sentry

### 2. Assess
- Determine severity level
- Identify affected components
- Estimate time to resolution

### 3. Communicate
- Notify stakeholders via Slack #incidents
- Update status page if applicable
- Assign incident commander

### 4. Resolve
- Implement fix or workaround
- Verify fix in staging
- Deploy to production
- Monitor for 30 minutes post-fix

### 5. Post-Mortem
- Document timeline
- Identify root cause
- Create action items
- Schedule follow-up meeting
