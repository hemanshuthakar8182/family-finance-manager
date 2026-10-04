const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Checking and applying Phase 4 migrations to MySQL database...");

  // 1. Add receiptUrl to Transaction
  try {
    await prisma.$executeRawUnsafe(
      "ALTER TABLE `Transaction` ADD COLUMN `receiptUrl` VARCHAR(500) NULL;"
    );
    console.log("✓ Added receiptUrl column to Transaction table.");
  } catch (err) {
    if (err.message && err.message.includes("Duplicate column name")) {
      console.log("• receiptUrl column already exists in Transaction.");
    } else {
      console.warn("Notice on receiptUrl:", err.message);
    }
  }

  // 2. Create ExpenseSplit table
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS \`ExpenseSplit\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`transactionId\` VARCHAR(191) NOT NULL,
        \`familyId\` VARCHAR(191) NOT NULL,
        \`paidById\` VARCHAR(191) NOT NULL,
        \`totalAmount\` DECIMAL(12, 2) NOT NULL,
        \`notes\` TEXT NULL,
        \`createdAt\` DATETIME NOT NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`ExpenseSplit_transactionId_key\` (\`transactionId\`),
        KEY \`ExpenseSplit_familyId_idx\` (\`familyId\`),
        KEY \`ExpenseSplit_paidById_idx\` (\`paidById\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
    `);
    console.log("✓ Created ExpenseSplit table (or already exists).");
  } catch (err) {
    console.error("Error creating ExpenseSplit:", err.message);
  }

  // 3. Create SplitShare table
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS \`SplitShare\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`splitId\` VARCHAR(191) NOT NULL,
        \`memberId\` VARCHAR(191) NOT NULL,
        \`amount\` DECIMAL(12, 2) NOT NULL,
        \`isSettled\` TINYINT(1) NOT NULL DEFAULT 0,
        \`settledAt\` DATETIME NULL,
        \`settlementTxId\` VARCHAR(191) NULL,
        \`createdAt\` DATETIME NOT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`SplitShare_splitId_idx\` (\`splitId\`),
        KEY \`SplitShare_memberId_idx\` (\`memberId\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
    `);
    console.log("✓ Created SplitShare table (or already exists).");
  } catch (err) {
    console.error("Error creating SplitShare:", err.message);
  }

  console.log("Database schema updated successfully for Phase 4!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
