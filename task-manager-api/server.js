require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cache = require('./cache');
const Task = require('./models/Task');
const Profile = require('./models/Profile');
const About = require('./models/About');
const Education = require('./models/Education');
const Skill = require('./models/Skill');
const Project = require('./models/Project');
const Achievement = require('./models/Achievement');
const Contact = require('./models/Contact');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing (CORS) for frontend integration
app.use(cors());

// Parse incoming request JSON payloads
app.use(express.json());

// Seeding function for portfolio data
async function seedPortfolioData() {
  try {
    // Seed Profile
    const profileCount = await Profile.countDocuments();
    if (profileCount === 0) {
      await Profile.create({
        name: 'JIYA',
        titles: ["Aspiring Software Developer", "Full Stack Developer", "Problem Solver"],
        githubUrl: 'https://github.com/jiyavinchhi123',
        linkedinUrl: 'https://linkedin.com/in/jiya-vinchhi-a75678332/',
        email: 'jiya.vinchhi2412@gmail.com'
      });
      console.log('Seeded Profile data');
    }

    // Seed About
    const aboutCount = await About.countDocuments();
    if (aboutCount === 0) {
      await About.create({
        paragraphs: [
          "Hi, I'm Jiya, a passionate Software Developer currently pursuing my BTech in Information Technology from Charotar University of Science and Technology (CHARUSAT). I am in my second year, building a strong foundation in software development and core computer science concepts.",
          "I enjoy creating real-world applications that solve meaningful problems and love working with modern technologies. Problem-solving, especially in Data Structures and Algorithms, is something I genuinely enjoy as it combines logic with creativity.",
          "I am always eager to learn, explore new technologies, and continuously improve my skills while working towards becoming a skilled developer who can contribute to impactful and innovative projects."
        ]
      });
      console.log('Seeded About data');
    }

    // Seed Education
    const eduCount = await Education.countDocuments();
    if (eduCount === 0) {
      await Education.create({
        degree: "BTech in Information Technology",
        institution: "Charotar University of Science and Technology (CHARUSAT)",
        year: "second year",
        description: "Building a strong foundation in software development and core computer science concepts."
      });
      console.log('Seeded Education data');
    }

    // Seed Skills
    const skillCount = await Skill.countDocuments();
    if (skillCount === 0) {
      const skills = [
        "C", "C++", "Java", "JavaScript", "PHP", "Python",
        "HTML", "CSS", "React", "Tailwind CSS",
        "Node.js", "Express.js", "Spring Boot",
        "MySQL", "MongoDB", "PostgreSQL", "Supabase",
        "Git", "GitHub", "Vercel", "Render",
        "Algorithms", "Data Structures", "DBMS", "OOP", "Design & Analysis",
        "Communication", "Problem Solving", "Teamwork", "Leadership"
      ];
      await Skill.insertMany(skills.map(s => ({ name: s })));
      console.log('Seeded Skills data');
    }

    // Seed Projects
    const projectCount = await Project.countDocuments();
    if (projectCount === 0) {
      const projects = [
        {
          name: "SiyaRang",
          description: "Customized e-commerce platform for a Bandhani store.",
          tech: ["HTML", "CSS", "JS", "Python"],
          features: ["Product catalog", "Custom UI", "Secure storage"],
          demo: "https://www.youtube.com/watch?v=FVvFQQ20D3M",
          repo: "https://github.com/jiyavinchhi123/SiyaRang-Bandhej",
          image: "siyarangImg"
        },
        {
          name: "ResumeFit",
          description: "Resume-to-job fit scoring with actionable improvements.",
          tech: ["Java", "Python", "Supabase"],
          features: ["Score out of 100", "Suggestions", "Trial model"],
          demo: "https://www.youtube.com/watch?v=wBWmEWm8Bvg",
          repo: "https://github.com/jiyavinchhi123/Job-Fit-Score",
          image: "resumefitImg"
        },
        {
          name: "FinLite",
          description: "Smart finance manager built for modern business owners with automated insights and beautiful reporting.",
          tech: ["React", "Spring Boot", "Supabase", "Python", "Charts"],
          features: [
            "Auto PDF balance sheet generation",
            "Smart predictions with interactive charts",
            "Guided, user-friendly workflows"
          ],
          demo: "https://www.youtube.com/watch?v=TQz-BSR0Dv4&t=15s",
          repo: "https://github.com/jiyavinchhi123/FinLite",
          image: "finliteImg"
        },
        {
          name: "FormFlux",
          description: "Dynamic form generator with database integration.",
          tech: ["MongoDB", "Java", "JS"],
          features: ["Auto DB creation", "Response tracking", "XLSX export"],
          demo: "https://www.youtube.com/watch?v=MhxHFskRKCw&t=8s",
          repo: "https://github.com/jiyavinchhi123/FormFlux",
          image: "formfluxImg"
        },
        {
          name: "Task Manager API",
          description: "A RESTful backend server with complete CRUD endpoints using an Express middleware pipeline.",
          tech: ["Node.js", "Express.js", "CORS", "JavaScript"],
          features: [
            "Strict Content-Type verification middleware",
            "Custom global logging and error handling pipeline",
            "Route-specific integer parameter validation",
            "Comprehensive REST CRUD endpoints (GET/POST/PUT/DELETE)"
          ],
          demo: "/projects/task-manager",
          repo: "https://github.com/jiyavinchhi123/task-manager-api",
          image: "taskmanagerImg"
        }
      ];
      await Project.insertMany(projects);
      console.log('Seeded Projects data');
    }

    // Seed Achievements
    const achCount = await Achievement.countDocuments();
    if (achCount === 0) {
      const achievements = [
        { type: "stat", value: "130+", label: "Problems Solved" },
        { type: "stat", value: "Top 5%", label: "NPTEL" },
        { type: "stat", value: "996", label: "CodeChef Rating" },
        { type: "stat", value: "National", label: "Hackathon Participant" },
        { type: "achievement", title: "NPTEL Top 5%", description: "Top 5% in DSA using Java.", icon: "FiAward" },
        { type: "achievement", title: "HackerRank Badges", description: "C++ Gold, C Silver, Java Bronze, Problem Solving Bronze.", icon: "FiStar" },
        { type: "achievement", title: "Hackamind 2026", description: "National Hackathon at Nirma University.", icon: "FiUsers" },
        { type: "achievement", title: "CodeChef Rating", description: "Current 996, peak 1020 rating.", icon: "FiTrendingUp" }
      ];
      await Achievement.insertMany(achievements);
      console.log('Seeded Achievements data');
    }

    // Seed Contact
    const contactCount = await Contact.countDocuments();
    if (contactCount === 0) {
      await Contact.create({
        email: "jiya.vinchhi2412@gmail.com",
        github: "https://github.com/jiyavinchhi123",
        linkedin: "https://linkedin.com/in/jiya-vinchhi-a75678332/"
      });
      console.log('Seeded Contact data');
    }
  } catch (err) {
    console.error('Error seeding portfolio data:', err);
  }
}

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskmanager')
  .then(() => {
    console.log('MongoDB connected successfully');
    seedPortfolioData();
  })
  .catch((err) => console.error('MongoDB connection error:', err));

// 1. Global Request Logging Middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[LOG] ${req.method} ${req.url} - ${timestamp}`);
  next();
});

// 2. Content-Type Verification Middleware for POST & PUT
app.use((req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    const contentType = req.headers['content-type'];
    if (!contentType) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Missing Content-Type header. Requests with bodies must include 'Content-Type: application/json'"
      });
    }
    if (!contentType.includes('application/json')) {
      return res.status(415).json({
        error: "Unsupported Media Type",
        message: "Unsupported Content-Type. Request body must be in JSON format ('application/json')"
      });
    }
  }
  next();
});

// 3. Route-Specific Middleware: Validate Task ID Format (now checking for Mongoose ObjectId)
const validateTaskId = (req, res, next) => {
  const rawId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(rawId)) {
    return res.status(400).json({
      error: "Bad Request",
      message: `Invalid task ID format '${rawId}'. ID must be a valid 24-character hexadecimal string.`
    });
  }
  req.taskId = rawId;
  next();
};

// --- RESTful Endpoints with In-Memory Caching (node-cache) ---

// GET /tasks - Read all tasks from MongoDB (with node-cache in-memory caching)
app.get('/tasks', async (req, res, next) => {
  try {
    // Optional bypass for benchmarking/testing: ?noCache=true or Cache-Control: no-cache
    const bypassCache = req.query.noCache === 'true' || req.headers['cache-control'] === 'no-cache';

    if (!bypassCache) {
      const cachedTasks = cache.get('all_tasks');
      if (cachedTasks) {
        res.set('X-Cache', 'HIT');
        return res.status(200).json(cachedTasks);
      }
    }

    // Cache MISS: Query MongoDB
    const tasks = await Task.find().sort({ createdAt: -1 });

    if (!bypassCache) {
      cache.set('all_tasks', tasks);
    }

    res.set('X-Cache', bypassCache ? 'BYPASS' : 'MISS');
    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
});

// GET /tasks/:id - Read task by MongoDB ObjectId (with single-task caching)
app.get('/tasks/:id', validateTaskId, async (req, res, next) => {
  try {
    const cacheKey = `task_${req.taskId}`;
    const bypassCache = req.query.noCache === 'true' || req.headers['cache-control'] === 'no-cache';

    if (!bypassCache) {
      const cachedTask = cache.get(cacheKey);
      if (cachedTask) {
        res.set('X-Cache', 'HIT');
        return res.status(200).json(cachedTask);
      }
    }

    const task = await Task.findById(req.taskId);
    if (!task) {
      return res.status(404).json({
        error: "Not Found",
        message: `Task with ID ${req.taskId} not found.`
      });
    }

    if (!bypassCache) {
      cache.set(cacheKey, task);
    }

    res.set('X-Cache', bypassCache ? 'BYPASS' : 'MISS');
    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
});

// POST /tasks - Create a task in MongoDB and invalidate cache
app.post('/tasks', async (req, res, next) => {
  try {
    const { title, description, priority, category, dueDate } = req.body;

    // Explicit title presence check (Mongoose schema also catches this, but this gives a friendly error)
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({
        error: "Bad Request",
        message: "Task title is required and must be a non-empty string."
      });
    }

    const newTask = await Task.create({
      title,
      description,
      priority,
      category,
      dueDate
    });

    // Invalidate the cache after successful write so stale data is never served
    cache.del('all_tasks');

    res.status(201).json(newTask);
  } catch (err) {
    next(err);
  }
});

// PUT /tasks/:id - Update an existing task in MongoDB and invalidate cache
app.put('/tasks/:id', validateTaskId, async (req, res, next) => {
  try {
    const { title, description, completed, priority, category, dueDate } = req.body;

    // Perform lookup first to ensure it exists
    const task = await Task.findById(req.taskId);
    if (!task) {
      return res.status(404).json({
        error: "Not Found",
        message: `Task with ID ${req.taskId} not found.`
      });
    }

    // Build update object
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (completed !== undefined) updates.completed = completed;
    if (priority !== undefined) updates.priority = priority;
    if (category !== undefined) updates.category = category;
    if (dueDate !== undefined) updates.dueDate = dueDate;

    const updatedTask = await Task.findByIdAndUpdate(
      req.taskId,
      updates,
      { new: true, runValidators: true }
    );

    // Invalidate both the list cache and the specific single-task cache
    cache.del('all_tasks');
    cache.del(`task_${req.taskId}`);

    res.status(200).json(updatedTask);
  } catch (err) {
    next(err);
  }
});

// DELETE /tasks/:id - Delete task from MongoDB and invalidate cache
app.delete('/tasks/:id', validateTaskId, async (req, res, next) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.taskId);
    if (!deletedTask) {
      return res.status(404).json({
        error: "Not Found",
        message: `Task with ID ${req.taskId} not found.`
      });
    }

    // Invalidate both the list cache and the specific single-task cache
    cache.del('all_tasks');
    cache.del(`task_${req.taskId}`);

    res.status(200).json({
      message: "Task deleted successfully.",
      task: deletedTask
    });
  } catch (err) {
    next(err);
  }
});

// --- Debug & Cache Statistics Endpoints (Supplementary Problems) ---
const getCacheStats = (req, res) => {
  const stats = cache.getStats();
  const keys = cache.keys();
  const total = stats.hits + stats.misses;
  const hitRatio = total > 0 ? `${((stats.hits / total) * 100).toFixed(2)}%` : '0.00%';

  res.status(200).json({
    status: "active",
    hits: stats.hits,
    misses: stats.misses,
    totalRequests: total,
    hitRatio: hitRatio,
    activeKeysCount: keys.length,
    activeKeys: keys,
    stdTTL: 60,
    memoryStats: {
      ksize: stats.ksize,
      vsize: stats.vsize
    }
  });
};

// Expose cache stats via /debug/cache and /tasks/cache/stats
app.get('/debug/cache', getCacheStats);
app.get('/tasks/cache/stats', getCacheStats);

// Allow testing cache clearing/flushing
app.post('/debug/cache/clear', (req, res) => {
  cache.flushAll();
  res.status(200).json({
    message: "Cache flushed successfully.",
    stats: cache.getStats()
  });
});

// Middleware to validate Education Mongoose ID
const validateEducationId = (req, res, next) => {
  const rawId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(rawId)) {
    return res.status(400).json({
      error: "Bad Request",
      message: `Invalid education ID format '${rawId}'. ID must be a valid 24-character hexadecimal string.`
    });
  }
  req.eduId = rawId;
  next();
};

// --- Portfolio Management API Endpoints ---

// LOGIN
app.post('/portfolio/login', (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  if (password === adminPassword) {
    return res.status(200).json({ success: true, token: "admin-session-token-998" });
  } else {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

// PROFILE
app.get('/portfolio/profile', async (req, res, next) => {
  try {
    let profile = await Profile.findOne();
    if (!profile) {
      profile = await Profile.create({});
    }
    res.status(200).json(profile);
  } catch (err) {
    next(err);
  }
});

app.put('/portfolio/profile', async (req, res, next) => {
  try {
    let profile = await Profile.findOne();
    if (!profile) {
      profile = new Profile();
    }
    const { name, titles, profilePhotoUrl, shortIntro, resumeUrl, githubUrl, linkedinUrl, email } = req.body;
    if (name !== undefined) profile.name = name;
    if (titles !== undefined) profile.titles = titles;
    if (profilePhotoUrl !== undefined) profile.profilePhotoUrl = profilePhotoUrl;
    if (shortIntro !== undefined) profile.shortIntro = shortIntro;
    if (resumeUrl !== undefined) profile.resumeUrl = resumeUrl;
    if (githubUrl !== undefined) profile.githubUrl = githubUrl;
    if (linkedinUrl !== undefined) profile.linkedinUrl = linkedinUrl;
    if (email !== undefined) profile.email = email;

    await profile.save();
    res.status(200).json(profile);
  } catch (err) {
    next(err);
  }
});

// ABOUT
app.get('/portfolio/about', async (req, res, next) => {
  try {
    let about = await About.findOne();
    if (!about) {
      about = await About.create({});
    }
    res.status(200).json(about);
  } catch (err) {
    next(err);
  }
});

app.put('/portfolio/about', async (req, res, next) => {
  try {
    let about = await About.findOne();
    if (!about) {
      about = new About();
    }
    const { description, careerObjective, interests } = req.body;
    if (description !== undefined) {
      about.description = description;
      about.paragraphs = [description]; // keep for backwards compatibility if needed
    }
    if (careerObjective !== undefined) about.careerObjective = careerObjective;
    if (interests !== undefined) about.interests = interests;

    await about.save();
    res.status(200).json(about);
  } catch (err) {
    next(err);
  }
});

// EDUCATION
app.get('/portfolio/education', async (req, res, next) => {
  try {
    const list = await Education.find().sort({ graduationYear: -1 });
    res.status(200).json(list);
  } catch (err) {
    next(err);
  }
});

app.post('/portfolio/education', async (req, res, next) => {
  try {
    const { degree, college, branch, startYear, graduationYear, description } = req.body;
    if (!degree || !college || !graduationYear) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Degree, college/university, and graduation year are required."
      });
    }

    const newEdu = await Education.create({
      degree,
      college,
      branch,
      startYear,
      graduationYear,
      description,
      institution: college, // backwards compatibility
      year: `${startYear} - ${graduationYear}`
    });
    res.status(201).json(newEdu);
  } catch (err) {
    next(err);
  }
});

app.put('/portfolio/education/:id', validateEducationId, async (req, res, next) => {
  try {
    const { degree, college, branch, startYear, graduationYear, description } = req.body;
    const edu = await Education.findById(req.eduId);
    if (!edu) {
      return res.status(404).json({
        error: "Not Found",
        message: `Education entry with ID ${req.eduId} not found.`
      });
    }

    if (degree !== undefined) edu.degree = degree;
    if (college !== undefined) {
      edu.college = college;
      edu.institution = college;
    }
    if (branch !== undefined) edu.branch = branch;
    if (startYear !== undefined) edu.startYear = startYear;
    if (graduationYear !== undefined) edu.graduationYear = graduationYear;
    if (description !== undefined) edu.description = description;

    // Recalculate helper display field
    edu.year = `${edu.startYear || ''} - ${edu.graduationYear || ''}`;

    await edu.save();
    res.status(200).json(edu);
  } catch (err) {
    next(err);
  }
});

app.delete('/portfolio/education/:id', validateEducationId, async (req, res, next) => {
  try {
    const deletedEdu = await Education.findByIdAndDelete(req.eduId);
    if (!deletedEdu) {
      return res.status(404).json({
        error: "Not Found",
        message: `Education entry with ID ${req.eduId} not found.`
      });
    }
    res.status(200).json({
      message: "Education entry deleted successfully.",
      education: deletedEdu
    });
  } catch (err) {
    next(err);
  }
});

const validateProjectId = (req, res, next) => {
  const rawId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(rawId)) {
    return res.status(400).json({
      error: "Bad Request",
      message: `Invalid project ID format '${rawId}'. ID must be a valid 24-character hexadecimal string.`
    });
  }
  req.projectId = rawId;
  next();
};

const validateAchievementId = (req, res, next) => {
  const rawId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(rawId)) {
    return res.status(400).json({
      error: "Bad Request",
      message: `Invalid achievement ID format '${rawId}'. ID must be a valid 24-character hexadecimal string.`
    });
  }
  req.achievementId = rawId;
  next();
};

// SKILLS
app.get('/portfolio/skills', async (req, res, next) => {
  try {
    const list = await Skill.find();
    res.status(200).json(list.map(s => s.name));
  } catch (err) {
    next(err);
  }
});

app.post('/portfolio/skills', async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Bad Request", message: "Skill name is required." });
    }
    const exists = await Skill.findOne({ name });
    if (exists) {
      return res.status(400).json({ error: "Bad Request", message: "Skill already exists." });
    }
    const newSkill = await Skill.create({ name });
    res.status(201).json(newSkill);
  } catch (err) {
    next(err);
  }
});

app.delete('/portfolio/skills/:name', async (req, res, next) => {
  try {
    const name = req.params.name;
    const deleted = await Skill.findOneAndDelete({ name });
    if (!deleted) {
      return res.status(404).json({ error: "Not Found", message: `Skill '${name}' not found.` });
    }
    res.status(200).json({ message: "Skill deleted successfully.", skill: deleted });
  } catch (err) {
    next(err);
  }
});

// PROJECTS
app.get('/portfolio/projects', async (req, res, next) => {
  try {
    const list = await Project.find();
    res.status(200).json(list);
  } catch (err) {
    next(err);
  }
});

app.post('/portfolio/projects', async (req, res, next) => {
  try {
    const { name, description, tech, features, demo, repo, image, milestones } = req.body;
    if (!name || !description) {
      return res.status(400).json({ error: "Bad Request", message: "Project name and description are required." });
    }
    const newProj = await Project.create({ name, description, tech, features, demo, repo, image, milestones });
    res.status(201).json(newProj);
  } catch (err) {
    next(err);
  }
});

app.put('/portfolio/projects/:id', validateProjectId, async (req, res, next) => {
  try {
    const { name, description, tech, features, demo, repo, image, milestones } = req.body;
    const proj = await Project.findById(req.projectId);
    if (!proj) {
      return res.status(404).json({ error: "Not Found", message: "Project not found." });
    }
    if (name !== undefined) proj.name = name;
    if (description !== undefined) proj.description = description;
    if (tech !== undefined) proj.tech = tech;
    if (features !== undefined) proj.features = features;
    if (demo !== undefined) proj.demo = demo;
    if (repo !== undefined) proj.repo = repo;
    if (image !== undefined) proj.image = image;
    if (milestones !== undefined) proj.milestones = milestones;

    await proj.save();
    res.status(200).json(proj);
  } catch (err) {
    next(err);
  }
});

app.delete('/portfolio/projects/:id', validateProjectId, async (req, res, next) => {
  try {
    const deleted = await Project.findByIdAndDelete(req.projectId);
    if (!deleted) {
      return res.status(404).json({ error: "Not Found", message: "Project not found." });
    }
    res.status(200).json({ message: "Project deleted successfully.", project: deleted });
  } catch (err) {
    next(err);
  }
});

// ACHIEVEMENTS
app.get('/portfolio/achievements', async (req, res, next) => {
  try {
    const list = await Achievement.find();
    res.status(200).json(list);
  } catch (err) {
    next(err);
  }
});

app.post('/portfolio/achievements', async (req, res, next) => {
  try {
    const { type, title, description, icon, value, label } = req.body;
    if (!type) {
      return res.status(400).json({ error: "Bad Request", message: "Type ('stat' or 'achievement') is required." });
    }
    const newAch = await Achievement.create({ type, title, description, icon, value, label });
    res.status(201).json(newAch);
  } catch (err) {
    next(err);
  }
});

app.put('/portfolio/achievements/:id', validateAchievementId, async (req, res, next) => {
  try {
    const { type, title, description, icon, value, label } = req.body;
    const ach = await Achievement.findById(req.achievementId);
    if (!ach) {
      return res.status(404).json({ error: "Not Found", message: "Achievement/Stat not found." });
    }
    if (type !== undefined) ach.type = type;
    if (title !== undefined) ach.title = title;
    if (description !== undefined) ach.description = description;
    if (icon !== undefined) ach.icon = icon;
    if (value !== undefined) ach.value = value;
    if (label !== undefined) ach.label = label;

    await ach.save();
    res.status(200).json(ach);
  } catch (err) {
    next(err);
  }
});

app.delete('/portfolio/achievements/:id', validateAchievementId, async (req, res, next) => {
  try {
    const deleted = await Achievement.findByIdAndDelete(req.achievementId);
    if (!deleted) {
      return res.status(404).json({ error: "Not Found", message: "Achievement/Stat not found." });
    }
    res.status(200).json({ message: "Achievement/Stat deleted successfully.", achievement: deleted });
  } catch (err) {
    next(err);
  }
});

// CONTACT
app.get('/portfolio/contact', async (req, res, next) => {
  try {
    let contact = await Contact.findOne();
    if (!contact) {
      contact = await Contact.create({
        email: "jiya.vinchhi2412@gmail.com",
        github: "https://github.com/jiyavinchhi123",
        linkedin: "https://linkedin.com/in/jiya-vinchhi-a75678332/"
      });
    }
    res.status(200).json(contact);
  } catch (err) {
    next(err);
  }
});

app.put('/portfolio/contact', async (req, res, next) => {
  try {
    const { email, github, linkedin } = req.body;
    let contact = await Contact.findOne();
    if (!contact) {
      contact = new Contact();
    }
    if (email !== undefined) contact.email = email;
    if (github !== undefined) contact.github = github;
    if (linkedin !== undefined) contact.linkedin = linkedin;
    await contact.save();
    res.status(200).json(contact);
  } catch (err) {
    next(err);
  }
});

// Trigger a deliberate server error to test Global Error Handling (for testing only)
app.get('/trigger-error', (req, res, next) => {
  next(new Error("Deliberately triggered server error for demonstration."));
});

// 4. Catch-All Middleware for Undefined Routes
app.use((req, res, next) => {
  res.status(404).json({
    error: "Not Found",
    message: `Cannot ${req.method} ${req.url} - The requested route does not exist on this server.`
  });
});

// 5. Centralized Global Error Handling Middleware (handles Mongoose validation errors nicely)
app.use((err, req, res, next) => {
  console.error("[ERROR] Global Exception Handler caught an error:", err.stack);

  // Clean, structured error handling for Mongoose Validation Errors
  if (err.name === 'ValidationError') {
    const errorDetails = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      error: "Bad Request",
      message: "Database validation failed.",
      details: errorDetails
    });
  }

  // Clean, structured error handling for Cast Errors (e.g. invalid Hex structure for ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: "Bad Request",
      message: `Data format conversion failed for field: ${err.path}. Expected valid type.`
    });
  }

  res.status(500).json({
    error: "Internal Server Error",
    message: "An unexpected error occurred on the server.",
    hint: "If testing error handling, verify server console logs for stack trace detail."
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`Task Manager API running at http://localhost:${PORT}`);
  console.log(`Global logger and MongoDB connection active.`);
  console.log(`==================================================`);
});
