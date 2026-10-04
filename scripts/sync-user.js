const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  const family = await prisma.family.findFirst({
    orderBy: { createdAt: "desc" },
  });

  if (!family) {
    console.error("No family found in database!");
    return;
  }

  console.log(`Found active family: ${family.name} (${family.id})`);

  const passwordHash = await bcrypt.hash("password123", 10);

  // Upsert himanshu@family.local
  const user = await prisma.user.upsert({
    where: { email: "himanshu@family.local" },
    update: {
      passwordHash,
      name: "Himanshu Thakar",
    },
    create: {
      email: "himanshu@family.local",
      name: "Himanshu Thakar",
      passwordHash,
    },
  });

  console.log(`User created/updated: ${user.name} (${user.email}) [id: ${user.id}]`);

  // Ensure family membership
  const member = await prisma.familyMember.upsert({
    where: {
      familyId_userId: {
        familyId: family.id,
        userId: user.id,
      },
    },
    update: {
      role: "ADMIN",
      status: "ACTIVE",
    },
    create: {
      familyId: family.id,
      userId: user.id,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  console.log(`Membership confirmed: role=${member.role}, familyId=${member.familyId}, memberId=${member.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
