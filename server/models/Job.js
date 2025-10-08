const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    minlength: [3, 'Job title must be at least 3 characters long'],
    maxlength: [100, 'Job title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    minlength: [10, 'Job description must be at least 10 characters long'],
    maxlength: [2000, 'Job description cannot exceed 2000 characters']
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  location: {
    type: String,
    required: [true, 'Job location is required'],
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  jobType: {
    type: String,
    required: [true, 'Job type is required'],
    enum: {
      values: ['full-time', 'part-time', 'contract', 'temporary', 'internship', 'remote'],
      message: '{VALUE} is not a valid job type'
    }
  },
  experienceLevel: {
    type: String,
    required: [true, 'Experience level is required'],
    enum: {
      values: ['entry-level', 'mid-level', 'senior-level', 'executive'],
      message: '{VALUE} is not a valid experience level'
    }
  },
  salary: {
    min: {
      type: Number,
      min: [0, 'Minimum salary cannot be negative']
    },
    max: {
      type: Number,
      min: [0, 'Maximum salary cannot be negative'],
      validate: {
        validator: function(value) {
          return !this.salary.min || value >= this.salary.min;
        },
        message: 'Maximum salary must be greater than or equal to minimum salary'
      }
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
      maxlength: [3, 'Currency code cannot exceed 3 characters']
    },
    period: {
      type: String,
      enum: ['hourly', 'monthly', 'yearly'],
      default: 'yearly'
    }
  },
  requirements: {
    skills: {
      type: [String],
      default: []
    },
    education: {
      type: String,
      maxlength: [200, 'Education requirement cannot exceed 200 characters']
    },
    experience: {
      type: String,
      maxlength: [200, 'Experience requirement cannot exceed 200 characters']
    }
  },
  benefits: {
    type: [String],
    default: []
  },
  applicationDeadline: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value > new Date();
      },
      message: 'Application deadline must be in the future'
    }
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'paused', 'closed', 'draft'],
      message: '{VALUE} is not a valid job status'
    },
    default: 'active'
  },
  // Reference to User (Job belongs to User)
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Job must have a poster']
  },
  applicants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'interviewed', 'accepted', 'rejected'],
      default: 'pending'
    },
    coverLetter: String,
    resume: String // URL or file path
  }],
  views: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Indexes for better query performance
jobSchema.index({ postedBy: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ jobType: 1 });
jobSchema.index({ experienceLevel: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ 'requirements.skills': 1 });
jobSchema.index({ createdAt: -1 });

// Compound indexes
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ location: 1, jobType: 1 });

// Virtual for application count
jobSchema.virtual('applicationCount').get(function() {
  return this.applicants ? this.applicants.length : 0;
});

// Instance method to check if user has applied
jobSchema.methods.hasUserApplied = function(userId) {
  return this.applicants.some(applicant => 
    applicant.user.toString() === userId.toString()
  );
};

// Instance method to add applicant
jobSchema.methods.addApplicant = function(userId, coverLetter = '', resume = '') {
  if (this.hasUserApplied(userId)) {
    throw new Error('User has already applied to this job');
  }
  
  this.applicants.push({
    user: userId,
    coverLetter,
    resume
  });
  
  return this.save();
};

// Static method to find jobs by user
jobSchema.statics.findByUser = function(userId) {
  return this.find({ postedBy: userId }).populate('postedBy', 'name email');
};

// Static method to find active jobs
jobSchema.statics.findActive = function() {
  return this.find({ status: 'active' }).populate('postedBy', 'name email');
};

// Pre-save middleware to update views
jobSchema.pre('save', function(next) {
  if (this.isNew) {
    this.views = 0;
  }
  next();
});

module.exports = mongoose.model('Job', jobSchema);