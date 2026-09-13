import Chat from '../models/Chat.js';
import User from '../models/User.js';

/**
 * @desc    Get or create chat between two users
 * @route   POST /api/chats
 * @access  Private
 */
export const getOrCreateChat = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Verify other user exists
    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Sort participant IDs to ensure consistent order
    const participants = [req.user.id, userId].sort();

    // Check if chat already exists
    let chat = await Chat.findOne({ participants })
      .populate('participants', 'name avatar email');

    // Create new chat if doesn't exist
    if (!chat) {
      chat = await Chat.create({
        participants,
        unreadCount: {
          [req.user.id]: 0,
          [userId]: 0
        }
      });

      chat = await Chat.findById(chat._id)
        .populate('participants', 'name avatar email');
    }

    res.status(200).json({
      success: true,
      data: chat
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's chats
 * @route   GET /api/chats
 * @access  Private
 */
export const getChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({
      participants: req.user.id
    })
      .populate('participants', 'name avatar email')
      .sort({ lastMessageAt: -1 });

    res.status(200).json({
      success: true,
      count: chats.length,
      data: chats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single chat
 * @route   GET /api/chats/:id
 * @access  Private
 */
export const getChat = async (req, res, next) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate('participants', 'name avatar email')
      .populate('messages.sender', 'name avatar');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Verify user is participant
    const isParticipant = chat.participants.some(
      p => p._id.toString() === req.user.id
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this chat'
      });
    }

    // Mark messages as read
    chat.messages.forEach(message => {
      if (message.sender.toString() !== req.user.id && !message.isRead) {
        message.isRead = true;
        message.readAt = new Date();
      }
    });

    // Reset unread count for current user
    chat.unreadCount.set(req.user.id, 0);
    await chat.save();

    res.status(200).json({
      success: true,
      data: chat
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Send message
 * @route   POST /api/chats/:id/messages
 * @access  Private
 */
export const sendMessage = async (req, res, next) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Verify user is participant
    const isParticipant = chat.participants.some(
      p => p.toString() === req.user.id
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send messages in this chat'
      });
    }

    // Add message
    chat.messages.push({
      sender: req.user.id,
      content: content.trim()
    });

    // Update last message info
    chat.lastMessage = content.trim().substring(0, 100);
    chat.lastMessageAt = new Date();

    // Increment unread count for other participant
    const otherParticipant = chat.participants.find(
      p => p.toString() !== req.user.id
    );
    const currentUnread = chat.unreadCount.get(otherParticipant.toString()) || 0;
    chat.unreadCount.set(otherParticipant.toString(), currentUnread + 1);

    await chat.save();

    const updatedChat = await Chat.findById(chat._id)
      .populate('participants', 'name avatar email')
      .populate('messages.sender', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: updatedChat
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete chat
 * @route   DELETE /api/chats/:id
 * @access  Private
 */
export const deleteChat = async (req, res, next) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Verify user is participant
    const isParticipant = chat.participants.some(
      p => p.toString() === req.user.id
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this chat'
      });
    }

    await chat.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Chat deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
