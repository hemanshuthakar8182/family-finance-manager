import { z } from "zod";

export const accountSchema = z.object({
  name: z.string().min(1, "Account name is required").max(60),
  type: z.enum(["CASH", "BANK", "UPI", "CREDIT_CARD", "WALLET"]),
  openingBalance: z.coerce.number().default(0),
});

export type AccountInput = z.infer<typeof accountSchema>;
