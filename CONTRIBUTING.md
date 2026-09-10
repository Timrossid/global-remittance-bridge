# Contributing to Global Remittance Bridge

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

## Development Setup

### Prerequisites
- Node.js >= 18
- PostgreSQL >= 14
- Redis >= 7
- Rust >= 1.70
- Docker & Docker Compose

### Quick Start
1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example` files)
4. Run database migrations: `cd payment-api && npx prisma migrate dev`
5. Start development servers: `npm run dev`

## How to Contribute

### Reporting Bugs
- Use the GitHub issue tracker
- Include steps to reproduce
- Include expected vs actual behavior
- Include environment details

### Suggesting Features
- Open a GitHub issue with the `enhancement` label
- Describe the feature and use case
- Discuss with maintainers before starting work

### Pull Requests
1. Create a feature branch from `master`
2. Make your changes
3. Ensure all tests pass: `npm test`
4. Ensure linting passes: `npm run lint`
5. Ensure TypeScript compiles: `npm run typecheck`
6. Submit a pull request

## Code Standards
- Follow existing code style
- Write tests for new functionality
- Update documentation as needed
- Keep commits atomic and well-described
