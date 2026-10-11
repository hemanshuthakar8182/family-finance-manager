import React from "react";
import {
  Utensils,
  ShoppingCart,
  Fuel,
  ShoppingBag,
  Home,
  Zap,
  Lightbulb,
  Smartphone,
  HeartPulse,
  GraduationCap,
  Car,
  Tv,
  Wrench,
  CircleDot,
  Briefcase,
  Laptop,
  Store,
  TrendingUp,
  Gift,
  CircleDollarSign,
  Tag,
  Coffee,
  Film,
  Plane,
  Music,
  DollarSign,
  CreditCard,
  Wallet,
  Banknote,
  Heart,
  Shield,
  Book,
  Dumbbell,
  Award,
  Wifi,
  Smile,
  Star,
  Settings,
  Package,
  Bus,
  Truck,
  Baby,
  Phone,
  Camera,
  Gamepad,
  Scissors,
  Sparkles,
  Building,
  Landmark,
  PiggyBank,
  Receipt,
  Pizza,
  Train,
  Shirt,
  Pill,
  Stethoscope,
  Droplet,
  Flame,
  Key,
  Globe,
  ShoppingBasket,
  type LucideIcon,
} from "lucide-react";

import { resolveCategoryIcon } from "@/lib/utils/category-helper";

interface CategoryIconProps {
  name: string;
  categoryName?: string;
  className?: string;
  size?: number;
}

// Curated dictionary of category icons preventing wildcard import of 1500+ Lucide icons
const ICON_MAP: Record<string, LucideIcon> = {
  // Food & Dining
  utensils: Utensils,
  food: Utensils,
  dining: Utensils,
  coffee: Coffee,
  pizza: Pizza,

  // Shopping & Grocery
  shoppingcart: ShoppingCart,
  shoppingbag: ShoppingBag,
  shoppingbasket: ShoppingBasket,
  grocery: ShoppingCart,
  shopping: ShoppingBag,
  package: Package,
  shirt: Shirt,

  // Transportation
  fuel: Fuel,
  petrol: Fuel,
  car: Car,
  bus: Bus,
  train: Train,
  truck: Truck,
  plane: Plane,
  travel: Plane,

  // Housing & Utilities
  home: Home,
  rent: Home,
  building: Building,
  landmark: Landmark,
  zap: Zap,
  bills: Zap,
  utilities: Zap,
  lightbulb: Lightbulb,
  electricity: Lightbulb,
  droplet: Droplet,
  water: Droplet,
  flame: Flame,
  gas: Flame,
  wifi: Wifi,
  smartphone: Smartphone,
  phone: Phone,
  mobile: Smartphone,

  // Health & Personal
  heartpulse: HeartPulse,
  heart: Heart,
  health: HeartPulse,
  medicine: Pill,
  pill: Pill,
  stethoscope: Stethoscope,
  dumbbell: Dumbbell,
  fitness: Dumbbell,
  gym: Dumbbell,
  baby: Baby,
  scissors: Scissors,

  // Education & Work
  graduationcap: GraduationCap,
  education: GraduationCap,
  book: Book,
  briefcase: Briefcase,
  salary: Briefcase,
  laptop: Laptop,
  freelance: Laptop,
  store: Store,
  business: Store,

  // Finance & Savings
  wallet: Wallet,
  creditcard: CreditCard,
  banknote: Banknote,
  cash: Banknote,
  piggybank: PiggyBank,
  receipt: Receipt,
  trendingup: TrendingUp,
  investment: TrendingUp,
  circledollarsign: CircleDollarSign,
  dollarsign: DollarSign,
  income: CircleDollarSign,

  // Entertainment & Leisure
  tv: Tv,
  film: Film,
  movies: Film,
  music: Music,
  gamepad: Gamepad,
  gaming: Gamepad,
  camera: Camera,
  gift: Gift,
  bonus: Gift,
  award: Award,
  star: Star,
  smile: Smile,
  sparkles: Sparkles,

  // Maintenance & General
  wrench: Wrench,
  maintenance: Wrench,
  settings: Settings,
  key: Key,
  globe: Globe,
  shield: Shield,
  circledot: CircleDot,
  tag: Tag,
};

export function CategoryIcon({ name, categoryName, className = "", size = 20 }: CategoryIconProps) {
  // Normalize string to alphanumeric lowercase
  const normalized = (name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  let IconComponent = ICON_MAP[normalized];

  // If icon is not matched or generic "tag", try resolving by categoryName
  if ((!IconComponent || normalized === "tag") && categoryName) {
    const resolved = resolveCategoryIcon(categoryName);
    const resolvedNorm = resolved.icon.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (ICON_MAP[resolvedNorm]) {
      IconComponent = ICON_MAP[resolvedNorm];
    }
  }

  const FinalIcon = IconComponent || Tag;
  return <FinalIcon className={className} size={size} />;
}

