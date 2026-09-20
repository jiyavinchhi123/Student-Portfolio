const mongoose = require('mongoose');

const aboutSchema = new mongoose.Schema({
  paragraphs: {
    type: [String],
    default: []
  },
  avatarUrl: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('About', aboutSchema);
