# 🎫 TicketForge AI

**TicketForge AI** is a state-of-the-art, scalable event ticketing and management platform built as a high-performance Monorepo. It leverages Artificial Intelligence for demand modeling and dynamic pricing, ensuring an optimal experience for both organizers and attendees.

## ✨ Key Features

- **🧠 AI-Powered Demand Modeling**: Integrated `TensorFlow.js` implementation for real-time demand analysis and dynamic pricing strategies.
- **💵 Smart Booking & Payments**: Seamless booking flow with secure **Razorpay** integration.
- **🛡️ Robust Authentication**: Secure JWT-based authentication with Role-Based Access Control (RBAC).
- **⚡ High-Performance Architecture**: Built on **Next.js 16** and **Express.js 5**, optimized for speed and scalability.
- **📊 Interactive Dashboards**: Comprehensive User and Admin dashboards for managing events, tickets, and wallets.
- **🔄 Real-Time Capabilities**: Powered by **Socket.io** and **GraphQL** for instant updates.
- **🧪 Comprehensive Testing**: Robust testing strategy using **Jest** and **Playwright** for E2E reliability.

---

## 🏗 Project Architecture

This project is organized as a **Monorepo**, managed by [TurboRepo](https://turbo.build/repo) and [pnpm](https://pnpm.io/), designed to scale effortlessly.

### 📂 Workspace Structure

| Path | Type | Status | Description |
| :--- | :--- | :--- | :--- |
| **`apps/api`** | Backend | 🟢 Active | **Express.js v5** + **GraphQL** API. Handles core logic, DB (PostgreSQL + Drizzle), and AI services. |
| **`apps/web`** | Frontend | 🟢 Active | **Next.js 16** application. Modern UI for users and admins, featuring Server Actions and SSR. |
| `apps/realtime` | Service | 🟡 Planned | Dedicated WebSocket server for live event updates. |
| `apps/worker` | Service | 🟡 Planned | Background job processing for notifications and cleanup. |
| `packages/` | Shared | 🔵 Scalable | Shared libraries for UI, config, and utilities. |

---

## 🛠 Tech Stack

### **Frontend (`apps/web`)**
- **Framework**: Next.js 16 (App Router), React 18
- **Styling**: Tailwind CSS (with `tailwindcss-animate`), Radix UI Primitives
- **State & Data**: React Query, React Hook Form, Zod
- **Utils**: Lucide React, Axios, Date-fns

### **Backend (`apps/api`)**
- **Runtime**: Node.js (v24+)
- **Framework**: Express.js 5, GraphQL (`graphql-http`)
- **Database**: PostgreSQL (via **Drizzle ORM**)
- **Caching**: Redis (`ioredis`)
- **AI/ML**: TensorFlow.js (`@tensorflow/tfjs`)
- **Payments**: Razorpay

### **DevOps & Quality Control**
- **Build System**: TurboRepo
- **Package Manager**: pnpm
- **Environment**: Docker (Infra ready)
- **Testing**: Jest (Unit), Playwright (E2E)

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### 1. Prerequisites
Ensure you have the following installed:
- **Node.js** (v24.0.0 or higher recommended)
- **pnpm** (`npm install -g pnpm`)
- **PostgreSQL** & **Redis** (Running locally or via Docker)

### 2. Installation
Clone the repository and install dependencies:

```bash
git clone <repository_url>
cd TicketForge-AI
pnpm install
```

### 3. Environment Setup
Create a `.env` file in the root directory (and `apps/api` / `apps/web` if needed). A typical setup looks like:

```env
# Root / Shared
PORT=4000
DATABASE_URL=postgres://user:password@localhost:5432/ticketforge
JWT_SECRET=your_super_secret_key

# Payment
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 4. Database Setup (Drizzle ORM)
Initialize the database from the `apps/api` directory:

```bash
# Generate migrations
pnpm --filter api db:generate

# Push changes/Migrate
pnpm --filter api db:migrate

# (Optional) Seed initial data
pnpm --filter api db:seed
```

### 5. Running the Application
Start the development server for all apps:

```bash
pnpm dev
```
- **Web App**: `http://localhost:3000`
- **API**: `http://localhost:4000/graphql`

---

## 🧪 Testing

We use **Jest** for unit tests and **Playwright** for End-to-End tests.

```bash
# Run Unit Tests
pnpm test

# Run E2E Tests (Playwright)
npx playwright test
```

---

## 🏗 Scripts

| Script | Description |
| :--- | :--- |
| `pnpm build` | Build all applications and packages. |
| `pnpm dev` | Start development servers in parallel. |
| `pnpm lint` | Lint all files using ESLint. |
| `pnpm clean` | Clean up `node_modules` and build artifacts. |

---

## 🤝 Contributing

Contributions are welcome! Please ensure you:
1.  Follow the monorepo structure.
2.  Add tests for new features.
3.  Run `pnpm lint` before pushing.

---

<p align="center">
  Built with ❤️ by the TicketForge AI Team
</p>
