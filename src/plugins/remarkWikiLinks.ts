import type { Root, Text, Html } from 'mdast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

interface WikiLinkMatch {
  fullMatch: string;
  slug: string;
  displayText: string;
  index: number;
}

function parseWikiLinks(text: string): WikiLinkMatch[] {
  const links: WikiLinkMatch[] = [];
  // Match [[slug|display]] or [[slug]]
  const regex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    links.push({
      fullMatch: match[0],
      slug: match[1].trim(),
      displayText: match[2]?.trim() || match[1].trim(),
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

        const href = `${basePath}${link.slug}`;

        // Add the link as HTML node - all links use wiki-link class
        // (broken link detection would need to be done at build time separately)
        newNodes.push({
          type: 'html',
          value: `<a href="${href}" class="wiki-link" data-wiki-slug="${link.slug}">${link.displayText}</a>`,
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
