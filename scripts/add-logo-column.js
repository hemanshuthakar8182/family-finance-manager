const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Adding logoUrl to Family table...");
  try {
    await prisma.$executeRawUnsafe(
      "ALTER TABLE `Family` ADD COLUMN `logoUrl` TEXT NULL;"
    );
    console.log("✓ Added logoUrl column to Family table.");
  } catch (err) {
    if (err.message && err.message.includes("Duplicate column name")) {
      console.log("• logoUrl column already exists in Family table.");
    } else {
      console.error("Notice:", err.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
