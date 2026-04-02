const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const auth = require('../middleware/authMiddleware');

// All routes require authentication
router.use(auth());

// Get all conversations
router.get('/conversations', messageController.getConversations);

// Get unread message count
router.get('/unread', messageController.getUnreadCount);

// Get users for messaging
router.get('/users', messageController.getUsersForMessaging);

// Get freelancers for a specific job
router.get('/job/:jobId/freelancers', messageController.getFreelancersForJob);

// Get messages with a specific user
router.get('/:userId', messageController.getMessages);

// Send a message
router.post('/', messageController.sendMessage);

// Delete a message
router.delete('/:id', messageController.deleteMessage);

module.exports = router;
