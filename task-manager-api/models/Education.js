const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
  degree: {
    type: String,
    required: true
  },
  college: {
    type: String,
    default: ''
  },
  institution: {
    type: String,
    default: ''
  },
  branch: {
    type: String,
    default: ''
  },
  startYear: {
    type: String,
    default: ''
  },
  graduationYear: {
    type: String,
    default: ''
  },
  year: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Education', educationSchema);
