import mongoose from 'mongoose';

const pointTransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['earned', 'spent', 'purchased', 'refund', 'bonus'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true
  },
  relatedSession: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  },
  paymentId: {
    type: String // For tracking payment transactions
  },
  balanceAfter: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
pointTransactionSchema.index({ user: 1, createdAt: -1 });

const PointTransaction = mongoose.model('PointTransaction', pointTransactionSchema);

export default PointTransaction;
