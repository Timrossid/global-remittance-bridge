# 🏗️ Infrastructure

DevOps, Deployment, and Cloud Orchestration for the Bridge.

## 🚀 Deployment Architecture
- **Frontend:** Vercel (Next.js)
- **Backend API:** Dockerized NestJS on VPS/Kubernetes
- **Database:** PostgreSQL (Managed)
- **Cache:** Redis (Managed)

## 🛠️ Components
- **Docker Compose:** `docker-compose.prod.yml` for one-click deployment of the backend stack.
- **GitHub Actions:** Automated CI/CD pipelines for building and pushing images to GHCR.
- **Terraform:** (Planned) Infrastructure as Code for cloud provisioning.

## 🚦 Deployment Guide
Refer to the detailed steps in the `README.md` to set up the production environment.
