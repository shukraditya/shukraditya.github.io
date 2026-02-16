// Table of Contents active section highlighting
function initTOC() {
  const tocLinks = document.querySelectorAll('.toc-link');
  const headings = document.querySelectorAll('h1[id], h2[id], h3[id]');

  if (!tocLinks.length || !headings.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const headingsArray = Array.from(headings);
  let activeId: string | null = null;
  let lastClickedId: string | null = null;
  let clickTimeout: number | null = null;

  // Handle click events for smooth scroll
  tocLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = (e.currentTarget as HTMLAnchorElement).getAttribute('href');
      if (!href) return;

      const targetId = href.slice(1);
      const target = document.getElementById(targetId);

      if (target) {
        e.preventDefault();

        // Track which section was clicked and set it active immediately
        lastClickedId = targetId;
        activeId = targetId;
        updateActiveLink(activeId);

        // Clear any existing timeout
        if (clickTimeout) window.clearTimeout(clickTimeout);

        // Reset lastClickedId after scroll animation completes
        clickTimeout = window.setTimeout(() => {
          lastClickedId = null;
        }, prefersReducedMotion ? 100 : 1000);

        // Calculate scroll position to center the heading in viewport
        const navHeight = 52;
        const targetRect = target.getBoundingClientRect();
        const targetTop = targetRect.top + window.scrollY;
        const viewportHeight = window.innerHeight;
        const headingHeight = targetRect.height;

        // Center the heading in the viewport, accounting for navbar
        const scrollTo = targetTop - navHeight - (viewportHeight - navHeight - headingHeight) / 2;

        window.scrollTo({
          top: Math.max(0, scrollTo),
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
        });

        // Update URL hash without jumping
        history.pushState(null, '', href);
      }
    });
  });

  // IntersectionObserver to highlight active section during manual scroll
  const observerOptions = {
    rootMargin: '-10% 0px -60% 0px',
    threshold: 0,
  };

  const observer = new IntersectionObserver((entries) => {
    // Find all intersecting entries and sort by DOM position
    const intersecting = entries
      .filter((e) => e.isIntersecting)
      .sort((a, b) => {
        return headingsArray.indexOf(a.target) - headingsArray.indexOf(b.target);
      });

    if (intersecting.length > 0) {
      const newActiveId = intersecting[0].target.id;

      // If we just clicked a link, only update if this is the clicked section
      // This prevents the highlight from jumping to the next section
      if (lastClickedId && newActiveId !== lastClickedId) {
        return;
      }

      if (newActiveId !== activeId) {
        activeId = newActiveId;
        updateActiveLink(activeId);
      }
    }
  }, observerOptions);

  headings.forEach((heading) => observer.observe(heading));

  function updateActiveLink(id: string) {
    tocLinks.forEach((link) => {
      const isActive = link.getAttribute('data-slug') === id;
      link.classList.toggle('text-accent', isActive);
      link.classList.toggle('font-medium', isActive);
      link.classList.toggle('text-secondary', !isActive);
    });
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTOC);
} else {
  initTOC();
}
