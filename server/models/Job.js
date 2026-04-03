const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },

  company: {
    type: String,
    trim: true
  },
  client: {
    type: String,
    trim: true
  },
  budget: {
    type: String,
    trim: true
  },

  location: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance']
  },
  experience: {
    type: String,
    required: true,
    enum: ['Entry Level', 'Mid Level', 'Senior Level', 'Lead', 'Principal']
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Data Engineering',
      'Data Analytics',
      'Data Science',
      'Machine Learning',
      'AI Development',
      'Data Visualization',
      'Business Intelligence',
      'Big Data',
      'Data Warehousing',
      'ETL Development',
      'Product Management'
    ]
  },

  salary: {
    type: String,
    trim: true
  },

  description: {
    type: String,
    required: true
  },
  requirements: [{
    type: String,
    required: true
  }],
  skills: [{
    type: String,
    required: true
  }],
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
    // required: true - temporarily removed for seeding
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'draft'],
    default: 'active'
  },
  applications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  }],
  savedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Index for search
jobSchema.index({ title: 'text', company: 'text', description: 'text', skills: 'text' });
jobSchema.index({ category: 1 });
jobSchema.index({ type: 1 });
jobSchema.index({ experience: 1 });
jobSchema.index({ status: 1 });

module.exports = mongoose.model('Job', jobSchema);
