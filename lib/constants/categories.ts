export interface DefaultCategory {
  name: string;
  type: "EXPENSE" | "INCOME";
  icon: string;
  color: string;
}

export const DEFAULT_EXPENSE_CATEGORIES: DefaultCategory[] = [
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

export const DEFAULT_INCOME_CATEGORIES: DefaultCategory[] = [
  { name: "Salary", type: "INCOME", icon: "Briefcase", color: "#16A34A" },
  { name: "Freelance", type: "INCOME", icon: "Laptop", color: "#0D9488" },
  { name: "Business", type: "INCOME", icon: "Store", color: "#2563EB" },
  { name: "Investment & Interest", type: "INCOME", icon: "TrendingUp", color: "#059669" },
  { name: "Gifts & Bonus", type: "INCOME", icon: "Gift", color: "#8B5CF6" },
  { name: "Other Income", type: "INCOME", icon: "CircleDollarSign", color: "#10B981" },
];
