import prisma from "@/lib/db/prisma";
import { CategoryInput } from "@/lib/validations/category";

export async function getCategories(familyId: string, includeArchived = false) {
  return await prisma.category.findMany({
    where: {
      familyId,
      ...(includeArchived ? {} : { isArchived: false }),
    },
    orderBy: [{ type: "asc" }, { name: "asc" }],
    include: {
      _count: {
        select: { transactions: true },
      },
    },
  });
}

export async function createCategory(familyId: string, input: CategoryInput) {
  return await prisma.category.create({
    data: {
      familyId,
      name: input.name.trim(),
      type: input.type,
      icon: input.icon,
      color: input.color,
    },
  });
}

export async function updateCategory(
  familyId: string,
  categoryId: string,
  input: Partial<CategoryInput>
) {
  return await prisma.category.updateMany({
    where: { id: categoryId, familyId },
    data: {
      ...(input.name ? { name: input.name.trim() } : {}),
      ...(input.icon ? { icon: input.icon } : {}),
      ...(input.color ? { color: input.color } : {}),
    },
  });
}

export async function archiveCategory(familyId: string, categoryId: string) {
  return await prisma.category.updateMany({
    where: { id: categoryId, familyId },
    data: { isArchived: true },
  });
}
