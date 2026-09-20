const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  }
});

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  tech: {
    type: [String],
    default: []
  },
  features: {
    type: [String],
    default: []
  },
  demo: {
    type: String,
    default: ''
  },
  repo: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  milestones: {
    type: [milestoneSchema],
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
