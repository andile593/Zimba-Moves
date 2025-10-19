import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["error", "warn"],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Add connection retry logic
prisma
  .$connect()
  .then(() => console.log("✓ Database connected"))
  .catch((err) => {
    console.error("✗ Database connection failed:", err);
    // Retry connection
    setTimeout(() => prisma.$connect(), 5000);
  });

// Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default prisma;
