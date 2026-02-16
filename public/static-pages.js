// Mobile menu functionality for static pages
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector(".menu-toggle");
    const navMenu = document.getElementById("navMenu");
    const closeMenu = document.querySelector(".close-menu");

    if (menuToggle && navMenu) {
        menuToggle.addEventListener("click", () => {
            navMenu.classList.toggle("active");
        });
    }

    if (closeMenu && navMenu) {
        closeMenu.addEventListener("click", () => {
            navMenu.classList.remove("active");
            const categoryItem = document.querySelector('.category');
            const employmentItem = document.querySelector('.Employment-Type');
            if (categoryItem) categoryItem.classList.remove('active');
            if (employmentItem) employmentItem.classList.remove('active');
        });
    }

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (navMenu && !e.target.closest('#navMenu') && !e.target.closest('.menu-toggle')) {
            navMenu.classList.remove('active');
            const categoryItem = document.querySelector('.category');
            const employmentItem = document.querySelector('.Employment-Type');
            if (categoryItem) categoryItem.classList.remove('active');
            if (employmentItem) employmentItem.classList.remove('active');
        }
    });

    // Mobile dropdown toggle
    const categoryItem = document.querySelector('.category');
    const employmentItem = document.querySelector('.Employment-Type');
    
    if (categoryItem) {
        const categoryLink = categoryItem.querySelector('.nav-a');
        if (categoryLink) {
            categoryLink.addEventListener('click', function(e) {
                if (window.innerWidth <= 900) {
                    e.preventDefault();
                    if (employmentItem) employmentItem.classList.remove('active');
                    categoryItem.classList.toggle('active');
                }
            });
        }
    }
    
    if (employmentItem) {
        const employmentLink = employmentItem.querySelector('.nav-a');
        if (employmentLink) {
            employmentLink.addEventListener('click', function(e) {
                if (window.innerWidth <= 900) {
                    e.preventDefault();
                    if (categoryItem) categoryItem.classList.remove('active');
                    employmentItem.classList.toggle('active');
                }
            });
        }
    }

    // Search functionality
    const searchBtn = document.querySelector('.search-btn');
    const searchInput = document.getElementById('searchInput');

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', function() {
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = `search.html?q=${encodeURIComponent(query)}`;
            }
        });

        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) {
                    window.location.href = `search.html?q=${encodeURIComponent(query)}`;
                }
            }
        });
    }
});
