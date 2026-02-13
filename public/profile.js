// Check authentication
const user = JSON.parse(localStorage.getItem('user'));
if (!user) {
    window.location.href = 'home.html';
}

// Get token from either user object or separate storage
if (!user.token) {
    user.token = localStorage.getItem('token');
}

console.log('User object:', user);
console.log('Has token:', !!user.token);

// Initialize arrays if they don't exist
if (!user.skills) user.skills = [];
if (!user.basicInformation) user.basicInformation = [];
if (!user.experiences) user.experiences = [];
if (!user.educations) user.educations = [];

// Helper function to save profile to MongoDB
async function saveProfileToMongoDB() {
    try {
        console.log('Saving to MongoDB:', {
            name: user.name,
            profileImage: user.profileImage ? 'Image data' : null,
            about: user.about,
            skills: user.skills,
            basicInformation: user.basicInformation,
            experiences: user.experiences,
            educations: user.educations
        });
        
        const response = await fetch('http://localhost:5000/api/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify({
                name: user.name,
                profileImage: user.profileImage,
                about: user.about,
                skills: user.skills,
                basicInformation: user.basicInformation,
                experiences: user.experiences,
                educations: user.educations
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Save failed:', errorData);
            throw new Error('Failed to save profile');
        }
        const result = await response.json();
        console.log('Save successful:', result);
        return result;
    } catch (error) {
        console.error('Error saving profile:', error);
        alert('Failed to save profile: ' + error.message);
        return null;
    }
}

// Helper function to load profile from MongoDB
async function loadProfileFromMongoDB() {
    try {
        console.log('Loading from MongoDB...');
        const response = await fetch('http://localhost:5000/api/profile', {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to load profile');
        const data = await response.json();
        console.log('Loaded from MongoDB:', data);
        
        if (data.user) {
            const token = user.token;
            Object.assign(user, data.user);
            user.token = token;
            
            // Ensure arrays exist
            if (!user.skills) user.skills = [];
            if (!user.basicInformation) user.basicInformation = [];
            if (!user.experiences) user.experiences = [];
            if (!user.educations) user.educations = [];
            
            localStorage.setItem('user', JSON.stringify(user));
        }
        return data.user;
    } catch (error) {
        console.error('Error loading profile:', error);
        return null;
    }
}

// Display user data
let profileSkills = [];

document.addEventListener('DOMContentLoaded', async () => {
    if (user.token) {
        await loadProfileFromMongoDB();
    }
    displayUserData();
    displayExperience();
    displayEducation();
    
    // Handle avatar upload from profile page
    document.getElementById('avatarUpload').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (event) => {
                user.profileImage = event.target.result;
                localStorage.setItem('user', JSON.stringify(user));
                if (user.token) {
                    await saveProfileToMongoDB();
                }
                displayUserData();
                showSuccessNotification();
            };
            reader.readAsDataURL(file);
        }
    });
    
    document.getElementById('profileImage').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const previewAvatar = document.getElementById('previewAvatar');
                previewAvatar.outerHTML = `<img src="${event.target.result}" id="previewAvatar" class="avatar" style="object-fit: cover; margin: 0 auto 10px;">`;
                user.profileImage = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Enter key support for skills
    document.getElementById('editSkillInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addProfileSkill();
        }
    });
});

function displayUserData() {
    const userName = user.name || 'User';
    const userEmail = user.email || 'N/A';
    const userSkills = user.skills || [];
    const userImage = user.profileImage;
    const userAbout = user.about || 'Welcome to your profile page. Update your information to get better job recommendations.';
    
    const basicInfo = user.basicInformation && user.basicInformation[0] ? user.basicInformation[0] : {};
    const jobType = basicInfo.jobType || 'Job Seeker';
    const phone = basicInfo.phone || 'Not provided';
    const experienceYears = basicInfo.experienceYears || 'Not provided';
    const status = basicInfo.status || 'Active';
    const memberSince = basicInfo.memberSince || '2024';
    
    // Update left card
    document.querySelector('.left-card h3').textContent = userName;
    document.querySelector('.role').textContent = jobType;
    document.querySelector('.about').textContent = userAbout;
    
    // Update avatar
    const avatarContainer = document.querySelector('.avatar-wrapper');
    const avatarImg = avatarContainer.querySelector('.avatar');
    if (userImage) {
        avatarImg.outerHTML = `<img src="${userImage}" class="avatar" style="object-fit: cover;">`;
    } else {
        const firstLetter = userName.charAt(0).toUpperCase();
        if (avatarImg.tagName === 'IMG') {
            avatarImg.outerHTML = `<div class="avatar">${firstLetter}</div>`;
        } else {
            avatarImg.textContent = firstLetter;
        }
    }
    
    // Update info grid
    const infoDivs = document.querySelectorAll('.info-grid div');
    infoDivs[0].innerHTML = `<strong>Email</strong><br>${userEmail}`;
    infoDivs[1].innerHTML = `<strong>Phone</strong><br>${phone}`;
    infoDivs[2].innerHTML = `<strong>Experience</strong><br>${experienceYears}`;
    infoDivs[3].innerHTML = `<strong>Status</strong><br>${status}`;
    infoDivs[4].innerHTML = `<strong>Member Since</strong><br>${memberSince}`;
    
    // Update skills
    const skillsDiv = document.querySelector('.skills');
    if (userSkills.length > 0) {
        skillsDiv.innerHTML = userSkills.map(skill => `<span>${skill}</span>`).join('');
    }
}

function openEditModal() {
    const basicInfo = user.basicInformation && user.basicInformation[0] ? user.basicInformation[0] : {};
    
    document.getElementById('editName').value = user.name || '';
    document.getElementById('editCategory').value = basicInfo.jobType || '';
    document.getElementById('editAbout').value = user.about || '';
    document.getElementById('editEmail').value = user.email || '';
    document.getElementById('editPhone').value = basicInfo.phone || '';
    document.getElementById('editExperience').value = basicInfo.experienceYears || '';
    
    // Load existing skills
    profileSkills = user.skills || [];
    displayProfileSkills();
    
    // Update preview avatar
    const previewAvatar = document.getElementById('previewAvatar');
    if (user.profileImage) {
        previewAvatar.outerHTML = `<img src="${user.profileImage}" id="previewAvatar" class="avatar" style="object-fit: cover; margin: 0 auto 10px;">`;
    } else {
        const firstLetter = (user.name || 'U').charAt(0).toUpperCase();
        previewAvatar.textContent = firstLetter;
    }
    
    document.getElementById('editModal').style.display = 'block';
}

function addProfileSkill() {
    const input = document.getElementById('editSkillInput');
    const skill = input.value.trim();
    
    if (skill && !profileSkills.includes(skill)) {
        profileSkills.push(skill);
        displayProfileSkills();
        input.value = '';
    }
}

function removeProfileSkill(skill) {
    profileSkills = profileSkills.filter(s => s !== skill);
    displayProfileSkills();
}

function displayProfileSkills() {
    const container = document.getElementById('profileSkillsList');
    container.innerHTML = profileSkills.map(skill => 
        `<span>${skill} <button type="button" onclick="removeProfileSkill('${skill}')">×</button></span>`
    ).join('');
}

// Handle image upload
document.addEventListener('DOMContentLoaded', () => {
    displayUserData();
    
    document.getElementById('profileImage').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const previewAvatar = document.getElementById('previewAvatar');
                previewAvatar.outerHTML = `<img src="${event.target.result}" id="previewAvatar" class="avatar" style="object-fit: cover; margin: 0 auto 10px;">`;
                user.profileImage = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
});

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

document.getElementById('editForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    user.name = document.getElementById('editName').value;
    user.about = document.getElementById('editAbout').value;
    user.email = document.getElementById('editEmail').value;
    user.skills = profileSkills;
    
    if (!user.basicInformation) user.basicInformation = [{}];
    user.basicInformation[0] = {
        jobType: document.getElementById('editCategory').value,
        phone: document.getElementById('editPhone').value,
        experienceYears: document.getElementById('editExperience').value,
        status: user.basicInformation[0]?.status || 'Active',
        memberSince: user.basicInformation[0]?.memberSince || new Date().getFullYear().toString()
    };
    
    localStorage.setItem('user', JSON.stringify(user));
    
    if (user.token) {
        console.log('Calling saveProfileToMongoDB...');
        const result = await saveProfileToMongoDB();
        if (result) {
            console.log('Save successful!');
        } else {
            console.error('Save failed!');
        }
    } else {
        console.warn('No token found, skipping MongoDB save');
    }
    
    displayUserData();
    closeEditModal();
    showSuccessNotification();
});

function showSuccessNotification() {
    const notification = document.getElementById('successNotification');
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Experience Modal Functions
let editingExpIndex = -1;

function openExperienceModal(index = -1) {
    editingExpIndex = index;
    
    if (index >= 0 && user.experiences && user.experiences[index]) {
        const exp = user.experiences[index];
        document.getElementById('expCompany').value = exp.companyName;
        document.getElementById('expTitle').value = exp.jobTitle;
        document.getElementById('expJoinDate').value = exp.joinDate;
        document.getElementById('expLastDate').value = exp.lastDate || '';
        document.getElementById('expPresent').checked = exp.present;
        document.getElementById('expLocation').value = exp.location;
        document.getElementById('expLastDate').disabled = exp.present;
    } else {
        document.getElementById('expCompany').value = '';
        document.getElementById('expTitle').value = '';
        document.getElementById('expJoinDate').value = '';
        document.getElementById('expLastDate').value = '';
        document.getElementById('expPresent').checked = false;
        document.getElementById('expLocation').value = '';
        document.getElementById('expLastDate').disabled = false;
    }
    
    document.getElementById('experienceModal').style.display = 'block';
}

function closeExperienceModal() {
    document.getElementById('experienceModal').style.display = 'none';
}

// Handle company logo upload
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('companyLogo').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                document.getElementById('companyLogoPreview').innerHTML = 
                    `<img src="${event.target.result}" style="width: 100%; height: 100%; object-fit: cover;">`;
            };
            reader.readAsDataURL(file);
        }
    });
    
    document.getElementById('expCompany').addEventListener('input', (e) => {
        const companyName = e.target.value.trim();
        const logoPreview = document.getElementById('companyLogoPreview');
        if (companyName && !logoPreview.querySelector('img')) {
            const firstLetter = companyName.charAt(0).toUpperCase();
            logoPreview.innerHTML = `<div style="width: 100%; height: 100%; background: #4f7cff; color: white; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: bold;">${firstLetter}</div>`;
        }
    });
    
    document.getElementById('expPresent').addEventListener('change', (e) => {
        document.getElementById('expLastDate').disabled = e.target.checked;
        if (e.target.checked) {
            document.getElementById('expLastDate').value = '';
        }
    });
});

// Handle experience form submission
document.getElementById('experienceForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const expData = {
        companyName: document.getElementById('expCompany').value,
        jobTitle: document.getElementById('expTitle').value,
        joinDate: document.getElementById('expJoinDate').value,
        lastDate: document.getElementById('expLastDate').value,
        present: document.getElementById('expPresent').checked,
        location: document.getElementById('expLocation').value
    };
    
    if (!user.experiences) user.experiences = [];
    
    if (editingExpIndex >= 0) {
        user.experiences[editingExpIndex] = expData;
    } else {
        user.experiences.push(expData);
    }
    
    localStorage.setItem('user', JSON.stringify(user));
    
    if (user.token) {
        console.log('Saving experience to MongoDB...', expData);
        const result = await saveProfileToMongoDB();
        if (result) {
            console.log('Experience saved successfully!');
        } else {
            console.error('Experience save failed!');
        }
    } else {
        console.warn('No token, skipping MongoDB save');
    }
    
    closeExperienceModal();
    showSuccessNotification();
    displayExperience();
});

async function deleteExperience(index) {
    if (confirm('Are you sure you want to delete this experience?')) {
        user.experiences.splice(index, 1);
        localStorage.setItem('user', JSON.stringify(user));
        if (user.token) {
            await saveProfileToMongoDB();
        }
        displayExperience();
        showSuccessNotification();
    }
}

function displayExperience() {
    const exps = user.experiences || [];
    const expSection = document.querySelector('.section:nth-child(2)');
    
    if (exps.length > 0) {
        const expsHTML = exps.map((exp, index) => {
            const endDate = exp.present ? 'Present' : new Date(exp.lastDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            const startDate = new Date(exp.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            
            return `
                <div style="display: flex; gap: 15px; margin-top: 15px; align-items: center; justify-content: space-between;">
                    <div style="display: flex; gap: 15px; align-items: center; flex: 1;">
                        <div style="width: 60px; height: 60px; border-radius: 10px; overflow: hidden; background: #f0f0f0; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-building" style="font-size: 24px; color: #999;"></i>
                        </div>
                        <div>
                            <h4 style="margin: 0 0 5px 0;">${exp.jobTitle}</h4>
                            <p style="margin: 0; color: #666;">${exp.companyName}</p>
                            <p style="margin: 5px 0 0 0; font-size: 14px; color: #888;">${startDate} - ${endDate} • ${exp.location}</p>
                        </div>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button onclick="openExperienceModal(${index})" style="padding: 6px 12px; background: #4f7cff; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px;"><i class="fas fa-edit"></i></button>
                        <button onclick="deleteExperience(${index})" style="padding: 6px 12px; background: #ff4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px;"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;
        }).join('');
        
        expSection.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h3>Experience</h3>
                <button class="btn-edit" onclick="openExperienceModal()">Add Experience</button>
            </div>
            ${expsHTML}
        `;
    }
}

// Education Modal Functions
let editingEduIndex = -1;

function openEducationModal(index = -1) {
    editingEduIndex = index;
    
    if (index >= 0 && user.educations && user.educations[index]) {
        const edu = user.educations[index];
        document.getElementById('eduInstitution').value = edu.institutionName;
        document.getElementById('eduDegree').value = edu.degree;
        document.getElementById('eduField').value = edu.fieldOfStudy;
        document.getElementById('eduYear').value = edu.year;
    } else {
        document.getElementById('eduInstitution').value = '';
        document.getElementById('eduDegree').value = '';
        document.getElementById('eduField').value = '';
        document.getElementById('eduYear').value = '';
    }
    
    document.getElementById('educationModal').style.display = 'block';
}

function closeEducationModal() {
    document.getElementById('educationModal').style.display = 'none';
}

// Handle institution logo upload
document.addEventListener('DOMContentLoaded', () => {
    displayEducation();
    
    document.getElementById('institutionLogo').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                document.getElementById('institutionLogoPreview').innerHTML = 
                    `<img src="${event.target.result}" style="width: 100%; height: 100%; object-fit: cover;">`;
            };
            reader.readAsDataURL(file);
        }
    });
    
    document.getElementById('eduInstitution').addEventListener('input', (e) => {
        const institutionName = e.target.value.trim();
        const logoPreview = document.getElementById('institutionLogoPreview');
        if (institutionName && !logoPreview.querySelector('img')) {
            const firstLetter = institutionName.charAt(0).toUpperCase();
            logoPreview.innerHTML = `<div style="width: 100%; height: 100%; background: #ff5c8a; color: white; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: bold;">${firstLetter}</div>`;
        }
    });
});

document.getElementById('educationForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const eduData = {
        institutionName: document.getElementById('eduInstitution').value,
        degree: document.getElementById('eduDegree').value,
        fieldOfStudy: document.getElementById('eduField').value,
        year: document.getElementById('eduYear').value
    };
    
    if (!user.educations) user.educations = [];
    
    if (editingEduIndex >= 0) {
        user.educations[editingEduIndex] = eduData;
    } else {
        user.educations.push(eduData);
    }
    
    localStorage.setItem('user', JSON.stringify(user));
    
    if (user.token) {
        console.log('Saving education to MongoDB...', eduData);
        const result = await saveProfileToMongoDB();
        if (result) {
            console.log('Education saved successfully!');
        } else {
            console.error('Education save failed!');
        }
    } else {
        console.warn('No token, skipping MongoDB save');
    }
    
    closeEducationModal();
    showSuccessNotification();
    displayEducation();
});

async function deleteEducation(index) {
    if (confirm('Are you sure you want to delete this education?')) {
        user.educations.splice(index, 1);
        localStorage.setItem('user', JSON.stringify(user));
        if (user.token) {
            await saveProfileToMongoDB();
        }
        displayEducation();
        showSuccessNotification();
    }
}

function displayEducation() {
    const edus = user.educations || [];
    const eduSection = document.querySelector('.section:nth-child(3)');
    
    if (edus.length > 0) {
        const edusHTML = edus.map((edu, index) => {
            return `
                <div style="display: flex; gap: 15px; margin-top: 15px; align-items: center; justify-content: space-between;">
                    <div style="display: flex; gap: 15px; align-items: center; flex: 1;">
                        <div style="width: 60px; height: 60px; border-radius: 10px; overflow: hidden; background: #f0f0f0; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-graduation-cap" style="font-size: 24px; color: #999;"></i>
                        </div>
                        <div>
                            <h4 style="margin: 0 0 5px 0;">${edu.degree}</h4>
                            <p style="margin: 0; color: #666;">${edu.institutionName}</p>
                            <p style="margin: 5px 0 0 0; font-size: 14px; color: #888;">${edu.fieldOfStudy} • ${edu.year}</p>
                        </div>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button onclick="openEducationModal(${index})" style="padding: 6px 12px; background: #4f7cff; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px;"><i class="fas fa-edit"></i></button>
                        <button onclick="deleteEducation(${index})" style="padding: 6px 12px; background: #ff4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px;"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;
        }).join('');
        
        eduSection.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h3>Education</h3>
                <button class="btn-edit" onclick="openEducationModal()">Add Education</button>
            </div>
            ${edusHTML}
        `;
    }
}
