import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Skill from '../models/Skill.js';
import MatchRequest from '../models/MatchRequest.js';

// Load environment variables
dotenv.config();

const skills = [
  { name: 'Web Development', category: 'Web Development', icon: '🌐', description: 'HTML, CSS, JavaScript, React, Node.js' },
  { name: 'Python', category: 'Programming', icon: '🐍', description: 'Python programming language' },
  { name: 'Data Structures', category: 'Programming', icon: '📊', description: 'Arrays, Linked Lists, Trees, Graphs' },
  { name: 'Algorithms', category: 'Programming', icon: '🧮', description: 'Sorting, Searching, Dynamic Programming' },
  { name: 'Machine Learning', category: 'Machine Learning', icon: '🤖', description: 'ML algorithms and frameworks' },
  { name: 'UI/UX Design', category: 'Design', icon: '🎨', description: 'User interface and experience design' },
  { name: 'Graphic Design', category: 'Design', icon: '✏️', description: 'Photoshop, Illustrator, Figma' },
  { name: 'Video Editing', category: 'Video Editing', icon: '🎬', description: 'Premiere Pro, Final Cut Pro' },
  { name: 'Content Writing', category: 'Content Writing', icon: '✍️', description: 'Blog posts, articles, copywriting' },
  { name: 'Digital Marketing', category: 'Digital Marketing', icon: '📱', description: 'SEO, Social Media, Email Marketing' },
  { name: 'Photography', category: 'Photography', icon: '📷', description: 'Camera techniques, editing' },
  { name: 'React.js', category: 'Web Development', icon: '⚛️', description: 'React framework for web apps' },
  { name: 'Node.js', category: 'Web Development', icon: '🟢', description: 'Backend JavaScript runtime' },
  { name: 'MongoDB', category: 'Programming', icon: '🍃', description: 'NoSQL database' },
  { name: 'Java', category: 'Programming', icon: '☕', description: 'Java programming language' },
  { name: 'C++', category: 'Programming', icon: '⚙️', description: 'C++ programming language' },
  { name: 'Git & GitHub', category: 'Programming', icon: '📦', description: 'Version control systems' },
  { name: 'Spanish', category: 'Languages', icon: '🇪🇸', description: 'Spanish language' },
  { name: 'French', category: 'Languages', icon: '🇫🇷', description: 'French language' },
  { name: 'Public Speaking', category: 'Other', icon: '🎤', description: 'Presentation and communication skills' }
];

const users = [
  {
    name: 'Rahul Sharma',
    email: 'rahul@iit.ac.in',
    password: 'password123',
    bio: 'Full-stack developer passionate about teaching web development',
    college: 'IIT Delhi',
    branch: 'Computer Science',
    year: 3,
    availability: {
      days: ['Monday', 'Wednesday', 'Friday'],
      timeSlots: ['Evening (6PM-12AM)']
    },
    linkedin: 'https://linkedin.com/in/rahulsharma',
    github: 'https://github.com/rahulsharma'
  },
  {
    name: 'Priya Patel',
    email: 'priya@iit.ac.in',
    password: 'password123',
    bio: 'ML enthusiast, looking to learn web development',
    college: 'IIT Bombay',
    branch: 'Computer Science',
    year: 2,
    availability: {
      days: ['Tuesday', 'Thursday', 'Saturday'],
      timeSlots: ['Afternoon (12PM-6PM)', 'Evening (6PM-12AM)']
    }
  },
  {
    name: 'Amit Kumar',
    email: 'amit@iit.ac.in',
    password: 'password123',
    bio: 'Competitive programmer and DSA expert',
    college: 'IIT Kanpur',
    branch: 'Computer Science',
    year: 4,
    availability: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      timeSlots: ['Morning (6AM-12PM)']
    },
    isPremium: true
  },
  {
    name: 'Sneha Reddy',
    email: 'sneha@iit.ac.in',
    password: 'password123',
    bio: 'UI/UX designer with 2 years of experience',
    college: 'IIT Madras',
    branch: 'Design',
    year: 3,
    availability: {
      days: ['Wednesday', 'Friday', 'Sunday'],
      timeSlots: ['Afternoon (12PM-6PM)']
    }
  },
  {
    name: 'Vikram Singh',
    email: 'vikram@iit.ac.in',
    password: 'password123',
    bio: 'Data science and ML practitioner',
    college: 'IIT Kharagpur',
    branch: 'Computer Science',
    year: 4,
    availability: {
      days: ['Monday', 'Thursday', 'Saturday'],
      timeSlots: ['Evening (6PM-12AM)']
    }
  },
  {
    name: 'Admin User',
    email: 'admin@iit.ac.in',
    password: 'admin123',
    role: 'admin',
    bio: 'Platform administrator',
    college: 'IIT Delhi',
    branch: 'Administration',
    year: 5
  }
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Clear existing data
const clearData = async () => {
  try {
    await User.deleteMany();
    await Skill.deleteMany();
    await MatchRequest.deleteMany();
    console.log('🗑️  Cleared existing data');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
  }
};

// Seed skills
const seedSkills = async () => {
  try {
    const createdSkills = await Skill.insertMany(skills);
    console.log(`✅ ${createdSkills.length} skills created`);
    return createdSkills;
  } catch (error) {
    console.error('❌ Error seeding skills:', error);
  }
};

// Seed users
const seedUsers = async (skillsData) => {
  try {
    // Assign skills to users
    users[0].skillsOffered = [
      skillsData.find(s => s.name === 'Web Development')._id,
      skillsData.find(s => s.name === 'React.js')._id,
      skillsData.find(s => s.name === 'Node.js')._id
    ];
    users[0].skillsNeeded = [
      skillsData.find(s => s.name === 'Machine Learning')._id
    ];

    users[1].skillsOffered = [
      skillsData.find(s => s.name === 'Machine Learning')._id,
      skillsData.find(s => s.name === 'Python')._id
    ];
    users[1].skillsNeeded = [
      skillsData.find(s => s.name === 'Web Development')._id,
      skillsData.find(s => s.name === 'React.js')._id
    ];

    users[2].skillsOffered = [
      skillsData.find(s => s.name === 'Data Structures')._id,
      skillsData.find(s => s.name === 'Algorithms')._id,
      skillsData.find(s => s.name === 'C++')._id
    ];
    users[2].skillsNeeded = [
      skillsData.find(s => s.name === 'UI/UX Design')._id
    ];

    users[3].skillsOffered = [
      skillsData.find(s => s.name === 'UI/UX Design')._id,
      skillsData.find(s => s.name === 'Graphic Design')._id
    ];
    users[3].skillsNeeded = [
      skillsData.find(s => s.name === 'Data Structures')._id,
      skillsData.find(s => s.name === 'React.js')._id
    ];

    users[4].skillsOffered = [
      skillsData.find(s => s.name === 'Machine Learning')._id,
      skillsData.find(s => s.name === 'Python')._id,
      skillsData.find(s => s.name === 'Data Structures')._id
    ];
    users[4].skillsNeeded = [
      skillsData.find(s => s.name === 'Web Development')._id
    ];

    // Use save() instead of insertMany() to trigger password hashing middleware
    const createdUsers = [];
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
    }
    console.log(`✅ ${createdUsers.length} users created`);
    return createdUsers;
  } catch (error) {
    console.error('❌ Error seeding users:', error);
  }
};

// Seed sample match request
const seedMatchRequests = async (usersData, skillsData) => {
  try {
    const matchRequests = [
      {
        requester: usersData[1]._id, // Priya
        mentor: usersData[0]._id, // Rahul
        skillOffered: skillsData.find(s => s.name === 'Machine Learning')._id,
        skillNeeded: skillsData.find(s => s.name === 'Web Development')._id,
        message: 'Hi! I would love to learn web development from you. I can teach you ML in return.',
        status: 'pending'
      }
    ];

    const created = await MatchRequest.insertMany(matchRequests);
    console.log(`✅ ${created.length} match requests created`);
  } catch (error) {
    console.error('❌ Error seeding match requests:', error);
  }
};

// Main seeding function
const seedDatabase = async () => {
  try {
    await connectDB();
    await clearData();
    
    const skillsData = await seedSkills();
    const usersData = await seedUsers(skillsData);
    await seedMatchRequests(usersData, skillsData);

    console.log('\n🎉 Database seeding completed successfully!\n');
    console.log('📧 Sample Login Credentials:');
    console.log('   Student: rahul@iit.ac.in / password123');
    console.log('   Admin:   admin@iit.ac.in / admin123\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeding
seedDatabase();
