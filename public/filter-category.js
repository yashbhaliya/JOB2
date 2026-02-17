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


// Load jobs when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize mobile menu
    initializeMobileMenu();
    
    loadJobs();
    
    // Get parameters from URL
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const type = urlParams.get('type');
    const filter = urlParams.get('filter');
    
    // Hide opposite buttons based on current filter
    if (filter === 'urgent') {
        const featuredBtn = document.querySelector('.featured-btn');
        if (featuredBtn) featuredBtn.style.display = 'none';
    } else if (filter === 'featured') {
        const urgentBtn = document.querySelector('.urgent-btn');
        if (urgentBtn) urgentBtn.style.display = 'none';
    }
    
    if (category) {
        updatePageTitle(category, null, null);
    } else if (type) {
        updatePageTitle(null, type, null);
    } else if (filter) {
        updatePageTitle(null, null, filter);
    }
    
    // Add event listeners
    document.querySelector('.filter-search-btn').addEventListener('click', applyFilters);
    document.querySelector('.clear-filters').addEventListener('click', clearAllFilters);
    
    // Add Enter key functionality to sidebar search input
    const filterSearchInput = document.getElementById('filterSearch');
    if (filterSearchInput) {
        filterSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                applyFilters();
            }
        });
    }
    
    // Search functionality - unified across all pages
    const headerSearchInput = document.getElementById('searchInput');
    const headerSearchBtn = document.querySelector('.search-btn');
    
    function performHeaderSearch() {
        const query = headerSearchInput ? headerSearchInput.value.trim() : '';
        if (query) {
            searchJobs(query);
        } else {
            displayJobs(allJobs);
        }
    }
    
    if (headerSearchInput && headerSearchBtn) {
        headerSearchBtn.addEventListener('click', performHeaderSearch);
        
        headerSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performHeaderSearch();
            }
        });
    }
    
    const allBtn = document.querySelector('.all-btn');
    const urgentBtn = document.querySelector('.urgent-btn');
    const featuredBtn = document.querySelector('.featured-btn');
    
    // Set "All" button as active by default
    if (allBtn) {
        allBtn.classList.add('active');
    }
    
    if (allBtn) {
        allBtn.addEventListener('click', () => {
            // Always redirect to home page from category pages
            window.location.href = 'home.html';
        });
    }
    
    if (urgentBtn) {
        urgentBtn.addEventListener('click', () => {
            setActiveButton(urgentBtn);
            filterJobs('urgent');
        });
    }
    
    if (featuredBtn) {
        featuredBtn.addEventListener('click', () => {
            setActiveButton(featuredBtn);
            filterJobs('featured');
        });
    }
    
    // Add change listeners to checkboxes
    const checkboxes = document.querySelectorAll('.filter-options input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', applyFilters);
    });
});

function updatePageTitle(category, type, filter) {
    const titleElement = document.getElementById('categoryTitle');
    if (category) {
        if (category === 'it-software' || category === 'it-softwate' || category === 'it&softwate' || category === 'it&amp;softwate' || category === 'it & software') {
            titleElement.textContent = 'IT & Software Jobs';
        } else if (category === 'marketing') {
            titleElement.textContent = 'Marketing Jobs';
        } else if (category === 'finance') {
            titleElement.textContent = 'Finance Jobs';
        } else if (category === 'design') {
            titleElement.textContent = 'Design Jobs';
        }
    } else if (type) {
        if (type === 'fulltime') {
            titleElement.textContent = 'Full-time Jobs';
        } else if (type === 'parttime') {
            titleElement.textContent = 'Part-time Jobs';
        } else if (type === 'remote') {
            titleElement.textContent = 'Remote Jobs';
        } else if (type === 'internship') {
            titleElement.textContent = 'Internship Jobs';
        }
    } else if (filter) {
        if (filter === 'urgent') {
            titleElement.textContent = 'Urgent Jobs';
        } else if (filter === 'featured') {
            titleElement.textContent = 'Featured Jobs';
        }
    } else {
        titleElement.textContent = 'Filtered Jobs';
    }
}

async function loadJobs() {
    try {
        const response = await fetch('http://localhost:5000/api/jobs');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        allJobs = await response.json();
        console.log('Loaded jobs:', allJobs.length, allJobs);
        
        // Get parameters from URL
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');
        const type = urlParams.get('type');
        const filter = urlParams.get('filter');
        
        if (category) {
            updatePageTitle(category, null, null);
            filterJobsByCategory(category);
        } else if (type) {
            updatePageTitle(null, type, null);
            filterJobsByType(type);
        } else if (filter) {
            updatePageTitle(null, null, filter);
            filterJobsByFilter(filter);
        } else {
            displayJobs(allJobs);
        }
    } catch (error) {
        console.error('Error loading jobs:', error);
        document.getElementById('jobsContainer').innerHTML = '<p>Unable to load jobs. Please make sure the server is running on port 5000.</p>';
    }
}

function filterJobsByCategory(category) {
    let filteredJobs = allJobs;
    console.log('Filtering by category:', category);
    console.log('All jobs before filtering:', allJobs.length);
    
    // Handle different category formats
    if (category === 'it-software' || category === 'it-softwate' || category === 'it&softwate' || category === 'it&amp;softwate' || category === 'it & software' || category === 'it%20%26%20software') {
        filteredJobs = allJobs.filter(job => job.category === 'IT & Software');
        console.log('IT & Software jobs found:', filteredJobs.length);
    } else if (category === 'marketing') {
        filteredJobs = allJobs.filter(job => job.category === 'Marketing');
        console.log('Marketing jobs found:', filteredJobs.length);
    } else if (category === 'finance') {
        filteredJobs = allJobs.filter(job => job.category === 'Finance');
        console.log('Finance jobs found:', filteredJobs.length);
    } else if (category === 'design') {
        filteredJobs = allJobs.filter(job => job.category === 'Design');
        console.log('Design jobs found:', filteredJobs.length);
    }
    
    console.log('Final filtered jobs:', filteredJobs.length, filteredJobs);
    displayJobs(filteredJobs);
}

function filterJobsByType(type) {
    let filteredJobs = allJobs;
    console.log('Filtering by type:', type);
    console.log('All jobs before filtering:', allJobs.length);
    
    // Log all employment types in the database
    allJobs.forEach((job, index) => {
        console.log(`Job ${index + 1} employment types:`, job.employmentTypes);
    });
    
    if (type === 'fulltime') {
        filteredJobs = allJobs.filter(job => {
            return job.employmentTypes && (
                job.employmentTypes.includes('Full-time') ||
                job.employmentTypes.includes('Fulltime') ||
                job.employmentTypes.includes('full-time') ||
                job.employmentTypes.includes('fulltime')
            );
        });
        console.log('Full-time jobs found:', filteredJobs.length);
    } else if (type === 'parttime') {
        filteredJobs = allJobs.filter(job => {
            return job.employmentTypes && (
                job.employmentTypes.includes('Part-time') ||
                job.employmentTypes.includes('Parttime') ||
                job.employmentTypes.includes('part-time') ||
                job.employmentTypes.includes('parttime')
            );
        });
        console.log('Part-time jobs found:', filteredJobs.length);
    } else if (type === 'remote') {
        filteredJobs = allJobs.filter(job => job.employmentTypes && job.employmentTypes.includes('Remote'));
        console.log('Remote jobs found:', filteredJobs.length);
    } else if (type === 'internship') {
        filteredJobs = allJobs.filter(job => job.employmentTypes && job.employmentTypes.includes('Internship'));
        console.log('Internship jobs found:', filteredJobs.length);
    }
    
    console.log('Final filtered jobs:', filteredJobs.length, filteredJobs);
    displayJobs(filteredJobs);
}

function filterJobsByFilter(filter) {
    let filteredJobs = allJobs;
    console.log('Filtering by filter:', filter);
    console.log('All jobs before filtering:', allJobs.length);
    
    if (filter === 'urgent') {
        filteredJobs = allJobs.filter(job => job.urgent === true);
        console.log('Urgent jobs found:', filteredJobs.length);
    } else if (filter === 'featured') {
        filteredJobs = allJobs.filter(job => job.featured === true);
        console.log('Featured jobs found:', filteredJobs.length);
    }
    
    console.log('Final filtered jobs:', filteredJobs.length, filteredJobs);
    displayJobs(filteredJobs);
}

function displayJobs(jobs) {
    currentFilteredJobs = jobs;
    currentPage = 1;
    
    // Check if we're showing urgent or featured jobs and apply urgent layout class
    const urlParams = new URLSearchParams(window.location.search);
    const filter = urlParams.get('filter');
    const container = document.getElementById('jobsContainer');
    
    if (filter === 'urgent' || filter === 'featured') {
        container.classList.add('urgent-layout');
    } else {
        container.classList.remove('urgent-layout');
    }
    
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
                    <button class="clear-filters-btn" onclick="clearAllFilters()">Clear Filters <i class="fas fa-times"></i></button>
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
            <div class="job-card" style="cursor: pointer;">
                <div class="job-header" onclick="openJobDetails('${job._id}')">
                    ${job.companyLogo ? `<img src="${job.companyLogo}" alt="${job.companyName}" class="company-logo">` : `<span class="job-icon ${icon.class}">${icon.emoji}</span>`}
                    <div class="title-section">
                        <h3>${job.title}</h3>
                        <div class="company-small">${job.companyName}</div>
                    </div>
                </div>
                <div class="job-info">
                    <div class="category" onclick="openJobDetails('${job._id}')" style="cursor: pointer;"><strong>Category:</strong> ${job.category}</div>
                    <div class="experience-type-inline">
                        <div class="experience" onclick="openJobDetails('${job._id}')"><strong>Experience:</strong> ${fullExperience}</div>
                        <div class="employment-type" onclick="openJobDetails('${job._id}')"><strong>Type:</strong> ${employmentType}</div>
                    </div>
                    <div class="salary-expiry-inline">
                        <div class="salary" onclick="openJobDetails('${job._id}')"><img src="/img/save-money.png" alt="Salary" class="field-icon"> <strong>Salary:</strong> ${salary}</div>
                        <div class="expiry-date" onclick="openJobDetails('${job._id}')"><img src="/img/calendar.png" alt="Expiry" class="field-icon"> <strong>Expires:</strong> ${job.expiryDate || 'Not specified'}</div>
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
    
    // Page info
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
    
    // Scroll to top of jobs container
    document.getElementById('jobsContainer').scrollIntoView({ behavior: 'smooth' });
}

function showAllJobs() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    
    if (category) {
        filterJobsByCategory(category);
    } else {
        displayJobs(allJobs);
    }
}

function filterJobs(type) {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    
    let filteredJobs = allJobs;
    
    // First filter by category if specified
    if (category) {
        if (category === 'it-software' || category === 'it-softwate' || category === 'it&softwate' || category === 'it&amp;softwate' || category === 'it & software' || category === 'it%20%26%20software') {
            filteredJobs = filteredJobs.filter(job => job.category === 'IT & Software');
        } else if (category === 'marketing') {
            filteredJobs = filteredJobs.filter(job => job.category === 'Marketing');
        } else if (category === 'finance') {
            filteredJobs = filteredJobs.filter(job => job.category === 'Finance');
        } else if (category === 'design') {
            filteredJobs = filteredJobs.filter(job => job.category === 'Design');
        }
    }
    
    // Then filter by type
    if (type === 'urgent') {
        filteredJobs = filteredJobs.filter(job => job.urgent === true);
    } else if (type === 'featured') {
        filteredJobs = filteredJobs.filter(job => job.featured === true);
    }
    
    displayJobs(filteredJobs);
}

function openJobDetails(jobId) {
    window.location.href = `detail.html?id=${jobId}`;
}

function filterByCategory(category) {
    let categoryParam;
    if (category === 'IT & Software') {
        categoryParam = 'it-software';
    } else if (category === 'Marketing') {
        categoryParam = 'marketing';
    } else if (category === 'Finance') {
        categoryParam = 'finance';
    } else if (category === 'Design') {
        categoryParam = 'design';
    }
    
    if (categoryParam) {
        window.location.href = `filter.html?category=${categoryParam}`;
    }
}

function clearAllFilters() {
    const checkboxes = document.querySelectorAll('.filter-options input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    
    const filterSearchInput = document.getElementById('filterSearch');
    if (filterSearchInput) {
        filterSearchInput.value = '';
    }
    
    showAllJobs();
}

function applyFilters() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    
    let filteredJobs = allJobs;
    
    // First filter by category if specified
    if (category) {
        if (category === 'it-software' || category === 'it-softwate' || category === 'it&softwate' || category === 'it&amp;softwate' || category === 'it & software' || category === 'it%20%26%20software') {
            filteredJobs = filteredJobs.filter(job => job.category === 'IT & Software');
        } else if (category === 'marketing') {
            filteredJobs = filteredJobs.filter(job => job.category === 'Marketing');
        } else if (category === 'finance') {
            filteredJobs = filteredJobs.filter(job => job.category === 'Finance');
        } else if (category === 'design') {
            filteredJobs = filteredJobs.filter(job => job.category === 'Design');
        }
    }
    
    // Get search term
    const searchTerm = document.getElementById('filterSearch')?.value.toLowerCase().trim() || '';
    
    // Get selected employment types
    const selectedEmploymentTypes = Array.from(document.querySelectorAll('.filter-options input[value="Full-time"], .filter-options input[value="Part-time"], .filter-options input[value="Remote"], .filter-options input[value="Internship"]'))
        .filter(cb => cb.checked)
        .map(cb => cb.value);
    
    // Get selected salary ranges
    const selectedSalaryRanges = Array.from(document.querySelectorAll('.filter-options input[value="0-30000"], .filter-options input[value="30000-60000"], .filter-options input[value="60000-100000"], .filter-options input[value="100000+"]'))
        .filter(cb => cb.checked)
        .map(cb => cb.value);
    
    // Get selected experience levels
    const selectedExperience = Array.from(document.querySelectorAll('.filter-options input[value="freshman"], .filter-options input[value="junior"], .filter-options input[value="mid"], .filter-options input[value="senior"]'))
        .filter(cb => cb.checked)
        .map(cb => cb.value);
    
    // Apply search filter
    if (searchTerm) {
        filteredJobs = filteredJobs.filter(job => 
            job.title.toLowerCase().includes(searchTerm) ||
            job.companyName.toLowerCase().includes(searchTerm) ||
            job.category.toLowerCase().includes(searchTerm) ||
            job.location?.toLowerCase().includes(searchTerm) ||
            job.experience?.toLowerCase().includes(searchTerm) ||
            (job.employmentTypes && job.employmentTypes.some(type => type.toLowerCase().includes(searchTerm))) ||
            (job.skills && job.skills.some(skill => skill.toLowerCase().includes(searchTerm)))
        );
    }
    
    // Apply employment type filter
    if (selectedEmploymentTypes.length > 0) {
        filteredJobs = filteredJobs.filter(job => {
            if (!job.employmentTypes) return false;
            
            return selectedEmploymentTypes.some(selectedType => {
                return job.employmentTypes.some(jobType => {
                    // Normalize both strings for comparison
                    const normalizedJobType = jobType.toLowerCase().replace(/[-\s]/g, '');
                    const normalizedSelectedType = selectedType.toLowerCase().replace(/[-\s]/g, '');
                    
                    return normalizedJobType === normalizedSelectedType ||
                           jobType === selectedType ||
                           (selectedType === 'Full-time' && (jobType === 'Fulltime' || jobType === 'full-time' || jobType === 'fulltime')) ||
                           (selectedType === 'Part-time' && (jobType === 'Parttime' || jobType === 'part-time' || jobType === 'parttime'));
                });
            });
        });
    }
    
    // Apply salary range filter
    if (selectedSalaryRanges.length > 0) {
        filteredJobs = filteredJobs.filter(job => {
            if (!job.minSalary || !job.maxSalary) return false;
            
            return selectedSalaryRanges.some(range => {
                switch(range) {
                    case '0-30000':
                        return job.maxSalary <= 30000;
                    case '30000-60000':
                        return job.minSalary >= 30000 && job.maxSalary <= 60000;
                    case '60000-100000':
                        return job.minSalary >= 60000 && job.maxSalary <= 100000;
                    case '100000+':
                        return job.minSalary >= 100000;
                    default:
                        return false;
                }
            });
        });
    }
    
    // Apply experience filter
    if (selectedExperience.length > 0) {
        filteredJobs = filteredJobs.filter(job => {
            const jobExp = job.experience?.toLowerCase();
            return selectedExperience.some(exp => {
                switch(exp) {
                    case 'freshman':
                        return jobExp === 'freshman' || jobExp === 'fresher' || jobExp === 'intern' || jobExp === 'internship';
                    case 'junior':
                        return jobExp === 'junior' || (job.years && job.years >= 1 && job.years <= 3);
                    case 'mid':
                        return jobExp === 'mid' || jobExp === 'mid-level' || (job.years && job.years >= 3 && job.years <= 5);
                    case 'senior':
                        return jobExp === 'senior' || (job.years && job.years >= 5);
                    default:
                        return false;
                }
            });
        });
    }
    
    displayJobs(filteredJobs);
}

function searchJobs(query) {
    if (!query.trim()) {
        showAllJobs();
        return;
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


// Mobile filter toggle functionality
const filterToggle = document.getElementById('mobileFilterToggle');
const filtersSidebar = document.getElementById('filtersSidebar');
const closeFilterBtn = document.getElementById('closeFilterBtn');

if (filterToggle) {
    filterToggle.addEventListener('click', function() {
        filtersSidebar.classList.add('active');
    });
}

if (closeFilterBtn) {
    closeFilterBtn.addEventListener('click', function() {
        filtersSidebar.classList.remove('active');
    });
}

// Close filter when clicking outside
document.addEventListener('click', function(e) {
    if (filtersSidebar && filtersSidebar.classList.contains('active')) {
        if (!e.target.closest('.filters-sidebar') && !e.target.closest('.mobile-filter-toggle')) {
            filtersSidebar.classList.remove('active');
        }
    }
});

// Apply filters button
const applyFiltersBtn = document.querySelector('.apply-filters');
if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', function() {
        applyFilters();
        if (filtersSidebar) {
            filtersSidebar.classList.remove('active');
        }
    });
}
