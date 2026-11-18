# Zinthiya Trust - Backend API

Production NestJS API backend for **The Zinthiya Ganeshpanchan Trust** (Charity #1137350), providing mission-critical services for donors, beneficiaries, advocates, and administrators.

## Features

- **Authentication & RBAC**: JWT-based session security supporting `ADMIN`, `STAFF`, `BENEFICIARY`, and `DONOR` roles.
- **Beneficiary & Casework Management**: Application tracking, document management, crisis triage, emergency relief records, and advocate allocation.
- **Fund Allocation & Distribution Ledger**: Admin-configured funding categories with independent targets, grant commitments, voucher redemptions, and disbursement ledgers.
- **Campaign & Giving Engine**: Internal and external appeals, one-off and recurring donations, Gift Aid declarations, and automatic receipt generation.
- **Staff & Admin Audit Trail**: Immutable logging of administrative actions, role assignments, and permission matrices.
- **Interactive API Documentation**: OpenAPI / Swagger documentation out-of-the-box.

## Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) v10 (TypeScript)
- **Database ORM**: [Prisma ORM](https://www.prisma.io/) v6 with [PostgreSQL](https://www.postgresql.org/)
- **Authentication**: Passport.js & JWT (`@nestjs/jwt`)
- **Queue & Caching**: Redis with BullMQ (`@nestjs/bullmq`)
- **Logging**: Pino logger with HTTP middleware (`nestjs-pino`)
- **API Documentation**: Swagger UI Express (`@nestjs/swagger`)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- Redis (optional, for queued tasks)
- `pnpm` (or `npm`)

### Setup Instructions

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Configure environment variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Update `DATABASE_URL` with your PostgreSQL credentials:
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/zinthiya_db?schema=public&connection_limit=25&pool_timeout=30"
   PORT=5000
   JWT_SECRET=your_secure_jwt_secret_key
   ```

3. **Generate Prisma client and run migrations**:
   ```bash
   pnpm run prisma:generate
   pnpm run prisma:migrate
   ```

4. **Start the API server**:
   ```bash
   # Development mode with hot-reload
   pnpm run start:dev

   # Production build & run
   pnpm run build
   pnpm run start:prod
   ```

The API will be operational at:
- **Base API**: `http://localhost:5000/api`
- **Swagger Documentation**: `http://localhost:5000/api/docs`
- **Health Check**: `http://localhost:5000/api/health`
