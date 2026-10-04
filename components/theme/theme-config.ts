export type ThemeCategory = "classic" | "light" | "mix" | "dark";

export interface ThemeConfig {
  id: string;
  name: string;
  category: ThemeCategory;
  primaryColor: string;
  secondaryColor?: string;
  gradient?: string;
  isDark: boolean;
  description: string;
}

export const THEME_CATEGORIES: { id: ThemeCategory; label: string; icon: string }[] = [
  { id: "classic", label: "Classic", icon: "🏛️" },
  { id: "light", label: "Light", icon: "☀️" },
  { id: "mix", label: "Mix / Gradient", icon: "🌈" },
  { id: "dark", label: "Dark", icon: "🌙" },
];

export const THEMES: ThemeConfig[] = [
  // 1. Classic Themes
  {
    id: "classic-teal",
    name: "Classic Teal",
    category: "classic",
    primaryColor: "#0F766E",
    secondaryColor: "#059669",
    isDark: false,
    description: "Original clean teal and emerald finance palette",
  },
  {
    id: "corporate-navy",
    name: "Corporate Navy",
    category: "classic",
    primaryColor: "#1E3A8A",
    secondaryColor: "#2563EB",
    isDark: false,
    description: "High-trust deep corporate blue banking aesthetic",
  },
  {
    id: "forest-wealth",
    name: "Forest Wealth",
    category: "classic",
    primaryColor: "#15803D",
    secondaryColor: "#16A34A",
    isDark: false,
    description: "Natural prosperity and growth-focused emerald green",
  },
  {
    id: "executive-slate",
    name: "Executive Slate",
    category: "classic",
    primaryColor: "#334155",
    secondaryColor: "#475569",
    isDark: false,
    description: "Monochrome graphite for a focused minimalist workspace",
  },

  // 2. Light & Fresh Themes
  {
    id: "sky-cyan",
    name: "Sky Cyan",
    category: "light",
    primaryColor: "#0284C7",
    secondaryColor: "#06B6D4",
    isDark: false,
    description: "Airy bright cyan with gentle light accents",
  },
  {
    id: "soft-mint",
    name: "Soft Mint",
    category: "light",
    primaryColor: "#059669",
    secondaryColor: "#10B981",
    isDark: false,
    description: "Fresh sage and mint for pleasant daily budgeting",
  },
  {
    id: "lavender-mist",
    name: "Lavender Mist",
    category: "light",
    primaryColor: "#7C3AED",
    secondaryColor: "#8B5CF6",
    isDark: false,
    description: "Calming pastel purple with soft lilac backgrounds",
  },
  {
    id: "rose-blush",
    name: "Rose Blush",
    category: "light",
    primaryColor: "#E11D48",
    secondaryColor: "#F43F5E",
    isDark: false,
    description: "Warm coral and delicate rose blossom highlights",
  },
  {
    id: "golden-amber",
    name: "Golden Amber",
    category: "light",
    primaryColor: "#D97706",
    secondaryColor: "#F59E0B",
    isDark: false,
    description: "Warm golden sunlight and honey accents",
  },

  // 3. Mix & Gradient Themes
  {
    id: "sunset-glow",
    name: "Sunset Glow",
    category: "mix",
    primaryColor: "#EA580C",
    secondaryColor: "#E11D48",
    gradient: "linear-gradient(135deg, #F97316 0%, #E11D48 100%)",
    isDark: false,
    description: "Warm amber blending seamlessly into ruby rose",
  },
  {
    id: "oceanic-breeze",
    name: "Oceanic Breeze",
    category: "mix",
    primaryColor: "#0284C7",
    secondaryColor: "#2563EB",
    gradient: "linear-gradient(135deg, #06B6D4 0%, #2563EB 100%)",
    isDark: false,
    description: "Deep sea azure cascading into electric royal blue",
  },
  {
    id: "cyber-violet",
    name: "Cyber Violet",
    category: "mix",
    primaryColor: "#6366F1",
    secondaryColor: "#A855F7",
    gradient: "linear-gradient(135deg, #6366F1 0%, #A855F7 100%)",
    isDark: false,
    description: "Futuristic fintech indigo blending into neon purple",
  },
  {
    id: "emerald-aurora",
    name: "Emerald Aurora",
    category: "mix",
    primaryColor: "#059669",
    secondaryColor: "#0F766E",
    gradient: "linear-gradient(135deg, #10B981 0%, #0F766E 100%)",
    isDark: false,
    description: "Luminescent northern-lights spring green and teal",
  },

  // 4. Dark & Midnight Themes
  {
    id: "midnight-obsidian",
    name: "Midnight Obsidian",
    category: "dark",
    primaryColor: "#38BDF8",
    secondaryColor: "#0EA5E9",
    isDark: true,
    description: "Deep space navy-black with glowing electric cyan",
  },
  {
    id: "dark-emerald",
    name: "Dark Emerald",
    category: "dark",
    primaryColor: "#34D399",
    secondaryColor: "#10B981",
    isDark: true,
    description: "Midnight obsidian forest with vibrant emerald glow",
  },
  {
    id: "dark-amethyst",
    name: "Dark Amethyst",
    category: "dark",
    primaryColor: "#A78BFA",
    secondaryColor: "#C084FC",
    isDark: true,
    description: "Velvet night purple with luminous neon lilac highlights",
  },
  {
    id: "carbon-titanium",
    name: "Carbon Titanium",
    category: "dark",
    primaryColor: "#E2E8F0",
    secondaryColor: "#A1A1AA",
    isDark: true,
    description: "Pure carbon matte black with crisp titanium silver",
  },
];

export const DEFAULT_THEME_ID = "classic-teal";

export function getThemeConfig(id: string): ThemeConfig {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}
