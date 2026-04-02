const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const notificationController = require('../controllers/notificationController');

const socketHandler = (io) => {
  // Store online users
  const onlineUsers = new Map();

  // Authentication middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.user._id})`);

    // Add user to online users
    onlineUsers.set(socket.user._id.toString(), {
      socketId: socket.id,
      user: socket.user,
    });

    // Broadcast online users to all clients
    io.emit('onlineUsers', Array.from(onlineUsers.values()).map(u => ({
      _id: u.user._id,
      name: u.user.name,
      email: u.user.email,
      avatar: u.user.avatar,
    })));

    // Join user to their own room
    const roomName = socket.user._id.toString();
    socket.join(roomName);
    console.log(`User ${socket.user.name} joined room: ${roomName}`);

    // Handle sending messages
    socket.on('sendMessage', async (data) => {
      try {
        console.log('Received sendMessage:', data, 'from user:', socket.user.name);
        const { receiverId, content, jobId, clientId } = data;

        // Create new message
        const message = new Message({
          sender: socket.user._id,
          receiver: receiverId,
          content,
          job: jobId || null,
        });

        await message.save();

        // Create notification for receiver
        try {
          await notificationController.createNotification(
            receiverId,
            'message',
            'New Message',
            `You have a new message from ${socket.user.name}`,
            { senderId: socket.user._id, messageId: message._id }
          );
        } catch (error) {
          console.error('Error creating notification:', error);
        }

        // Populate sender and receiver details
        await message.populate('sender', 'name email avatar');
        await message.populate('receiver', 'name email avatar');

        // Format message for frontend
        const formattedMessage = {
          _id: message._id,
          senderId: message.sender._id,
          receiverId: message.receiver._id,
          content: message.content,
          timestamp: message.createdAt.toISOString(),
          read: message.read,
          clientId: clientId || null
        };

        // Send to receiver if online (using room instead of direct socket)
        const receiverRoom = receiverId.toString();
        console.log(`Sending message to receiver room: ${receiverRoom}`);
        io.to(receiverRoom).emit('newMessage', formattedMessage);

        // Also send to sender's room so they see it in real-time
        const senderRoom = socket.user._id.toString();
        console.log(`Sending message to sender room: ${senderRoom}`);
        io.to(senderRoom).emit('newMessage', formattedMessage);

        // Send confirmation to sender
        socket.emit('messageSent', formattedMessage);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('messageError', { error: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
      const { receiverId } = data;
      io.to(receiverId.toString()).emit('userTyping', {
        userId: socket.user._id,
        name: socket.user.name,
      });
    });

    // Handle stop typing
    socket.on('stopTyping', (data) => {
      const { receiverId } = data;
      io.to(receiverId.toString()).emit('userStopTyping', {
        userId: socket.user._id,
      });
    });

    // Handle marking messages as read
    socket.on('markAsRead', async (data) => {
      try {
        const { senderId } = data;
        
        await Message.updateMany(
          {
            sender: senderId,
            receiver: socket.user._id,
            read: false,
          },
          { read: true }
        );

        // Mark related notifications as read
        await Notification.updateMany(
          {
            userId: socket.user._id.toString(),
            type: 'message',
            'data.senderId': senderId,
            read: false,
          },
          { read: true }
        );

        // Notify sender that messages were read
        io.to(senderId.toString()).emit('messagesRead', {
          readBy: socket.user._id,
        });
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.name} (${socket.user._id})`);
      
      // Remove from online users
      onlineUsers.delete(socket.user._id.toString());

      // Broadcast updated online users
      io.emit('onlineUsers', Array.from(onlineUsers.values()).map(u => ({
        _id: u.user._id,
        name: u.user.name,
        email: u.user.email,
        avatar: u.user.avatar,
      })));
    });
  });
};

module.exports = socketHandler;
