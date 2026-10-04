/* ==========================================================================
   BRAND TAXONOMY
   This is site structure (navigation + editorial copy), not commerce data.
   Whether a category is actually shoppable is decided at runtime by real
   inventory counts — see resolveCategories() in catalog.ts.
   ========================================================================== */

export interface CategoryDef {
  slug: string;
  name: string;
  blurb: string;
  image?: string;
  objectPosition?: string;
  /** Grid weight on the homepage category section. */
  feature?: boolean;
}

export const CATEGORY_DEFS: CategoryDef[] = [
  {
    slug: 'ladies-sarees',
    name: 'Ladies Sarees',
    blurb: 'Drape, weave and fall — chosen for the way they move.',
    image: '/media/cat-sarees.jpg',
    objectPosition: 'center 30%',
    feature: true,
  },
  {
    slug: 'womens',
    name: "Women's",
    blurb: 'Considered everyday pieces with an editorial edge.',
    image: '/media/cat-women.jpg',
    objectPosition: 'center 22%',
    feature: true,
  },
  {
    slug: 'mens',
    name: "Men's",
    blurb: 'Clean lines, honest fabric, quiet tailoring.',
    image: '/media/cat-men.jpg',
    objectPosition: 'center 22%',
  },
  {
    slug: 'kids',
    name: 'Kids',
    blurb: 'Soft, durable and made to be lived in.',
    image: '/media/cat-kids.jpg',
    objectPosition: 'center 28%',
  },
  {
    slug: 'ethnic',
    name: 'Ethnic',
    blurb: 'Traditional craft, contemporary restraint.',
  },
  {
    slug: 'western-wear',
    name: 'Western Wear',
    blurb: 'Modern silhouettes for the everyday.',
  },
  {
    slug: 'footwear',
    name: 'Footwear',
    blurb: 'Grounded, built to last.',
  },
  {
    slug: 'accessories',
    name: 'Accessories',
    blurb: 'The small decisions that finish a look.',
  },
];

export function categoryName(slug: string): string {
  return CATEGORY_DEFS.find((c) => c.slug === slug)?.name ?? slug;
}
