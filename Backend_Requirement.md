# Backend Specification: Polygram Markets

Этот документ описывает технические требования к бэкенду на основе дизайна Mini App.

## 1. Расширенная схема данных (Prisma)

Существующая схема требует дополнений для поддержки лидерборда, системы достижений, реферальной программы и истории транзакций.

```prisma
// Дополнения к существующим моделям

model User {
  // ... существующие поля
  avatarUrl   String?
  role        UserRole    @default(USER) // USER, ADMIN, PRO
  referralCode String     @unique
  referredById String?
  referredBy   User?      @relation("Referrals", fields: [referredById], references: [id])
  referrals    User[]     @relation("Referrals")
  
  achievements UserAchievement[]
  transactions Transaction[]
  notifications Notification[]
}

enum UserRole {
  USER
  PRO
}

model Transaction {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  type        TransactionType
  amount      Float
  currency    String   @default("TON")
  marketId    String?
  market      Market?  @relation(fields: [marketId], references: [id])
  metadata    Json?    // Хранит детали сделки (price, shares)
  createdAt   DateTime @default(now())
}

enum TransactionType {
  DEPOSIT
  WITHDRAW
  BUY_YES
  BUY_NO
  SELL_YES
  SELL_NO
  REFERRAL_REWARD
  WIN_PAYOUT
}

model Achievement {
  id          String   @id @default(uuid())
  key         String   @unique // e.g., "FIRST_WIN"
  title       String
  description String
  icon        String
  multiplier  Float    @default(1.0)
  users       UserAchievement[]
}

model UserAchievement {
  userId        String
  achievementId String
  user          User        @relation(fields: [userId], references: [id])
  achievement   Achievement @relation(fields: [achievementId], references: [id])
  unlockedAt    DateTime    @default(now())
  @@id([userId, achievementId])
}

model Notification {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  title     String
  message   String
  type      String   // MARKET_RESOLVED, PRICE_ALERT, SYSTEM
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

## 2. API Endpoints

### Markets (Главный экран)
- `GET /api/markets` — список рынков.
    - Query Params: `category` (trending, closing_soon, high_volume), `limit`, `offset`.
- `GET /api/markets/:id` — детальная информация о рынке.
    - Включает: описание, правила резолюции, текущую цену (LMSR), объем.
- `GET /api/markets/:id/history` — данные для графика (PriceHistory).
- `GET /api/markets/:id/trades` — последние сделки ( Recent Trades в UI).

### Trading (Торговля)
- `POST /api/trade` — совершение сделки.
    - Body: `marketId`, `outcome` (YES/NO), `amount` (TON).
    - Logic: Расчет через LMSR, обновление пулов, создание записи в `Transaction` и `Position`.

### Portfolio (Портфель)
- `GET /api/portfolio` — баланс и агрегированные данные (P&L, Win Rate).
- `GET /api/portfolio/positions` — список активных позиций с расчетом нереализованной прибыли (Unrealized P&L) на основе текущих цен.

### Social & Competitive
- `GET /api/leaderboard` — топ трейдеров.
    - Query Params: `period` (daily, weekly, all_time).
- `GET /api/user/profile` — данные текущего пользователя для меню (Tier,Achievements).
- `GET /api/user/referrals` — статистика реферальной программы.

## 3. Критическая бизнес-логика

### Математическая модель (LMSR)
Бэкенд должен гарантировать, что цена меняется динамически:
- При покупке `YES` цена `YES` растет.
- Формула цены: `P_yes = exp(q_yes/b) / (exp(q_yes/b) + exp(q_no/b))`.
- Параметр `b` (ликвидность) определяет "проскальзывание".

### Resolution Engine (AI + Oracle)
Система автоматического закрытия рынков:
1. `Cron Job` проверяет `expiresAt`.
2. Статус меняется на `RESOLVING`.
3. Запрос к Gemini API для верификации события через доверенные источники.
4. (Опционально) Ручное подтверждение админом через Telegram Bot.
5. Распределение пула TON между победителями.

### Real-time Updates (WebSocket)
Через WS необходимо транслировать:
- `MARKET_PRICE_CHANGED`: Обновление цен на главной и в деталях.
- `GLOBAL_TRADE_FEED`: Появление новых сделок (для секции Recent Trades).
- `NOTIFICATION_RECEIVED`: Результаты резолюции рынков.

## 4. Интеграция с TON
Поскольку используется TON Connect, бэкенд должен:
1. Валидировать подписи (Proof of Ownership).
2. Синхронизировать off-chain баланс с реальными транзакциями (если предусмотрен депозит).
3. Генерировать Payload для транзакций покупки (если расчет идет on-chain).
