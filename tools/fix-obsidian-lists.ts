#!/usr/bin/env tsx
import glob from 'glob';
import { readFile, writeFile } from 'fs/promises';
import { promisify } from 'util';

const globAsync = promisify(glob);

/**
 * Fix Obsidian-style markdown by adding blank lines between:
 * 1. Consecutive text paragraphs
 * 2. List items and following paragraphs
 *
 * Pattern: Text line followed by another text line = add blank line between
 */
async function fixFile(filepath: string): Promise<boolean> {
  const content = await readFile(filepath, 'utf-8');
  const lines = content.split('\n');
  const result: string[] = [];
  let modified = false;
  let inList = false;
  let lastListIndent = 0;
  let prevLineWasText = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isListItem = /^\s*[-*+\d][.)\s]/.test(line);
    const isBlank = /^\s*$/.test(line);
    const isCodeFence = /^\s*```/.test(line);
    const isHeading = /^\s*#/.test(line);
    const isFrontmatter = i === 0 && line === '---';
    const lineIndent = line.match(/^(\s*)/)?.[1].length || 0;

    // Handle frontmatter
    if (isFrontmatter) {
      result.push(line);
      i++;
      while (i < lines.length && lines[i] !== '---') {
        result.push(lines[i]);
        i++;
      }
      if (i < lines.length) result.push(lines[i]);
      prevLineWasText = false;
      continue;
    }

    // Skip code blocks
    if (isCodeFence) {
      result.push(line);
      i++;
      while (i < lines.length && !/^\s*```/.test(lines[i])) {
        result.push(lines[i]);
        i++;
      }
      if (i < lines.length) result.push(lines[i]);
      inList = false;
      prevLineWasText = false;
      continue;
    }

    // Skip tables (lines starting with |)
    if (/^\s*\|/.test(line)) {
      // Add blank line before table if previous was text
      if (prevLineWasText) {
        result.push('');
        modified = true;
      }
      // Collect all table rows
      while (i < lines.length && /^\s*\|/.test(lines[i])) {
        result.push(lines[i]);
        i++;
      }
      i--; // Back up one since outer loop will increment
      inList = false;
      prevLineWasText = false;
      continue;
    }

    // Skip math blocks ($$...$$)
    if (/^\s*\$\$\s*$/.test(line)) {
      // Add blank line before math block if previous was text
      if (prevLineWasText) {
        result.push('');
        modified = true;
      }
      result.push(line);
      i++;
      // Push all lines until closing $$
      while (i < lines.length && !/^\s*\$\$\s*$/.test(lines[i])) {
        result.push(lines[i]);
        i++;
      }
      if (i < lines.length) result.push(lines[i]);
      inList = false;
      prevLineWasText = false;
      continue;
    }

    // Skip blockquotes/callouts (lines starting with >)
    if (/^\s*>/.test(line)) {
      // Add blank line before blockquote if previous was text
      if (prevLineWasText) {
        result.push('');
        modified = true;
      }
      // Collect all consecutive blockquote lines
      while (i < lines.length && /^\s*>/.test(lines[i])) {
        result.push(lines[i]);
        i++;
      }
      i--; // Back up since outer loop increments
      inList = false;
      prevLineWasText = false;
      continue;
    }

    if (isHeading) {
      // Add blank line before heading if previous was text
      if (prevLineWasText) {
        result.push('');
        modified = true;
      }
      result.push(line);
      inList = false;
      prevLineWasText = false;
      continue;
    }

    if (isListItem) {
      // Add blank line before list if previous was text paragraph (not another list)
      if (prevLineWasText && !inList) {
        result.push('');
        modified = true;
      }
      result.push(line);
      inList = true;
      lastListIndent = lineIndent;
      prevLineWasText = false;
      continue;
    }

    if (isBlank) {
      result.push(line);
      inList = false;
      prevLineWasText = false;
      continue;
    }

    // This is a text line (not blank, not special)
    if (line.trim()) {
      // Check if we need to add blank line before this text
      if (prevLineWasText) {
        // Previous was also text - add blank line between paragraphs
        result.push('');
        modified = true;
      } else if (inList) {
        // Coming out of a list - check if indented continuation
        if (lineIndent <= lastListIndent + 2) {
          // Not indented enough - new paragraph after list
          result.push('');
          modified = true;
        }
      }
      result.push(line);
      prevLineWasText = true;
      inList = false;
    }
  }

  if (modified) {
    await writeFile(filepath, result.join('\n'), 'utf-8');
    console.log(`✓ ${filepath}`);
    return true;
  }
  return false;
}

async function main() {
  const files = await globAsync('src/content/writing/**/*.md');
  let fixed = 0;

  for (const file of files) {
    if (await fixFile(file)) fixed++;
  }

  console.log(`\nFixed ${fixed} file(s)`);
}

main().catch(console.error);
