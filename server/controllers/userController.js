const User = require('../models/User');

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get current user profile
const getMe = async (req, res) => {
  try {
    console.log('🔍 getMe called, req.user:', req.user);
    const userId = req.user?.userId || req.user?.id;
    console.log('🔍 Looking up user with ID:', userId);
    
    const user = await User.findById(userId).select('-password');
    console.log('🔍 User found:', user ? 'yes' : 'no');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Build response data
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      location: user.location || '',
      bio: user.bio || '',
      skills: user.skills || [],
      hourlyRate: user.hourlyRate || 0,
      title: user.title || '',
      rating: user.rating || 0,
      totalEarnings: user.totalEarnings || 0,
      jobsCompleted: user.jobsCompleted || 0
    };
    
    console.log('✅ Returning user data');
    res.json(userData);
  } catch (err) {
    console.error('❌ getMe error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, location, bio, skills, hourlyRate, title } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (location !== undefined) updateData.location = location;
    if (bio !== undefined) updateData.bio = bio;
    if (skills) updateData.skills = skills;
    if (hourlyRate !== undefined) updateData.hourlyRate = hourlyRate;
    if (title !== undefined) updateData.title = title;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user activity
const getUserActivity = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;

    // Mock activity data - in a real app, this would come from a database
    const activities = [
      {
        id: 1,
        type: 'application',
        title: 'Applied to Data Engineer position',
        description: 'You applied for the Senior Data Engineer role at TechCorp',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        status: 'pending'
      },
      {
        id: 2,
        type: 'message',
        title: 'New message from recruiter',
        description: 'Sarah Johnson sent you a message about your application',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        status: 'unread'
      },
      {
        id: 3,
        type: 'job_saved',
        title: 'Saved job: ML Engineer',
        description: 'You saved the Machine Learning Engineer position',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        status: 'completed'
      }
    ];

    res.json({ activities });
  } catch (err) {
    console.error('❌ getUserActivity error:', err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllUsers,
  getMe,
  updateProfile,
  getUserActivity
};

