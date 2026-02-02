# TicketForge AI

**TicketForge AI** is a scalable, AI-powered ticketing and project management system built as a Monorepo.

## 🏗 Project Architecture

This project is a **Monorepo** managed by [TurboRepo](https://turbo.build/repo) and [pnpm](https://pnpm.io/). It is designed to scale into multiple services and frontends.

### Workspace Structure

| Path            | Type      | Status     | Description                                                       |
| :-------------- | :-------- | :--------- | :---------------------------------------------------------------- |
| **`apps/api`**  | Backend   | ✅ Active  | **Express.js** + **GraphQL** API. Connects to PostgreSQL & Redis. |
| `apps/web`      | Frontend  | 🚧 Planned | Next.js Dashboard / User Interface.                               |
| `apps/realtime` | Service   | 🚧 Planned | WebSocket server for live updates.                                |
| `apps/worker`   | Service   | 🚧 Planned | Background job worker (queues, cron).                             |
| `packages/*`    | Libraries | 🚧 Planned | Shared UI, AI models, and Configs.                                |
| `infra/*`       | Ops       | 🚧 Planned | Docker, Kubernetes, and Kafka configurations.                     |

---

## 🛠 Tech Stack

- **Runtime**: Node.js (v20+)
- **Package Manager**: pnpm
- **Build System**: TurboRepo
- **Backend**: Express.js, GraphQL (`graphql-http`)
- **Database**: PostgreSQL (via Drizzle ORM)
- **Caching**: Redis (`ioredis`)
- **Language**: TypeScript

---

## 🚀 Getting Started

### 1. Prerequisites

Ensure you have the following installed:

- **Node.js** (v20 or higher)
- **pnpm** (Install via `npm install -g pnpm`)
- **PostgreSQL** (Local or Cloud)
- **Redis** (Local or Cloud)

### 2. Installation

Clone the repo and install dependencies:

```bash
git clone <repository_url>
cd TicketForge-AI
pnpm install
```

### 3. Environment Setup

Create a `.env` file in the root directory (or ensure `apps/api` has access to one).
A template is available at `.env.example`:

```env
PORT=4000
DATABASE_URL=postgres://user:password@localhost:5432/ticketforge
JWT_SECRET=supersecretkey_change_me
```

### 4. Running Development Server

Start all active applications in development mode:

```bash
pnpm dev
```

- **API** will start at `http://localhost:4000/graphql`

### 5. Build and Lint

To build all apps and packages:

```bash
pnpm build
```

To run linting:

```bash
pnpm lint
```

---

## 🗄 Database (Apps/API)

The API uses **Drizzle ORM**.

- **Schema Location**: `apps/api/src/db/schema.ts`
- **Generate Migrations**: `pnpm drizzle-kit generate` (inside `apps/api`)
- **Run Migrations**: `pnpm drizzle-kit migrate` (inside `apps/api`)
- **Drizzle Studio**: `pnpm drizzle-kit studio` (to view DB UI)

---

## 🤝 Contribution Guide

1.  **Add Dependencies**:
    - Root: `pnpm add -w <pkg>`
    - Specific App: `pnpm add <pkg> --filter <app_name>` (e.g., `pnpm add lodash --filter api`)
2.  **New Apps**: Create a new folder in `apps/` and add a `package.json`.
3.  **New Packages**: Create a new folder in `packages/` and verify `package.json` name.
