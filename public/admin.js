// admin.js
let jobs = [];
let editingJobId = null;
let currentSkills = [];
let isViewMode = false;

const addJobBtn = document.getElementById('addJobBtn');
const jobModal = document.getElementById('jobModal');
const jobForm = document.querySelector('.job-form');
const experienceYearsInput = document.getElementById('experienceYears');

// 1. Fetch from MongoDB
async function fetchJobs() {
    try {
        const res = await fetch('http://localhost:5000/api/jobs');
        jobs = await res.json();
        localStorage.setItem('jobPortalJobs', JSON.stringify(jobs));
        renderJobs();
    } catch (err) {
        console.error('Error fetching jobs:', err);
        const cached = localStorage.getItem('jobPortalJobs');
        if (cached) {
            jobs = JSON.parse(cached);
            renderJobs();
        }
    }
}

// 2. Render using MongoDB _id
function renderJobs() {
    const jobsContainer = document.querySelector('.jobs');
        // console.log('TTTTTT', jobs);

    jobsContainer.innerHTML = '';
    jobs.forEach(job => {
        const jobCard = document.createElement('div');
        jobCard.className = 'job-card';
        jobCard.innerHTML = `
            <div class="job-card-header">
                ${job.companyLogo && job.companyLogo !== null && job.companyLogo !== 'null' ? `<img src="${job.companyLogo}" alt="Company Logo" class="job-card-logo">` : ''}
                <div class="job-card-title-section">
                    <h3>${job.title}</h3>
                    <p class="company-name">${job.companyName || 'N/A'}</p>
                </div>
            </div>
            <p><strong>Category:</strong> ${job.category}</p>
            ${job.description ? `<p><strong>Description:</strong> ${job.description.substring(0, 100)}${job.description.length > 100 ? '...' : ''}</p>` : ''}
            <p><strong>Salary:</strong> ${job.minSalary === 'No salary needed' ? 'No salary needed' : `₹${job.minSalary} - ₹${job.maxSalary}`}</p>
            <p><strong>Experience:</strong> ${job.experience}${job.years ? ` (${job.years} years)` : ''}</p>
            <p><strong>Type:</strong> ${Array.isArray(job.employmentTypes) && job.employmentTypes.length > 0 ? job.employmentTypes.join(', ') : 'N/A'}</p>
            ${job.featured ? '<span class="featured">⭐  </span>' : ''}
            ${job.urgent ? '<span class="urgent"> ⚡</span>' : ''}
            <div class="actions">
                <button class="btn-view" data-id="${job._id}">View</button>
                <button class="btn-edit" data-id="${job._id}">Edit</button>
                <button class="btn-delete" data-id="${job._id}">Delete</button>
            </div>
        `;
        jobsContainer.appendChild(jobCard);
    });
}

// 3. Unified Form Submission (Post & Put)
jobForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (isViewMode) return;

    const formData = new FormData(jobForm);
    const title = formData.get('title');

    if (!title || title.trim() === "") {
        alert("Please enter a job title.");
        return;
    }

    const jobData = {
        title: title,
        category: formData.get('category'),
        companyName: formData.get('companyName'),
        location: formData.get('location'),
        description: formData.get('description') || '',
        minSalary: formData.get('minSalary') || 'No salary needed',
        maxSalary: formData.get('maxSalary') || 'No salary needed',
        experience: formData.get('experience'),
        years: formData.get('years'),
        employmentTypes: formData.getAll('employmentType'),
        skills: [...currentSkills],
        expiryDate: formData.get('expiryDate'),
        featured: formData.has('featured'),
        urgent: formData.has('urgent')
    };

    console.log('📤 Submitting job data:', jobData);
    console.log('📝 Description value:', jobData.description);

    // Include companyLogo if it's being updated (new upload) or keep existing
    const newLogo = document.getElementById('companyLogoFile').getAttribute('data-base64');
    if (newLogo) {
        jobData.companyLogo = newLogo;
    } else if (editingJobId) {
        const currentJob = jobs.find(j => j._id === editingJobId);
        if (currentJob && currentJob.companyLogo) {
            jobData.companyLogo = currentJob.companyLogo;
        }
    }

    try {
        let url = 'http://localhost:5000/api/jobs';
        let method = 'POST';

        if (editingJobId) {
            url = `http://localhost:5000/api/jobs/${editingJobId}`;
            method = 'PUT';
        }

        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jobData)
        });

        const responseText = await res.text();
        console.log('✅ Response status:', res.status);
        console.log('📥 Response data:', responseText);

        if (res.ok) {
            alert(editingJobId ? 'Job updated successfully!' : 'Job posted successfully!');
            await fetchJobs();
            closeJobModal();
        } else {
            alert(`Error: ${res.status} - ${responseText}`);
        }
    } catch (err) {
        console.error('Error saving job:', err);
        alert('Network error: ' + err.message);
    }
});

// 4. Unified Event Delegation
document.querySelector('.jobs').addEventListener('click', async function (e) {
    const target = e.target.closest('button');
    if (!target) return;

    const jobId = target.dataset.id;
    const job = jobs.find(j => j._id === jobId);

    if (target.classList.contains('btn-view')) {
        isViewMode = true;
        editingJobId = jobId;
        console.log('VIEW - Job object:', job);
        populateForm(job);
        openJobModal();
    } else if (target.classList.contains('btn-edit')) {
        isViewMode = false;
        editingJobId = jobId;
        populateForm(job);
        openJobModal();
    } else if (target.classList.contains('btn-delete')) {
        if (confirm('Are you sure you want to delete this job?')) {
            await fetch(`http://localhost:5000/api/jobs/${jobId}`, { method: 'DELETE' });
            fetchJobs();
        }
    }
});

// Helper Functions
function openJobModal() {
    const modalTitle = document.querySelector('.job-modal-content h2');
    const submitBtn = document.querySelector('.btn-primary');
    const skillBtn = document.querySelector('.skill-btn');
    const fileUploadBtn = document.querySelector('.file-upload-btn');
    const jobForm = document.querySelector('.job-form');
    
    if (isViewMode) {
        modalTitle.textContent = 'Job Details';
        // Hide form and show card layout
        jobForm.style.display = 'none';
        
        // Remove any existing view card first
        const existingViewCard = document.querySelector('.job-view-card');
        if (existingViewCard) existingViewCard.remove();
        
        // Create view card layout
        const job = jobs.find(j => j._id === editingJobId);
        console.log('VIEW POPUP - Job data:', job);
        console.log('VIEW POPUP - Description:', job.description);
        
        const viewCard = document.createElement('div');
        viewCard.className = 'job-view-card';
        
        let logoHtml = '';
        if (job.companyLogo && job.companyLogo !== null && job.companyLogo !== 'null') {
            logoHtml = `<img src="${job.companyLogo}" alt="Company Logo" class="job-view-logo">`;
        }
        
        viewCard.innerHTML = `
            <div class="job-view-header">
                ${logoHtml}
                <div class="job-view-title-section">
                    <h3>${job.title}</h3>
                    <p class="company-name">${job.companyName || 'N/A'}</p>
                </div>
            </div>
            <div class="view-field"><strong>Category:</strong> ${job.category || 'N/A'}</div>
            <div class="view-field"><strong>Location:</strong> ${job.location || 'N/A'}</div>
            <div class="view-field"><strong>Description:</strong> ${job.description || 'N/A'}</div>
            <div class="view-field"><strong>Salary:</strong> ${job.minSalary === 'No salary needed' ? 'No salary needed' : `₹${job.minSalary} - ₹${job.maxSalary}`}</div>
            <div class="view-field"><strong>Experience:</strong> ${job.experience || 'N/A'}${job.years ? ` (${job.years} years)` : ''}</div>
            <div class="view-field"><strong>Employment Type:</strong> ${Array.isArray(job.employmentTypes) && job.employmentTypes.length > 0 ? job.employmentTypes.join(', ') : 'N/A'}</div>
            <div class="view-field"><strong>Skills:</strong> ${Array.isArray(job.skills) && job.skills.length > 0 ? job.skills.join(', ') : 'N/A'}</div>
            <div class="view-field"><strong>Expiry Date:</strong> ${job.expiryDate || 'N/A'}</div>
            <div class="job-view-badges">
                ${job.featured ? '<span class="featured">⭐</span>' : ''}
                ${job.urgent ? '<span class="urgent">⚡</span>' : ''}
            </div>
        `;
        
        // Insert view card after title
        modalTitle.insertAdjacentElement('afterend', viewCard);
        
        // Hide all form controls
        document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => btn.style.display = 'none');
    } else {
        modalTitle.textContent = editingJobId ? 'Update Job' : 'Post New Job';
        if (submitBtn) submitBtn.textContent = editingJobId ? 'Update Job' : 'Post Job';
        
        // Show form and remove any existing view card
        jobForm.style.display = 'block';
        const existingViewCard = document.querySelector('.job-view-card');
        if (existingViewCard) existingViewCard.remove();
        
        // Show all form controls
        document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => btn.style.display = 'block');
        if (skillBtn) skillBtn.style.display = 'inline-block';
        if (fileUploadBtn) fileUploadBtn.style.display = 'flex';
        
        // Enable all inputs
        jobForm.querySelectorAll('input, select, textarea').forEach(el => {
            el.readOnly = false;
            el.disabled = false;
        });
    }
    jobModal.style.display = 'flex';
}

function closeJobModal() {
    jobModal.style.display = 'none';
    editingJobId = null;
    isViewMode = false;
    
    // Remove view card if exists
    const existingViewCard = document.querySelector('.job-view-card');
    if (existingViewCard) existingViewCard.remove();
    
    // Show form
    const jobForm = document.querySelector('.job-form');
    jobForm.style.display = 'block';
    jobForm.reset();
    
    currentSkills = [];
    renderSkillsList(false);
    
    // Clear logo preview
    const preview = document.getElementById('logoPreview');
    if (preview) {
        preview.classList.remove('active');
        preview.innerHTML = '';
    }
    
    // Re-enable all elements
    jobForm.querySelectorAll('input, select, textarea').forEach(el => {
        el.readOnly = false;
        el.disabled = false;
    });
    document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => btn.style.display = 'block');
    const skillBtn = document.querySelector('.skill-btn');
    const fileUploadBtn = document.querySelector('.file-upload-btn');
    if (skillBtn) skillBtn.style.display = 'inline-block';
    if (fileUploadBtn) fileUploadBtn.style.display = 'flex';
}

function populateForm(job) {
    jobForm.querySelector('input[name="title"]').value = job.title || '';
    jobForm.querySelector('select[name="category"]').value = job.category || '';
    jobForm.querySelector('input[name="companyName"]').value = job.companyName || '';
    jobForm.querySelector('input[name="location"]').value = job.location || '';
    
    // Handle company logo
    if (job.companyLogo && job.companyLogo !== 'null' && job.companyLogo !== null) {
        const preview = document.getElementById('logoPreview');
        preview.innerHTML = `
            <img src="${job.companyLogo}" alt="Company Logo" class="preview-image">
            <div class="preview-info">
                <div class="preview-name">Current Logo</div>
            </div>
        `;
        preview.classList.add('active');
    }
    
    jobForm.querySelector('textarea[name="description"]').value = job.description || '';
    jobForm.querySelector('input[name="minSalary"]').value = job.minSalary === 'No salary needed' ? '' : (job.minSalary || '');
    jobForm.querySelector('input[name="maxSalary"]').value = job.maxSalary === 'No salary needed' ? '' : (job.maxSalary || '');
    
    const expRadio = jobForm.querySelector(`input[name="experience"][value="${job.experience}"]`);
    if(expRadio) expRadio.checked = true;
    
    jobForm.querySelector('input[name="years"]').value = job.years || '';
    experienceYearsInput.style.display = job.experience === 'experienced' ? 'block' : 'none';

    jobForm.querySelectorAll('input[name="employmentType"]').forEach(cb => {
        cb.checked = Array.isArray(job.employmentTypes) && job.employmentTypes.includes(cb.value);
    });

    currentSkills = Array.isArray(job.skills) ? [...job.skills] : [];
    renderSkillsList(isViewMode);
    jobForm.querySelector('input[name="expiryDate"]').value = job.expiryDate || '';
    jobForm.querySelector('input[name="featured"]').checked = job.featured || false;
    jobForm.querySelector('input[name="urgent"]').checked = job.urgent || false;
}

function renderSkillsList(readonly = false) {
    const list = document.getElementById('skillsList');
    list.innerHTML = '';
    currentSkills.forEach((skill, index) => {
        const skillTag = document.createElement('span');
        skillTag.className = 'skill-tag';
        skillTag.innerHTML = readonly ? skill : `${skill} <button type="button" onclick="removeSkill(${index})">×</button>`;
        list.appendChild(skillTag);
    });
}

function addSkill() {
    const skillInput = document.getElementById('skillInput');
    const skill = skillInput.value.trim();
    if (skill && !currentSkills.includes(skill)) {
        currentSkills.push(skill);
        skillInput.value = '';
        renderSkillsList();
    }
}

function removeSkill(index) {
    currentSkills.splice(index, 1);
    renderSkillsList();
}

// Allow adding skill with Enter key
document.getElementById('skillInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        addSkill();
    }
});

// Experience level functionality
jobForm.querySelectorAll('input[name="experience"]').forEach(radio => {
    radio.addEventListener('change', function() {
        experienceYearsInput.style.display = this.value === 'experienced' ? 'block' : 'none';
    });
});

addJobBtn.addEventListener('click', () => {
    editingJobId = null;
    isViewMode = false;
    openJobModal();
});

// Modal outside click to close
document.getElementById('jobModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeJobModal();
    }
});

// Theme toggle functionality
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');
    const themeText = document.getElementById('theme-text');
    
    if (body.getAttribute('data-theme') === 'dark') {
        body.removeAttribute('data-theme');
        themeIcon.textContent = '🌙';
        themeText.textContent = 'Dark';
        localStorage.setItem('theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        themeIcon.textContent = '☀️';
        themeText.textContent = 'Light';
        localStorage.setItem('theme', 'dark');
    }
}

// Load saved theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.body.setAttribute('data-theme', 'dark');
    document.getElementById('theme-icon').textContent = '☀️';
    document.getElementById('theme-text').textContent = 'Light';
}

// File upload handling
document.getElementById('companyLogoFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('logoPreview');
    
    if (file) {
        // Check file size (16MB = 16 * 1024 * 1024 bytes)
        const maxSize = 16 * 1024 * 1024;
        if (file.size > maxSize) {
            alert('Error: File size exceeds 16MB limit. Please choose a smaller image.');
            e.target.value = ''; // Clear the input
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const base64String = e.target.result;
            
            preview.innerHTML = `
                <img src="${base64String}" alt="Logo Preview" class="preview-image">
                <div class="preview-info">
                    <div class="preview-name">${file.name}</div>
                    <div class="preview-size">${(file.size / 1024).toFixed(1)} KB</div>
                </div>
                <button type="button" class="remove-file" onclick="removeLogoFile()">Remove</button>
            `;
            preview.classList.add('active');
            
            // Store base64 string for form submission
            document.getElementById('companyLogoFile').setAttribute('data-base64', base64String);
        };
        reader.readAsDataURL(file);
    }
});

function removeLogoFile() {
    document.getElementById('companyLogoFile').value = '';
    document.getElementById('companyLogoFile').removeAttribute('data-base64');
    document.getElementById('logoPreview').classList.remove('active');
    document.getElementById('logoPreview').innerHTML = '';
}

// Initial load
fetchJobs();