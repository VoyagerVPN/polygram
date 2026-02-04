import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create a mock market
  await prisma.market.create({
    data: {
      question: "Биткоин превысит $120,000 до конца февраля 2026?",
      description: "Бинарный рынок на цену BTC на основе данных Binance.",
      expiresAt: new Date("2026-03-01T00:00:00Z"),
      qYes: 100,
      qNo: 100,
      liquidityB: 150,
      status: "OPEN"
    }
  });

  await prisma.market.create({
    data: {
      question: "TON выйдет в топ-5 CoinMarketCap до конца недели?",
      description: "Проверка капитализации на CMC.",
      expiresAt: new Date("2026-02-10T00:00:00Z"),
      qYes: 120,
      qNo: 80,
      liquidityB: 150,
      status: "OPEN"
    }
  });

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
