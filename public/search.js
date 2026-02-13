let allJobs = [];
let currentPage = 1;
const jobsPerPage = 8;
let currentFilteredJobs = [];

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
            const categoryItem = document.querySelector('.category');
            const employmentItem = document.querySelector('.Employment-Type');
            if (categoryItem) categoryItem.classList.remove('active');
            if (employmentItem) employmentItem.classList.remove('active');
        });
    }

    document.addEventListener('click', function(e) {
        if (navMenu && !e.target.closest('#navMenu') && !e.target.closest('.menu-toggle')) {
            navMenu.classList.remove('active');
            const categoryItem = document.querySelector('.category');
            const employmentItem = document.querySelector('.Employment-Type');
            if (categoryItem) categoryItem.classList.remove('active');
            if (employmentItem) employmentItem.classList.remove('active');
        }
    });

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
}

document.addEventListener('DOMContentLoaded', function() {
    initializeMobileMenu();
    loadJobs();
    
    const mainSearchInput = document.getElementById('mainSearchInput');
    const mainSearchBtn = document.querySelector('.main-search-btn');
    const headerSearchInput = document.getElementById('searchInput');
    const headerSearchBtn = document.querySelector('.search-btn');
    
    function performSearch() {
        const mainQuery = mainSearchInput ? mainSearchInput.value.trim() : '';
        const headerQuery = headerSearchInput ? headerSearchInput.value.trim() : '';
        const query = mainQuery || headerQuery;
        
        if (query) {
            // Update both search inputs
            if (mainSearchInput) mainSearchInput.value = query;
            if (headerSearchInput) headerSearchInput.value = query;
            searchJobs(query);
        } else {
            displayJobs(allJobs);
        }
    }
    
    if (mainSearchBtn) {
        mainSearchBtn.addEventListener('click', performSearch);
    }
    
    if (mainSearchInput) {
        mainSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    if (headerSearchBtn) {
        headerSearchBtn.addEventListener('click', performSearch);
    }
    
    if (headerSearchInput) {
        headerSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    // Check for search parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    if (searchQuery) {
        if (mainSearchInput) mainSearchInput.value = searchQuery;
        if (headerSearchInput) headerSearchInput.value = searchQuery;
        searchJobs(searchQuery);
    }
});

async function loadJobs() {
    try {
        const response = await fetch('http://localhost:5000/api/jobs');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        allJobs = await response.json();
        
        // Check for search parameter in URL after loading jobs
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('search');
        if (searchQuery) {
            const mainSearchInput = document.getElementById('mainSearchInput');
            const headerSearchInput = document.getElementById('searchInput');
            if (mainSearchInput) mainSearchInput.value = searchQuery;
            if (headerSearchInput) headerSearchInput.value = searchQuery;
            searchJobs(searchQuery);
        } else {
            displayJobs(allJobs);
        }
    } catch (error) {
        console.error('Error loading jobs:', error);
        document.getElementById('jobsContainer').innerHTML = '<p>Unable to load jobs. Please make sure the server is running on port 5000.</p>';
    }
}

function searchJobs(query) {
    const searchKeywordDiv = document.getElementById('searchKeyword');
    const keywordText = document.getElementById('keywordText');
    
    if (!query.trim()) {
        if (searchKeywordDiv) searchKeywordDiv.style.display = 'none';
        displayJobs(allJobs);
        return;
    }
    
    // Show search keyword
    if (searchKeywordDiv && keywordText) {
        keywordText.textContent = query;
        searchKeywordDiv.style.display = 'block';
    }
    
    const filteredJobs = allJobs.filter(job => {
        const searchText = query.toLowerCase();
        return (
            job.title.toLowerCase().includes(searchText) ||
            job.companyName.toLowerCase().includes(searchText) ||
            job.category.toLowerCase().includes(searchText) ||
            job.location?.toLowerCase().includes(searchText) ||
            job.experience?.toLowerCase().includes(searchText) ||
            (job.employmentTypes && job.employmentTypes.some(type => type.toLowerCase().includes(searchText))) ||
            (job.skills && job.skills.some(skill => skill.toLowerCase().includes(searchText)))
        );
    });
    
    displayJobs(filteredJobs);
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
                    <h3>No jobs found</h3>
                    <p>Try different keywords or browse all jobs</p>
                    <button class="clear-filters-btn" onclick="window.location.href='home.html'">Browse All Jobs</button>
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
                    <div class="experience-type-inline">
                        <div class="experience"><strong>Experience:</strong> ${fullExperience}</div>
                        <div class="employment-type"><strong>Type:</strong> ${employmentType}</div>
                    </div>
                    <div class="salary-expiry-inline">
                        <div class="salary"><strong>Salary:</strong> ${salary}</div>
                        <div class="expiry-date"><strong>Expires:</strong> ${job.expiryDate || 'Not specified'}</div>
                    </div>
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
        return;
    }
    
    let paginationHTML = '';
    
    paginationHTML += `<button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>`;
    
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            paginationHTML += `<button onclick="changePage(${i})" ${i === currentPage ? 'class="active"' : ''}>${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            paginationHTML += '<span>...</span>';
        }
    }
    
    paginationHTML += `<button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>`;
    
    const startItem = (currentPage - 1) * jobsPerPage + 1;
    const endItem = Math.min(currentPage * jobsPerPage, currentFilteredJobs.length);
    paginationHTML += `<div class="page-info">Showing ${startItem}-${endItem} of ${currentFilteredJobs.length} jobs</div>`;
    
    paginationContainer.innerHTML = paginationHTML;
}

function changePage(page) {
    const totalPages = Math.ceil(currentFilteredJobs.length / jobsPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    displayJobsPage();
    setupPagination();
    
    document.getElementById('jobsContainer').scrollIntoView({ behavior: 'smooth' });
}

function openJobDetails(jobId) {
    window.location.href = `detail.html?id=${jobId}`;
}