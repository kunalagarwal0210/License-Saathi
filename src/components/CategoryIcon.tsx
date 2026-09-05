import type { Category } from "@/lib/categories";

type CategoryIconProps = {
  category: Category;
  className?: string;
};

// Small line icons for the category picker. Kept inline (no icon library
// dependency) and purely decorative — the card's own text label carries the
// meaning, so the <svg> is hidden from assistive tech.
export function CategoryIcon({ category, className }: CategoryIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {category === "eatery" && (
        <>
          <path d="M6 2v7a2 2 0 0 0 2 2v11" />
          <path d="M6 2v7" />
          <path d="M9 2v7" />
          <path d="M17 2c-1.5 1.5-2 3-2 5s.5 3 2 4v11" />
        </>
      )}
      {category === "retail" && (
        <>
          <path d="M4 8h16l-1.5 12.5a1 1 0 0 1-1 .5H6.5a1 1 0 0 1-1-.5L4 8Z" />
          <path d="M8 8V6a4 4 0 0 1 8 0v2" />
        </>
      )}
      {category === "salon" && (
        <>
          <circle cx="7" cy="6" r="2.5" />
          <circle cx="7" cy="18" r="2.5" />
          <path d="M20 5 9 18" />
          <path d="M9 6l11 12" />
        </>
      )}
    </svg>
  );
}
