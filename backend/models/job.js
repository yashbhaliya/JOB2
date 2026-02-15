const mongoose = require('../config/db'); // important to import the connection

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String, required: true },
    companyName: { type: String, required: true },
    location: { type: String, required: true },
    companyLogo: String,
    description: String,
    minSalary: String,
    maxSalary: String,
    experience: { type: String, default: 'freshman' },
    years: String,
    employmentTypes: [String],
    skills: [String],
    expiryDate: String,
    featured: { type: Boolean, default: false },
    urgent: { type: Boolean, default: false }
}, { 
    toJSON: { virtuals: false },
    toObject: { virtuals: false }
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
