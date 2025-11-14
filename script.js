document.addEventListener("DOMContentLoaded", function() {
    
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');

    // Toggle mobile menu
    menuToggle.addEventListener('click', function() {
        mobileNav.style.display = mobileNav.style.display === 'flex' ? 'none' : 'flex';
        
        // Bonus: Change menu icon to "X"
        const icon = menuToggle.querySelector('i');
        if (icon.getAttribute('data-feather') === 'menu') {
            icon.setAttribute('data-feather', 'x');
        } else {
            icon.setAttribute('data-feather', 'menu');
        }
        feather.replace(); // Re-render the icon
    });

    // Hide mobile menu when a link is clicked
    const mobileLinks = document.querySelectorAll('.mobile-link');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileNav.style.display = 'none';
            // Reset icon to 'menu'
            const icon = menuToggle.querySelector('i');
            icon.setAttribute('data-feather', 'menu');
            feather.replace();
        });
    });

});