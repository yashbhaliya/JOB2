// Dropdown functionality
document.addEventListener('DOMContentLoaded', function () {
    // Mobile menu toggle
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
            // Reset all dropdown states
            const categoryItem = document.querySelector('.category');
            const employmentItem = document.querySelector('.Employment-Type');
            if (categoryItem) categoryItem.classList.remove('active');
            if (employmentItem) employmentItem.classList.remove('active');
        });
    }

    // Close menu when clicking outside
    document.addEventListener('click', function (e) {
        if (navMenu && !e.target.closest('#navMenu') && !e.target.closest('.menu-toggle')) {
            navMenu.classList.remove('active');
            // Reset all dropdown states
            const categoryItem = document.querySelector('.category');
            const employmentItem = document.querySelector('.Employment-Type');
            if (categoryItem) categoryItem.classList.remove('active');
            if (employmentItem) employmentItem.classList.remove('active');
        }
    });

    // Desktop dropdown functionality
    const categoryItem = document.querySelector('.category');
    const employmentItem = document.querySelector('.Employment-Type');

    // Mobile dropdown toggle
    if (categoryItem) {
        const categoryLink = categoryItem.querySelector('.nav-a');
        if (categoryLink) {
            categoryLink.addEventListener('click', function (e) {
                if (window.innerWidth <= 900) {
                    e.preventDefault();
                    // Close other dropdown first
                    if (employmentItem) employmentItem.classList.remove('active');
                    categoryItem.classList.toggle('active');
                }
            });
        }
    }

    if (employmentItem) {
        const employmentLink = employmentItem.querySelector('.nav-a');
        if (employmentLink) {
            employmentLink.addEventListener('click', function (e) {
                if (window.innerWidth <= 900) {
                    e.preventDefault();
                    // Close other dropdown first
                    if (categoryItem) categoryItem.classList.remove('active');
                    employmentItem.classList.toggle('active');
                }
            });
        }
    }

    // Search functionality - unified across all pages
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.querySelector('.search-btn');

    function performSearch() {
        const query = searchInput ? searchInput.value.trim() : '';
        if (query) {
            window.location.href = `search.html?search=${encodeURIComponent(query)}`;
        }
    }

    if (searchInput && searchBtn) {
        searchBtn.addEventListener('click', performSearch);

        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }

    // Load jobs when page loads
    loadJobs();



});
let allJobs = [];
let currentPage = 1;
const jobsPerPage = 8;
let currentFilteredJobs = [];

// Fetch and display jobs from MongoDB
async function loadJobs() {
    try {
        const response = await fetch('http://localhost:5000/api/jobs', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        allJobs = await response.json();
        displayJobs(allJobs);
    } catch (error) {
        console.error('Error loading jobs:', error);
        document.getElementById('jobsContainer').innerHTML = '<p>Unable to load jobs. Please make sure the server is running on port 5000.</p>';
    }
}

function displayJobs(jobs) {
    currentFilteredJobs = jobs;
    currentPage = 1;
    displayJobsPage();
    setupPagination();
}

function displayJobsPage() {
    const container = document.getElementById('jobsContainer');
    const startIndex = (currentPage - 1) * jobsPerPage;
    const endIndex = startIndex + jobsPerPage;
    const jobsToShow = currentFilteredJobs.slice(startIndex, endIndex);

    if (jobsToShow.length === 0 && currentFilteredJobs.length === 0) {
        container.innerHTML = `
            <div class="no-jobs-card">
                <div class="no-jobs-content">
                    <img src="/img/unemployment.png" alt="No Jobs" class="unemployment-img">
                    <h3>Sorry, no jobs found</h3>
                    <p>Clear filters to see jobs or explore jobs in other cities</p>
                    <button class="clear-filters-btn" onclick="window.location.reload()">Clear Filters <i class="fas fa-times"></i></button>
                </div>
            </div>
        `;
        return;
    }

    function getCategoryIcon(category) {
        const icons = {
            'IT & Software': { emoji: '💻', class: 'it' },
            'Marketing': { emoji: '📈', class: 'marketing' },
            'Finance': { emoji: '💰', class: 'finance' },
            'Design': { emoji: '🎨', class: 'design' }
        };
        return icons[category] || { emoji: '💼', class: 'default' };
    }

    container.innerHTML = jobsToShow.map(job => {
        const icon = getCategoryIcon(job.category);
        const salary = job.minSalary && job.maxSalary ? `₹${job.minSalary} - ₹${job.maxSalary}` : 'Salary not specified';
        const experience = job.experience === 'freshman' ? 'Fresher' : job.experience || 'Not specified';
        const experienceYears = job.years ? ` (${job.years} years)` : '';
        const fullExperience = experience + experienceYears;
        const employmentType = job.employmentTypes && job.employmentTypes.length > 0 ? job.employmentTypes.join(', ') : 'Not specified';

        return `
            <div class="job-card" onclick="openJobDetails('${job._id}')" style="cursor: pointer;">
                <div class="job-header">
                    ${job.companyLogo ? `<img src="${job.companyLogo}" alt="${job.companyName}" class="company-logo">` : `<span class="job-icon ${icon.class}">${icon.emoji}</span>`}
                    <div class="title-section">
                        <h3>${job.title}</h3>
                        <div class="company-small">${job.companyName}</div>
                    </div>
                </div>
                <div class="job-info">
                    <div class="category"><strong>Category:</strong> ${job.category}</div>
                    <div class="experience"><strong>Experience:</strong> ${fullExperience}</div>
                    <div class="employment-type"><strong>Type:</strong> ${employmentType}</div>
                    <div class="salary"> <strong>Salary:</strong> ${salary}</div>
                    <div class="expiry-date"><strong>Expires:</strong> ${job.expiryDate || 'Not specified'}</div>
                    ${job.urgent ? '<span class="badge urgent" title="Urgent"><img src="/img/urgent.png" alt="Urgent" class="star-icon"></span>' : ''}
                    ${job.featured ? '<span class="badge featured" title="Featured"><img src="/img/features.png" alt="Featured" class="star-icon"></span>' : ''}
                </div>
            </div>
        `;
    }).join('');
}

function setupPagination() {
    const totalPages = Math.ceil(currentFilteredJobs.length / jobsPerPage);
    const paginationContainer = document.getElementById('pagination');

    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        // Clear page info when no pagination needed
        const pageInfoContainer = document.getElementById('pageInfo');
        if (pageInfoContainer) pageInfoContainer.innerHTML = '';
        return;
    }

    // Update page info in separate container
    const startItem = (currentPage - 1) * jobsPerPage + 1;
    const endItem = Math.min(currentPage * jobsPerPage, currentFilteredJobs.length);
    const pageInfoContainer = document.getElementById('pageInfo');
    if (pageInfoContainer) {
        pageInfoContainer.innerHTML = `<div class="page-info-display">Showing ${startItem}-${endItem} of ${currentFilteredJobs.length} jobs</div>`;
    }

    // Pagination buttons only
    let paginationHTML = '';

    // Previous button
    paginationHTML += `<button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>`;

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            paginationHTML += `<button onclick="changePage(${i})" ${i === currentPage ? 'class="active"' : ''}>${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            paginationHTML += '<span>...</span>';
        }
    }

    // Next button
    paginationHTML += `<button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>`;

    paginationContainer.innerHTML = paginationHTML;
}

function changePage(page) {
    const totalPages = Math.ceil(currentFilteredJobs.length / jobsPerPage);
    if (page < 1 || page > totalPages) return;

    currentPage = page;
    displayJobsPage();
    setupPagination();

    // Scroll to top of jobs container
    document.getElementById('jobsContainer').scrollIntoView({ behavior: 'smooth' });
}

function searchJobs(query) {
    if (!query.trim()) {
        displayJobs(allJobs);
        return;
    }

    const filteredJobs = allJobs.filter(job => {
        const searchText = query.toLowerCase();
        return (
            job.title.toLowerCase().includes(searchText) ||
            job.companyName.toLowerCase().includes(searchText) ||
            job.category.toLowerCase().includes(searchText) ||
            job.location.toLowerCase().includes(searchText) ||
            job.experience.toLowerCase().includes(searchText) ||
            (job.employmentTypes && job.employmentTypes.some(type => type.toLowerCase().includes(searchText))) ||
            (job.skills && job.skills.some(skill => skill.toLowerCase().includes(searchText)))
        );
    });

    displayJobs(filteredJobs);
}

// Function to open job details page
function openJobDetails(jobId) {
    window.location.href = `detail.html?id=${jobId}`;
}

// Load jobs when page loads
document.addEventListener('DOMContentLoaded', function () {
    loadJobs();

    // Check for search parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    if (searchQuery) {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = searchQuery;
            searchJobs(searchQuery);
        }
    }

});



// Auth Modal Functions
function openLoginModal() {
    document.getElementById('loginModal').style.display = 'flex';
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('loginForm').reset();
}

function openSignupModal() {
    document.getElementById('signupModal').style.display = 'flex';
}

function closeSignupModal() {
    document.getElementById('signupModal').style.display = 'none';
    document.getElementById('signupForm').reset();
}

function switchToSignup() {
    closeLoginModal();
    openSignupModal();
}

function switchToLogin() {
    closeSignupModal();
    openLoginModal();
}

// Close modal on outside click
document.getElementById('loginModal')?.addEventListener('click', function(e) {
    if (e.target === this) closeLoginModal();
});

document.getElementById('signupModal')?.addEventListener('click', function(e) {
    if (e.target === this) closeSignupModal();
});

// Login Form Submission
document.getElementById('loginForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const submitBtn = e.target.querySelector('.auth-submit-btn');
    submitBtn.classList.add('loading');
    
    const formData = new FormData(e.target);
    const data = {
        email: formData.get('email'),
        password: formData.get('password')
    };

    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            showPopup('Login successful!', 'success');
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
            closeLoginModal();
            updateAuthUI();
        } else {
            showPopup(result.error || 'Login failed', 'error');
        }
    } catch (error) {
        showPopup('Error: ' + error.message, 'error');
    } finally {
        submitBtn.classList.remove('loading');
    }
});

// Signup Form Submission
document.getElementById('signupForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const submitBtn = e.target.querySelector('.auth-submit-btn');
    submitBtn.classList.add('loading');
    
    const formData = new FormData(e.target);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password')
    };

    try {
        const response = await fetch('http://localhost:5000/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            closeSignupModal();
            showPopup('Signup successful! Please check your email to verify your account.', 'success');
            setTimeout(() => openLoginModal(), 2000);
        } else {
            showPopup(result.error || 'Signup failed', 'error');
        }
    } catch (error) {
        showPopup('Error: ' + error.message, 'error');
    } finally {
        submitBtn.classList.remove('loading');
    }
});

// Update UI based on auth state
function updateAuthUI() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const authButtons = document.querySelector('.auth-buttons');

    if (token && user.name) {
        authButtons.innerHTML = `
            <div class="user-profile" onclick="toggleProfileDropdown()">
                <i class="fas fa-user-circle" style="font-size: 24px; color: white; cursor: pointer;"></i>
                <div style="display: flex; flex-direction: column; margin-left: 8px; cursor: pointer;">
                    <span style="color: white; font-size: 12px;">Welcome</span>
                    <span style="color: white; font-weight: 600; font-size: 14px;">${user.name}</span>
                </div>
                <div class="profile-dropdown" id="profileDropdown">
                    <div class="profile-info">
                        <strong>${user.name}</strong>
                        <small>${user.email}</small>
                    </div>
                    <hr>
                    <a href="profile.html"><i class="fas fa-user"></i> View Profile</a>
                    <a href="#" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Logout</a>
                </div>
            </div>
        `;
    }
}

function toggleProfileDropdown() {
    const dropdown = document.getElementById('profileDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.user-profile')) {
        const dropdown = document.getElementById('profileDropdown');
        if (dropdown) dropdown.classList.remove('show');
    }
});

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    location.reload();
}

// Check auth state on page load
updateAuthUI();


// Popup notification function
function showPopup(message, type) {
    const popup = document.createElement('div');
    popup.className = `popup-notification ${type}`;
    popup.textContent = message;
    document.body.appendChild(popup);
    
    setTimeout(() => popup.classList.add('show'), 10);
    setTimeout(() => {
        popup.classList.remove('show');
        setTimeout(() => popup.remove(), 300);
    }, 3000);
}


function closeMenu() {
    const navMenu = document.getElementById('navMenu');
    if (navMenu) {
        navMenu.classList.remove('active');
    }
}


// Forgot Password Modal Functions
function openForgotPasswordModal() {
    closeLoginModal();
    document.getElementById('forgotPasswordModal').style.display = 'flex';
}

function closeForgotPasswordModal() {
    document.getElementById('forgotPasswordModal').style.display = 'none';
    document.getElementById('forgotPasswordForm').reset();
}

// Close forgot password modal on outside click
document.getElementById('forgotPasswordModal')?.addEventListener('click', function(e) {
    if (e.target === this) closeForgotPasswordModal();
});

// Forgot Password Form Submission
document.getElementById('forgotPasswordForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');

    try {
        const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const result = await response.json();

        if (response.ok) {
            showPopup('Password reset link sent to your email!', 'success');
            closeForgotPasswordModal();
        } else {
            showPopup(result.error || 'Failed to send reset link', 'error');
        }
    } catch (error) {
        showPopup('Error: ' + error.message, 'error');
    }
});
