const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const DEFAULT_EXPENSE_CATEGORIES = [
  { name: "Food & Dining", type: "EXPENSE", icon: "Utensils", color: "#EA580C" },
  { name: "Grocery", type: "EXPENSE", icon: "ShoppingCart", color: "#059669" },
  { name: "Fuel & Petrol", type: "EXPENSE", icon: "Fuel", color: "#D97706" },
  { name: "Shopping", type: "EXPENSE", icon: "ShoppingBag", color: "#8B5CF6" },
  { name: "Rent", type: "EXPENSE", icon: "Home", color: "#2563EB" },
  { name: "Bills & Utilities", type: "EXPENSE", icon: "Zap", color: "#F59E0B" },
  { name: "Electricity", type: "EXPENSE", icon: "Lightbulb", color: "#EAB308" },
  { name: "Mobile & WiFi", type: "EXPENSE", icon: "Smartphone", color: "#0284C7" },
  { name: "Health & Medicine", type: "EXPENSE", icon: "HeartPulse", color: "#DC2626" },
  { name: "Education", type: "EXPENSE", icon: "GraduationCap", color: "#4F46E5" },
  { name: "Travel & Commute", type: "EXPENSE", icon: "Car", color: "#0D9488" },
  { name: "Entertainment", type: "EXPENSE", icon: "Tv", color: "#EC4899" },
  { name: "Maintenance", type: "EXPENSE", icon: "Wrench", color: "#64748B" },
  { name: "Other Expense", type: "EXPENSE", icon: "CircleDot", color: "#6B7280" },
];

const DEFAULT_INCOME_CATEGORIES = [
  { name: "Salary", type: "INCOME", icon: "Briefcase", color: "#16A34A" },
  { name: "Freelance", type: "INCOME", icon: "Laptop", color: "#0D9488" },
  { name: "Business", type: "INCOME", icon: "Store", color: "#2563EB" },
  { name: "Investment & Interest", type: "INCOME", icon: "TrendingUp", color: "#059669" },
  { name: "Gifts & Bonus", type: "INCOME", icon: "Gift", color: "#8B5CF6" },
  { name: "Other Income", type: "INCOME", icon: "CircleDollarSign", color: "#10B981" },
];

async function main() {
  console.log("Seeding database with realistic Family Finance data...");

  // Clear existing demo data
  await prisma.transaction.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.recurringTransaction.deleteMany();
  await prisma.category.deleteMany();
  await prisma.account.deleteMany();
  await prisma.familyMember.deleteMany();
  await prisma.family.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  // 1. Create Users
  const himanshu = await prisma.user.create({
    data: {
      name: "Hemanshu Thakar",
      email: "himanshu@family.local",
      passwordHash,
    },
  });

  const priya = await prisma.user.create({
    data: {
      name: "Hina Thakar",
      email: "priya@family.local",
      passwordHash,
    },
  });

  // 2. Create Family
  const family = await prisma.family.create({
    data: {
      name: "Thakar Family's",
      currency: "INR",
      inviteCode: "THAKAR-2026",
    },
  });

  // 3. Create Family Members
  const adminMember = await prisma.familyMember.create({
    data: {
      familyId: family.id,
      userId: himanshu.id,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  const regularMember = await prisma.familyMember.create({
    data: {
      familyId: family.id,
      userId: priya.id,
      role: "MEMBER",
      status: "ACTIVE",
    },
  });

  // 4. Create Accounts
  const hdfc = await prisma.account.create({
    data: {
      familyId: family.id,
      name: "HDFC Bank",
      type: "BANK",
      openingBalance: 50000,
      currentBalance: 78500,
    },
  });

  const upi = await prisma.account.create({
    data: {
      familyId: family.id,
      name: "UPI / PhonePe",
      type: "UPI",
      openingBalance: 3000,
      currentBalance: 4250,
    },
  });

  const cash = await prisma.account.create({
    data: {
      familyId: family.id,
      name: "Cash in Hand",
      type: "CASH",
      openingBalance: 5000,
      currentBalance: 3400,
    },
  });

  // 5. Create Categories
  const categoryRecords = {};

  for (const cat of DEFAULT_EXPENSE_CATEGORIES) {
    const c = await prisma.category.create({
      data: {
        familyId: family.id,
        name: cat.name,
        type: cat.type,
        icon: cat.icon,
        color: cat.color,
        isDefault: true,
      },
    });
    categoryRecords[cat.name] = c.id;
  }

  for (const cat of DEFAULT_INCOME_CATEGORIES) {
    const c = await prisma.category.create({
      data: {
        familyId: family.id,
        name: cat.name,
        type: cat.type,
        icon: cat.icon,
        color: cat.color,
        isDefault: true,
      },
    });
    categoryRecords[cat.name] = c.id;
  }

  // 6. Create realistic sample transactions for the current month
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const transactionsData = [
    // Income
    {
      type: "INCOME",
      amount: 75000,
      categoryId: categoryRecords["Salary"],
      accountId: hdfc.id,
      memberId: adminMember.id,
      date: new Date(year, month, 1, 10, 0),
      description: "Monthly Tech Salary",
      notes: "Credited for the month",
    },
    {
      type: "INCOME",
      amount: 15000,
      categoryId: categoryRecords["Freelance"],
      accountId: hdfc.id,
      memberId: regularMember.id,
      date: new Date(year, month, 3, 14, 30),
      description: "Design Project Payment",
      notes: "Client milestone 1",
    },
    // Expenses
    {
      type: "EXPENSE",
      amount: 22000,
      categoryId: categoryRecords["Rent"],
      accountId: hdfc.id,
      memberId: adminMember.id,
      date: new Date(year, month, 2, 11, 0),
      description: "Apartment Rent",
      notes: "Transferred to landlord",
    },
    {
      type: "EXPENSE",
      amount: 3200,
      categoryId: categoryRecords["Electricity"],
      accountId: upi.id,
      memberId: adminMember.id,
      date: new Date(year, month, 2, 18, 15),
      description: "Electricity Bill (BSES)",
      notes: "Paid via UPI",
    },
    {
      type: "EXPENSE",
      amount: 1850,
      categoryId: categoryRecords["Grocery"],
      accountId: upi.id,
      memberId: regularMember.id,
      date: new Date(year, month, 2, 19, 30),
      description: "Weekly vegetables & fruits",
      notes: "Blinkit order",
    },
    {
      type: "EXPENSE",
      amount: 450,
      categoryId: categoryRecords["Food & Dining"],
      accountId: cash.id,
      memberId: adminMember.id,
      date: new Date(year, month, 3, 13, 0),
      description: "Family lunch snacks",
      notes: "Paid in cash",
    },
    {
      type: "EXPENSE",
      amount: 1200,
      categoryId: categoryRecords["Fuel & Petrol"],
      accountId: upi.id,
      memberId: adminMember.id,
      date: new Date(year, month, 3, 15, 45),
      description: "Car Petrol Tank Refill",
      notes: "Indian Oil station",
    },
    {
      type: "EXPENSE",
      amount: 899,
      categoryId: categoryRecords["Mobile & WiFi"],
      accountId: hdfc.id,
      memberId: regularMember.id,
      date: new Date(year, month, 3, 16, 20),
      description: "Airtel Fiber Broadband",
      notes: "Monthly plan",
    },
  ];

  for (const t of transactionsData) {
    if (t.categoryId) {
      await prisma.transaction.create({
        data: {
          familyId: family.id,
          memberId: t.memberId,
          type: t.type,
          amount: t.amount,
          categoryId: t.categoryId,
          accountId: t.accountId,
          date: t.date,
          description: t.description,
          notes: t.notes,
        },
      });
    }
  }

  // 7. Seed Budgets
  if (categoryRecords["Grocery"]) {
    await prisma.budget.create({
      data: {
        familyId: family.id,
        categoryId: categoryRecords["Grocery"],
        amount: 8000,
        month: month + 1,
        year,
      },
    });
  }

  if (categoryRecords["Food & Dining"]) {
    await prisma.budget.create({
      data: {
        familyId: family.id,
        categoryId: categoryRecords["Food & Dining"],
        amount: 5000,
        month: month + 1,
        year,
      },
    });
  }

  console.log("Seed completed successfully!");
  console.log("Admin login: himanshu@family.local / password123");
  console.log("Member login: priya@family.local / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
