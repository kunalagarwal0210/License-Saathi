// Shared business-category data for the landing category picker and the
// questionnaire route contract (ticket 05 -> ticket 06).
//
// The category is carried in the URL path (`/questionnaire/[category]`) so
// it survives refresh/navigation per the spec's "must survive navigation"
// requirement (UI_IMPLEMENTATION_SPEC.md §8).

export const CATEGORIES = ["eatery", "retail", "salon"] as const;

export type Category = (typeof CATEGORIES)[number];

export type CategoryDefinition = {
  id: Category;
  label: string;
  description: string;
};

export const CATEGORY_DEFINITIONS: readonly CategoryDefinition[] = [
  {
    id: "eatery",
    label: "Eatery / Café",
    description: "Dine-in, cloud kitchen, or takeaway food business",
  },
  {
    id: "retail",
    label: "Retail / Kirana",
    description: "Shop selling groceries, goods, or general merchandise",
  },
  {
    id: "salon",
    label: "Salon",
    description: "Hair, beauty, or personal-care services",
  },
];

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}

export function getQuestionnaireHref(category: Category): string {
  return `/questionnaire/${category}`;
}
