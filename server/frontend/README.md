# SkillSwap IIT - Student Skill Exchange Platform

A modern, production-grade authentication UI for a student skill exchange platform built with React.

## 🚀 Features

- **Modern UI/UX**: Clean, minimal design with smooth animations and transitions
- **Responsive Design**: Mobile-first approach, works on all devices
- **Accessible**: ARIA labels, focus states, and keyboard navigation
- **Form Validation**: Client-side validation with helpful error messages
- **Password Strength Indicator**: Real-time feedback on password quality
- **Skill Tag System**: Dynamic tag input for skills offered and needed
- **Loading States**: Smooth loading animations for better UX

## 📦 Tech Stack

- React 18
- React Router DOM v6
- Vite (Build tool)
- Plain CSS (No UI libraries)
- JavaScript ES6+

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── AuthCard.jsx          # Auth page layout wrapper
│   │   ├── Button.jsx            # Reusable button component
│   │   ├── InputField.jsx        # Text input with validation
│   │   ├── PasswordField.jsx     # Password input with show/hide
│   │   └── SkillTagInput.jsx     # Tag-based input for skills
│   ├── pages/
│   │   ├── Login.jsx             # Login page
│   │   └── Signup.jsx            # Signup page
│   ├── styles/
│   │   ├── variables.css         # CSS variables and global styles
│   │   ├── components.css        # Component-specific styles
│   │   └── auth.css              # Auth page styles
│   ├── App.jsx                   # Main app with routing
│   └── main.jsx                  # App entry point
├── index.html
├── package.json
└── vite.config.js
```

## 🎯 Pages

### Login Page
- Email and password fields
- Show/hide password toggle
- Remember me checkbox
- Forgot password link (UI only)
- Loading state animation
- Link to signup page

### Signup Page
- Full name input
- College email validation (IIT domain check)
- Password with strength indicator
- Confirm password validation
- Skills offered (tag input)
- Skills needed (tag input)
- Comprehensive client-side validation
- Link to login page

## 🛠️ Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Preview production build:**
   ```bash
   npm run preview
   ```

## 💅 Design Philosophy

- **Clean & Minimal**: Reduced visual clutter, focus on content
- **Modern Gradients**: Subtle gradient backgrounds and accents
- **Smooth Transitions**: All interactive elements have smooth animations
- **Accessibility First**: Proper ARIA labels, focus states, and keyboard navigation
- **Mobile Responsive**: Looks great on all screen sizes

## 🎨 Color Palette

- Primary: `#6366f1` (Indigo)
- Secondary: `#ec4899` (Pink)
- Accent: `#8b5cf6` (Purple)
- Success: `#10b981` (Green)
- Error: `#ef4444` (Red)
- Warning: `#f59e0b` (Amber)

## 📝 Form Validation Rules

### Login
- Email: Required, valid format
- Password: Required, min 6 characters

### Signup
- Full Name: Required, min 2 characters, letters only
- Email: Required, valid format, must contain "iit"
- Password: Required, min 8 characters, must have uppercase, lowercase, and number
- Confirm Password: Must match password
- Skills Offered: At least 1 skill required
- Skills Needed: At least 1 skill required

## 🔒 Security Notes

⚠️ **Important**: This is a frontend-only implementation for UI demonstration.

- No actual backend authentication
- No API calls or data persistence
- No real password hashing
- Form submissions are simulated with console logs

## 🚀 Next Steps (For Full Implementation)

To make this production-ready, you would need to:

1. Connect to a backend API
2. Implement real authentication (JWT tokens, sessions)
3. Add password hashing and secure storage
4. Implement email verification
5. Add password reset functionality
6. Connect to a database
7. Add protected routes and auth context
8. Implement session management

## 📄 License

This is a demonstration project for educational purposes.

## 👨‍💻 Author

Built with ❤️ for IIT students

---

**Note**: This is a frontend-only implementation. No backend code or API integration is included.
