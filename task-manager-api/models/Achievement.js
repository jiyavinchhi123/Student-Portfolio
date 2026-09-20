const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['stat', 'achievement'],
    required: true
  },
  title: {
    type: String,
    required: function() { return this.type === 'achievement'; }
  },
  description: {
    type: String,
    required: function() { return this.type === 'achievement'; }
  },
  icon: {
    type: String,
    default: 'FiAward'
  },
  value: {
    type: String,
    required: function() { return this.type === 'stat'; }
  },
  label: {
    type: String,
    required: function() { return this.type === 'stat'; }
  }
}, { timestamps: true });

module.exports = mongoose.model('Achievement', achievementSchema);
