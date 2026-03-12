import mongoose from 'mongoose';

const matchRequestSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skillOffered: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill',
    required: false
  },
  skillNeeded: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill',
    required: true
  },
  message: {
    type: String,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'cancelled'],
    default: 'pending'
  },
  // Response from mentor
  responseMessage: {
    type: String,
    maxlength: [500, 'Response cannot exceed 500 characters']
  },
  respondedAt: {
    type: Date
  },
  // Match score for analytics
  matchScore: {
    type: Number,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

// Index for efficient querying
matchRequestSchema.index({ requester: 1, mentor: 1, status: 1 });
matchRequestSchema.index({ mentor: 1, status: 1 });

// Prevent duplicate active requests
matchRequestSchema.index(
  { requester: 1, mentor: 1 },
  { 
    unique: true, 
    partialFilterExpression: { status: { $in: ['pending', 'accepted'] } } 
  }
);

const MatchRequest = mongoose.model('MatchRequest', matchRequestSchema);

export default MatchRequest;
