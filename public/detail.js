// Get job ID from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const jobId = urlParams.get('id');

// Load job details when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize mobile menu
    initializeMobileMenu();
    
    if (jobId) {
        loadJobDetails(jobId);
    } else {
        // Redirect to home if no job ID
        window.location.href = 'home.html';
    }
});

// Mobile menu functionality
function initializeMobileMenu() {
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
    document.addEventListener('click', function(e) {
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
            categoryLink.addEventListener('click', function(e) {
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
            employmentLink.addEventListener('click', function(e) {
                if (window.innerWidth <= 900) {
                    e.preventDefault();
                    // Close other dropdown first
                    if (categoryItem) categoryItem.classList.remove('active');
                    employmentItem.classList.toggle('active');
                }
            });
        }
    }
}

// Fetch job details from server
async function loadJobDetails(id) {
    try {
        const response = await fetch(`http://localhost:5000/api/jobs/${id}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                showError('Job not found. It may have been removed or the link is invalid.');
            } else {
                showError(`Server error: ${response.status}. Please try again later.`);
            }
            return;
        }
        
        const job = await response.json();
        displayJobDetails(job);
    } catch (error) {
        console.error('Error loading job details:', error);
        if (error.message === 'Failed to fetch') {
            showError('Server is not running. Please start the server and try again.');
        } else {
            showError('Unable to connect to server. Please check your internet connection and try again.');
        }
    }
}

// Show error message
function showError(message) {
    document.getElementById('jobContainer').style.display = 'none';
    document.getElementById('errorContainer').style.display = 'block';
    document.getElementById('errorMessage').textContent = message;
}

// Display job details on the page
function displayJobDetails(job) {
    // Update page title
    document.title = `${job.title} - ${job.companyName} | Job-Portal`;
    
    // Update job header
    document.getElementById('jobTitle').textContent = job.title;
    document.getElementById('companyName').textContent = job.companyName;
    
    // Update company logo
    const logoElement = document.getElementById('companyLogo');
    if (job.companyLogo) {
        logoElement.src = job.companyLogo;
        logoElement.style.display = 'block';
    } else {
        logoElement.style.display = 'none';
    }
    
    // Update badges
    const urgentBadge = document.getElementById('urgentBadge');
    const featuredBadge = document.getElementById('featuredBadge');
    
    if (job.urgent) {
        urgentBadge.style.display = 'inline-block';
    }
    
    if (job.featured) {
        featuredBadge.style.display = 'inline-block';
    }
    
    // Update job information
    document.getElementById('category').textContent = job.category || 'Not specified';
    
    // Make category clickable
    const categoryElement = document.getElementById('category');
    categoryElement.className = 'clickable-category';
    categoryElement.onclick = function() {
        const categoryParam = getCategoryParam(job.category);
        window.location.href = `http://127.0.0.1:5500/public/filter.html?category=${categoryParam}`;
    };
    
    const salary = job.minSalary && job.maxSalary ? 
        `$${job.minSalary} - $${job.maxSalary}` : 
        'Salary not specified';
    document.getElementById('salary').textContent = salary;
    
    const experience = job.experience === 'freshman' ? 'Fresher' : job.experience || 'Not specified';
    const experienceYears = job.years ? ` (${job.years} years)` : '';
    document.getElementById('experience').textContent = experience + experienceYears;
    
    const employmentType = job.employmentTypes && job.employmentTypes.length > 0 ? 
        job.employmentTypes.join(', ') : 
        'Not specified';
    document.getElementById('employmentType').textContent = employmentType;
    
    // Make employment type clickable
    const employmentTypeElement = document.getElementById('employmentType');
    if (job.employmentTypes && job.employmentTypes.length > 0) {
        // Make each employment type clickable
        const types = job.employmentTypes.map(type => {
            const typeParam = getEmploymentTypeParam(type);
            if (typeParam) {
                return `<span class="clickable-employment-type" onclick="window.location.href='http://127.0.0.1:5500/public/filter.html?type=${typeParam}'">${type}</span>`;
            }
            return type;
        });
        employmentTypeElement.innerHTML = types.join(', ');
    }
    
    document.getElementById('location').textContent = job.location || 'Not specified';
    document.getElementById('expiryDate').textContent = job.expiryDate || 'Not specified';
    
    // Update skills
    const skillsList = document.getElementById('skillsList');
    if (job.skills && job.skills.length > 0) {
        skillsList.innerHTML = job.skills.map(skill => 
            `<span class="skill-tag">${skill}</span>`
        ).join('');
    } else {
        skillsList.innerHTML = '<p>No specific skills listed.</p>';
    }
}

// Get category parameter for URL
function getCategoryParam(category) {
    const categoryMap = {
        'IT & Software': 'it-software',
        'Marketing': 'marketing',
        'Finance': 'finance',
        'Design': 'design'
    };
    return categoryMap[category] || 'it-software';
}

// Get employment type parameter for URL
function getEmploymentTypeParam(employmentType) {
    const typeMap = {
        'Full-time': 'fulltime',
        'Fulltime': 'fulltime',
        'full-time': 'fulltime',
        'fulltime': 'fulltime',
        'Part-time': 'parttime',
        'Parttime': 'parttime',
        'part-time': 'parttime',
        'parttime': 'parttime',
        'Remote': 'remote',
        'remote': 'remote',
        'Internship': 'internship',
        'internship': 'internship'
    };
    return typeMap[employmentType] || null;
}