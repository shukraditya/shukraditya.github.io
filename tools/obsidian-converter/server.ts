import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import * as fs from 'fs/promises';
import * as path from 'path';
import YAML from 'yaml';

const app = new Hono();

// Paths
const PROJECT_ROOT = path.resolve('/Users/user/dev/personal/shukraditya.github.io');
const PUBLIC_IMAGES = path.join(PROJECT_ROOT, 'public', 'images');
const WRITING_DIR = path.join(PROJECT_ROOT, 'src', 'content', 'writing');

// Types
interface ConversionResult {
  success: boolean;
  output: {
    frontmatter: string;
    body: string;
    fullContent: string;
  };
  images: {
    found: string[];
    missing: string[];
  };
  suggestedSlug: string;
  writePath: string;
}

// Extract frontmatter from Obsidian markdown
function extractFrontmatter(content: string): { frontmatter: Record<string, any>; body: string } {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n?/;
  const match = content.match(frontmatterRegex);

  if (match) {
    const yamlContent = match[1];
    const body = content.slice(match[0].length);
    try {
      const frontmatter = YAML.parse(yamlContent) || {};
      return { frontmatter, body };
    } catch {
      return { frontmatter: {}, body: content };
    }
  }

  return { frontmatter: {}, body: content };
}

// Extract title from first H1
function extractTitleFromH1(body: string): string | null {
  const h1Match = body.match(/^#\s+(.+)$/m);
  return h1Match ? h1Match[1].trim() : null;
}

// Extract description from first paragraph
function extractDescription(body: string): string | null {
  const lines = body.split('\n');
  let inCodeBlock = false;
  let description = '';

  for (const line of lines) {
    if (line.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;
    if (line.startsWith('#')) continue;
    if (line.trim() && !line.startsWith('![') && !line.startsWith('[[')) {
      description = line.trim();
      break;
    }
  }

  if (description.length > 150) {
    description = description.slice(0, 147) + '...';
  }

  return description || null;
}

// Convert date to YYYY-MM-DD format
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toISOString().split('T')[0];
}

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 50)
    .replace(/-+$/, '');
}

// Parse image references from markdown
function parseImages(body: string): Array<{ original: string; filename: string; alt: string }> {
  const images: Array<{ original: string; filename: string; alt: string }> = [];
  const seen = new Set<string>();

  // Wiki-link style: ![[image.png]]
  const wikiRegex = /!\[\[([^\]]+)\]\]/g;
  let match;
  while ((match = wikiRegex.exec(body)) !== null) {
    const fullPath = match[1];
    const filename = path.basename(fullPath);
    if (!seen.has(filename)) {
      seen.add(filename);
      images.push({
        original: match[0],
        filename,
        alt: filename.replace(/\.[^.]+$/, '')
      });
    }
  }

  // Standard markdown: ![alt](path/to/image.png)
  const mdRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  while ((match = mdRegex.exec(body)) !== null) {
    const imagePath = match[2];
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('/images/')) continue;
    const filename = path.basename(imagePath);
    if (!seen.has(filename)) {
      seen.add(filename);
      images.push({
        original: match[0],
        filename,
        alt: match[1] || filename.replace(/\.[^.]+$/, '')
      });
    }
  }

  return images;
}

// Transform markdown body
function transformBody(body: string): string {
  let transformed = body;

  // Convert wiki-links to standard markdown with /images/ path
  transformed = transformed.replace(/!\[\[([^\]]+)\]\]/g, (match, fullPath) => {
    const filename = path.basename(fullPath);
    const alt = filename.replace(/\.[^.]+$/, '');
    return `![${alt}](/images/${filename})`;
  });

  // Convert relative image paths to /images/
  transformed = transformed.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, imagePath) => {
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('/images/')) {
      return match;
    }
    const filename = path.basename(imagePath);
    return `![${alt || filename.replace(/\.[^.]+$/, '')}](/images/${filename})`;
  });

  return transformed;
}

// Build Astro frontmatter
function buildAstroFrontmatter(frontmatter: Record<string, any>, body: string): Record<string, any> {
  const astro: Record<string, any> = {};

  astro.title = frontmatter.title || extractTitleFromH1(body) || 'Untitled';

  if (frontmatter.date) {
    astro.date = formatDate(frontmatter.date);
  } else {
    astro.date = new Date().toISOString().split('T')[0];
  }

  astro.description = frontmatter.description || extractDescription(body) || '';
  astro.draft = frontmatter.draft ?? false;

  if (frontmatter.author) {
    astro.author = frontmatter.author;
  }

  return astro;
}

// Parse multipart form data for file uploads
async function parseMultipartFormData(req: Request): Promise<{ fields: Record<string, string>; files: Array<{ name: string; filename: string; data: Buffer }> }> {
  const contentType = req.headers.get('content-type') || '';
  if (!contentType.includes('multipart/form-data')) {
    throw new Error('Expected multipart/form-data');
  }

  const boundary = contentType.split('boundary=')[1];
  if (!boundary) {
    throw new Error('No boundary in multipart/form-data');
  }

  const body = await req.arrayBuffer();
  const decoder = new TextDecoder();
  const data = new Uint8Array(body);

  const fields: Record<string, string> = {};
  const files: Array<{ name: string; filename: string; data: Buffer }> = [];

  const boundaryBytes = new TextEncoder().encode('--' + boundary);
  let start = 0;

  while (true) {
    const boundaryIdx = findBoundary(data, boundaryBytes, start);
    if (boundaryIdx === -1) break;

    const nextBoundaryIdx = findBoundary(data, boundaryBytes, boundaryIdx + boundaryBytes.length);
    if (nextBoundaryIdx === -1) break;

    const part = data.slice(boundaryIdx + boundaryBytes.length, nextBoundaryIdx);
    const partStr = decoder.decode(part);

    const headerEndIdx = partStr.indexOf('\r\n\r\n');
    if (headerEndIdx === -1) continue;

    const headers = partStr.slice(0, headerEndIdx);
    const content = part.slice(headerEndIdx + 4, part.length - 2); // Remove trailing \r\n
    const nameMatch = headers.match(/name="([^"]+)"/);
    const filenameMatch = headers.match(/filename="([^"]+)"/);

    if (filenameMatch && nameMatch) {
      files.push({
        name: nameMatch[1],
        filename: filenameMatch[1],
        data: Buffer.from(content)
      });
    } else if (nameMatch) {
      const value = decoder.decode(content);
      fields[nameMatch[1]] = value;
    }

    start = nextBoundaryIdx;
  }

  return { fields, files };
}

function findBoundary(data: Uint8Array, boundary: Uint8Array, start: number): number {
  for (let i = start; i <= data.length - boundary.length; i++) {
    let found = true;
    for (let j = 0; j < boundary.length; j++) {
      if (data[i + j] !== boundary[j]) {
        found = false;
        break;
      }
    }
    if (found) return i;
  }
  return -1;
}

// Convert endpoint - transforms markdown, returns image list
app.post('/convert', async (c) => {
  try {
    const { markdown, slug } = await c.req.json();

    if (!markdown) {
      return c.json({ success: false, error: 'No markdown provided' }, 400);
    }

    const { frontmatter: obsidianFrontmatter, body } = extractFrontmatter(markdown);
    const astroFrontmatter = buildAstroFrontmatter(obsidianFrontmatter, body);
    const transformedBody = transformBody(body);

    const images = parseImages(body);
    const imageFilenames = images.map(img => img.filename);

    const frontmatterYaml = YAML.stringify(astroFrontmatter).trim();
    const fullContent = `---\n${frontmatterYaml}\n---\n\n${transformedBody}`;

    const suggestedSlug = slug || generateSlug(astroFrontmatter.title);

    const result: ConversionResult = {
      success: true,
      output: {
        frontmatter: `---\n${frontmatterYaml}\n---`,
        body: transformedBody,
        fullContent
      },
      images: {
        found: imageFilenames,
        missing: []
      },
      suggestedSlug,
      writePath: path.join(WRITING_DIR, `${suggestedSlug}.md`)
    };

    return c.json(result);
  } catch (err) {
    return c.json({ success: false, error: (err as Error).message }, 500);
  }
});

// Upload images endpoint - receives files via multipart/form-data
app.post('/upload-images', async (c) => {
  try {
    const { files } = await parseMultipartFormData(c.req.raw);

    if (files.length === 0) {
      return c.json({ success: false, error: 'No files uploaded' }, 400);
    }

    await fs.mkdir(PUBLIC_IMAGES, { recursive: true });

    const uploaded: string[] = [];
    const errors: string[] = [];

    for (const file of files) {
      const destPath = path.join(PUBLIC_IMAGES, file.filename);

      try {
        await fs.writeFile(destPath, file.data);
        uploaded.push(`/images/${file.filename}`);
      } catch (err) {
        errors.push(`Failed to save ${file.filename}: ${(err as Error).message}`);
      }
    }

    return c.json({
      success: true,
      migrated: uploaded.length,
      errors,
      paths: uploaded
    });
  } catch (err) {
    return c.json({ success: false, error: (err as Error).message }, 500);
  }
});

// Write endpoint
app.post('/write', async (c) => {
  try {
    const { content, slug } = await c.req.json();

    if (!content || !slug) {
      return c.json({ success: false, error: 'Missing content or slug' }, 400);
    }

    await fs.mkdir(WRITING_DIR, { recursive: true });

    const filePath = path.join(WRITING_DIR, `${slug}.md`);
    await fs.writeFile(filePath, content, 'utf-8');

    return c.json({
      success: true,
      path: filePath,
      message: `Written to ${filePath}`
    });
  } catch (err) {
    return c.json({ success: false, error: (err as Error).message }, 500);
  }
});

// Serve UI
app.get('/', async (c) => {
  const html = await fs.readFile(
    path.join(PROJECT_ROOT, 'tools', 'obsidian-converter', 'index.html'),
    'utf-8'
  );
  return c.html(html);
});

const port = 3333;
console.log(`Obsidian Converter running at http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port
});
