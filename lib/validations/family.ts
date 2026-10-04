import { z } from "zod";

export const addMemberSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
});

export const updateFamilySchema = z.object({
  name: z.string().min(2, "Family name must be at least 2 characters").optional(),
  currency: z.string().default("INR").optional(),
  logoUrl: z.string().nullable().optional(),
});

export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type UpdateFamilyInput = z.infer<typeof updateFamilySchema>;
