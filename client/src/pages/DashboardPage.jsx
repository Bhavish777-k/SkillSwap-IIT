import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userService, matchService } from '../services';
import LoadingSpinner from '../components/LoadingSpinner';

const DashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dashData, recData] = await Promise.all([
        userService.getDashboard(),
        matchService.getRecommendations(),
      ]);

      setDashboard(dashData.data);
      setRecommendations(recData.data.slice(0, 3));
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {dashboard?.user?.name}!
          </h1>

          <p className="text-gray-600 mt-2">
            Here's your learning overview
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

          {/* Sent Requests */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Sent Requests
                </p>

                <p className="text-3xl font-bold text-primary-600">
                  {dashboard?.stats?.sentRequests || 0}
                </p>
              </div>

              <div className="text-4xl">
                📤
              </div>
            </div>
          </div>

          {/* Received Requests */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Received Requests
                </p>

                <p className="text-3xl font-bold text-green-600">
                  {dashboard?.stats?.receivedRequests || 0}
                </p>
              </div>

              <div className="text-4xl">
                📥
              </div>
            </div>
          </div>

          {/* Upcoming Sessions */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Upcoming Sessions
                </p>

                <p className="text-3xl font-bold text-blue-600">
                  {dashboard?.stats?.upcomingSessions || 0}
                </p>
              </div>

              <div className="text-4xl">
                📅
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Your Rating
                </p>

                <p className="text-3xl font-bold text-yellow-600">
                  {dashboard?.stats?.rating?.toFixed(1) || 'N/A'}
                </p>
              </div>

              <div className="text-4xl">
                ⭐
              </div>
            </div>
          </div>

        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Left Section */}
          <div className="lg:col-span-2 space-y-6">

            {/* Your Skills */}
            <div className="card">

              <div className="flex items-center justify-between mb-4">

                <h2 className="text-xl font-bold">
                  Your Skills
                </h2>

                <Link
                  to="/profile"
                  className="btn btn-primary text-sm"
                >
                  ✏️ Edit Profile
                </Link>

              </div>

              {/* Skills You Offer */}
              <div className="mb-6">

                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Skills You Offer
                </h3>

                {dashboard?.user?.skillsOffered?.length > 0 ? (

                  <div className="flex flex-wrap gap-2">

                    {dashboard.user.skillsOffered.map((skill) => (

                      <span
                        key={skill._id}
                        className="badge badge-primary"
                      >
                        {skill.icon} {skill.name}
                      </span>

                    ))}

                  </div>

                ) : (

                  <p className="text-gray-500 text-sm">
                    No skills added yet.

                    <Link
                      to="/profile"
                      className="text-primary-600 ml-1"
                    >
                      Add skills
                    </Link>
                  </p>

                )}

              </div>

              {/* Skills You Need */}
              <div>

                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Skills You Need
                </h3>

                {dashboard?.user?.skillsNeeded?.length > 0 ? (

                  <div className="flex flex-wrap gap-2">

                    {dashboard.user.skillsNeeded.map((skill) => (

                      <span
                        key={skill._id}
                        className="badge badge-warning"
                      >
                        {skill.icon} {skill.name}
                      </span>

                    ))}

                  </div>

                ) : (

                  <p className="text-gray-500 text-sm">
                    No skills added yet.

                    <Link
                      to="/profile"
                      className="text-primary-600 ml-1"
                    >
                      Add skills
                    </Link>
                  </p>

                )}

              </div>

            </div>

            {/* Quick Actions */}
            <div className="card">

              <h2 className="text-xl font-bold mb-4">
                Quick Actions
              </h2>

              <div className="grid grid-cols-2 gap-4">

                {/* Browse Mentors */}
                <Link
                  to="/browse"
                  className="btn btn-primary text-center"
                >
                  🔍 Browse Mentors
                </Link>

                {/* Requests */}
                <Link
                  to="/requests"
                  className="btn btn-secondary text-center"
                >
                  📨 View Requests
                </Link>

                {/* Sessions */}
                <Link
                  to="/sessions"
                  className="btn btn-secondary text-center"
                >
                  📅 My Sessions
                </Link>

                {/* Chats */}
                <Link
                  to="/chats"
                  className="btn btn-secondary text-center"
                >
                  💬 Messages
                </Link>

                {/* ⭐ NEW LEADERBOARD BUTTON */}
                <Link
                  to="/leaderboard"
                  className="btn btn-secondary text-center"
                >
                  🏆 Teacher Leaderboard
                </Link>

              </div>

            </div>

          </div>

          {/* Recommendations Sidebar */}
          <div className="space-y-6">

            <div className="card">

              <h2 className="text-xl font-bold mb-4">
                Recommended Matches
              </h2>

              {recommendations.length > 0 ? (

                <div className="space-y-4">

                  {recommendations.map((match) => (

                    <Link
                      key={match.user._id}
                      to={`/users/${match.user._id}`}
                      className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >

                      <div className="flex items-center gap-3 mb-2">

                        <img
                          src={
                            match.user.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              match.user.name
                            )}&size=40&background=random`
                          }
                          alt={match.user.name}
                          className="w-10 h-10 rounded-full"
                        />

                        <div className="flex-1">

                          <p className="font-medium text-sm">
                            {match.user.name}
                          </p>

                          <p className="text-xs text-gray-500">
                            {match.matchScore}% Match
                          </p>

                        </div>

                      </div>

                      {match.user.skillsOffered &&
                        match.user.skillsOffered.length > 0 && (

                          <div className="flex flex-wrap gap-1">

                            {match.user.skillsOffered
                              .slice(0, 2)
                              .map((skill) => (

                                <span
                                  key={skill._id}
                                  className="text-xs badge badge-primary"
                                >
                                  {skill.name}
                                </span>

                              ))}

                          </div>

                        )}

                    </Link>

                  ))}

                  <Link
                    to="/browse"
                    className="btn btn-outline w-full text-sm"
                  >
                    View All Matches
                  </Link>

                </div>

              ) : (

                <p className="text-gray-500 text-sm">
                  No recommendations yet. Add skills to get personalized matches!
                </p>

              )}

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default DashboardPage;