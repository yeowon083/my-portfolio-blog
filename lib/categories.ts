export type Category = {
  id: string;
  name: string;
  slug: string;
  parent_id?: string | null;
};

export function getParentCategory(
  category: Category,
  categories: Category[]
) {
  if (!category.parent_id) return null;
  return categories.find((parent) => parent.id === category.parent_id) ?? null;
}

export function getCategoryLabel(category: Category, categories: Category[]) {
  const parent = getParentCategory(category, categories);
  return parent ? `${parent.name} / ${category.name}` : category.name;
}

export function getTopLevelCategories(categories: Category[]) {
  return categories
    .filter((category) => !category.parent_id)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getCategoryOptions(categories: Category[]) {
  const topLevelCategories = getTopLevelCategories(categories);

  return topLevelCategories.flatMap((category) => {
    const children = categories
      .filter((child) => child.parent_id === category.id)
      .sort((a, b) => a.name.localeCompare(b.name));

    return [category, ...children];
  });
}

export function hasChildCategories(categoryId: string, categories: Category[]) {
  return categories.some((category) => category.parent_id === categoryId);
}

export function isMissingParentIdError(error: { message?: string } | null) {
  return error?.message?.includes("parent_id") ?? false;
}
