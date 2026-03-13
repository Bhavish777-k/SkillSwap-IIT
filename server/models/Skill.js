import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Skill name is required'],
    unique: true,
    trim: true,
    minlength: [2, 'Skill name must be at least 2 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Programming',
      'Web Development',
      'Mobile Development',
      'Data Science',
      'Machine Learning',
      'Design',
      'Video Editing',
      'Content Writing',
      'Digital Marketing',
      'Photography',
      'Music',
      'Languages',
      'Academic',
      'Other'
    ]
  },
  description: {
    type: String,
    maxlength: [300, 'Description cannot exceed 300 characters']
  },
  icon: {
    type: String,
    default: '🎯'
  },
  usersOffering: {
    type: Number,
    default: 0
  },
  usersNeed: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for fast searching
skillSchema.index({ name: 'text', category: 1 });

const Skill = mongoose.model('Skill', skillSchema);

export default Skill;
