const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: 'JIYA'
  },
  titles: {
    type: [String],
    default: ["Aspiring Software Developer", "Full Stack Developer", "Problem Solver"]
  },
  githubUrl: {
    type: String,
    default: 'https://github.com/jiyavinchhi123'
  },
  linkedinUrl: {
    type: String,
    default: 'https://linkedin.com/in/jiya-vinchhi-a75678332/'
  },
  email: {
    type: String,
    default: 'jiya.vinchhi2412@gmail.com'
  },
  resumeUrl: {
    type: String,
    default: ''
  },
  profilePhotoUrl: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
