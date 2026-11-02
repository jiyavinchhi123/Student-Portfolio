const mongoose = require('mongoose');

const aboutSchema = new mongoose.Schema({
  description: {
    type: String,
    default: "Hi, I'm Jiya, a passionate Software Developer currently pursuing my BTech in Information Technology from Charotar University of Science and Technology (CHARUSAT). I am in my second year, building a strong foundation in software development and core computer science concepts."
  },
  careerObjective: {
    type: String,
    default: "I enjoy creating real-world applications that solve meaningful problems and love working with modern technologies. Problem-solving, especially in Data Structures and Algorithms, is something I genuinely enjoy as it combines logic with creativity."
  },
  interests: {
    type: [String],
    default: ["Problem Solving", "Data Structures", "Algorithms", "Web Development"]
  },
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
