import { z } from "zod";

export const transactionSchema = z.object({
  amount: z.coerce
    .number()
    .positive("Amount must be greater than 0")
    .max(100000000, "Amount exceeds permissible limit"),
  type: z.enum(["INCOME", "EXPENSE"]),
  categoryId: z.string().min(1, "Please select a category"),
  accountId: z.string().optional().nullable(),
  date: z.string().or(z.date()),
  description: z.string().max(255).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export const transactionFilterSchema = z.object({
  search: z.string().optional(),
  type: z.enum(["ALL", "INCOME", "EXPENSE"]).default("ALL"),
  categoryId: z.string().optional(),
  accountId: z.string().optional(),
  memberId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
});

export type TransactionInput = z.infer<typeof transactionSchema>;
export type TransactionFilterInput = z.infer<typeof transactionFilterSchema>;
