Theme B: The Kindle Oasis
Concept: Electronic ink display. Light mode = Paperwhite glow. Dark mode = Night reading (inverted E Ink).
Color System
css
Copy
:root {
  /* Light: Paperwhite */
  --paper: #F9F9F9;           /* Cool grey-white */
  --text: #2D2D2D;            /* Charcoal */
  --text-muted: #6B6B6B;
  --border: #E4E4E4;
  --accent: #0066CC;          /* Hyperlink blue */
  
  /* Dark: Night Mode (E Ink inverted) */
  --dark-bg: #000000;         /* True black */
  --dark-surface: #111111;    /* Card lift */
  --dark-text: #D1D1D1;       /* Grey-white (easier than pure white) */
  --dark-dim: #888888;
  --dark-accent: #5C9DFF;     /* Soft blue */
}
Typography
Body: Charter, Georgia, serif (optimized for screens)
UI/Tables: SF Pro Text or Inter system stack
Scale identical to Theme A, but --text-body: 1.1875rem (slightly larger for e-ink legibility)
Letter-spacing: 0.01em on body text (air between letters)
Cross-Page Components
Navigation
Fixed top bar with backdrop-filter: blur(20px)
Background: rgba(249,249,249,0.8) (light) / rgba(0,0,0,0.7) (dark)
Dividers
Light: linear-gradient(to right, transparent, #D1D1D1, transparent)
Dark: linear-gradient(to right, transparent, #333, transparent)
Home Specifics
Hero name: Charter Bold, not italic, tight leading (1.1)
No drop caps. No paper texture. Flat, matte finish.
Social icons: Outline style (1px stroke), fill on hover
Writing Index
List items: padding: 2.5rem 0 (generous spacing for e-ink "breath")
Active/Hover state: Background rgba(0,102,204,0.05) (light) / rgba(92,157,255,0.1) (dark), full bleed width
About Tables
Font: SF Pro Text, font-size: 15px
Row separator: 0.5px solid border color (hairline)
Year column aligned right with font-variant-numeric: tabular-nums
Theme C: The Engineering Notebook
Concept: Active lab research. Light mode = Moleskine dot-grid. Dark mode = Blackboard/chalkboard at night.
Color System
css
Copy
:root {
  /* Light: Engineering Paper */
  --paper: #E8E6E1;
  --grid: #D4D2CC;            /* Dot grid */
  --margin: #E5B8B8;          /* Red margin line (faded) */
  --ink: #1A1A1A;
  --pencil: #4A4A4A;
  --blueprint: #2E5C8A;       /* Technical blue for links */
  --highlighter: rgba(255, 230, 128, 0.4);
  
  /* Dark: Blackboard */
  --dark-bg: #0D0D0D;         /* Chalkboard black */
  --dark-grid: #1F1F1F;       /* Subtle grid */
  --dark-chalk: #E0E0E0;      /* White chalk */
  --dark-dim: #707070;        /* Grey chalk */
  --dark-accent: #4DABF7;     /* Cyan/blue chalk */
  --dark-sticky: #2D2D1F;     /* Dark yellow post-it */
}
Layout Specifics
Global Background
Light: CSS radial dot grid background-image: radial-gradient(circle, var(--grid) 1px, transparent 1px), background-size: 20px 20px
Dark: Subtle crosshatch linear-gradient(0deg, transparent 24%, var(--dark-grid) 25%, var(--dark-grid) 26%, transparent 27%, transparent 74%, var(--dark-grid) 75%, var(--dark-grid) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, var(--dark-grid) 25%, var(--dark-grid) 26%, transparent 27%, transparent 74%, var(--dark-grid) 75%, var(--dark-grid) 76%, transparent 77%, transparent), background-size: 40px 40px
Page-by-Page Specs
Home (Dark Mode)
Name: JetBrains Mono or IBM Plex Mono (medium weight, non-italic) to mimic technical labeling
Quote: Enclosed in " characters rendered in --dark-accent (chalk color), actual quote text in --dark-chalk
Social icons: Technical line icons, opacity: 0.7 default, 1.0 on hover
Recent items: "Taped" look with slight random rotation (transform: rotate(-0.5deg)), background: var(--dark-surface), box-shadow: 2px 2px 0 rgba(255,255,255,0.05)
Writing Index
Header "Writing": Underlined with border-bottom: 2px solid var(--dark-accent)
List items: Left border 2px solid transparent, hover/active fills border with --dark-accent
Dates: Monospaced font for column alignment
About
Photo: High contrast B&W with border: 2px solid var(--dark-chalk)
Tables: Org names in --dark-accent (cyan chalk), details in --dark-dim
Section headers: "Handwritten" using Caveat or Permanent Marker webfont at font-size: 2rem, rotated -1deg
Implementation: Mode Toggle Strategy
JavaScript
Copy
// Initialize theme
const theme = localStorage.getItem('theme') || 
              (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', theme);

// Toggle button
<button aria-label="Toggle theme" onclick="toggleTheme()">
  <span class="sun">{sun-icon}</span>
  <span class="moon">{moon-icon}</span>
</button>

// CSS
:root, [data-theme="light"] { /* light vars */ }
[data-theme="dark"] { /* dark vars */ }

// OR use light-dark() CSS function (modern browsers)
color: light-dark(var(--ink), var(--dark-ink));
Storage: Persist preference in localStorage. Respect prefers-color-scheme on first visit.