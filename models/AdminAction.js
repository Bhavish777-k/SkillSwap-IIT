import mongoose from 'mongoose';

const adminActionSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  actionType: {
    type: String,
    required: true,
    enum: [
      'block_user',
      'unblock_user',
      'delete_user',
      'delete_skill',
      'delete_review',
      'feature_user',
      'unfeature_user',
      'grant_premium',
      'revoke_premium',
      'other'
    ]
  },
  targetModel: {
    type: String,
    required: true,
    enum: ['User', 'Skill', 'Review', 'Session', 'MatchRequest', 'Chat']
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  // Store previous state for rollback
  previousState: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Index for audit trail
adminActionSchema.index({ admin: 1, createdAt: -1 });
adminActionSchema.index({ targetModel: 1, targetId: 1 });

const AdminAction = mongoose.model('AdminAction', adminActionSchema);

export default AdminAction;
