import { useState, useEffect } from 'react';
import { matchService, skillService } from '../services';
import LoadingSpinner from '../components/LoadingSpinner';
import SkillCard from '../components/SkillCard';
import { Link } from 'react-router-dom';

const RequestsPage = () => {
  const [activeTab, setActiveTab] = useState('received');
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [receivedRes, sentRes, skillsRes] = await Promise.all([
        matchService.getReceivedRequests(),
        matchService.getSentRequests(),
        skillService.getSkills(),
      ]);
      setReceivedRequests(receivedRes.data);
      setSentRequests(sentRes.data);
      setSkills(skillsRes.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (requestId, response) => {
    try {
      await matchService.respondToRequest(requestId, { status: response });
      alert(`Request ${response}!`);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to respond to request');
    }
  };

  const handleCancel = async (requestId) => {
    if (!confirm('Are you sure you want to cancel this request?')) return;
    
    try {
      await matchService.cancelRequest(requestId);
      alert('Request cancelled');
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel request');
    }
  };

  const getSkillName = (skillId) => {
    const skill = skills.find((s) => s._id === skillId);
    return skill?.name || 'Unknown';
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
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

  const requests = activeTab === 'received' ? receivedRequests : sentRequests;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Match Requests</h1>
          <p className="text-gray-600 mt-2">Manage your learning requests</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('received')}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === 'received'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Received ({receivedRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === 'sent'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Sent ({sentRequests.length})
          </button>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-gray-400 text-5xl mb-4">📭</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No {activeTab} requests
              </h3>
              <p className="text-gray-600 mb-6">
                {activeTab === 'received'
                  ? "You haven't received any match requests yet"
                  : "You haven't sent any match requests yet"}
              </p>
              <Link to="/browse" className="btn btn-primary">
                Browse Mentors
              </Link>
            </div>
          ) : (
            requests.map((request) => (
              <div key={request._id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    {/* User Avatar */}
                    <Link
                      to={`/users/${activeTab === 'received' ? request.requester._id : request.mentor._id}`}
                    >
                      <img
                        src={
                          activeTab === 'received'
                            ? request.requester.avatar ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                request.requester.name
                              )}&size=60&background=random`
                            : request.mentor.avatar ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                request.mentor.name
                              )}&size=60&background=random`
                        }
                        alt={activeTab === 'received' ? request.requester.name : request.mentor.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    </Link>

                    {/* Request Details */}
                    <div className="flex-1">
                      <Link
                        to={`/users/${activeTab === 'received' ? request.requester._id : request.mentor._id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-primary-600"
                      >
                        {activeTab === 'received' ? request.requester.name : request.mentor.name}
                      </Link>
                      <div className="text-sm text-gray-600 mb-2">
                        {activeTab === 'received' ? request.requester.college : request.mentor.college} •{' '}
                        {formatDate(request.createdAt)}
                      </div>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">
                            {activeTab === 'received' ? 'Wants to learn:' : 'I want to learn:'}
                          </span>
                          <SkillCard skill={getSkillName(request.skillNeeded)} />
                        </div>
                        {request.skillOffered && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">
                              {activeTab === 'received' ? 'Can teach:' : 'I can teach:'}
                            </span>
                            <SkillCard skill={getSkillName(request.skillOffered)} />
                          </div>
                        )}
                      </div>

                      {/* Message */}
                      {request.message && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          <p className="text-sm text-gray-700">{request.message}</p>
                        </div>
                      )}

                      {/* Response Message (if rejected) */}
                      {request.responseMessage && (
                        <div className="bg-blue-50 rounded-lg p-3 mb-3">
                          <p className="text-sm font-medium text-blue-900 mb-1">Response:</p>
                          <p className="text-sm text-blue-700">{request.responseMessage}</p>
                        </div>
                      )}

                      {/* Match Score */}
                      {request.matchScore && (
                        <div className="text-sm text-gray-600">
                          Match Score: <span className="font-semibold">{request.matchScore}%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex flex-col items-end gap-3">
                    {getStatusBadge(request.status)}

                    {/* Action Buttons */}
                    {activeTab === 'received' && request.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRespond(request._id, 'accepted')}
                          className="btn btn-primary text-sm"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRespond(request._id, 'rejected')}
                          className="btn btn-secondary text-sm"
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {activeTab === 'sent' && request.status === 'pending' && (
                      <button
                        onClick={() => handleCancel(request._id)}
                        className="btn btn-secondary text-sm"
                      >
                        Cancel
                      </button>
                    )}

                    {request.status === 'accepted' && (
                      <div className="flex gap-2">
                        <Link
                          to={`/sessions?requestId=${request._id}`}
                          className="btn btn-primary text-sm"
                        >
                          📅 Schedule Session
                        </Link>
                        <Link
                          to={`/chats?userId=${activeTab === 'received' ? request.requester._id : request.mentor._id}`}
                          className="btn btn-secondary text-sm"
                        >
                          💬 Message
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestsPage;
