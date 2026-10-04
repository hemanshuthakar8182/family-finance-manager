export interface KeywordRule {
  keywords: string[];
  icon: string;
  color: string;
}

export const CATEGORY_KEYWORD_RULES: KeywordRule[] = [
  // Groceries & Supermarkets
  {
    keywords: [
      "grocery",
      "groceries",
      "supermarket",
      "mart",
      "blinkit",
      "instamart",
      "zepto",
      "vegetable",
      "veggie",
      "fruit",
      "fruits",
      "ration",
      "milk",
      "dairy",
      "bread",
      "bakery",
      "basket",
    ],
    icon: "ShoppingCart",
    color: "#059669",
  },
  // Cafes & Beverages
  {
    keywords: ["coffee", "cafe", "starbucks", "tea", "chai", "beverage", "beverages"],
    icon: "Coffee",
    color: "#B45309",
  },
  // Fast Food & Snacks
  {
    keywords: ["pizza", "burger", "fastfood", "snack", "snacks", "dominos", "mcdonald", "kfc", "subway"],
    icon: "Pizza",
    color: "#EA580C",
  },
  // Food & Dining
  {
    keywords: [
      "food",
      "dining",
      "restaurant",
      "lunch",
      "dinner",
      "breakfast",
      "zomato",
      "swiggy",
      "eat",
      "eating",
      "meal",
      "hotel",
      "sweet",
      "sweets",
      "drinks",
    ],
    icon: "Utensils",
    color: "#F97316",
  },
  // Fuel & Petrol
  {
    keywords: ["petrol", "diesel", "fuel", "gasoline", "cng", "pump", "oil"],
    icon: "Fuel",
    color: "#DC2626",
  },
  // Cabs & Rides
  {
    keywords: ["uber", "ola", "cab", "cabs", "taxi", "rapido", "auto", "rickshaw", "drive", "car"],
    icon: "Car",
    color: "#2563EB",
  },
  // Flights & Travel
  {
    keywords: ["flight", "plane", "air", "airline", "indigo", "travel", "trip", "tourism", "vacation", "holiday"],
    icon: "Plane",
    color: "#0284C7",
  },
  // Train & Metro
  {
    keywords: ["train", "metro", "railway", "irctc", "ticket"],
    icon: "Train",
    color: "#4F46E5",
  },
  // Bus & Public Transit
  {
    keywords: ["bus", "transit", "commute", "transport"],
    icon: "Bus",
    color: "#2563EB",
  },
  // Housing & Rent
  {
    keywords: ["rent", "flat", "apartment", "house", "home", "housing", "society", "maintenance"],
    icon: "Home",
    color: "#4F46E5",
  },
  {
    keywords: ["building", "property", "mortgage", "estate"],
    icon: "Building",
    color: "#64748B",
  },
  // Electricity & Power
  {
    keywords: ["electric", "electricity", "power", "eb", "current", "bill", "utility", "utilities", "bescom", "tneb"],
    icon: "Zap",
    color: "#D97706",
  },
  {
    keywords: ["light", "bulb"],
    icon: "Lightbulb",
    color: "#EAB308",
  },
  // Water
  {
    keywords: ["water", "jal", "droplet"],
    icon: "Droplet",
    color: "#0284C7",
  },
  // Gas & LPG
  {
    keywords: ["gas", "cylinder", "lpg", "flame", "indane", "bharatgas"],
    icon: "Flame",
    color: "#EA580C",
  },
  // Internet & Broadband
  {
    keywords: ["wifi", "broadband", "internet", "fiber", "airtel", "jiofiber", "act"],
    icon: "Wifi",
    color: "#7C3AED",
  },
  // Mobile & Recharge
  {
    keywords: ["mobile", "phone", "recharge", "postpaid", "prepaid", "sim", "telecom"],
    icon: "Smartphone",
    color: "#0D9488",
  },
  // Medicines & Pharmacy
  {
    keywords: [
      "medicine",
      "medicines",
      "pharma",
      "pharmacy",
      "pill",
      "pills",
      "tablet",
      "tablets",
      "apollo",
      "1mg",
      "netmeds",
      "drug",
    ],
    icon: "Pill",
    color: "#E11D48",
  },
  // Doctor & Hospitals
  {
    keywords: ["doctor", "clinic", "hospital", "consultation", "dental", "dentist", "checkup", "lab", "test", "pathology"],
    icon: "Stethoscope",
    color: "#E11D48",
  },
  // Gym & Fitness
  {
    keywords: [
      "gym",
      "fitness",
      "workout",
      "crossfit",
      "yoga",
      "exercise",
      "trainer",
      "cult",
      "cultfit",
      "protein",
      "supplement",
    ],
    icon: "Dumbbell",
    color: "#EA580C",
  },
  // General Health
  {
    keywords: ["health", "medical", "wellness", "therapy"],
    icon: "HeartPulse",
    color: "#E11D48",
  },
  // Clothing & Fashion
  {
    keywords: ["clothes", "clothing", "apparel", "shirt", "pant", "tshirt", "dress", "myntra", "zara", "fashion"],
    icon: "Shirt",
    color: "#DB2777",
  },
  // Shopping
  {
    keywords: ["shopping", "amazon", "flipkart", "mall", "purchase", "order", "goods"],
    icon: "ShoppingBag",
    color: "#DB2777",
  },
  // Salon & Grooming
  {
    keywords: ["salon", "parlour", "haircut", "barber", "grooming", "spa", "shave"],
    icon: "Scissors",
    color: "#9333EA",
  },
  // Education
  {
    keywords: ["school", "college", "tuition", "fees", "course", "udemy", "coursera", "class", "coaching", "exam", "education"],
    icon: "GraduationCap",
    color: "#7C3AED",
  },
  // Books & Stationery
  {
    keywords: ["book", "books", "library", "stationery", "notebook", "pen"],
    icon: "Book",
    color: "#2563EB",
  },
  // Kids & Baby
  {
    keywords: ["baby", "kids", "child", "daycare", "toy", "toys", "diaper", "nursery"],
    icon: "Baby",
    color: "#F43F5E",
  },
  // Movies & Cinema
  {
    keywords: ["movie", "movies", "cinema", "theatre", "film", "pvr", "inox", "bookmyshow", "netflix", "prime", "hotstar"],
    icon: "Film",
    color: "#9333EA",
  },
  {
    keywords: ["tv", "television", "dth", "tatasky"],
    icon: "Tv",
    color: "#6366F1",
  },
  {
    keywords: ["music", "spotify", "concert", "wynk", "gaana"],
    icon: "Music",
    color: "#10B981",
  },
  {
    keywords: ["game", "games", "gaming", "steam", "playstation", "xbox"],
    icon: "Gamepad",
    color: "#8B5CF6",
  },
  {
    keywords: ["camera", "photo", "photography", "photoshoot"],
    icon: "Camera",
    color: "#475569",
  },
  // Pets
  {
    keywords: ["pet", "pets", "dog", "cat", "puppy", "kitten", "vet", "veterinary", "pedigree"],
    icon: "Heart",
    color: "#E11D48",
  },
  // Insurance & Protection
  {
    keywords: ["insurance", "lic", "policy", "premium", "mediclaim", "term insurance"],
    icon: "Shield",
    color: "#0F766E",
  },
  // Tax
  {
    keywords: ["tax", "income tax", "gst", "itr", "audit"],
    icon: "Receipt",
    color: "#475569",
  },
  // Investments
  {
    keywords: ["investment", "investments", "stocks", "shares", "mutual fund", "sip", "zerodha", "groww", "crypto", "trading"],
    icon: "TrendingUp",
    color: "#059669",
  },
  // Savings
  {
    keywords: ["savings", "saving", "piggy", "deposit", "fd", "rd"],
    icon: "PiggyBank",
    color: "#0D9488",
  },
  // Banking
  {
    keywords: ["bank", "loan", "emi", "interest", "credit card", "atm", "repayment"],
    icon: "Landmark",
    color: "#1E293B",
  },
  // Salary & Work Income
  {
    keywords: ["salary", "paycheck", "wages", "stipend", "compensation"],
    icon: "Briefcase",
    color: "#16A34A",
  },
  // Freelance & Tech
  {
    keywords: ["freelance", "client", "consulting", "project", "work", "upwork", "fiverr"],
    icon: "Laptop",
    color: "#0D9488",
  },
  // Business
  {
    keywords: ["business", "sales", "revenue", "shop", "store"],
    icon: "Store",
    color: "#059669",
  },
  // Dividend & Profit
  {
    keywords: ["dividend", "profit", "capital gain", "royalty"],
    icon: "TrendingUp",
    color: "#16A34A",
  },
  // Gift & Bonus
  {
    keywords: ["gift", "gifts", "bonus", "reward", "rewards", "cashback", "prize", "award"],
    icon: "Gift",
    color: "#E11D48",
  },
  // Cash & Allowance
  {
    keywords: ["income", "cash", "allowance", "pocket money"],
    icon: "Banknote",
    color: "#16A34A",
  },
  // Repair & Services
  {
    keywords: ["repair", "repairs", "service", "services", "maintenance", "mechanic", "carpenter", "plumber", "wrench"],
    icon: "Wrench",
    color: "#475569",
  },
];

/**
 * Resolves a suggested icon and theme color based on the category name and type.
 */
export function resolveCategoryIcon(
  name: string,
  type: "EXPENSE" | "INCOME" = "EXPENSE"
): { icon: string; color: string } {
  const cleanName = (name || "").toLowerCase().trim();

  if (!cleanName) {
    return {
      icon: type === "INCOME" ? "Briefcase" : "Tag",
      color: type === "INCOME" ? "#16A34A" : "#0F766E",
    };
  }

  // Tokenize into clean words
  const words = cleanName.split(/[\s,./_+-]+/).filter(Boolean);

  // Check rules
  for (const rule of CATEGORY_KEYWORD_RULES) {
    for (const kw of rule.keywords) {
      // Exact word match
      if (words.includes(kw)) {
        return { icon: rule.icon, color: rule.color };
      }
      // Substring match for compound words (e.g. "cultfit", "fastfood")
      if (cleanName.includes(kw) && kw.length >= 4) {
        return { icon: rule.icon, color: rule.color };
      }
    }
  }

  // Fallback defaults based on type
  if (type === "INCOME") {
    return { icon: "CircleDollarSign", color: "#16A34A" };
  }

  return { icon: "Tag", color: "#0F766E" };
}

export interface CuratedIconItem {
  name: string;
  label: string;
  category: string;
}

export const CURATED_CATEGORY_ICONS: CuratedIconItem[] = [
  // Food & Dining
  { name: "Utensils", label: "Food & Dining", category: "Food" },
  { name: "Coffee", label: "Coffee & Drinks", category: "Food" },
  { name: "Pizza", label: "Fast Food", category: "Food" },
  { name: "ShoppingCart", label: "Grocery & Supermarket", category: "Food" },
  { name: "ShoppingBasket", label: "Essentials Basket", category: "Food" },

  // Shopping & Personal
  { name: "ShoppingBag", label: "Shopping", category: "Shopping" },
  { name: "Shirt", label: "Clothing & Apparel", category: "Shopping" },
  { name: "Package", label: "Orders & Delivery", category: "Shopping" },
  { name: "Scissors", label: "Salon & Grooming", category: "Shopping" },
  { name: "Tag", label: "General Tag", category: "Shopping" },

  // Transportation
  { name: "Fuel", label: "Fuel / Petrol", category: "Transport" },
  { name: "Car", label: "Car & Cabs", category: "Transport" },
  { name: "Bus", label: "Bus & Public Transit", category: "Transport" },
  { name: "Train", label: "Train & Metro", category: "Transport" },
  { name: "Plane", label: "Flights & Travel", category: "Transport" },

  // Home & Utilities
  { name: "Home", label: "Rent & Home", category: "Home" },
  { name: "Building", label: "Building & Society", category: "Home" },
  { name: "Zap", label: "Electricity & Power", category: "Home" },
  { name: "Droplet", label: "Water Supply", category: "Home" },
  { name: "Flame", label: "Gas & LPG", category: "Home" },
  { name: "Wifi", label: "Internet & WiFi", category: "Home" },
  { name: "Smartphone", label: "Mobile & Recharge", category: "Home" },
  { name: "Wrench", label: "Maintenance & Repairs", category: "Home" },

  // Health & Fitness
  { name: "HeartPulse", label: "Health & Medical", category: "Health" },
  { name: "Pill", label: "Pharmacy & Medicines", category: "Health" },
  { name: "Stethoscope", label: "Doctor & Clinic", category: "Health" },
  { name: "Dumbbell", label: "Gym & Fitness", category: "Health" },
  { name: "Heart", label: "Care & Pets", category: "Health" },

  // Education & Family
  { name: "GraduationCap", label: "Education & Courses", category: "Family" },
  { name: "Book", label: "Books & Study", category: "Family" },
  { name: "Baby", label: "Kids & Baby Care", category: "Family" },
  { name: "Smile", label: "Family & Fun", category: "Family" },

  // Entertainment & Leisure
  { name: "Film", label: "Movies & Cinema", category: "Leisure" },
  { name: "Tv", label: "Television & DTH", category: "Leisure" },
  { name: "Music", label: "Music & Audio", category: "Leisure" },
  { name: "Gamepad", label: "Gaming", category: "Leisure" },
  { name: "Sparkles", label: "Events & Celebration", category: "Leisure" },
  { name: "Gift", label: "Gifts & Bonus", category: "Leisure" },

  // Work & Finance
  { name: "Briefcase", label: "Salary & Career", category: "Finance" },
  { name: "Laptop", label: "Freelance & Tech", category: "Finance" },
  { name: "Store", label: "Business & Sales", category: "Finance" },
  { name: "TrendingUp", label: "Investments & Stocks", category: "Finance" },
  { name: "PiggyBank", label: "Savings & Deposits", category: "Finance" },
  { name: "Landmark", label: "Banking & Loans", category: "Finance" },
  { name: "CreditCard", label: "Credit Card & EMI", category: "Finance" },
  { name: "Banknote", label: "Cash & Earnings", category: "Finance" },
  { name: "CircleDollarSign", label: "Income & Profit", category: "Finance" },
  { name: "Receipt", label: "Taxes & Invoices", category: "Finance" },
  { name: "Shield", label: "Insurance & Security", category: "Finance" },
];

export const PRESET_CATEGORY_COLORS = [
  { hex: "#0F766E", label: "Teal" },
  { hex: "#059669", label: "Emerald" },
  { hex: "#16A34A", label: "Green" },
  { hex: "#0284C7", label: "Sky Blue" },
  { hex: "#2563EB", label: "Royal Blue" },
  { hex: "#4F46E5", label: "Indigo" },
  { hex: "#7C3AED", label: "Purple" },
  { hex: "#9333EA", label: "Violet" },
  { hex: "#DB2777", label: "Pink" },
  { hex: "#E11D48", label: "Rose" },
  { hex: "#DC2626", label: "Red" },
  { hex: "#EA580C", label: "Orange" },
  { hex: "#D97706", label: "Amber" },
  { hex: "#475569", label: "Slate" },
];
