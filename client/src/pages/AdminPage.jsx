import { useState, useEffect } from 'react';
import { adminService } from '../services';
import LoadingSpinner from '../components/LoadingSpinner';
import { Link } from 'react-router-dom';

const AdminPage = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, logsRes] = await Promise.all([
        adminService.getStats(),
        adminService.getAllUsers(),
        adminService.getActionLogs(),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setLogs(logsRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId, isBlocked) => {
    const action = isBlocked ? 'unblock' : 'block';
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      if (isBlocked) {
        await adminService.unblockUser(userId);
      } else {
        await adminService.blockUser(userId, 'Blocked by admin');
      }
      alert(`User ${action}ed successfully`);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || `Failed to ${action} user`);
    }
  };

  const handleGrantPremium = async (userId, isPremium) => {
    const action = isPremium ? 'remove premium from' : 'grant premium to';
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      await adminService.grantPremium(userId, !isPremium);
      alert(`Premium ${isPremium ? 'removed' : 'granted'} successfully`);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update premium status');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    const reason = prompt(`Enter reason for deleting ${userName}:`);
    if (!reason) return;

    if (!confirm(`This will permanently delete ${userName}. Continue?`)) return;

    try {
      await adminService.deleteUser(userId, reason);
      alert('User deleted successfully');
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.college?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600 mt-2">Platform management and monitoring</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          {['stats', 'users', 'logs'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-4 font-medium transition-colors capitalize ${
                activeTab === tab
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Stats Tab */}
        {activeTab === 'stats' && stats && (
          <div>
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="card bg-blue-50 border-blue-200">
                <div className="text-3xl font-bold text-blue-600">{stats.totalUsers}</div>
                <div className="text-sm text-blue-700">Total Users</div>
                <div className="text-xs text-blue-600 mt-1">
                  +{stats.newUsersToday} today
                </div>
              </div>
              <div className="card bg-green-50 border-green-200">
                <div className="text-3xl font-bold text-green-600">{stats.activeUsers}</div>
                <div className="text-sm text-green-700">Active Users</div>
                <div className="text-xs text-green-600 mt-1">
                  Last 30 days
                </div>
              </div>
              <div className="card bg-purple-50 border-purple-200">
                <div className="text-3xl font-bold text-purple-600">{stats.totalSessions}</div>
                <div className="text-sm text-purple-700">Total Sessions</div>
                <div className="text-xs text-purple-600 mt-1">
                  +{stats.sessionsToday} today
                </div>
              </div>
              <div className="card bg-orange-50 border-orange-200">
                <div className="text-3xl font-bold text-orange-600">{stats.totalMatches}</div>
                <div className="text-sm text-orange-700">Total Matches</div>
                <div className="text-xs text-orange-600 mt-1">
                  +{stats.matchesToday} today
                </div>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-3">User Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Premium Users:</span>
                    <span className="font-medium">{stats.premiumUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Blocked Users:</span>
                    <span className="font-medium text-red-600">{stats.blockedUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Skills:</span>
                    <span className="font-medium">{stats.totalSkills}</span>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-3">Session Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completed:</span>
                    <span className="font-medium text-green-600">{stats.completedSessions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Scheduled:</span>
                    <span className="font-medium text-blue-600">{stats.scheduledSessions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cancelled:</span>
                    <span className="font-medium text-red-600">{stats.cancelledSessions}</span>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-3">Match Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pending:</span>
                    <span className="font-medium text-yellow-600">{stats.pendingMatches}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Accepted:</span>
                    <span className="font-medium text-green-600">{stats.acceptedMatches}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Reviews:</span>
                    <span className="font-medium">{stats.totalReviews}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            {/* Search */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search users by name, email, or college..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input max-w-md"
              />
            </div>

            {/* Users List */}
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user._id} className="card">
                  <div className="flex items-start gap-4">
                    <img
                      src={
                        user.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          user.name
                        )}&size=80&background=random`
                      }
                      alt={user.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/users/${user._id}`}
                              className="text-lg font-semibold text-gray-900 hover:text-primary-600"
                            >
                              {user.name}
                            </Link>
                            {user.isPremium && (
                              <span className="badge badge-warning">Premium</span>
                            )}
                            {user.isBlocked && (
                              <span className="badge badge-error">Blocked</span>
                            )}
                            {user.role === 'admin' && (
                              <span className="badge badge-primary">Admin</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {user.email} • {user.college} • {user.branch}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          Joined {formatDate(user.createdAt)}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                        <div>
                          <span className="text-gray-600">Rating:</span>{' '}
                          <span className="font-medium">
                            {user.rating.average.toFixed(1)} ⭐ ({user.rating.count})
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Skills Offered:</span>{' '}
                          <span className="font-medium">{user.skillsOffered?.length || 0}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Skills Needed:</span>{' '}
                          <span className="font-medium">{user.skillsNeeded?.length || 0}</span>
                        </div>
                      </div>

                      {user.role !== 'admin' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleBlockUser(user._id, user.isBlocked)}
                            className={`btn text-sm ${
                              user.isBlocked ? 'btn-primary' : 'btn-secondary'
                            }`}
                          >
                            {user.isBlocked ? 'Unblock' : 'Block'}
                          </button>
                          <button
                            onClick={() => handleGrantPremium(user._id, user.isPremium)}
                            className="btn btn-secondary text-sm"
                          >
                            {user.isPremium ? 'Remove Premium' : 'Grant Premium'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user._id, user.name)}
                            className="btn btn-secondary text-red-600 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div className="space-y-4">
            {logs.length === 0 ? (
              <div className="card text-center py-12">
                <div className="text-gray-400 text-5xl mb-4">📋</div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No action logs</h3>
                <p className="text-gray-600">Admin actions will appear here</p>
              </div>
            ) : (
              logs.map((log) => (
                <div key={log._id} className="card">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900">
                          {log.admin?.name || 'Unknown Admin'}
                        </span>
                        <span className="text-gray-600">•</span>
                        <span className="text-sm text-gray-600 capitalize">
                          {log.actionType.replace(/_/g, ' ')}
                        </span>
                      </div>
                      {log.reason && (
                        <div className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Reason:</span> {log.reason}
                        </div>
                      )}
                      {log.notes && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Notes:</span> {log.notes}
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">{formatDate(log.createdAt)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
