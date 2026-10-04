import { z } from "zod";

export const transactionSchema = z
  .object({
    amount: z.coerce
      .number()
      .positive("Amount must be greater than 0")
      .max(100000000, "Amount exceeds permissible limit"),
    type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
    categoryId: z.string().optional().nullable(),
    accountId: z.string().optional().nullable(),
    toAccountId: z.string().optional().nullable(),
    date: z.string().or(z.date()),
    description: z.string().max(255).optional().nullable(),
    notes: z.string().max(1000).optional().nullable(),
    receiptUrl: z.string().max(500).optional().nullable(),
  })
  .superRefine((val, ctx) => {
    if (val.type !== "TRANSFER" && !val.categoryId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select a category",
        path: ["categoryId"],
      });
    }
    if (val.type === "TRANSFER") {
      if (!val.accountId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please select the source account",
          path: ["accountId"],
        });
      }
      if (!val.toAccountId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please select the destination account",
          path: ["toAccountId"],
        });
      }
      if (val.accountId && val.toAccountId && val.accountId === val.toAccountId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Source and destination accounts must be different",
          path: ["toAccountId"],
        });
      }
    }
  });

export const transactionFilterSchema = z.object({
  search: z.string().optional(),
  type: z.enum(["ALL", "INCOME", "EXPENSE", "TRANSFER"]).default("ALL"),
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
