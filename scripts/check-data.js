const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const families = await prisma.family.findMany({
    include: {
      members: {
        include: { user: true },
      },
    },
  });

  console.log("Families:", JSON.stringify(families.map((f) => ({
    id: f.id,
    name: f.name,
    logoUrl: f.logoUrl,
    members: f.members.map((m) => ({
      userId: m.userId,
      name: m.user.name,
      email: m.user.email,
      role: m.role,
    })),
  })), null, 2));

  const allTx = await prisma.transaction.findMany({
    where: { deletedAt: null },
    include: { family: true },
  });

  console.log("Transactions count:", allTx.length);
  for (const t of allTx) {
    console.log(`- ${t.date.toISOString().split("T")[0]} | ${t.type} | ₹${t.amount} | ${t.description} | Family: ${t.family.name}`);
  }
}

main().finally(() => prisma.$disconnect());
