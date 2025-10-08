const express = require('express');
const Job = require('../models/Job');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/jobs
// @desc    Get all jobs with filtering, sorting, and pagination
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = 'active',
      jobType,
      experienceLevel,
      location,
      company,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      minSalary,
      maxSalary
    } = req.query;

    // Build query object
    const query = { status };
    
    // Add filters
    if (jobType) query.jobType = jobType;
    if (experienceLevel) query.experienceLevel = experienceLevel;
    if (location) query.location = new RegExp(location, 'i');
    if (company) query.company = new RegExp(company, 'i');
    
    // Search in title and description
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { company: new RegExp(search, 'i') }
      ];
    }

    // Salary range filter
    if (minSalary || maxSalary) {
      query['salary.min'] = {};
      if (minSalary) query['salary.min'].$gte = parseInt(minSalary);
      if (maxSalary) query['salary.max'].$lte = parseInt(maxSalary);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const jobs = await Job.find(query)
      .populate('postedBy', 'name email profile.firstName profile.lastName')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Job.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    // Increment view count for each job (if user is viewing)
    if (jobs.length > 0) {
      await Job.updateMany(
        { _id: { $in: jobs.map(job => job._id) } },
        { $inc: { views: 1 } }
      );
    }

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalJobs: total,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs'
    });
  }
});

// @route   GET /api/jobs/:id
// @desc    Get single job by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name email profile')
      .populate('applicants.user', 'name email profile');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Increment view count
    await Job.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    // If user is not the job poster, hide applicant details
    let jobResponse = job.toObject();
    if (!req.user || req.user._id.toString() !== job.postedBy._id.toString()) {
      jobResponse.applicants = jobResponse.applicants.map(applicant => ({
        appliedAt: applicant.appliedAt,
        status: applicant.status
      }));
    }

    res.json({
      success: true,
      data: {
        job: jobResponse
      }
    });

  } catch (error) {
    console.error('Get job error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch job'
    });
  }
});

// @route   POST /api/jobs
// @desc    Create new job
// @access  Private
router.post('/', authenticateToken, async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      postedBy: req.user._id
    };

    const job = new Job(jobData);
    await job.save();

    // Populate the postedBy field for response
    await job.populate('postedBy', 'name email profile');

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: {
        job
      }
    });

  } catch (error) {
    console.error('Create job error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create job'
    });
  }
});

// @route   PUT /api/jobs/:id
// @desc    Update job
// @access  Private (only job owner)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

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
        message: 'Not authorized to update this job'
      });
    }

    // Update job
    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('postedBy', 'name email profile');

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: {
        job: updatedJob
      }
    });

  } catch (error) {
    console.error('Update job error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update job'
    });
  }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete job
// @access  Private (only job owner)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

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
        message: 'Not authorized to delete this job'
      });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });

  } catch (error) {
    console.error('Delete job error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete job'
    });
  }
});

// @route   GET /api/jobs/user/my-jobs
// @desc    Get current user's posted jobs
// @access  Private
router.get('/user/my-jobs', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = { postedBy: req.user._id };
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const jobs = await Job.find(query)
      .populate('applicants.user', 'name email profile')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Job.countDocuments(query);

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalJobs: total
        }
      }
    });

  } catch (error) {
    console.error('Get my jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your jobs'
    });
  }
});

// @route   POST /api/jobs/:id/apply
// @desc    Apply to a job
// @access  Private
router.post('/:id/apply', authenticateToken, async (req, res) => {
  try {
    const { coverLetter, resume } = req.body;
    
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This job is not accepting applications'
      });
    }

    // Check if user is the job poster
    if (job.postedBy.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot apply to your own job'
      });
    }

    // Check if application deadline has passed
    if (job.applicationDeadline && new Date() > job.applicationDeadline) {
      return res.status(400).json({
        success: false,
        message: 'Application deadline has passed'
      });
    }

    // Use the Job model method to add applicant
    try {
      await job.addApplicant(req.user._id, coverLetter, resume);
      
      res.json({
        success: true,
        message: 'Application submitted successfully'
      });
    } catch (error) {
      if (error.message === 'User has already applied to this job') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      throw error;
    }

  } catch (error) {
    console.error('Apply to job error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to submit application'
    });
  }
});

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