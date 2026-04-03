const Message = require('../models/Message');
const User = require('../models/User');
const Application = require('../models/Application');

// Get all conversations for current user
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get all messages where user is sender or receiver
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    })
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .sort({ createdAt: -1 });

    // Group by conversation
    const conversationsMap = new Map();
    
    messages.forEach(msg => {
      const otherUser = msg.sender._id.toString() === userId ? msg.receiver : msg.sender;
      const otherUserId = otherUser._id.toString();
      
      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          userId: otherUserId,
          userName: otherUser.name,
          userAvatar: otherUser.name?.charAt(0)?.toUpperCase() || 'U',
          name: otherUser.name,
          email: otherUser.email,
          lastMessage: msg.content,
          lastMessageTime: msg.createdAt,
          timestamp: msg.createdAt,
          unread: msg.receiver._id.toString() === userId && !msg.read ? 1 : 0,
          online: false // Will be updated by socket
        });
      } else if (msg.receiver._id.toString() === userId && !msg.read) {
        const conv = conversationsMap.get(otherUserId);
        conv.unread += 1;
      }
    });

    const conversations = Array.from(conversationsMap.values())
      .sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

    res.json({ conversations });
  } catch (err) {
    console.error('Get conversations error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get messages between two users
exports.getMessages = async (req, res) => {
  try {
    const userId = req.user.userId;
    const otherUserId = req.params.userId;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(10, Math.min(100, parseInt(req.query.limit, 10) || 30));
    const skip = (page - 1) * limit;

    const totalMessages = await Message.countDocuments({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ]
    });

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ]
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Send in chronological order for the client (oldest first)
    const transformedMessages = messages
      .map(msg => ({
        _id: msg._id,
        senderId: msg.sender,
        receiverId: msg.receiver,
        content: msg.content,
        timestamp: msg.createdAt.toISOString(),
        read: msg.read
      }))
      .reverse();


    // Mark messages as read
    await Message.updateMany(
      { sender: otherUserId, receiver: userId, read: false },
      { read: true }
    );

    res.json({
      messages: transformedMessages,
      page,
      limit,
      total: totalMessages,
      hasMore: skip + transformedMessages.length < totalMessages
    });
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content, jobId } = req.body;
    const senderId = req.user.userId;

    if (!receiverId || !content) {
      return res.status(400).json({ message: 'Receiver and content are required' });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      content: content.trim(),
      job: jobId || null
    });

    await message.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email')
      .populate('receiver', 'name email');

    res.status(201).json({ message: populatedMessage });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete a message
exports.deleteMessage = async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = req.user.userId;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only sender can delete
    if (message.sender.toString() !== userId) {
      return res.status(403).json({ message: 'You can only delete your own messages' });
    }

    await Message.findByIdAndDelete(messageId);

    res.json({ message: 'Message deleted successfully' });
  } catch (err) {
    console.error('Delete message error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get unread message count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.userId;

    const count = await Message.countDocuments({
      receiver: userId,
      read: false
    });

    res.json({ count });
  } catch (err) {
    console.error('Get unread count error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get freelancers for messaging (freelancers and admin)
exports.getUsersForMessaging = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    let users;
    
    if (userRole === 'client') {
      // Clients can message any freelancer or admin
      users = await User.find({
        $or: [
          { _id: { $ne: userId }, role: 'freelancer' },
          { _id: { $ne: userId }, role: 'admin' }
        ]
      }).select('name email role avatar');
    } else if (userRole === 'freelancer') {
      // Freelancers can message clients they've applied to jobs for, and admin
      const applications = await Application.find({ freelancer: userId }).populate('job', 'postedBy');
      const clientIds = [...new Set(applications.map(app => app.job.postedBy.toString()))];
      
      const clients = await User.find({
        _id: { $in: clientIds },
        role: 'client'
      }).select('name email role avatar');
      
      const admin = await User.find({
        _id: { $ne: userId },
        role: 'admin'
      }).select('name email role avatar');
      
      users = [...clients, ...admin];
    } else {
      // Admin can message everyone
      users = await User.find({
        _id: { $ne: userId }
      }).select('name email role avatar');
    }

    res.json({ users });
  } catch (err) {
    console.error('Get users for messaging error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get freelancers who applied to a specific job
exports.getFreelancersForJob = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const jobId = req.params.jobId;

    // Only clients can view freelancers for their jobs
    if (userRole !== 'client') {
      return res.status(403).json({ message: 'Only clients can view job freelancers' });
    }

    // Check if the job belongs to the client
    const Job = require('../models/Job');
    const job = await Job.findById(jobId);
    if (!job || job.postedBy.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get freelancers who applied to this job
    const applications = await Application.find({ job: jobId }).populate('freelancer', 'name email avatar');
    const freelancers = applications.map(app => app.freelancer);

    res.json({ freelancers });
  } catch (err) {
    console.error('Get freelancers for job error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
