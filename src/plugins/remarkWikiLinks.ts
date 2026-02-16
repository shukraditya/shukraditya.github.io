import type { Root, Text, Html } from 'mdast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

interface WikiLinkMatch {
  fullMatch: string;
  slug: string;
  anchor: string | null;
  displayText: string;
  index: number;
}

/**
 * Slugify anchor text to match Astro's heading ID generation
 * Converts "The Mechanistic View" → "the-mechanistic-view"
 * Converts "1. Detection" → "1-detection"
 */
function slugifyAnchor(anchor: string): string {
  return anchor
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special chars except spaces and hyphens
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/^-+|-+$/g, '');  // Trim leading/trailing hyphens
}

function parseWikiLinks(text: string): WikiLinkMatch[] {
  const links: WikiLinkMatch[] = [];
  // Match [[slug|display]] or [[slug]] or [[#anchor]] or [[slug#anchor]]
  const regex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const rawSlug = match[1].trim();
    // Parse anchor from slug (e.g., "slug#section" or "#section")
    const hashIndex = rawSlug.indexOf('#');
    const slug = hashIndex >= 0 ? rawSlug.slice(0, hashIndex) : rawSlug;
    const anchor = hashIndex >= 0 ? rawSlug.slice(hashIndex + 1) : null;

    links.push({
      fullMatch: match[0],
      slug,
      anchor,
      displayText: match[2]?.trim() || rawSlug,
      index: match.index,
    });
  }

  return links;
}

export interface WikiLinkOptions {
  /** Base path for wiki links */
  basePath?: string;
}

export const remarkWikiLinks: Plugin<[WikiLinkOptions?], Root> = (options = {}) => {
  const { basePath = '/writing/' } = options;

  return (tree) => {
    visit(tree, 'text', (node: Text, index, parent) => {
      if (!parent || index === null) return;

      const links = parseWikiLinks(node.value);
      if (links.length === 0) return;

      const newNodes: (Text | Html)[] = [];
      let lastIndex = 0;

      for (const link of links) {
        // Add text before the wiki link
        if (link.index > lastIndex) {
          newNodes.push({
            type: 'text',
            value: node.value.slice(lastIndex, link.index),
          });
        }

        // Build href based on link type
        let href: string;
        if (link.slug && link.anchor) {
          // [[slug#anchor]] - cross-post with anchor
          href = `${basePath}${link.slug}#${slugifyAnchor(link.anchor)}`;
        } else if (link.anchor) {
          // [[#anchor]] - same-page anchor only
          href = `#${slugifyAnchor(link.anchor)}`;
        } else {
          // [[slug]] - regular post link
          href = `${basePath}${link.slug}`;
        }

        // Store the base slug (without anchor) for data attribute
        const dataSlug = link.slug || link.anchor || '';

        // Add the link as HTML node - all links use wiki-link class
        // (broken link detection would need to be done at build time separately)
        newNodes.push({
          type: 'html',
          value: `<a href="${href}" class="wiki-link" data-wiki-slug="${dataSlug}">${link.displayText}</a>`,
        });

        lastIndex = link.index + link.fullMatch.length;
      }

      // Add remaining text after last link
      if (lastIndex < node.value.length) {
        newNodes.push({
          type: 'text',
          value: node.value.slice(lastIndex),
        });
      }

      // Replace the text node with new nodes
      parent.children.splice(index, 1, ...newNodes);
    });
  };
};

export default remarkWikiLinks;
