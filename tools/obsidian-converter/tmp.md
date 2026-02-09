# Obsidian-to-Astro Converter - Implementation Progress

## Status: IMPLEMENTED (pending testing)

## Files Created

```
tools/obsidian-converter/
├── server.ts          # Bun/Node HTTP server with Hono
├── package.json       # Dependencies: hono, @hono/node-server, yaml, tsx
├── index.html         # Web UI (e-ink inspired design)
└── README.md          # Usage instructions
```

## What Works

- [x] Basic file structure created
- [x] Server runs on http://localhost:3333
- [x] Web UI loads correctly
- [x] Dependencies installed (npm)

## Features Implemented

### API Endpoints
- `GET /` - Serves web UI
- `POST /convert` - Converts Obsidian markdown to Astro format
- `POST /write` - Writes converted file to `src/content/writing/`

### Frontmatter Mapping
| Obsidian | Astro | Handling |
|----------|-------|----------|
| title | title | Pass through or extract from H1 |
| date | date | Convert to YYYY-MM-DD |
| description | description | Pass through or extract from first paragraph |
| draft | draft | Pass through (default: false) |
| author | author | Pass through (optional) |
| aliases, tags | - | Stripped (Obsidian-only) |

### Image Transformations
- `![[image.png]]` → `![image](/images/image.png)`
- `![alt](./path/image.png)` → `![alt](/images/image.png)`
- External URLs preserved as-is

## Pending Verification

- [ ] Test `/convert` endpoint with real Obsidian markdown
- [ ] Test image migration with actual image files
- [ ] Test `/write` endpoint creates file correctly
- [ ] Verify frontmatter YAML formatting (may need newline fix)

## Known Issues

1. **Frontmatter formatting**: May need newline before closing `---` - check line 245 in server.ts
   ```typescript
   // Current:
   const fullContent = `---\n${frontmatterYaml}\n---\n\n${transformedBody}`;
   // Verify this produces correct YAML frontmatter
   ```

## How to Resume

```bash
cd /Users/user/dev/personal/shukraditya.github.io/tools/obsidian-converter
npm install  # if needed
npx tsx server.ts
```

Then open http://localhost:3333

## Test Command

```bash
curl -X POST http://localhost:3333/convert \
  -H "Content-Type: application/json" \
  -d '{
    "markdown": "---\ntitle: Test\ndate: 2024-01-15\n---\n\n# Test Post\n\nDescription here.\n\n![[image.png]]",
    "imageBasePath": "/path/to/obsidian/Attachments"
  }'
```
