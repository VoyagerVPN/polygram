Вот **итоговый полноценный Architecture & Implementation Document** — чистая, готовая к использованию версия со всеми правками, которые мы обсудили.

```markdown
# Polygram: AI Prediction Market on TON  
**Architecture & Implementation Document v2.0**  
Дата: февраль 2026

## 1. Executive Summary
Polygram — Telegram Mini App для ставок на будущие события (prediction market) на блокчейне TON.

**Core Mechanics**  
- LMSR (Logarithmic Market Scoring Rule) — современная и точная модель для prediction markets  
- Автоматическое создание рынков через AI + ручная модерация через Telegram-бота  

**Unique Selling Point**  
Полная автоматизация контента (RSS → Gemini → модерация → публикация) с последующим авто-разрешением событий.  

**Blockchain & Economy**  
TON Connect + off-chain торговля (баланс отображается в TON для вайба).  

**Vibe**  
iOS Web3 + glassmorphism, dark mode, real-time обновления, haptic feedback.

## 2. Tech Stack
| Компонент          | Технология                              | Обоснование |
|-------------------|-----------------------------------------|-------------|
| Frontend          | React + Vite + TypeScript + @tonconnect/ui-react | SPA, TON Connect из коробки |
| Styling           | Tailwind CSS + glassmorphism            | Быстро + красивый blur |
| State             | Zustand + TanStack Query                | Лёгкий + кэширование |
| Backend           | Node.js + Fastify                       | Быстрый и современный |
| Database          | PostgreSQL + Prisma ORM                 | Надёжно |
| Real-time         | Redis Pub/Sub + WebSocket               | Котировки и обновления |
| AI                | Google Gemini (Pro) + fallback mock     | Генерация + resolution |
| Design            | Google Stitch → Figma + Telegram Mini Apps UI Kit | Максимально быстрый и аутентичный Telegram-внешний вид |
| Infra             | Docker Compose                          | Локально и в проде |

## 3. Architecture Overview
Три основных сервиса в Docker:

1. **Content Engine (AI Worker)**  
   - Cron раз в час → RSS (Crypto, Tech, Politics, World)  
   - Gemini: извлечение бинарных событий (Yes/No, resolve ≤7 дней)  
   - Модерация → Admin Telegram Chat (кнопки ✅ Publish / ❌ Drop)  
   - После expiresAt → авто-resolution через Gemini + manual override в чате

2. **Trading Engine (Backend API)**  
   - LMSR математика  
   - Redis Pub/Sub → market_updates  
   - WebSocket трансляция клиентам  
   - TON Connect авторизация

3. **Client (Telegram Mini App)**  
   - Telegram WebApp initData + TON Connect  
   - Recharts (live графики + sparkline)  
   - HapticFeedback на все действия

## 4. Database Schema (Prisma)
```prisma
model User {
  id          String   @id @default(uuid())
  telegramId  BigInt   @unique
  username    String?
  tonAddress  String?  // для отображения
  balance     Float    @default(1000.0) // в "TON" для вайба
  positions   Position[]
}

model Market {
  id            String      @id @default(uuid())
  question      String
  description   String?
  imageUrl      String?

  yesPool       Float       @default(100.0) // LMSR использует q вместо пулов
  noPool        Float       @default(100.0)
  liquidityB    Float       @default(150.0) // параметр b в LMSR

  status        MarketStatus @default(OPEN)
  outcome       Outcome?     // YES | NO | null
  resolvedAt    DateTime?
  resolvedBy    String?      // "AI" | "ADMIN" | telegramId

  expiresAt     DateTime
  history       PriceHistory[]
}

model PriceHistory {
  id          Int      @id @default(autoincrement())
  marketId    String
  market      Market   @relation(fields: [marketId], references: [id])
  priceYes    Float
  timestamp   DateTime @default(now())
}
```

## 5. TON Integration
- `@tonconnect/ui-react` + `@tonconnect/sdk`
- Кнопка «Connect Wallet» в правом верхнем углу
- Отображение баланса как `12.45 TON` (mock для MVP)
- После успешной сделки — анимация «Sent X TON»

## 6. Mathematical Model — LMSR (Binary)
```ts
const b = 150; // liquidity parameter

// Текущая вероятность YES
const pYes = Math.exp(q / b) / (Math.exp(q / b) + Math.exp((1 - q) / b));

// Стоимость покупки amount на YES
function buyYes(amount: number, currentQ: number): { tokens: number; newQ: number } {
  const newQ = currentQ + amount;
  const cost = b * Math.log(
    Math.exp(newQ / b) + Math.exp((1 - newQ) / b)
  ) - b * Math.log(
    Math.exp(currentQ / b) + Math.exp((1 - currentQ) / b)
  );
  const tokensReceived = newQ - currentQ;
  return { tokens: tokensReceived, newQ };
}
```

## 7. Resolution Mechanism
- Авто: после `expiresAt` → Gemini prompt «Did the event happen? Answer strictly YES or NO + evidence»
- Manual: кнопки в админ-чате «Resolve YES» / «Resolve NO»
- После резолюции: автоматический расчёт и выплата выигрышей

## 8. UI/UX Design System
- Генерация: Google Stitch (промпт: "Telegram Mini App prediction market iOS Web3 glassmorphism dark mode")
- Финализация: экспорт в Figma → замена компонентов из официального Telegram Mini Apps UI Kit
- Цвета:  
  YES → #34C759  
  NO → #FF3B30  
  Accent → #0A84FF  
- Glassmorphism: backdrop-filter: blur(16px), bg-black/20, border-white/10
- HapticFeedback на все кнопки и успешные сделки


## 9. Implementation Roadmap (10–11 дней)
**Day 0** – TON Mini App boilerplate + TON Connect + Telegram Auth  
**Day 1–2** – Skeleton + список рынков + glassmorphism (Stitch → Figma → Telegram Kit)  
**Day 3–4** – LMSR + trade + price history + WebSocket + Redis  
**Day 5** – AI Content Engine + улучшенный промпт + moderation bot  
**Day 6** – Auto + manual resolution + leaderboard  
**Day 7** – Polish: haptics, loading states, fallback AI, мобильная адаптация  
**Day 8** – Deploy (Vercel + Railway) + 60-секундное демо-видео
