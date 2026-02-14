// Fix existing jobs with missing data
require('dotenv').config();
const Job = require('./models/job');
require('./config/db');

async function fixJobs() {
    try {
        console.log('🔧 Fixing existing jobs...\n');
        
        const jobs = await Job.find();
        console.log(`Found ${jobs.length} jobs to check\n`);
        
        for (let job of jobs) {
            let updated = false;
            const updates = {};
            
            // Fix missing companyName
            if (!job.companyName) {
                updates.companyName = 'Tech Company';
                updated = true;
            }
            
            // Fix missing category
            if (!job.category) {
                updates.category = 'IT & Software';
                updated = true;
            }
            
            // Fix missing salary
            if (!job.minSalary) {
                updates.minSalary = '30000';
                updated = true;
            }
            if (!job.maxSalary) {
                updates.maxSalary = '50000';
                updated = true;
            }
            
            // Fix missing employmentTypes
            if (!job.employmentTypes || job.employmentTypes.length === 0) {
                updates.employmentTypes = ['Fulltime'];
                updated = true;
            }
            
            // Fix missing skills
            if (!job.skills || job.skills.length === 0) {
                updates.skills = ['JavaScript', 'HTML', 'CSS'];
                updated = true;
            }
            
            // Fix missing expiryDate
            if (!job.expiryDate) {
                const futureDate = new Date();
                futureDate.setMonth(futureDate.getMonth() + 1);
                updates.expiryDate = futureDate.toISOString().split('T')[0];
                updated = true;
            }
            
            if (updated) {
                await Job.findByIdAndUpdate(job._id, updates);
                console.log(`✅ Fixed job: ${job.title}`);
                console.log(`   Updates: ${Object.keys(updates).join(', ')}`);
            } else {
                console.log(`✓ Job OK: ${job.title}`);
            }
        }
        
        console.log('\n🎉 All jobs have been fixed!');
        console.log('🌐 Refresh your browser to see the changes');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

// Wait for connection
setTimeout(fixJobs, 2000);
