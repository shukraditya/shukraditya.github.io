// Table of Contents active section highlighting
function initTOC() {
  const tocLinks = document.querySelectorAll('.toc-link');
  const headings = document.querySelectorAll('h2[id], h3[id]');

  if (!tocLinks.length || !headings.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Handle click events for smooth scroll
  tocLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = (e.currentTarget as HTMLAnchorElement).getAttribute('href');
      if (!href) return;

      const targetId = href.slice(1);
      const target = document.getElementById(targetId);

      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
        });

        // Update URL hash without jumping
        history.pushState(null, '', href);
      }
    });
  });

  // IntersectionObserver to highlight active section
  const observerOptions = {
    rootMargin: '-100px 0px -66% 0px',
    threshold: 0,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Remove active state from all links
        tocLinks.forEach((link) => {
          link.classList.remove('text-accent', 'font-medium');
          link.classList.add('text-secondary');
        });

        // Add active state to current link
        const activeLink = document.querySelector(
          `.toc-link[data-slug="${entry.target.id}"]`
        );
        if (activeLink) {
          activeLink.classList.remove('text-secondary');
          activeLink.classList.add('text-accent', 'font-medium');
        }
      }
    });
  }, observerOptions);

  headings.forEach((heading) => observer.observe(heading));
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTOC);
} else {
  initTOC();
}
