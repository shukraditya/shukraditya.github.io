[FORMAT]|docs=pipe-compressed-index,no-spaces
|RULE:use-pipe-delimited-format-matching-global-CLAUDE.md

[PROJECT]|name=kindle-oasis-blog,type=static-site,stack=Astro+Tailwind
|purpose=personal-writing-platform,design=e-ink-inspired,minimal-distraction
|deploy=static-HTML,CDN-ready,no-server-required

[DESIGN-SYSTEM]|inspiration=Kindle-Paperwhite+reMarkable,aesthetic=academic-clarity
|colors=paper(#F9F9F9),card(#F5F5F5),ink(#2D2D2D),accent(#0066CC)
|dark-mode=true-black(#000000),pure-inversion
|typography=Charter(body,1.1875rem,1.7-line),Libre-Baskerville(display),SF-Mono(code)
|spacing=52px-nav,800px-content-max,generous-vertical-padding(2.5rem)

[DESIGN-RULES]|transitions=instant(0ms),no-animations,e-ink-flash-on-nav(50ms)
|images=grayscale(20%)-contrast(1.05)-brightness(1.05)
|focus=3px-outline-high-contrast,a11y-first
|text=justified+hyphens,tabular-nums-for-dates,selection-inverted

[COMPONENT-PATTERNS]|nav=fixed-52px,glassmorphism-backdrop(80%-blur),hairline-border
|writing-list=active-state(bg-accent/5),hover=same,no-transform
|theme-toggle=instant-toggle,localStorage-persist,system-preference-default
|social-icons=outline-style(1.5px-stroke),hover-fill

[CONTENT]|collection=writing,schema=title+date+description+draft
|format=Markdown/MDX,math=KaTeX-supported(delimiters=$$,\[,\()
|sorting=date-desc,drafts-filtered-by-default

[LEARNINGS]|astro-content-collections=type-safe-markdown-with-Zod
|tailwind-responsive=mobile-first(sm:prefix),sensible-breakpoints
|e-ink-ux=no-motion-respects-prefers-reduced-motion,flash-simulates-ink-refresh
|astro-view-transitions=not-used-here-prefer-custom-flash-effect
|toc-sidebar=sticky(right,100px-offset),240px-width,hidden-on-mobile(lg:block),nested-H2/H3-with-indent
|toc-active-highlight=IntersectionObserver(-100px-0px--66%),instant-no-transition
|header-metadata=date(tabular-nums)·readtime·author(italic-accent),backlink-with-chevron-above-title
|logo-placeholder=top-left-nav,bordered-square(w-8-h-8),hover-accent-state,initial-letter-S
|content-schema=writing-collection,author-field-optional,frontmatter-with-Zod
