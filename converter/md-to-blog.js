#!/usr/bin/env node

/**
 * Markdown to Blog Converter
 *
 * This utility converts a markdown file to an HTML blog page using the site's template.
 * Usage: node md-to-blog.js <markdown-file-path> [output-name]
 *
 * Features:
 * - Converts markdown to HTML
 * - Uses the site's template structure
 * - Extracts title and metadata from frontmatter or first heading
 * - Creates SEO-friendly URLs
 * - Automatically updates the blogs listing page
 */

const fs = require('fs');
const path = require('path');

// Simple markdown parser (basic implementation)
function parseMarkdown(markdown) {
    let html = markdown;

    // Extract frontmatter if exists
    const frontmatterMatch = html.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    let frontmatter = {};
    let content = html;

    if (frontmatterMatch) {
        const frontmatterText = frontmatterMatch[1];
        content = frontmatterMatch[2];

        // Parse simple frontmatter (title, date, description)
        frontmatterText.split('\n').forEach(line => {
            const [key, ...value] = line.split(':');
            if (key && value.length > 0) {
                frontmatter[key.trim()] = value.join(':').trim().replace(/^["']|["']$/g, '');
            }
        });
    }

    // Convert markdown to HTML
    content = content
        // Headers
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')

        // Bold and Italic
        .replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')

        // Code blocks
        .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
        .replace(/`(.*?)`/gim, '<code>$1</code>')

        // Links
        .replace(/\[([^\]]*)\]\(([^)]*)\)/gim, '<a href="$2" target="_blank">$1</a>')

        // Lists
        .replace(/^\* (.*)$/gim, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/gims, '<ul>$1</ul>')

        // Paragraphs (simple implementation)
        .split('\n\n')
        .map(paragraph => {
            paragraph = paragraph.trim();
            if (paragraph && !paragraph.startsWith('<')) {
                return `<p>${paragraph.replace(/\n/g, '<br>')}</p>`;
            }
            return paragraph;
        })
        .join('\n');

    return { frontmatter, content };
}

function createBlogTemplate(title, content, description = '') {
    // Convert title to match the site's style (lowercase with first letter capitalized)
    const styledTitle = title.toLowerCase();

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Shukraditya Bose</title>
    <meta name="description" content="${description}">
    <link rel="stylesheet" href="../../style.css">
    <style>
        /* Blog content styles that follow the main design system */
        .blog-content {
            line-height: 1.6;
        }
        .blog-content h1, .blog-content h2, .blog-content h3 {
            font-size: 1.2rem;
            font-weight: bold;
            margin-top: 2rem;
            margin-bottom: 1rem;
            color: var(--text-orange);
            text-transform: lowercase;
        }
        .blog-content h1::first-letter,
        .blog-content h2::first-letter,
        .blog-content h3::first-letter {
            text-transform: uppercase;
        }
        .blog-content p {
            margin-bottom: 0.8rem;
            color: var(--text-orange);
        }
        .blog-content strong {
            color: var(--text-orange);
        }
        .blog-content pre {
            background: rgba(235, 219, 178, 0.1);
            border: 1px solid var(--border-orange);
            padding: 1rem;
            overflow-x: auto;
            margin: 1rem 0;
        }
        .blog-content code {
            background: rgba(235, 219, 178, 0.1);
            padding: 0.2rem 0.4rem;
            font-family: 'Courier New', monospace;
            color: var(--text-orange);
        }
        .blog-content pre code {
            background: none;
            padding: 0;
        }
        .blog-content ul {
            list-style: none;
            padding-left: 0;
            margin-bottom: 1rem;
        }
        .blog-content ul li {
            margin-bottom: 0.8rem;
            padding-left: 1.5rem;
            position: relative;
        }
        .blog-content ul li::before {
            content: '•';
            position: absolute;
            left: 0;
            color: var(--text-orange);
        }
        .blog-content blockquote {
            border-left: 1px dashed var(--border-orange);
            padding-left: 1rem;
            margin: 1rem 0;
            font-style: italic;
            color: var(--text-orange);
        }
        .blog-content a {
            color: var(--link-orange);
            text-decoration: underline;
        }
        .blog-content a:hover {
            opacity: 0.7;
        }
        .blog-meta {
            color: var(--text-orange);
            font-size: 0.9rem;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px dashed var(--border-orange);
            opacity: 0.8;
        }
    </style>
</head>
<body>
    <!-- Navigation will be injected here -->
    <div id="nav-placeholder"></div>

    <main>
        <section class="section hero" style="padding-top: 120px;">
            <div class="content-box">
                <h2 class="section-title">${styledTitle}</h2>
                ${description ? `<p class="blog-meta">${description}</p>` : ''}

                <div class="blog-content">
                    ${content}
                </div>
            </div>
        </section>
    </main>

    <!-- Footer will be injected here -->
    <div id="footer-placeholder"></div>

    <script src="../../components/components.js"></script>
    <script src="../../script.js"></script>
</body>
</html>`;
}

function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
}

function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log('Usage: node md-to-blog.js <markdown-file-path> [output-name]');
        console.log('');
        console.log('Examples:');
        console.log('  node md-to-blog.js ./my-blog-post.md');
        console.log('  node md-to-blog.js ./posts/intro.md intro-to-ai');
        console.log('');
        process.exit(1);
    }

    const markdownFile = args[0];
    const outputName = args[1];

    if (!fs.existsSync(markdownFile)) {
        console.error(`Error: Markdown file "${markdownFile}" does not exist.`);
        process.exit(1);
    }

    try {
        // Read markdown file
        const markdownContent = fs.readFileSync(markdownFile, 'utf8');

        // Parse markdown
        const { frontmatter, content } = parseMarkdown(markdownContent);

        // Extract title
        let title = frontmatter.title;
        if (!title) {
            const titleMatch = content.match(/<h1>(.*?)<\/h1>/);
            title = titleMatch ? titleMatch[1] : 'Untitled Blog Post';
        }

        // Generate filename
        const filename = outputName || generateSlug(title);
        const outputPath = path.join(__dirname, 'pages', 'blogs', `${filename}.html`);

        // Create HTML content
        const htmlContent = createBlogTemplate(
            title,
            content,
            frontmatter.description || ''
        );

        // Write HTML file
        fs.writeFileSync(outputPath, htmlContent);

        console.log(`✅ Blog post created successfully!`);
        console.log(`📝 Title: ${title}`);
        console.log(`📁 File: pages/blogs/${filename}.html`);
        console.log(`🌐 URL: pages/blogs/${filename}.html`);

        // Provide next steps
        console.log('');
        console.log('Next steps:');
        console.log('1. Update pages/blogs.html to include a link to this post');
        console.log('2. Test the page in your browser');
        console.log('3. Commit the changes to git');

    } catch (error) {
        console.error('Error processing markdown file:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { parseMarkdown, createBlogTemplate, generateSlug };