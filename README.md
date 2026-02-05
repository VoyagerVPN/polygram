# Polygram: AI Prediction Market on TON

[![wakatime](https://wakatime.com/badge/user/1717ffce-a05a-4082-a46e-75fb9a96f23d/project/7d7a3c55-6095-4e62-973d-a7eadfbe355d.svg)](https://wakatime.com/badge/user/1717ffce-a05a-4082-a46e-75fb9a96f23d/project/7d7a3c55-6095-4e62-973d-a7eadfbe355d)
[![CI](https://github.com/VoyagerVPN/polygram/actions/workflows/ci.yml/badge.svg)](https://github.com/VoyagerVPN/polygram/actions/workflows/ci.yml)
[![Demo](https://img.shields.io/badge/status-demo-yellow.svg)](https://t.me/polygram_bot)

> ⚠️ **Demo Mode**: This project is currently in active development. Features and APIs may change without notice.

AI-powered prediction market platform on TON blockchain. Users can bet on future events (Yes/No markets) using an off-chain trading engine with LMSR (Logarithmic Market Scoring Rule) mathematics.

## 🚀 Core Features

- **AI Content Engine**: Automated market creation via RSS → OpenRouter AI → Telegram moderation bot
- **LMSR Trading**: Logarithmic Market Scoring Rule for dynamic pricing
- **TON Integration**: TON Connect for wallet authentication and on-chain settlements
- **Real-time Updates**: WebSocket for live price feeds and trade notifications
- **Auto-resolution**: AI-driven market resolution with manual admin override
- **Telegram Mini App**: Native Telegram experience with glassmorphism design
- **Unified UI System**: Consistent component library with design tokens

## 📁 Project Structure

```
polygram/
├── apps/
│   ├── client/              # Telegram Mini App (React + Vite)
│   │   ├── src/
│   │   │   ├── api/         # HTTP client & WebSocket handlers
│   │   │   ├── components/  # React components
│   │   │   │   └── ui/      # Unified UI component system
│   │   │   │       ├── Button/      # Button components
│   │   │   │       ├── Card/        # Card containers
│   │   │   │       └── Feedback/    # Loading, Error, Empty states
│   │   │   ├── hooks/       # Custom hooks (useLMSR, useMarkets, useRealtime)
│   │   │   ├── pages/       # Route-level pages
│   │   │   └── store/       # Zustand store
│   │   └── public/          # Static assets
│   │
│   └── server/              # Backend API (Fastify)
│       ├── src/
│       │   ├── core/        # Constants & configuration
│       │   ├── infrastructure/  # External services (DB, AI, WS, Bot, TON)
│       │   └── modules/     # Domain modules (market, trading, portfolio, user)
│       └── prisma/
│           └── schema.prisma    # Database schema
│
├── packages/
│   └── shared/              # Shared business logic
│       └── src/
│           └── index.ts     # LMSR calculator (used by both client & server)
│
└── docker-compose.yml       # Full stack orchestration
```

## 🛠 Technology Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Monorepo** | pnpm workspaces | 10.x | Package management & workspace linking |
| **Client** | React | 19.x | UI library |
| | Vite | 6.x | Build tool |
| | TypeScript | 5.x | Type safety |
| | Zustand | 5.x | State management |
| | Tailwind CSS | 4.x | Styling |
| | Framer Motion | 12.x | Animations |
| | @telegram-apps/telegram-ui | latest | Telegram-native UI |
| | lightweight-charts | 5.x | Price history charts |
| **Backend** | Fastify | 5.x | API server |
| | Prisma | 6.x | Database ORM |
| | PostgreSQL | 15.x | Primary database |
| | Redis | 7.x | Cache & Pub/Sub |
| | Telegraf | latest | Telegram bot |
| **WebSocket** | @fastify/websocket | latest | Real-time communication |
| **AI** | OpenRouter | latest | Market generation & resolution |
| **Blockchain** | @ton/core, @ton/crypto | latest | TON interactions |
| **Testing** | Vitest | 3.x | Unit & integration tests |
| | @vitest/coverage-v8 | 3.x | Coverage reports |

## 🏗 Architecture

### UI Component System

Unified design system with consistent tokens:

```tsx
// Button variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<TradeButton outcome="YES" price={65} />
<PredictionButton outcome="NO" />

// Card variants  
<Card variant="glass">Glassmorphism</Card>
<Card variant="flat">Flat panel</Card>
<Card variant="surface">Surface background</Card>

// Feedback
<LoadingSpinner size="lg" />
<ErrorMessage onRetry={refetch} />
<EmptyState icon="search" title="No markets found" />
```

### LMSR (Logarithmic Market Scoring Rule)

**Formula:**
```
Price(YES) = exp(qYes/b) / (exp(qYes/b) + exp(qNo/b))
Cost = b * ln(exp(qYes/b) + exp(qNo/b))
```

Implementation is shared between client and server via `@polygram/shared` package.

### Market Lifecycle

1. **PENDING**: AI generates from news → Admin moderation via Telegram bot
2. **OPEN**: Active trading enabled
3. **RESOLVING**: After `expiresAt`, AI verifies outcome
4. **CLOSED**: Final outcome set, payouts distributed

### Authentication

- Telegram `initData` signature validation for API access
- TON Connect proof-of-ownership for wallet linking

## 🚀 Getting Started

### Prerequisites

- Node.js 22+
- pnpm 10+
- PostgreSQL 15+
- Redis 7+

### Installation

```bash
# Install dependencies
pnpm install

# Generate Prisma Client
pnpm -F @polygram/server db:generate

# Run database migrations
pnpm -F @polygram/server db:migrate

# Build shared package
pnpm -F @polygram/shared build
```

### Development

```bash
# Run all apps in parallel
pnpm dev

# Or run individually
pnpm -F @polygram/client dev        # Client only
pnpm -F @polygram/server dev:watch  # Server only
```

### Docker (Full Stack)

```bash
# Start all services (DB, Redis, Server, Client)
docker-compose up -d

# Rebuild after changes
docker-compose up -d --build

# View logs
docker-compose logs -f server
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# With coverage
pnpm -r test -- --coverage

# Specific packages
pnpm -F @polygram/server test
pnpm -F @polygram/client test
pnpm -F @polygram/shared test

# Watch mode
pnpm -F @polygram/server test:watch
```

### Test Structure

- `apps/server/src/**/*.test.ts` — Server logic tests
- `apps/client/src/**/*.test.tsx` — Component tests
- `packages/shared/src/**/*.test.ts` — Shared logic tests

## 📊 Environment Variables

### Server (.env)

```bash
# Required
DATABASE_URL="postgresql://user:pass@localhost:5432/polygram?schema=public"
PORT=3001
BOT_TOKEN="<telegram_bot_token>"
OPENROUTER_API_KEY="<openrouter_api_key>"
REDIS_URL="redis://localhost:6379"

# Optional
CRYPTOPANIC_API_KEY="<cryptopanic_api_key>"  # News feed
ADMIN_CHAT_ID="<telegram_chat_id>"           # Moderation chat
TONAPI_KEY="<tonapi_key>"                    # TON monitoring
APP_WALLET="<ton_wallet_address>"            # Deposit wallet
```

### Client

No `.env` file required. API base URL configured in `src/constants/index.ts`.

## 🔧 Build & Production

```bash
# Build all packages
pnpm build

# Production build
pnpm -F @polygram/client build
pnpm -F @polygram/server build

# Start production server
pnpm -F @polygram/server start
```

## 📝 Code Quality

```bash
# Lint all packages
pnpm lint

# Fix linting issues
pnpm lint:fix

# Find dead code
pnpm knip
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

[MIT](LICENSE)

## 🙏 Acknowledgments

- [LMSR Paper](https://mason.gmu.edu/~rhanson/lmsr.pdf) - Logarithmic Market Scoring Rule
- [TON Blockchain](https://ton.org) - The Open Network
- [Telegram Mini Apps](https://core.telegram.org/bots/webapps) - Telegram WebApp platform
