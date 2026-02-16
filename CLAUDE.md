[FORMAT]|docs=pipe-delimited-index,no-spaces
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
|nav-logo=bordered-square(w-8-h-8),initial-letter-S,hover-accent
|nav-links=centered-absolute,uppercase-tracking-wider,active-state-font-medium
|theme-toggle=data-theme-attribute,localStorage-persist,system-preference-fallback
|theme-toggle-icons=sun+moon-svg,hidden-class-swap,1.5px-stroke
|writing-list=divide-y-border,hover-bg-accent/5,title+date+description
|writing-list-date=tabular-nums,shrink-0,responsive-flex-col-sm:flex-row
|footer=copyright-left-icons-right,flex-justify-between,text-secondary
|social-icons=outline-style(1.5px-stroke),hover-fill,configurable-size-prop
|toc-sidebar=sticky(top-100px),max-h-[calc(100vh-140px)],w-60,hidden-mobile(lg:block)
|toc-nested=pl-4-for-H3,space-y-1,hover:text-accent
|toc-active=text-accent+font-medium,instant-no-transition
|mobile-contents-drawer=lg:hidden,toggle-button,collapsible-panel,chevron-rotation
|garden-graph=canvas-340x380,force-simulation,zoom-pan-interactive
|backlinks-sidebar=hidden-mobile(lg:block),space-y-2,title+date-structure
|tag-styling=bg-accent/5,text-secondary,rounded-sm,px-2-py-1,hashtag-prefix

[CONTENT]|collection=writing,schema=title+date+description+draft+author+tags
|format=Markdown/MDX,math=KaTeX(delimiters=$$,$,\[,\(),images=/images/,obsidian-wikilinks-supported
|sorting=date-desc,drafts-filtered-by-default
|wiki-links=remark-plugin-handles-[[slug]]+[[slug|display]],css-dotted-underline,broken-links-red
|reading-time=200-wpm,Math.ceil,content.split(/\s+/).length
|date-formatting=Intl.DateTimeFormat(en-US,year-numeric-month-long-day-numeric)

[LEARNINGS]|astro-content-collections=type-safe-markdown-with-Zod,schema-in-config.ts
|tailwind-typography=custom-font-sizes(display,hero,body,label,meta),max-w-content(680px)
|tailwind-colors=CSS-custom-properties-mapped(paper,card,border,ink,secondary,accent)
|e-ink-ux=no-motion-respects-prefers-reduced-motion,flash-simulates-ink-refresh
|e-ink-flash-overlay=fixed-inset-0,50ms-animation,active-class-triggered-on-load
|astro-view-transitions=not-used-here-prefer-custom-flash-effect
|toc-scroll-to-center=calc:targetTop-navHeight-(viewportHeight-navHeight-headingHeight)/2
|toc-highlight-persistence=track-lastClickedId,set-active-immediately,observer-ignores-others-during-scroll
|toc-observer-pattern=IntersectionObserver(-10%-0px--60%),sort-by-DOM-position
|garden-graph-physics=center-gravity(0.001),repulsion(1000),spring-length(80),damping(0.92)
|garden-graph-zoom=threshold-1.2-for-labels,min-0.5-max-3,scroll-wheel+buttons
|graph-positioning=fixed-position,calc-75%-center-in-right-space,align-with-content-top
|image-assets=public/images,reference-as-/images/,url-encode-spaces
|markdown-lists=prose-class-needs-explicit-list-style-type-disc-decimal
|prose-styling=justified-text,hyphens-auto,blockquote-left-border,space-y-paragraphs
|KaTeX-setup=CDN-loaded,auto-render,delimiters-configured,inline+display-modes
|theme-init=inline-script-prevent-flash,localStorage>system-preference>light-default
|SocialIcons-component=optional-size-prop,default-w-5-h-5,footer-uses-w-4-h-4
|footer-layout=copyright-left(2026,shukraditya),social-icons-right,vertical-center
|nav-component=logo-left,links-centered-absolutely,theme-toggle-right
|about-page-layout=grid-[200px_1fr],profile-image-left,experience-education-tables
|writing-post-layout=max-w-[1200px],flex-gap-12,article+sidebar,backlinks-below-toc
