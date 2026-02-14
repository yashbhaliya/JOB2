// server.js (FINAL MERGED VERSION)

require('dotenv').config(); // Load env

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const Job = require('./models/job');          // Job model
require('./config/db');                       // MongoDB connection (job-portal)

// 🔐 Auth routes
const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');

const app = express();
const PORT = process.env.PORT || 5000;

/* ======================
   MIDDLEWARES
====================== */
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ======================
   STATIC FILES
====================== */
app.use(express.static(path.join(__dirname, '..', 'public')));

/* ======================
   AUTH ROUTES (NEW)
====================== */
app.use('/api/auth', authRoutes);
app.use('/api', profileRoutes);

/* ======================
   JOB ROUTES (UNCHANGED)
====================== */

// GET all jobs
app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await Job.find();
    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET single job by ID
app.get('/api/jobs/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE job
app.post('/api/jobs', async (req, res) => {
  try {
    const { title, category, companyName, location } = req.body;

    if (!title || !category || !companyName || !location) {
      return res.status(400).json({
        error: 'Title, category, company name, and location are required'
      });
    }

    const job = new Job(req.body);
    await job.save();

    res.json({ message: 'Job saved successfully!', job });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE job
app.put('/api/jobs/:id', async (req, res) => {
  try {
    const { title, category, companyName, location } = req.body;

    if (!title || !category || !companyName || !location) {
      return res.status(400).json({
        error: 'Title, category, company name, and location are required'
      });
    }

    const allowedFields = [
      'title',
      'category',
      'companyName',
      'location',
      'companyLogo',
      'minSalary',
      'maxSalary',
      'experience',
      'years',
      'employmentTypes',
      'skills',
      'expiryDate',
      'featured',
      'urgent'
    ];

    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedJob) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(updatedJob);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE job
app.delete('/api/jobs/:id', async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================
   FALLBACK (Frontend)
====================== */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'home.html'));
});

/* ======================
   SERVER START
====================== */
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
