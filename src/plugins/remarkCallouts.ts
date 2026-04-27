import type { Root, Blockquote, Paragraph, Text, Parent, Node } from 'mdast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

interface CalloutInfo {
  type: string;
  collapsed: boolean;
  title: string;
}

/**
 * Extract plain text from an mdast node (recursive)
 */
function extractText(node: any): string {
  if (!node) return '';
  if (node.type === 'text') return node.value || '';
  if (node.children?.map) return node.children.map(extractText).join('');
  return '';
}

/**
 * Escape HTML special characters for safe insertion into raw HTML
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Parse Obsidian callout header from a single line of text.
 * Matches: [!type]- title, [!type]-, [!type] title, [!type]
 */
function parseCalloutHeader(text: string): CalloutInfo | null {
  const match = text.match(/^\s*\[!(?<type>\w+)\](?<collapsed>-)?\s*(?<title>.*)$/);
  if (!match) return null;

  const type = match.groups!.type.toLowerCase();
  const collapsed = !!match.groups!.collapsed;
  let title = match.groups!.title.trim();

  if (!title) {
    title = type.charAt(0).toUpperCase() + type.slice(1);
  }

  return { type, collapsed, title };
}

/**
 * Check if a blockquote is an Obsidian callout.
 * Only looks at the first line of the first paragraph.
 */
function isCallout(blockquote: Blockquote): CalloutInfo | null {
  const firstChild = blockquote.children[0];
  if (firstChild?.type !== 'paragraph') return null;

  const fullText = extractText(firstChild);
  const firstLine = fullText.split('\n')[0];
  return parseCalloutHeader(firstLine);
}

/**
 * Transform a callout blockquote into <details>/<summary> HTML nodes.
 * Returns an array of nodes to replace the blockquote.
 */
function transformCallout(blockquote: Blockquote, info: CalloutInfo): Node[] {
  const firstChild = blockquote.children[0] as Paragraph;
  const contentChildren: Node[] = [];

  // The first paragraph may contain both the header and content (CommonMark
  // merges consecutive blockquote lines into one paragraph). We split at the
  // first newline: everything after it stays as content.
  const firstText = firstChild.children.find(child => child.type === 'text') as Text | undefined;
  if (firstText) {
    const newlineIndex = firstText.value.indexOf('\n');
    if (newlineIndex >= 0) {
      const rest = firstText.value.slice(newlineIndex + 1);
      if (rest.trim()) {
        // Create a new paragraph with the remaining text
        const newParagraph: Paragraph = {
          type: 'paragraph',
          children: [{ type: 'text', value: rest }],
        };
        contentChildren.push(newParagraph);
      }
    }
    // If no newline, the entire paragraph was just the header line
  }

  // Append remaining children after the first paragraph
  contentChildren.push(...blockquote.children.slice(1));

  const openAttr = info.collapsed ? '' : ' open';
  const htmlOpen: Node = {
    type: 'html',
    value: `<details${openAttr} class="callout callout-${escapeHtml(info.type)}"><summary>${escapeHtml(info.title)}</summary>`,
  };

  const htmlClose: Node = {
    type: 'html',
    value: '</details>',
  };

  return [htmlOpen, ...contentChildren, htmlClose];
}

export const remarkCallouts: Plugin<[], Root> = () => {
  return (tree) => {
    const callouts: Array<{ node: Blockquote; parent: Parent; index: number; info: CalloutInfo }> = [];

    // First pass: collect all callout blockquotes
    visit(tree, 'blockquote', (node: Blockquote, index, parent) => {
      if (parent && index !== null && typeof index === 'number') {
        const info = isCallout(node);
        if (info) {
          callouts.push({ node, parent, index, info });
        }
      }
    });

    // Process deepest-first by reversing the pre-order collection
    callouts.reverse();

    // Second pass: transform each callout
    for (const { node, parent, index, info } of callouts) {
      const replacement = transformCallout(node, info);
      parent.children.splice(index, 1, ...replacement);
    }
  };
};

export default remarkCallouts;
