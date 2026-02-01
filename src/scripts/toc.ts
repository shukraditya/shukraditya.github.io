// Table of Contents active section highlighting
function initTOC() {
  const tocLinks = document.querySelectorAll('.toc-link');
  const headings = document.querySelectorAll('h2[id], h3[id]');

  if (!tocLinks.length || !headings.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const headingsArray = Array.from(headings);
  let activeId: string | null = null;
  let isScrollingFromClick = false;
  let scrollTimeout: number | null = null;

  // Handle click events for smooth scroll
  tocLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = (e.currentTarget as HTMLAnchorElement).getAttribute('href');
      if (!href) return;

      const targetId = href.slice(1);
      const target = document.getElementById(targetId);

      if (target) {
        e.preventDefault();

        // Disable observer during programmatic scroll
        isScrollingFromClick = true;
        if (scrollTimeout) window.clearTimeout(scrollTimeout);

        // Set the clicked link as active immediately
        activeId = targetId;
        updateActiveLink(activeId);

        target.scrollIntoView({
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
        });

        // Update URL hash without jumping
        history.pushState(null, '', href);

        // Re-enable observer after scroll animation completes
        scrollTimeout = window.setTimeout(() => {
          isScrollingFromClick = false;
        }, prefersReducedMotion ? 0 : 800);
      }
    });
  });

  // IntersectionObserver to highlight active section
  const observerOptions = {
    rootMargin: '-10% 0px -60% 0px',
    threshold: 0,
  };

  const observer = new IntersectionObserver((entries) => {
    // Skip updates during programmatic scrolls
    if (isScrollingFromClick) return;

    // Find all intersecting entries and sort by DOM position
    const intersecting = entries
      .filter((e) => e.isIntersecting)
      .sort((a, b) => {
        return headingsArray.indexOf(a.target) - headingsArray.indexOf(b.target);
      });

    if (intersecting.length > 0) {
      const newActiveId = intersecting[0].target.id;
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
