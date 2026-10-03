import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(50),
  type: z.enum(["EXPENSE", "INCOME"]),
  icon: z.string().default("Tag"),
  color: z.string().default("#0F766E"),
});

export type CategoryInput = z.infer<typeof categorySchema>;
