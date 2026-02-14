const mongoose = require('../config/db');

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true
  },
  password: String,

  isVerified: {
    type: Boolean,
    default: false
  },

  verificationToken: String,
  verificationTokenExpiry: Date,
  
  resetPasswordToken: String,
  resetPasswordExpiry: Date,

  // Profile fields
  profileImage: String,
  about: String,
  skills: [String],
  
  basicInformation: [{
    jobType: String,
    phone: String,
    experienceYears: String,
    status: String,
    memberSince: String
  }],
  
  experiences: [{
    companyName: String,
    jobTitle: String,
    joinDate: String,
    lastDate: String,
    present: Boolean,
    location: String
  }],
  
  educations: [{
    institutionName: String,
    degree: String,
    fieldOfStudy: String,
    year: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
