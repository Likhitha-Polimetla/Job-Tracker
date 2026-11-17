const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const { protect } = require('../middleware/authMiddleware');

// Get all jobs for logged-in user
router.get('/', protect, async (req, res) => {
  try {
    const jobs = await Job.find({ userId: req.user }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ message: 'Server error while fetching jobs' });
  }
});

// Create a new job application
router.post('/', protect, async (req, res) => {
  try {
    const { company, role, status, techStack, location, notes } = req.body;

    if (!company || !role) {
      return res.status(400).json({ message: 'Company and Role are required fields.' });
    }

    const job = await Job.create({
      userId: req.user,
      company,
      role,
      status: status || 'Applied',
      techStack: techStack || [],
      location: location || '',
      notes: notes || ''
    });

    res.status(201).json(job);
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(400).json({ message: error.message || 'Invalid job data' });
  }
});

// Update an existing job
router.put('/:id', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.userId.toString() !== req.user) {
      return res.status(401).json({ message: 'Not authorized to update this job' });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    res.json(updatedJob);
  } catch (error) {
    console.error("Error updating job:", error);
    res.status(500).json({ message: 'Server error while updating job' });
  }
});

// Delete a job application
router.delete('/:id', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.userId.toString() !== req.user) {
      return res.status(401).json({ message: 'Not authorized to delete this job' });
    }

    await job.deleteOne();
    res.json({ message: 'Job removed successfully' });
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({ message: 'Server error while deleting job' });
  }
});

module.exports = router;