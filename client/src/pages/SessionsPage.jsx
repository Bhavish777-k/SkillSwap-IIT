import { useState, useEffect } from 'react';
import { sessionService, skillService, matchService } from '../services';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import SkillCard from '../components/SkillCard';
import { Link, useSearchParams } from 'react-router-dom';

const SessionsPage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skills, setSkills] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [sessionData, setSessionData] = useState({
    matchRequestId: '',
    scheduledDate: '',
    duration: 60,
    mode: 'online',
    meetingLink: '',
    location: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Auto-open modal if requestId is in URL
    const requestId = searchParams.get('requestId');
    if (requestId && acceptedRequests.length > 0) {
      setSessionData({ ...sessionData, matchRequestId: requestId });
      setShowScheduleModal(true);
    }
  }, [searchParams, acceptedRequests]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sessionsRes, skillsRes, requestsRes] = await Promise.all([
        sessionService.getSessions(),
        skillService.getSkills(),
        matchService.getSentRequests({ status: 'accepted' }).catch(() => ({ data: [] })),
      ]);
      setSessions(sessionsRes.data);
      setSkills(skillsRes.data);
      setAcceptedRequests(requestsRes.data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSession = async () => {
    if (!sessionData.matchRequestId || !sessionData.scheduledDate) {
      alert('Please select a match request and date');
      return;
    }

    if (sessionData.mode === 'online' && !sessionData.meetingLink) {
      alert('Please provide a meeting link for online sessions');
      return;
    }

    if (sessionData.mode === 'offline' && !sessionData.location) {
      alert('Please provide a location for offline sessions');
      return;
    }

    setSubmitting(true);
    try {
      await sessionService.createSession(sessionData);
      alert('Session scheduled successfully!');
      setShowScheduleModal(false);
      setSessionData({
        matchRequestId: '',
        scheduledDate: '',
        duration: 60,
        mode: 'online',
        meetingLink: '',
        location: '',
        notes: '',
      });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to schedule session');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteSession = async (sessionId) => {
    if (!confirm('Mark this session as completed?')) return;

    try {
      await sessionService.completeSession(sessionId);
      alert('Session marked as completed!');
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to complete session');
    }
  };

  const handleCancelSession = async (sessionId) => {
    const reason = prompt('Please provide a reason for cancellation:');
    if (!reason) return;

    try {
      await sessionService.cancelSession(sessionId, { cancellationReason: reason });
      alert('Session cancelled');
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel session');
    }
  };

  const getSkillName = (skillId) => {
    const skill = skills.find((s) => s._id === skillId);
    return skill?.name || 'Unknown';
  };

  const getStatusBadge = (status) => {
    const styles = {
      scheduled: 'bg-blue-100 text-blue-800',
      ongoing: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      missed: 'bg-orange-100 text-orange-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isUpcoming = (date) => {
    return new Date(date) > new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  };

  const filteredSessions = sessions.filter((session) => {
    if (filterStatus === 'all') return true;
    return session.status === filterStatus;
  });

  const upcomingSessions = sessions.filter(
    (s) => s.status === 'scheduled' && isUpcoming(s.scheduledDate)
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Sessions</h1>
            <p className="text-gray-600 mt-2">Manage your learning sessions</p>
          </div>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="btn btn-primary"
          >
            + Schedule New Session
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card bg-blue-50 border-blue-200">
            <div className="text-3xl font-bold text-blue-600">{upcomingSessions.length}</div>
            <div className="text-sm text-blue-700">Upcoming</div>
          </div>
          <div className="card bg-green-50 border-green-200">
            <div className="text-3xl font-bold text-green-600">
              {sessions.filter((s) => s.status === 'completed').length}
            </div>
            <div className="text-sm text-green-700">Completed</div>
          </div>
          <div className="card bg-orange-50 border-orange-200">
            <div className="text-3xl font-bold text-orange-600">
              {sessions.filter((s) => s.status === 'ongoing').length}
            </div>
            <div className="text-sm text-orange-700">Ongoing</div>
          </div>
          <div className="card bg-gray-50 border-gray-200">
            <div className="text-3xl font-bold text-gray-600">{sessions.length}</div>
            <div className="text-sm text-gray-700">Total Sessions</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['all', 'scheduled', 'ongoing', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status !== 'all' && ` (${sessions.filter((s) => s.status === status).length})`}
            </button>
          ))}
        </div>

        {/* Sessions List */}
        <div className="space-y-4">
          {filteredSessions.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-gray-400 text-5xl mb-4">📅</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No sessions found</h3>
              <p className="text-gray-600 mb-6">
                {filterStatus === 'all'
                  ? "You don't have any sessions yet"
                  : `No ${filterStatus} sessions`}
              </p>
              <Link to="/requests" className="btn btn-primary">
                View Match Requests
              </Link>
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isLearner = session.learner._id === user._id;
              const otherPerson = isLearner ? session.mentor : session.learner;

              return (
                <div key={session._id} className="card">
                  <div className="flex items-start gap-4">
                    {/* User Avatar */}
                    <Link to={`/users/${otherPerson._id}`}>
                      <img
                        src={
                          otherPerson.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            otherPerson.name
                          )}&size=80&background=random`
                        }
                        alt={otherPerson.name}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    </Link>

                    {/* Session Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <Link
                              to={`/users/${otherPerson._id}`}
                              className="text-xl font-semibold text-gray-900 hover:text-primary-600"
                            >
                              {otherPerson.name}
                            </Link>
                            <span className="text-sm text-gray-600">
                              ({isLearner ? 'Teaching you' : 'Learning from you'})
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {otherPerson.college} • {otherPerson.branch}
                          </div>
                        </div>
                        {getStatusBadge(session.status)}
                      </div>

                      {/* Skill */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-medium text-gray-700">Skill:</span>
                        <SkillCard skill={getSkillName(session.skill)} />
                      </div>

                      {/* Session Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-600">📅</span>
                          <span>{formatDateTime(session.scheduledDate)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-600">⏱️</span>
                          <span>{session.duration} minutes</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-600">📍</span>
                          <span className="capitalize">{session.mode}</span>
                        </div>
                        {session.isPaid && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-600">💰</span>
                            <span>₹{session.amount}</span>
                          </div>
                        )}
                      </div>

                      {/* Meeting Link */}
                      {session.meetingLink && session.status !== 'cancelled' && (
                        <div className="bg-blue-50 rounded-lg p-3 mb-3">
                          <div className="text-sm font-medium text-blue-900 mb-1">Meeting Link:</div>
                          <a
                            href={session.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline break-all"
                          >
                            {session.meetingLink}
                          </a>
                        </div>
                      )}

                      {/* Location */}
                      {session.location && (
                        <div className="text-sm text-gray-600 mb-3">
                          <span className="font-medium">Location:</span> {session.location}
                        </div>
                      )}

                      {/* Notes */}
                      {session.notes && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          <div className="text-sm font-medium text-gray-900 mb-1">Notes:</div>
                          <p className="text-sm text-gray-700">{session.notes}</p>
                        </div>
                      )}

                      {/* Cancellation Info */}
                      {session.status === 'cancelled' && session.cancellationReason && (
                        <div className="bg-red-50 rounded-lg p-3 mb-3">
                          <div className="text-sm font-medium text-red-900 mb-1">
                            Cancelled by {session.cancelledBy === user._id ? 'you' : otherPerson.name}:
                          </div>
                          <p className="text-sm text-red-700">{session.cancellationReason}</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-4">
                        {session.status === 'scheduled' && (
                          <>
                            <button
                              onClick={() => handleCompleteSession(session._id)}
                              className="btn btn-primary text-sm"
                            >
                              Mark as Completed
                            </button>
                            <button
                              onClick={() => handleCancelSession(session._id)}
                              className="btn btn-secondary text-sm"
                            >
                              Cancel Session
                            </button>
                          </>
                        )}
                        {session.status === 'completed' && (
                          <Link to={`/users/${otherPerson._id}`} className="btn btn-primary text-sm">
                            Leave a Review
                          </Link>
                        )}
                        {session.status === 'ongoing' && (
                          <button
                            onClick={() => handleCompleteSession(session._id)}
                            className="btn btn-primary text-sm"
                          >
                            Complete Session
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Schedule Session Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">Schedule New Session</h2>

                <div className="space-y-4">
                  {/* Match Request Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Accepted Match Request *
                    </label>
                    <select
                      className="input"
                      value={sessionData.matchRequestId}
                      onChange={(e) =>
                        setSessionData({ ...sessionData, matchRequestId: e.target.value })
                      }
                    >
                      <option value="">Choose a match request...</option>
                      {acceptedRequests.map((request) => (
                        <option key={request._id} value={request._id}>
                          {request.mentor.name} - {getSkillName(request.skillNeeded)}
                        </option>
                      ))}
                    </select>
                    {acceptedRequests.length === 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        No accepted requests available. Accept a match request first.
                      </p>
                    )}
                  </div>

                  {/* Date & Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      className="input"
                      value={sessionData.scheduledDate}
                      onChange={(e) =>
                        setSessionData({ ...sessionData, scheduledDate: e.target.value })
                      }
                    />
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (minutes) *
                    </label>
                    <select
                      className="input"
                      value={sessionData.duration}
                      onChange={(e) =>
                        setSessionData({ ...sessionData, duration: parseInt(e.target.value) })
                      }
                    >
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="90">1.5 hours</option>
                      <option value="120">2 hours</option>
                    </select>
                  </div>

                  {/* Mode */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Mode *
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="mode"
                          value="online"
                          checked={sessionData.mode === 'online'}
                          onChange={(e) =>
                            setSessionData({ ...sessionData, mode: e.target.value })
                          }
                          className="mr-2"
                        />
                        Online
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="mode"
                          value="offline"
                          checked={sessionData.mode === 'offline'}
                          onChange={(e) =>
                            setSessionData({ ...sessionData, mode: e.target.value })
                          }
                          className="mr-2"
                        />
                        Offline
                      </label>
                    </div>
                  </div>

                  {/* Meeting Link (for online) */}
                  {sessionData.mode === 'online' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Meeting Link *
                      </label>
                      <input
                        type="url"
                        className="input"
                        placeholder="https://meet.google.com/xxx or https://zoom.us/j/xxx"
                        value={sessionData.meetingLink}
                        onChange={(e) =>
                          setSessionData({ ...sessionData, meetingLink: e.target.value })
                        }
                      />
                    </div>
                  )}

                  {/* Location (for offline) */}
                  {sessionData.mode === 'offline' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location *
                      </label>
                      <input
                        type="text"
                        className="input"
                        placeholder="e.g., Library Room 101, Cafeteria"
                        value={sessionData.location}
                        onChange={(e) =>
                          setSessionData({ ...sessionData, location: e.target.value })
                        }
                      />
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      className="input"
                      rows="3"
                      placeholder="Add any additional notes or preparation instructions..."
                      value={sessionData.notes}
                      onChange={(e) =>
                        setSessionData({ ...sessionData, notes: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleScheduleSession}
                    disabled={submitting}
                    className="btn btn-primary flex-1"
                  >
                    {submitting ? 'Scheduling...' : 'Schedule Session'}
                  </button>
                  <button
                    onClick={() => {
                      setShowScheduleModal(false);
                      setSessionData({
                        matchRequestId: '',
                        scheduledDate: '',
                        duration: 60,
                        mode: 'online',
                        meetingLink: '',
                        location: '',
                        notes: '',
                      });
                    }}
                    className="btn btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionsPage;
