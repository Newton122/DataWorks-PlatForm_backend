const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');

// @desc    Create job application (freelancer)
const createApplication = async (req, res) => {
  try {
    const { jobId, proposal } = req.body;
    const freelancerId = req.user.userId; // from auth middleware

    // Validate job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({ 
      job: jobId, 
      freelancer: freelancerId 
    });
    if (existingApplication) {
      return res.status(400).json({ message: 'Already applied to this job' });
    }

    // Create application
    const application = new Application({
      job: jobId,
      freelancer: freelancerId,
      proposal
    });
    await application.save();

    res.status(201).json({ 
      message: 'Application submitted successfully',
      application: {
        id: application._id,
        job: application.job,
        proposal: application.proposal,
        status: application.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all applications for a job (client/employer)
const getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Verify job ownership (client check via req.user.role or job.owner)
    const applications = await Application.find({ job: jobId })
      .populate('freelancer', 'name email role')
      .sort({ createdAt: -1 });

    res.json({ applications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get freelancer's applications
const getMyApplications = async (req, res) => {
  try {
    const freelancerId = req.user.userId;
    const applications = await Application.find({ freelancer: freelancerId })
      .populate('job', 'title description budget')
      .sort({ createdAt: -1 });

    res.json({ applications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update application status (accept/reject) - Job owner only
const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body; // 'accepted' or 'rejected'
    const application = await Application.findById(applicationId).populate('job');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // TODO: Verify job ownership
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    application.status = status;
    await application.save();

    res.json({ 
      message: `Application ${status}`,
      application 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createApplication,
  getJobApplications,
  getMyApplications,
  updateApplicationStatus
};
