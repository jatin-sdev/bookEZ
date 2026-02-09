# 🎫 TicketForge AI

> **An intelligent event ticketing platform powered by AI-driven dynamic pricing, real-time seat management, and scalable microservices architecture.**

[![Node.js](https://img.shields.io/badge/Node.js-24.x-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.1-black.svg)](https://nextjs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Database Management](#-database-management)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Environment Variables](#-environment-variables)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**TicketForge AI** is a modern, production-ready event ticketing platform that combines the power of artificial intelligence with real-time event management. Built as a scalable monorepo, it features dynamic pricing algorithms, live seat selection, secure payment processing via Razorpay, and real-time updates through WebSockets.

### Key Highlights

- 🤖 **AI-Powered Dynamic Pricing** using TensorFlow.js
- 🪑 **Real-time Seat Management** with interactive seat maps
- 💳 **Secure Payment Integration** with Razorpay
- 🔄 **Event-Driven Architecture** using Kafka
- 📊 **GraphQL API** for flexible data querying
- 🎨 **Modern UI** built with Next.js and Tailwind CSS
- 🔐 **JWT-based Authentication** with refresh tokens
- 📦 **Monorepo Structure** managed by Turborepo

---

## ✨ Features

### For Event Organizers
- Create and manage events with custom seating layouts
- Upload event images via Cloudinary integration
- Real-time booking analytics and monitoring
- Dynamic pricing based on demand and availability

### For Attendees
- Browse events with advanced filtering
- Interactive seat selection with live availability
- Secure checkout with Razorpay payment gateway
- QR code-based ticket generation
- Real-time booking confirmations

### Technical Features
- **Scalable Architecture**: Microservices-ready with Kubernetes support
- **Real-time Updates**: WebSocket integration for live seat availability
- **Caching Layer**: Redis for improved performance
- **Message Queue**: Kafka for event-driven processing
- **Database Partitioning**: Optimized PostgreSQL with table partitioning
- **Type Safety**: Full TypeScript coverage across frontend and backend
- **Testing**: Jest and Playwright for unit and E2E testing

---

## 🏗 Architecture

This project follows a **monorepo architecture** managed by [Turborepo](https://turbo.build/repo) and [pnpm](https://pnpm.io/).

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Event List  │  │ Seat Select  │  │   Checkout   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────┬────────────────────────────────────┬──────────┘
             │                                    │
             ▼                                    ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer (Express + GraphQL)          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │  Events  │  │ Bookings │  │  Pricing │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└────┬──────────────┬──────────────┬──────────────┬──────────┘
     │              │              │              │
     ▼              ▼              ▼              ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│PostgreSQL│  │  Redis   │  │  Kafka   │  │Cloudinary│
└──────────┘  └──────────┘  └──────────┘  └──────────┘
```

### Workspace Structure

| Path              | Type      | Status    | Description                                          |
|:------------------|:----------|:----------|:-----------------------------------------------------|
| **`apps/api`**    | Backend   | ✅ Active | Express.js + GraphQL API with JWT authentication    |
| **`apps/web`**    | Frontend  | ✅ Active | Next.js 16 dashboard with Tailwind CSS               |
| **`apps/realtime`** | Service | ✅ Active | Socket.IO server for real-time updates              |
| `packages/*`      | Libraries | 🚧 Planned | Shared UI components and utilities                   |
| `infra/*`         | DevOps    | ✅ Active | Docker, Kubernetes, and Kafka configurations         |
| `test/*`          | Testing   | ✅ Active | E2E tests with Playwright                            |

---

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js 24.x
- **Framework**: Express.js 5.x
- **API**: GraphQL (graphql-http)
- **Database**: PostgreSQL with Drizzle ORM
- **Caching**: Redis (ioredis)
- **Message Queue**: Kafka (KafkaJS)
- **Authentication**: JWT (jsonwebtoken)
- **Payment**: Razorpay
- **File Upload**: Cloudinary
- **ML/AI**: TensorFlow.js
- **Real-time**: Socket.IO

### Frontend
- **Framework**: Next.js 16.1
- **UI Library**: React 18.3
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **UI Components**: Radix UI
- **GraphQL Client**: graphql-request
- **QR Codes**: qrcode.react
- **Drag & Drop**: react-dnd

### DevOps & Tools
- **Monorepo**: Turborepo
- **Package Manager**: pnpm 9.7
- **Language**: TypeScript 5.9
- **Testing**: Jest + Playwright
- **Containerization**: Docker
- **Orchestration**: Kubernetes
- **CI/CD**: GitHub Actions (planned)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** v24.0.0 or higher ([Download](https://nodejs.org/))
- **pnpm** v9.7.0 or higher
  ```bash
  npm install -g pnpm@9.7.0
  ```
- **PostgreSQL** v14+ (Local or Cloud)
- **Redis** v6+ (Local or Cloud)
- **Kafka** (Optional, for event-driven features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/TicketForge-AI.git
   cd TicketForge-AI
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration (see [Environment Variables](#-environment-variables))

4. **Set up the database**
   ```bash
   # Navigate to API directory
   cd apps/api
   
   # Generate and run migrations
   pnpm db:generate
   pnpm db:migrate
   
   # Seed the database with sample data
   pnpm db:seed
   
   # (Optional) Set up table partitions for performance
   pnpm db:setup-partitions
   ```

5. **Start development servers**
   ```bash
   # From root directory
   cd ../..
   pnpm dev
   ```

   This will start:
   - **API Server**: http://localhost:4000
   - **GraphQL Playground**: http://localhost:4000/graphql
   - **Web App**: http://localhost:3000
   - **Realtime Server**: http://localhost:4001

---

## 📁 Project Structure

```
TicketForge-AI/
├── apps/
│   ├── api/                    # Backend API
│   │   ├── src/
│   │   │   ├── auth/          # Authentication & authorization
│   │   │   ├── bookings/      # Booking management
│   │   │   ├── events/        # Event CRUD operations
│   │   │   ├── pricing/       # Dynamic pricing service
│   │   │   ├── ml/            # Machine learning models
│   │   │   ├── upload/        # File upload handlers
│   │   │   ├── users/         # User management
│   │   │   ├── db/            # Database schema & migrations
│   │   │   ├── lib/           # Shared utilities
│   │   │   ├── middleware/    # Express middleware
│   │   │   ├── services/      # Business logic services
│   │   │   ├── index.ts       # API entry point
│   │   │   └── worker.ts      # Background worker
│   │   └── scripts/           # Database scripts
│   │
│   ├── web/                   # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/           # Next.js 16 app directory
│   │   │   ├── components/    # React components
│   │   │   ├── lib/           # Frontend utilities
│   │   │   └── hooks/         # Custom React hooks
│   │   └── public/            # Static assets
│   │
│   └── realtime/              # WebSocket server
│       └── src/
│           └── index.ts       # Socket.IO server
│
├── infra/
│   ├── docker/                # Docker configurations
│   ├── k8s/                   # Kubernetes manifests
│   └── kafka/                 # Kafka setup
│
├── test/                      # E2E tests
│   └── e2e/                   # Playwright tests
│
├── packages/                  # Shared packages (planned)
│
├── .env.example               # Environment template
├── Makefile                   # Kubernetes shortcuts
├── turbo.json                 # Turborepo config
├── pnpm-workspace.yaml        # pnpm workspace config
└── README.md                  # This file
```

---

## 💻 Development

### Available Scripts

#### Root Level
```bash
pnpm dev          # Start all apps in development mode
pnpm build        # Build all apps and packages
pnpm lint         # Run linting across all workspaces
pnpm test         # Run all tests
pnpm clean        # Clean build artifacts
```

#### API (`apps/api`)
```bash
pnpm dev          # Start API and worker concurrently
pnpm dev:api      # Start only the API server
pnpm dev:worker   # Start only the background worker
pnpm build        # Compile TypeScript to JavaScript
pnpm start        # Run production build

# Database commands
pnpm db:push      # Push schema changes to database
pnpm db:generate  # Generate migrations
pnpm db:migrate   # Run migrations
pnpm db:seed      # Seed database with sample data
pnpm db:reset     # Reset database (⚠️ destructive)
pnpm db:setup-partitions  # Set up table partitions

# Testing
pnpm test         # Run Jest tests
pnpm test:watch   # Run tests in watch mode
```

#### Web (`apps/web`)
```bash
pnpm dev          # Start Next.js dev server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm codegen      # Generate GraphQL types
pnpm codegen:watch # Watch and generate GraphQL types
pnpm test         # Run Jest tests
pnpm test:watch   # Run tests in watch mode
```

### Adding Dependencies

```bash
# Add to root workspace
pnpm add -w <package>

# Add to specific app
pnpm add <package> --filter api
pnpm add <package> --filter web

# Add dev dependency
pnpm add -D <package> --filter api
```

---

## 🗄 Database Management

### Schema Management with Drizzle ORM

The project uses [Drizzle ORM](https://orm.drizzle.team/) for type-safe database operations.

**Schema Location**: `apps/api/src/db/schema.ts`

### Common Database Tasks

```bash
# Navigate to API directory
cd apps/api

# Generate migration files from schema changes
pnpm db:generate

# Apply migrations to database
pnpm db:migrate

# Push schema directly (for development)
pnpm db:push

# Seed database with test data
pnpm db:seed

# Open Drizzle Studio (Database GUI)
npx drizzle-kit studio
```

### Database Schema Overview

- **users**: User accounts and authentication
- **events**: Event information and metadata
- **bookings**: Ticket bookings and reservations
- **seats**: Seat inventory and availability
- **payments**: Payment transactions (Razorpay)
- **pricing_history**: Dynamic pricing logs

---

## 🧪 Testing

### Unit Tests (Jest)

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests for specific app
pnpm test --filter api
pnpm test --filter web
```

### E2E Tests (Playwright)

```bash
# Run E2E tests
npx playwright test

# Run in UI mode
npx playwright test --ui

# Run specific test file
npx playwright test test/e2e/booking-flow.spec.ts
```

**Test Configuration**: `playwright.config.ts`

---

## 🚢 Deployment

### Docker Deployment

```bash
# Build Docker images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Kubernetes Deployment

The project includes Kubernetes manifests in `infra/k8s/`.

```bash
# Deploy to Kubernetes
make k8s-up

# Check deployment status
make k8s-status

# View logs
make k8s-logs

# Tear down
make k8s-down
```

### Production Checklist

- [ ] Set strong `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`
- [ ] Configure production database (PostgreSQL)
- [ ] Set up Redis instance
- [ ] Configure Cloudinary credentials
- [ ] Set up Razorpay production keys
- [ ] Enable HTTPS/SSL
- [ ] Set up monitoring and logging
- [ ] Configure CORS for production domains
- [ ] Set `NODE_ENV=production`

---

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Application
NODE_ENV=development
PORT=4000
REALTIME_PORT=4001

# Database & Redis
DATABASE_URL=postgres://username:password@localhost:5432/ticketforge
REDIS_URL=redis://localhost:6379

# Kafka (Optional)
KAFKA_BROKER=localhost:9092

# JWT Authentication
JWT_ACCESS_SECRET=your_super_secret_access_key_change_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_in_production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Frontend URLs
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=http://localhost:4001
NEXT_PUBLIC_REALTIME_URL=http://localhost:4001

# Cloudinary (Image Upload)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay (Payment Gateway)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

> **⚠️ Security Note**: Never commit `.env` files to version control. Use `.env.example` as a template.

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
   - Follow the existing code style
   - Add tests for new features
   - Update documentation as needed
4. **Commit your changes**
   ```bash
   git commit -m "feat: add amazing feature"
   ```
5. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- [TensorFlow.js](https://www.tensorflow.org/js) - Machine learning
- [Razorpay](https://razorpay.com/) - Payment processing
- [Turborepo](https://turbo.build/repo) - Monorepo management

---

## 📞 Support

For questions or issues:

- 📧 Email: support@ticketforge.ai
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/TicketForge-AI/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/TicketForge-AI/discussions)

---

<div align="center">

**Built with ❤️ using TypeScript, Next.js, and AI**

⭐ Star this repo if you find it helpful!

</div>
