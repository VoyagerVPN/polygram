# Polygram: AI Prediction Market on TON

## Project Structure (Monorepo)
- `apps/client`: Telegram Mini App (React + SDK v3)
- `apps/server`: Backend API (Fastify + Prisma + WebSocket)
- `packages/shared`: Shared Business Logic (LMSR Math, Zod Schemas)

## Tech Stack
- **Language**: TypeScript (Monorepo)
- **Frontend**: Vite, React, Tailwind, @tma.js/sdk-react
- **Backend**: Fastify, Prisma, PostgreSQL
- **Logic**: LMSR (Logarithmic Market Scoring Rule)

## DX & Quality Tools
- **Vitest**: Unit testing for mathematical core.
- **Knip**: Dead code and unused dependencies elimination.
- **Prettier/ESLint**: Code style.

## Getting Started
1. Install dependencies: `pnpm install`
2. Run development: `pnpm dev`
