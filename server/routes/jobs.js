const express = require('express');
const Job = require('../models/Job');
const { authenticateToken } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// @route   GET /api/jobs
// @desc    Get all jobs for authenticated user
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const jobs = await Job.findAll({
      where: { userId: req.userId },
      order: [['createdAt', 'DESC']]
    });

    res.json(jobs);
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs'
    });
  }
});

// @route   POST /api/jobs
// @desc    Create a new job application
// @access  Private
router.post('/', authenticateToken, async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      userId: req.userId
    };

    const job = await Job.create(jobData);
    
    res.status(201).json(job);
  } catch (error) {
    console.error('Create job error:', error);
    
    // Handle Sequelize validation errors (includes ValidationError and SequelizeValidationError)
    if (error.name === 'SequelizeValidationError' || error.name === 'ValidationError') {
      const validationErrors = error.errors.map(err => err.message);
      return res.status(400).json({
        success: false,
        message: validationErrors.join(', '),
        errors: validationErrors
      });
    }
    
    // Handle Sequelize unique constraint errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'A job with this information already exists'
      });
    }
    
    // Handle other Sequelize database errors
    if (error.name && error.name.includes('Sequelize')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job data provided'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create job application'
    });
  }
});

// @route   PATCH /api/jobs/:id
// @desc    Update job application status
// @access  Private
router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const job = await Job.findOne({
      where: { 
        id: req.params.id,
        userId: req.userId 
      }
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    await job.update(req.body);
    
    res.json(job);
  } catch (error) {
    console.error('Update job error:', error);
    
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
      
      return res.status(400).json({
        success: false,
        message: error.errors[0]?.message || 'Validation failed',
        errors: validationErrors
      });
    }
    
    // Handle Sequelize database constraint errors
    if (error.name === 'SequelizeDatabaseError' && error.original) {
      return res.status(400).json({
        success: false,
        message: 'Invalid data provided'
      });
    }
    
    // Handle other Sequelize database errors
    if (error.name && error.name.includes('Sequelize')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job data provided'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update job application'
    });
  }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete job application
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const job = await Job.findOne({
      where: { 
        id: req.params.id,
        userId: req.userId 
      }
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    await job.destroy();
    
    res.json({
      success: true,
      message: 'Job application deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete job application'
    });
  }
});

module.exports = router;

// @route   PUT /api/jobs/:jobId/applicants/:applicantId
// @desc    Update applicant status (for job owners)
// @access  Private
router.put('/:jobId/applicants/:applicantId', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'reviewed', 'interviewed', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user owns the job
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update applicant status'
      });
    }

    // Find and update the applicant
    const applicant = job.applicants.id(req.params.applicantId);
    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: 'Applicant not found'
      });
    }

    applicant.status = status;
    await job.save();

    res.json({
      success: true,
      message: 'Applicant status updated successfully',
      data: {
        applicant
      }
    });

  } catch (error) {
    console.error('Update applicant status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update applicant status'
    });
  }
});

module.exports = router;