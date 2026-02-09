import type { Root, List, ListItem, Paragraph, Text } from 'mdast';
import type { Plugin } from 'unified';

/**
 * Remark plugin to normalize Obsidian-style loose lists to standard CommonMark.
 *
 * In Obsidian, a list item can be followed directly by a paragraph without a blank line:
 *   - item 1
 *   - item 2
 *   Paragraph after list (this is NOT part of item 2 in Obsidian)
 *
 * In CommonMark (Astro's default), this paragraph becomes part of the last list item.
 * This plugin detects and fixes this by splitting paragraphs that span multiple lines
 * where one of those lines was meant to be a separate paragraph.
 */
export const remarkObsidianLists: Plugin<[], Root> = () => {
  return (tree, file) => {
    // Parse the raw content to detect which lines follow list items without blank lines
    const rawContent = String(file.value);
    const lines = rawContent.split('\n');

    // Find lines that are paragraphs immediately following a list (no blank line)
    const linesAfterList = new Set<number>();
    let inList = false;
    let lastListLine = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isListItem = /^\s*[-*+\d][.)\s]/.test(line);
      const isBlank = /^\s*$/.test(line);
      const isCodeFence = /^\s*```/.test(line);
      const isHeading = /^\s*#/.test(line);

      if (isCodeFence) {
        i++;
        while (i < lines.length && !/^\s*```/.test(lines[i])) i++;
        inList = false;
        continue;
      }

      if (isHeading) {
        inList = false;
        continue;
      }

      if (isListItem) {
        inList = true;
        lastListLine = i;
      } else if (isBlank) {
        inList = false;
        lastListLine = -1;
      } else if (inList && lastListLine >= 0 && line.trim()) {
        // This line immediately follows a list item with no blank line
        const currentIndent = line.match(/^(\s*)/)?.[1].length || 0;
        const prevLine = lines[lastListLine];
        const prevIndent = prevLine.match(/^(\s*)/)?.[1].length || 0;

        // If not significantly indented (not a list continuation), mark it
        if (currentIndent <= prevIndent + 3) {
          linesAfterList.add(i);
        }
        inList = false;
      }
    }

    if (linesAfterList.size === 0) return;

    // Transform the AST
    transformTree(tree, linesAfterList, lines);
  };
};

/**
 * Transform the AST to extract paragraphs that should be outside lists
 */
function transformTree(tree: Root, linesAfterList: Set<number>, rawLines: string[]): void {
  const visit = (node: any, parent?: any, index?: number): void => {
    if (!node || typeof node !== 'object') return;

    // Process lists
    if (node.type === 'list' && parent && typeof index === 'number') {
      const list = node as List;
      const items = list.children as ListItem[];
      if (!items || items.length === 0) return;

      const lastItem = items[items.length - 1];
      if (!lastItem?.children || lastItem.children.length === 0) return;

      // Check if the last child of the last item is a paragraph
      const itemChildren = lastItem.children;
      const lastChild = itemChildren[itemChildren.length - 1];

      if (lastChild?.type === 'paragraph') {
        const para = lastChild as Paragraph;

        // Try to split this paragraph if it contains content from linesAfterList
        const splitResult = trySplitParagraph(para, linesAfterList, rawLines);

        if (splitResult) {
          // Replace the paragraph with the first part
          lastItem.children[itemChildren.length - 1] = splitResult.firstPart;

          // Insert the second part after the list
          if (parent.children && Array.isArray(parent.children)) {
            parent.children.splice(index + 1, 0, splitResult.secondPart);
          }
        }
      }
    }

    // Recurse into children (in reverse for safe insertion)
    if (node.children && Array.isArray(node.children)) {
      for (let i = node.children.length - 1; i >= 0; i--) {
        visit(node.children[i], node, i);
      }
    }
  };

  visit(tree);
}

/**
 * Try to split a paragraph that contains content from a line that should be separate
 */
function trySplitParagraph(
  para: Paragraph,
  linesAfterList: Set<number>,
  rawLines: string[]
): { firstPart: Paragraph; secondPart: Paragraph } | null {
  // Get the text content of the paragraph
  const fullText = extractText(para);

  // Check if any of the linesAfterList appear in this paragraph's text
  for (const lineNum of linesAfterList) {
    const lineContent = rawLines[lineNum]?.trim();
    if (!lineContent) continue;

    // Find where this line content appears in the paragraph
    const idx = fullText.indexOf(lineContent);
    if (idx > 0) {
      // Found it - split here
      const firstText = fullText.slice(0, idx).trim();
      const secondText = fullText.slice(idx).trim();

      if (firstText && secondText) {
        return {
          firstPart: {
            type: 'paragraph',
            children: [{ type: 'text', value: firstText } as Text],
          },
          secondPart: {
            type: 'paragraph',
            children: [{ type: 'text', value: secondText } as Text],
          },
        };
      }
    }
  }

  return null;
}

/**
 * Extract plain text from a node
 */
function extractText(node: any): string {
  if (!node) return '';
  if (node.type === 'text') return node.value || '';
  if (node.children?.map) return node.children.map(extractText).join('');
  return '';
}

export default remarkObsidianLists;
