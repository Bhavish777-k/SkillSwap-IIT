import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  }
}, {
  timestamps: true
});

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  matchRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MatchRequest'
  },
  messages: [messageSchema],
  lastMessage: {
    type: String
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: {}
  }
}, {
  timestamps: true
});

// Ensure only 2 participants
chatSchema.pre('save', function(next) {
  if (this.participants.length !== 2) {
    return next(new Error('Chat must have exactly 2 participants'));
  }
  next();
});

// Index for efficient querying
chatSchema.index({ participants: 1 });
chatSchema.index({ lastMessageAt: -1 });

// Prevent duplicate chats between same users
chatSchema.index({ participants: 1 }, { unique: true });

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
