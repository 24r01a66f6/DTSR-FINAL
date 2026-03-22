const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Resume = require('../models/Resume');
const { calculateResumeScore } = require('../utils/score');

// Middleware to verify JWT token
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Contains id property from jwt.sign payload
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// @route   GET /api/resume
// @desc    Get user's resumes (paginated)
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Resume.countDocuments({ user: req.user.id });
    const resumes = await Resume.find({ user: req.user.id })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      resumes,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/resume/:id
// @desc    Get a specific resume
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user.id });
    if (!resume) {
        return res.status(404).json({ message: 'Resume not found' });
    }
    res.json(resume);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/resume
// @desc    Create a new empty resume
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, layout, templateData } = req.body;
    
    // Calculate score
    const score = templateData ? calculateResumeScore(templateData) : 0;

    const newResume = new Resume({
      user: req.user.id,
      title: title || 'Untitled Resume',
      layout: layout || [],
      templateData: templateData || null,
      score: score
    });
    
    const savedResume = await newResume.save();
    res.json(savedResume);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/resume/:id
// @desc    Update an existing resume layout
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, layout, templateData } = req.body;
    
    let resume = await Resume.findOne({ _id: req.params.id, user: req.user.id });
    if (!resume) {
        return res.status(404).json({ message: 'Resume not found' });
    }

    if (title) resume.title = title;
    if (layout) resume.layout = layout;
    if (templateData) {
      resume.templateData = templateData;
      resume.score = calculateResumeScore(templateData);
    }

    const updatedResume = await resume.save();
    res.json(updatedResume);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
