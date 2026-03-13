# 🚀 Quick Start Guide

Get SkillSwap IIT up and running in 5 minutes!

## Prerequisites Check
- ✅ Node.js installed? Run: `node --version` (need v16+)
- ✅ MongoDB installed/running? Run: `mongod --version` (or use MongoDB Atlas)
- ✅ Git installed? Run: `git --version`

## Installation Steps

### 1️⃣ Clone & Navigate
```bash
cd "c:\Users\krish\OneDrive\Desktop\Mern Stack Projects\SkillSwap"
```

### 2️⃣ Backend Setup
```bash
cd server
npm install

# Create environment file
copy .env.example .env
```

**Edit `.env` file with:**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/skillswap
JWT_SECRET=your_super_secret_key_here_change_this
JWT_EXPIRE=7d
```

### 3️⃣ Frontend Setup
```bash
cd ..\client
npm install
```

### 4️⃣ Seed Database (Important!)
```bash
cd ..\server
npm run seed
```

This creates demo users and skills for testing.

### 5️⃣ Start the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```
✅ Backend running at: http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```
✅ Frontend running at: http://localhost:3000

## 🎉 You're Ready!

Open your browser and go to: **http://localhost:3000**

### Demo Login Credentials:
- **Student Account**: 
  - Email: `rahul@iit.ac.in`
  - Password: `password123`

- **Admin Account**:
  - Email: `admin@iit.ac.in`
  - Password: `admin123`

## 📱 Test the Platform

1. **Login** with demo credentials
2. **Browse Dashboard** - see your stats
3. **Browse Mentors** - find potential matches
4. **View Profiles** - click on user cards
5. **Send Requests** - try the matching system
6. **Update Profile** - add skills and availability

## 🔧 Common Issues

### MongoDB Connection Error
```bash
# Start MongoDB service
mongod
# OR use MongoDB Atlas cloud database
```

### Port Already in Use
```bash
# Change PORT in server/.env to 5001 or another port
PORT=5001
```

### Module Not Found
```bash
# Re-install dependencies
cd server
npm install
cd ../client
npm install
```

## 📚 Next Steps

- Read [README.md](README.md) for full documentation
- Check API endpoints in README
- Customize the code for your needs
- Deploy to production (Heroku, Vercel, etc.)

## 🆘 Need Help?

1. Check if both backend and frontend are running
2. Verify MongoDB is connected
3. Check browser console for errors
4. Review API responses in Network tab

---

**Happy Coding! 🎓**
