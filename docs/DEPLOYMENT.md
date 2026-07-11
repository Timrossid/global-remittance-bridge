# Deployment Guide

This guide outlines the processes for deploying the Global Micro-Remittance Bridge components in production environments.

## 🚀 Production Architecture

The recommended production setup utilizes a containerized approach managed by orchestration tools.

- **Frontend (Merchant Dashboard & Website):** Deployed on Vercel or similar edge-optimized hosting.
- **Backend (Payment API & Services):** Containerized using Docker and orchestrated via Kubernetes (EKS/GKE) or a high-availability VPS.
- **Databases:** Managed PostgreSQL and Redis instances for high availability and automated backups.
- **Blockchain Interaction:** Nodes/Horizon services connected to the Stellar network.

## 🛠️ Deployment Steps

### 1. Infrastructure Provisioning

Use the configuration in the `infrastructure/` directory to provision your cloud resources.

```bash
# Example for Terraform (once configured)
cd infrastructure/terraform
terraform init
terraform apply
```

### 2. Database Setup

Ensure your PostgreSQL and Redis instances are running and accessible by the backend services. Update your environment variables accordingly.

### 3. Deploying Backend Services

The backend services are containerized. Use Docker Compose for local testing or Kubernetes manifests for production.

#### Using Docker Compose (Development/Testing)

```bash
docker-compose -f payment-api/docker-compose.yml up -d
```

#### Using Kubernetes (Production)

Apply the manifests located in `infrastructure/kubernetes/`.

```bash
kubectl apply -f infrastructure/kubernetes/
```

### 4. Deploying Frontend

For the Merchant Dashboard and Website, use the automated CI/CD pipelines.

- **Merchant Dashboard:** Deployed via GitHub Actions to Vercel.
- **Website:** Deployed via GitHub Actions to Vercel.

## 📋 Post-Deployment Verification

After deployment, verify the following:
- [ ] All microservices are running and healthy.
- [ ] Connection to the Stellar network is established.
- [ ] Database migrations have been successfully applied.
- [ ] Environment variables are correctly configured.
- [ ] Monitoring and logging are functional.
