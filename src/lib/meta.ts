/* ==========================================================================
   DOCUMENT METADATA (§84)
   Keeps <title>, the meta description and the canonical URL correct per
   route, so each page is individually shareable and indexable.
   ========================================================================== */

function upsert(selector: string, create: () => HTMLElement): HTMLElement {
  let el = document.head.querySelector<HTMLElement>(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  return el;
}

export function setMeta({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  document.title = title;

  const ogTitle = upsert('meta[property="og:title"]', () => {
    const m = document.createElement('meta');
    m.setAttribute('property', 'og:title');
    return m;
  });
  ogTitle.setAttribute('content', title);

  if (description) {
    const desc = upsert('meta[name="description"]', () => {
      const m = document.createElement('meta');
      m.setAttribute('name', 'description');
      return m;
    });
    desc.setAttribute('content', description);

    const ogDesc = upsert('meta[property="og:description"]', () => {
      const m = document.createElement('meta');
      m.setAttribute('property', 'og:description');
      return m;
    });
    ogDesc.setAttribute('content', description);
  }

  const canonical = upsert('link[rel="canonical"]', () => {
    const l = document.createElement('link');
    l.setAttribute('rel', 'canonical');
    return l;
  });
  canonical.setAttribute('href', window.location.origin + window.location.pathname);
}
