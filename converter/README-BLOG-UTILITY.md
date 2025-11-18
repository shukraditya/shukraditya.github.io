# Blog Utility for Shukraditya's Portfolio

This utility helps convert Markdown files into HTML blog posts that integrate seamlessly with the existing portfolio website structure.

## Features

- ✅ Convert Markdown to HTML with proper styling
- ✅ Support for frontmatter metadata (title, description, date)
- ✅ Automatic slug generation from titles
- ✅ SEO-friendly HTML structure
- ✅ **Fully consistent styling** with the portfolio's design system
- ✅ Uses CSS variables from main `style.css` for colors and fonts
- ✅ Matches typography, spacing, and visual elements
- ✅ Support for code blocks, lists, links, and formatting
- ✅ Custom bullet points and borders matching the main theme

## Quick Start

### 1. Create a Markdown File

Create your blog post in Markdown format. You can include frontmatter for metadata:

```markdown
---
title: My Awesome Blog Post
description: A brief description of what this post is about
date: 2024-11-19
---

# My Awesome Blog Post

Your content goes here...

## Section Header

- List item 1
- List item 2

### Code Example

```python
def hello_world():
    print("Hello, World!")
```

**Bold text** and *italic text* are supported.

Links work too: [Visit GitHub](https://github.com)
```

### 2. Convert to HTML

Run the conversion utility:

```bash
# Basic usage - auto-generates filename from title
node md-to-blog.js your-blog-post.md

# Custom filename
node md-to-blog.js your-blog-post.md custom-filename

# Examples
node md-to-blog.js sample-blog.md
node md-to-blog.js posts/intro-to-ai.md intro-to-ai
```

### 3. Update Blog Listing

After creating a blog post, manually add it to `pages/blogs.html`:

```html
<div class="blog-card">
    <h3>Your Blog Title</h3>
    <div class="blog-meta">November 19, 2024</div>
    <div class="blog-description">
        Brief description of your blog post...
    </div>
    <a href="blogs/your-blog-filename.html" class="read-more">Read more →</a>
</div>
```

## File Structure

```
├── md-to-blog.js              # Main conversion utility
├── pages/
│   ├── blogs.html             # Blog listing page
│   └── blogs/                 # Individual blog posts
│       └── *.html            # Generated blog post files
├── sample-blog.md             # Example markdown file
└── README-BLOG-UTILITY.md     # This file
```

## Utility Script Details

### `md-to-blog.js`

The main utility script that handles:
- Markdown parsing and conversion
- HTML template generation
- File operations
- Slug generation

### Usage

```bash
node md-to-blog.js <markdown-file-path> [output-name]
```

**Parameters:**
- `markdown-file-path` (required): Path to your markdown file
- `output-name` (optional): Custom filename for the output (without .html extension)

**Output:**
- Creates HTML file in `pages/blogs/`
- Uses the portfolio's template structure
- Includes proper navigation and footer integration

## Supported Markdown Features

### Text Formatting
- **Bold**: `**text**` or `__text__`
- *Italic*: `*text*` or `_text_`
- ***Bold Italic***: `***text***`
- `Inline Code`: `code`

### Headers
```markdown
# H1 Header
## H2 Header
### H3 Header
```

### Lists
```markdown
* Unordered list item
* Another item

1. Ordered list item
2. Another item
```

### Code Blocks
```markdown
```python
def example():
    return "Hello World"
```
```

### Links
```markdown
[Link Text](https://example.com)
```

### Frontmatter
```markdown
---
title: Blog Post Title
description: SEO description
date: 2024-11-19
author: Your Name
---
```

## Generated HTML Structure

Each blog post uses this template structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>[Title] - Shukraditya Bose</title>
    <meta name="description" content="[Description]">
    <link rel="stylesheet" href="../../style.css">
    <!-- Blog-specific styles -->
</head>
<body>
    <!-- Navigation (injected by components.js) -->
    <div id="nav-placeholder"></div>

    <main>
        <!-- Hero section with title -->
        <!-- Content section with parsed markdown -->
    </main>

    <!-- Footer (injected by components.js) -->
    <div id="footer-placeholder"></div>

    <script src="../../components/components.js"></script>
    <script src="../../script.js"></script>
</body>
</html>
```

## Workflow Example

1. **Write your blog post** in Markdown:
   ```bash
   # Create a new markdown file
   touch my-new-post.md
   # Edit it with your content
   ```

2. **Convert to HTML**:
   ```bash
   node md-to-blog.js my-new-post.md
   ```

3. **Add to blog listing**:
   - Edit `pages/blogs.html`
   - Add a new blog card for your post

4. **Test and commit**:
   ```bash
   # Test in browser
   open pages/blogs/my-new-post.html

   # Commit changes
   git add .
   git commit -m "Add new blog post: My New Post"
   ```

## Design System Consistency

This utility ensures **complete visual consistency** with your portfolio's design system:

### Color Scheme
- Uses CSS variables from `style.css`: `--bg-dark`, `--text-orange`, `--border-orange`, `--link-orange`
- Background: `#282828` (dark theme)
- Text: `#ebcab2` (warm orange)
- Accents: `#ff8c42` (bright orange)
- Borders: `#ebdbb2` (light orange, dashed style)

### Typography
- Font family: `'Courier New', Courier, monospace` (matches main site)
- Headers use lowercase with first letter capitalized (matches `.section-title` style)
- Consistent line heights and spacing

### Layout Elements
- Uses `.content-box` with bordered container
- Custom bullet points (`•`) for lists (matches experience/projects pages)
- Dashed borders for separators
- Consistent hover effects (`opacity: 0.7`)

### Code Styling
- Code blocks with subtle background and border
- Inline code with consistent styling
- Proper syntax highlighting ready

## Customization

### Styling
Blog-specific styles are included in each generated HTML file and fully inherit from the main design system:
- `.blog-content` - Main content wrapper (follows `.content-box` patterns)
- `.blog-meta` - Date/metadata styling (matches site typography)
- Code block styling (consistent with site theme)
- Typography and spacing (matches `.section` and text styles)

### Template
Modify the `createBlogTemplate()` function in `md-to-blog.js` to change the HTML structure. The template already follows the site's component structure with navigation and footer injection.

### Markdown Parser
The utility includes a basic markdown parser that outputs HTML consistent with the site's style patterns. For advanced features, you could integrate a library like `marked` or `markdown-it`.

## Troubleshooting

### Common Issues

1. **File not found error**: Make sure the markdown file path is correct
2. **Permission denied**: Ensure the script is executable (`chmod +x md-to-blog.js`)
3. **Styling issues**: Check that the CSS paths are correct (`../../style.css`)

### Getting Help

```bash
# Show usage information
node md-to-blog.js
```

## Future Enhancements

Possible improvements for the utility:
- Automatic blog listing updates
- Image handling and optimization
- Tag/category system
- RSS feed generation
- Draft post support
- Batch processing of multiple markdown files

---

*Generated for Shukraditya Bose's Portfolio • November 2024*