// Navigation Component
// This creates a reusable navigation header that can be used across all pages

function createNavigation(currentPage = '') {
    // Determine the base path based on current location
    const pathname = window.location.pathname;
    const isRoot = pathname === '/' || 
                   pathname === '/index.html' || 
                   pathname.endsWith('/index.html') ||
                   (!pathname.includes('/pages/') && pathname.split('/').filter(p => p).length <= 1);
    
    const navItems = [
        { name: 'Home', path: isRoot ? 'index.html' : '../index.html' },
        { name: 'About', path: isRoot ? 'pages/about.html' : 'about.html' },
        { name: 'Experience', path: isRoot ? 'pages/experience.html' : 'experience.html' },
        { name: 'Projects', path: isRoot ? 'pages/projects.html' : 'projects.html' },
        { name: 'Skills', path: isRoot ? 'pages/skills.html' : 'skills.html' },
        { name: 'Contact', path: isRoot ? 'pages/contact.html' : 'contact.html' },
        { name: 'Blogs', path: isRoot ? 'pages/blogs.html' : 'blogs.html' }
    ];

    const logoLink = isRoot ? 'index.html' : '../index.html';
    
    return `
        <nav class="navbar">
            <div class="nav-container">
                <div class="nav-logo"><a href="${logoLink}" style="text-decoration: none; color: inherit;">shukraditya</a></div>
                <ul class="nav-menu">
                    ${navItems.map(item => 
                        `<li><a href="${item.path}" class="nav-link ${currentPage === item.name.toLowerCase() ? 'active' : ''}">${item.name}</a></li>`
                    ).join('')}
                </ul>
                <div class="hamburger">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </nav>
    `;
}

// Footer Component
function createFooter() {
    return `
        <footer class="footer">
            <div class="container">
                <p>2025 \\ shukraditya (ﾉ◕ヮ◕)ﾉ*:・ﾟ✧</p>
            </div>
        </footer>
    `;
}

// Initialize navigation and footer when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Get current page name from the page title or data attribute
    const pageTitle = document.title.toLowerCase();
    let currentPage = '';
    
    if (pageTitle.includes('about')) currentPage = 'about';
    else if (pageTitle.includes('experience')) currentPage = 'experience';
    else if (pageTitle.includes('project')) currentPage = 'projects';
    else if (pageTitle.includes('skill')) currentPage = 'skills';
    else if (pageTitle.includes('contact')) currentPage = 'contact';
    else if (pageTitle.includes('blog')) currentPage = 'blogs';
    else currentPage = 'home';
    
    // Find or create nav placeholder
    const navPlaceholder = document.getElementById('nav-placeholder');
    if (navPlaceholder) {
        navPlaceholder.outerHTML = createNavigation(currentPage);
    }
    
    // Find or create footer placeholder
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        footerPlaceholder.outerHTML = createFooter();
    }
    
    // Re-initialize mobile menu after injecting navigation
    initMobileMenu();
});

// Mobile menu initialization (extracted from script.js)
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        // Remove existing listeners by cloning
        const newHamburger = hamburger.cloneNode(true);
        const newNavMenu = navMenu.cloneNode(true);
        hamburger.parentNode.replaceChild(newHamburger, hamburger);
        navMenu.parentNode.replaceChild(newNavMenu, navMenu);
        
        const newHamburgerEl = document.querySelector('.hamburger');
        const newNavMenuEl = document.querySelector('.nav-menu');
        
        newHamburgerEl.addEventListener('click', () => {
            newNavMenuEl.classList.toggle('active');
            newHamburgerEl.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!newHamburgerEl.contains(e.target) && !newNavMenuEl.contains(e.target)) {
                newNavMenuEl.classList.remove('active');
                newHamburgerEl.classList.remove('active');
            }
        });

        // Close menu when clicking a nav link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                newNavMenuEl.classList.remove('active');
                newHamburgerEl.classList.remove('active');
            });
        });
    }
}

