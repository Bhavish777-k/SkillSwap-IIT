import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Exchange Skills, Build Connections
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              "I'll teach you Web Development → You teach me DSA"
            </p>
            <p className="text-lg mb-12 max-w-2xl mx-auto">
              Join SkillSwap IIT - where students learn from each other, share knowledge,
              and grow together. Find mentors, schedule sessions, and build your skill portfolio.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated ? (
                <>
                  <Link to="/register" className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg">
                    Get Started Free
                  </Link>
                  <Link to="/login" className="btn btn-outline border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 text-lg">
                    Login
                  </Link>
                </>
              ) : (
                <Link to="/dashboard" className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg">
                  Go to Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">👤</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Your Profile</h3>
              <p className="text-gray-600">
                List skills you can teach and skills you want to learn
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔍</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Find Perfect Matches</h3>
              <p className="text-gray-600">
                Our algorithm matches you with students who complement your skills
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📅</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Schedule & Learn</h3>
              <p className="text-gray-600">
                Book sessions, chat, and start your learning journey
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why SkillSwap?</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="text-primary-600 text-2xl">✨</div>
              <div>
                <h3 className="font-semibold mb-2">Skill-Based Matching</h3>
                <p className="text-gray-600">
                  Advanced algorithm matches you based on complementary skills and availability
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-primary-600 text-2xl">💬</div>
              <div>
                <h3 className="font-semibold mb-2">Built-in Chat</h3>
                <p className="text-gray-600">
                  Communicate seamlessly with your learning partners
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-primary-600 text-2xl">⭐</div>
              <div>
                <h3 className="font-semibold mb-2">Rating & Reviews</h3>
                <p className="text-gray-600">
                  Build trust with transparent feedback system
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-primary-600 text-2xl">🎯</div>
              <div>
                <h3 className="font-semibold mb-2">Session Management</h3>
                <p className="text-gray-600">
                  Easily schedule and track all your learning sessions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!isAuthenticated && (
        <div className="py-20 bg-primary-600 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Learning?</h2>
            <p className="text-xl mb-8">
              Join thousands of students exchanging skills and building connections
            </p>
            <Link to="/register" className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg">
              Sign Up Now - It's Free!
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
