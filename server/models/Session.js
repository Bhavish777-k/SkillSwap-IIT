import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  matchRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MatchRequest',
    required: true
  },
  learner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill',
    required: true
  },
  scheduledDate: {
    type: Date,
    required: [true, 'Scheduled date is required']
  },
  duration: {
    type: Number, // in minutes
    default: 60,
    min: 15,
    max: 180
  },
  mode: {
    type: String,
    enum: ['online', 'offline', 'hybrid'],
    default: 'online'
  },
  meetingLink: {
    type: String
  },
  location: {
    type: String
  },
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled', 'missed'],
    default: 'scheduled'
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  // Completion tracking
  completedAt: {
    type: Date
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancellationReason: {
    type: String
  },
  // Payment tracking (for premium features)
  isPaid: {
    type: Boolean,
    default: false
  },
  amount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient querying
sessionSchema.index({ learner: 1, status: 1 });
sessionSchema.index({ mentor: 1, status: 1 });
sessionSchema.index({ scheduledDate: 1 });

const Session = mongoose.model('Session', sessionSchema);

export default Session;
