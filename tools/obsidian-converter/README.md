# Obsidian to Astro Converter

Local HTTP server tool that converts Obsidian markdown to Astro blog format, with image migration support.

## Usage

```bash
cd tools/obsidian-converter
bun install
bun run dev          # Starts on http://localhost:3333
```

Or with Node:

```bash
npm install
npx tsx server.ts
```

## Features

- **Frontmatter Mapping**: Converts Obsidian frontmatter to Astro-compatible format
  - Extracts title from first H1 if not in frontmatter
  - Generates description from first paragraph
  - Strips Obsidian-only fields (aliases, tags)
- **Image Migration**: Copies images from Obsidian vault to `public/images/`
  - Supports wiki-links: `![[image.png]]`
  - Supports standard markdown: `![alt](./image.png)`
  - Converts all to `/images/` paths
- **Two-step workflow**: Preview conversion, then write to blog

## API

### POST /convert

```json
{
  "markdown": "string",
  "imageBasePath": "/path/to/vault/Attachments/",
  "slug": "optional-slug"
}
```

### POST /write

```json
{
  "content": "full markdown content",
  "slug": "post-slug",
  "imageBasePath": "/path/to/vault/Attachments/"
}
```

## Web UI

Open http://localhost:3333 for the web interface with:
- Input panel (left): Markdown + settings
- Output panel (right): Preview + copy/write buttons
