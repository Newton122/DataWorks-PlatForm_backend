const Job = require('../models/Job');
const Application = require('../models/Application');

// Get all jobs
exports.getJobs = async (req, res) => {
  try {
    const { 
      search, 
      category, 
      type, 
      experience, 
      page = 1, 
      limit = 10 
    } = req.query;

    const query = { status: 'active' };

    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Type filter
    if (type && type !== 'All') {
      query.type = type;
    }

    // Experience filter
    if (experience && experience !== 'All') {
      query.experience = experience;
    }

    const jobs = await Job.find(query)
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Map client to company, budget to salary for existing data
    const mappedJobs = jobs.map(job => ({
      ...job._doc,
      company: job.client || job.company || 'Client',
      salary: job.budget || job.salary || 'TBD',
      status: job.status || 'active'
    }));


    const count = await Job.countDocuments(query);

    res.json({
      jobs: mappedJobs,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalJobs: count
    });

  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Error fetching jobs' });
  }
};

// Get single job
exports.getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name email')
      .populate('applications');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ message: 'Error fetching job' });
  }
};

// Create job
exports.createJob = async (req, res) => {
  try {
    const {
      title,
      company,
      location,
      type,
      experience,
      category,
      salary,
      description,
      requirements,
      skills
    } = req.body;

    const job = new Job({
      title,
      company,
      location,
      type,
      experience,
      category,
      salary,
      description,
      requirements,
      skills,
      postedBy: req.user._id
    });

    await job.save();

    res.status(201).json(job);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ message: 'Error creating job' });
  }
};

// Update job
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user owns the job
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedJob);
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ message: 'Error updating job' });
  }
};

// Delete job
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user owns the job
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ message: 'Error deleting job' });
  }
};

// Save/unsave job
exports.toggleSaveJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const userIndex = job.savedBy.indexOf(req.user._id);

    if (userIndex > -1) {
      // Unsave
      job.savedBy.splice(userIndex, 1);
    } else {
      // Save
      job.savedBy.push(req.user._id);
    }

    await job.save();

    res.json(job);
  } catch (error) {
    console.error('Error toggling job save:', error);
    res.status(500).json({ message: 'Error toggling job save' });
  }
};

// Get saved jobs
exports.getSavedJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ savedBy: req.user._id })
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    res.status(500).json({ message: 'Error fetching saved jobs' });
  }
};

// Get jobs by category
exports.getJobsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const jobs = await Job.find({ 
      category: category,
      status: 'active' 
    })
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs by category:', error);
    res.status(500).json({ message: 'Error fetching jobs by category' });
  }
};

// Get jobs by type
exports.getJobsByType = async (req, res) => {
  try {
    const { type } = req.params;
    
    const jobs = await Job.find({ 
      type: type,
      status: 'active' 
    })
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs by type:', error);
    res.status(500).json({ message: 'Error fetching jobs by type' });
  }
};

// Get internship jobs
exports.getInternshipJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ 
      type: 'Internship',
      status: 'active' 
    })
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    console.error('Error fetching internship jobs:', error);
    res.status(500).json({ message: 'Error fetching internship jobs' });
  }
};

// Get job statistics
exports.getJobStats = async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments({ status: 'active' });
    const totalInternships = await Job.countDocuments({ type: 'Internship', status: 'active' });
    
    const categoryStats = await Job.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const typeStats = await Job.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      totalJobs,
      totalInternships,
      categoryStats,
      typeStats
    });
  } catch (error) {
    console.error('Error fetching job stats:', error);
    res.status(500).json({ message: 'Error fetching job stats' });
  }
};
