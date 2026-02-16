import type { CollectionEntry } from 'astro:content';

export interface Backlink {
  slug: string;
  title: string;
  url: string;
  description: string;
  date: Date;
}

/**
 * Extract wiki-links from post body
 * Returns array of slugs that are linked to
 */
export function extractWikiLinks(body: string): string[] {
  const links: string[] = [];
  // Match [[slug|display]] or [[slug]] or [[slug#anchor]] or [[#anchor]]
  const regex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
  let match;

  while ((match = regex.exec(body)) !== null) {
    const rawSlug = match[1].trim();
    // Strip anchor for backlink matching (e.g., "slug#section" → "slug")
    const hashIndex = rawSlug.indexOf('#');
    const slug = hashIndex >= 0 ? rawSlug.slice(0, hashIndex) : rawSlug;
    // Only add if there's a slug (anchor-only links don't create backlinks)
    if (slug) {
      links.push(slug);
    }
  }

  return links;
}

/**
 * Get all backlinks for a given post slug
 * Returns posts that link TO the current slug via [[...]] syntax
 */
export function getBacklinks(
  allPosts: CollectionEntry<'writing'>[],
  currentSlug: string
): Backlink[] {
  const backlinks: Backlink[] = [];

  for (const post of allPosts) {
    // Skip the current post
    if (post.slug === currentSlug) continue;
    // Skip drafts
    if (post.data.draft) continue;

    const linkedSlugs = extractWikiLinks(post.body);

    if (linkedSlugs.includes(currentSlug)) {
      backlinks.push({
        slug: post.slug,
        title: post.data.title,
        url: `/writing/${post.slug}`,
        description: post.data.description,
        date: post.data.date,
      });
    }
  }

  // Sort by date descending
  return backlinks.sort((a, b) => b.date.getTime() - a.date.getTime());
}

/**
 * Build a complete link graph for all posts
 * Returns a map of slug -> { outgoing: string[], incoming: string[] }
 */
export function buildLinkGraph(
  allPosts: CollectionEntry<'writing'>[]
): Map<string, { outgoing: string[]; incoming: string[] }> {
  const graph = new Map<string, { outgoing: string[]; incoming: string[] }>();

  // Initialize graph nodes
  for (const post of allPosts) {
    if (post.data.draft) continue;
    graph.set(post.slug, { outgoing: [], incoming: [] });
  }

  // Build outgoing links
  for (const post of allPosts) {
    if (post.data.draft) continue;

    const outgoing = extractWikiLinks(post.body);
    const node = graph.get(post.slug);
    if (node) {
      // Only include links to valid posts
      node.outgoing = outgoing.filter((slug) => graph.has(slug));
    }
  }

  // Build incoming links
  for (const [slug, node] of graph) {
    for (const targetSlug of node.outgoing) {
      const targetNode = graph.get(targetSlug);
      if (targetNode && !targetNode.incoming.includes(slug)) {
        targetNode.incoming.push(slug);
      }
    }
  }

  return graph;
}

/**
 * Get related posts based on shared tags
 */
export function getRelatedByTags(
  allPosts: CollectionEntry<'writing'>[],
  currentPost: CollectionEntry<'writing'>,
  limit: number = 5
): Backlink[] {
  const currentTags = new Set(currentPost.data.tags || []);
  if (currentTags.size === 0) return [];

  const scored = allPosts
    .filter((post) => post.slug !== currentPost.slug && !post.data.draft)
    .map((post) => {
      const postTags = post.data.tags || [];
      const sharedTags = postTags.filter((tag) => currentTags.has(tag));
      return {
        post,
        score: sharedTags.length,
        sharedTags,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || b.post.data.date.getTime() - a.post.data.date.getTime())
    .slice(0, limit);

  return scored.map((item) => ({
    slug: item.post.slug,
    title: item.post.data.title,
    url: `/writing/${item.post.slug}`,
    description: item.post.data.description,
    date: item.post.data.date,
  }));
}
