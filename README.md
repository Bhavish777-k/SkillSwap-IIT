# 🎓 SkillSwap IIT - Student Skill Exchange Platform

A modern, full-stack web application that connects students to exchange skills and build meaningful learning relationships. Built with the MERN stack (MongoDB, Express.js, React, Node.js).

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [API Documentation](#api-documentation)
- [Usage Guide](#usage-guide)
- [Deployment](#deployment)

---

## 🌟 Overview

**SkillSwap IIT** is a peer-to-peer learning platform where students can:
- **Teach** skills they're proficient in
- **Learn** skills they want to acquire
- **Exchange** knowledge in a mutually beneficial way

### Example Use Case:
> "I'll teach you Web Development → You teach me Data Structures & Algorithms"

---

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based secure authentication
- Role-based access control (Student, Admin)
- Protected routes and API endpoints

### 👤 User Profile Management
- Skills offered and skills needed
- Availability scheduling
- Bio, social links, and profile customization
- Rating and review system

### 🔍 Smart Matching Algorithm
- Matches users based on:
  - Complementary skills (offered vs needed)
  - Availability overlap
  - Rating scores
  - Premium status
- Personalized recommendations

### 📩 Mentorship Requests
- Send match requests to potential mentors
- Accept/reject incoming requests
- Status tracking (pending, accepted, rejected, cancelled)

### 📅 Session Scheduling
- Create learning sessions after match acceptance
- Online/offline/hybrid modes
- Meeting link integration
- Session status management

### 💬 Chat System
- One-to-one messaging
- Real-time chat (polling-based, upgradeable to WebSocket)
- Unread message tracking

### ⭐ Reviews & Ratings
- Post-session feedback
- 5-star rating system
- Category-based reviews (knowledge, communication, punctuality, helpfulness)
- Automatic rating calculation

### 🛡️ Admin Panel
- User management (block/unblock)
- Premium account management
- Platform analytics
- Audit logs

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator
- **Security**: bcryptjs for password hashing

### Frontend
- **Library**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: Context API
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios

---

## 📁 Project Structure

```
SkillSwap/
├── server/                      # Backend
│   ├── config/                  # Database configuration
│   │   └── database.js
│   ├── controllers/             # Route controllers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── skillController.js
│   │   ├── matchController.js
│   │   ├── sessionController.js
│   │   ├── chatController.js
│   │   ├── reviewController.js
│   │   └── adminController.js
│   ├── middlewares/             # Custom middleware
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   └── validator.js
│   ├── models/                  # Mongoose schemas
│   │   ├── User.js
│   │   ├── Skill.js
│   │   ├── MatchRequest.js
│   │   ├── Session.js
│   │   ├── Chat.js
│   │   ├── Review.js
│   │   └── AdminAction.js
│   ├── routes/                  # API routes
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── skillRoutes.js
│   │   ├── matchRoutes.js
│   │   ├── sessionRoutes.js
│   │   ├── chatRoutes.js
│   │   ├── reviewRoutes.js
│   │   └── adminRoutes.js
│   ├── utils/                   # Utility functions
│   │   ├── tokenUtils.js
│   │   ├── matchingAlgorithm.js
│   │   └── seedData.js
│   ├── .env.example             # Environment variables template
│   ├── package.json
│   └── server.js                # Entry point
│
└── client/                      # Frontend
    ├── public/
    ├── src/
    │   ├── components/          # Reusable components
    │   │   ├── Navbar.jsx
    │   │   ├── Footer.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   ├── LoadingSpinner.jsx
    │   │   ├── UserCard.jsx
    │   │   └── SkillCard.jsx
    │   ├── context/             # React Context
    │   │   └── AuthContext.jsx
    │   ├── pages/               # Page components
    │   │   ├── LandingPage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── BrowsePage.jsx
    │   │   └── UserProfilePage.jsx
    │   ├── services/            # API services
    │   │   ├── api.js
    │   │   └── index.js
    │   ├── App.jsx              # Main app component
    │   ├── main.jsx             # Entry point
    │   └── index.css            # Global styles
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

---

## 🚀 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd SkillSwap
```

### Step 2: Setup Backend
```bash
cd server
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
# Set MONGODB_URI, JWT_SECRET, etc.
```

### Step 3: Setup Frontend
```bash
cd ../client
npm install
```

### Step 4: Seed Database (Optional)
```bash
cd ../server
npm run seed
```

This creates sample data including:
- Demo users (student and admin)
- Skills across various categories
- Sample match requests

**Demo Credentials:**
- Student: `rahul@iit.ac.in` / `password123`
- Admin: `admin@iit.ac.in` / `admin123`

### Step 5: Run the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```
Server runs on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```
Frontend runs on `http://localhost:3000`

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@iit.ac.in",
  "password": "password123",
  "college": "IIT Delhi",
  "branch": "Computer Science",
  "year": 2
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@iit.ac.in",
  "password": "password123"
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

### User Endpoints

#### Get All Users
```http
GET /users?search=john&skill=<skillId>&page=1&limit=10
```

#### Get User by ID
```http
GET /users/:id
```

#### Update Profile
```http
PUT /users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "bio": "My bio",
  "skillsOffered": ["skillId1", "skillId2"],
  "skillsNeeded": ["skillId3"],
  "availability": {
    "days": ["Monday", "Wednesday"],
    "timeSlots": ["Evening (6PM-12AM)"]
  }
}
```

#### Get Dashboard
```http
GET /users/dashboard/stats
Authorization: Bearer <token>
```

### Skill Endpoints

#### Get All Skills
```http
GET /skills?category=Programming&search=python
```

#### Create Skill (Admin only)
```http
POST /skills
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Python",
  "category": "Programming",
  "description": "Python programming language",
  "icon": "🐍"
}
```

### Match Endpoints

#### Find Matches
```http
GET /matches/find?skillNeeded=<skillId>&skillOffered=<skillId>&limit=20
Authorization: Bearer <token>
```

#### Get Recommendations
```http
GET /matches/recommendations
Authorization: Bearer <token>
```

#### Send Match Request
```http
POST /matches/request
Authorization: Bearer <token>
Content-Type: application/json

{
  "mentorId": "userId",
  "skillOffered": "skillId",
  "skillNeeded": "skillId",
  "message": "Hi, I'd like to learn from you!"
}
```

#### Get Received Requests
```http
GET /matches/received?status=pending
Authorization: Bearer <token>
```

#### Respond to Request
```http
PUT /matches/:id/respond
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "accepted",
  "responseMessage": "Happy to help!"
}
```

### Session Endpoints

#### Create Session
```http
POST /sessions
Authorization: Bearer <token>
Content-Type: application/json

{
  "matchRequestId": "matchId",
  "scheduledDate": "2026-02-01T10:00:00Z",
  "duration": 60,
  "mode": "online",
  "meetingLink": "https://meet.google.com/xxx"
}
```

#### Get Sessions
```http
GET /sessions?status=scheduled&type=learning
Authorization: Bearer <token>
```

#### Complete Session
```http
PUT /sessions/:id/complete
Authorization: Bearer <token>
```

### Chat Endpoints

#### Get or Create Chat
```http
POST /chats
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "otherUserId"
}
```

#### Send Message
```http
POST /chats/:id/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Hello!"
}
```

### Review Endpoints

#### Create Review
```http
POST /reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "sessionId": "sessionId",
  "revieweeId": "userId",
  "rating": 5,
  "comment": "Great mentor!",
  "categories": {
    "knowledge": 5,
    "communication": 5,
    "punctuality": 5,
    "helpfulness": 5
  }
}
```

### Admin Endpoints

#### Get Stats
```http
GET /admin/stats
Authorization: Bearer <admin-token>
```

#### Block User
```http
PUT /admin/users/:id/block
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "reason": "Violated platform policies"
}
```

#### Grant Premium
```http
PUT /admin/users/:id/grant-premium
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "duration": 30
}
```

---

## 📖 Usage Guide

### For Students

1. **Register** an account with your college email
2. **Complete your profile** by adding:
   - Bio and social links
   - Skills you can offer
   - Skills you want to learn
   - Availability schedule
3. **Browse mentors** using the smart matching system
4. **Send match requests** to potential learning partners
5. **Accept requests** from students who want to learn from you
6. **Schedule sessions** after requests are accepted
7. **Chat** with your learning partners
8. **Give reviews** after completing sessions

### For Admins

1. Login with admin credentials
2. Access the admin dashboard
3. Monitor platform statistics
4. Manage users (block/unblock)
5. Grant premium memberships
6. View audit logs

---

## 🎯 Key Algorithms

### Matching Algorithm

The smart matching algorithm scores potential matches based on:

```javascript
Score Components:
- Skill Compatibility (40%): Matches offered skills with needed skills
- Availability Overlap (30%): Common days and time slots
- Rating Score (20%): User's average rating
- Premium Status (10%): Bonus for premium users

Final Match Score: 0-100%
```

**Implementation**: See [`server/utils/matchingAlgorithm.js`](server/utils/matchingAlgorithm.js)

---

## 🔒 Security Features

1. **Password Hashing**: bcryptjs with salt rounds
2. **JWT Authentication**: Secure token-based auth
3. **Input Validation**: express-validator for all inputs
4. **Protected Routes**: Middleware-based authorization
5. **Error Handling**: Global error handler
6. **CORS**: Configured for frontend-backend communication

---

## 🚢 Deployment

### Backend Deployment (Heroku/Render)

1. Set environment variables:
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=<your-mongodb-uri>
   JWT_SECRET=<your-secret>
   JWT_EXPIRE=7d
   ```

2. Build command: `npm install`
3. Start command: `npm start`

### Frontend Deployment (Vercel/Netlify)

1. Build command: `npm run build`
2. Output directory: `dist`
3. Environment variables:
   ```
   VITE_API_URL=<your-backend-url>
   ```

### Database (MongoDB Atlas)

1. Create a cluster on MongoDB Atlas
2. Whitelist IP addresses
3. Create database user
4. Get connection string

---

## 📈 Future Enhancements

- [ ] Real-time chat with WebSockets
- [ ] Video call integration
- [ ] Payment gateway for premium features
- [ ] Email notifications
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-college support
- [ ] Skill certification system
- [ ] Gamification (badges, leaderboards)

---

## 🤝 Contributing

This is a college project designed for:
- Hackathons
- Internship portfolios
- Major project submissions
- Startup pitch demonstrations

---

## 📄 License

MIT License - feel free to use this project for educational purposes.

---

## 👨‍💻 Developer Notes

### Project Highlights
- ✅ Clean, modular code structure
- ✅ RESTful API design
- ✅ Responsive UI (mobile-first)
- ✅ Scalable architecture
- ✅ Production-ready error handling
- ✅ Comprehensive documentation
- ✅ Easy to extend and customize

### Tech Interview Ready
This project demonstrates:
- Full-stack development skills
- Database design & optimization
- Authentication & authorization
- Algorithm implementation
- State management
- API integration
- Modern React patterns

---

## 🆘 Support

For issues or questions:
1. Check the API documentation above
2. Review the code comments
3. Test with the seeded demo data

---

**Built with ❤️ for the student community**
