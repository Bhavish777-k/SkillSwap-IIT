import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { matchService, sessionService, chatService } from '../services';
import { useAuth } from '../context/AuthContext';

const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [viewedNotifications, setViewedNotifications] = useState(new Set());

  useEffect(() => {
    // Load viewed notifications from localStorage
    const stored = localStorage.getItem('viewedNotifications');
    if (stored) {
      setViewedNotifications(new Set(JSON.parse(stored)));
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user, viewedNotifications]);

  const fetchNotifications = async () => {
    try {
      const [requestsRes, sessionsRes, chatsRes] = await Promise.all([
        matchService.getReceivedRequests().catch(() => ({ data: [] })),
        sessionService.getSessions().catch(() => ({ data: [] })),
        chatService.getChats().catch(() => ({ data: [] })),
      ]);

      const requests = requestsRes.data || [];
      const sessions = sessionsRes.data || [];
      const chats = chatsRes.data || [];

      const notifs = [];

      // Pending match requests
      const pendingRequests = requests.filter((r) => r.status === 'pending');
      pendingRequests.forEach((req) => {
        const notifId = `request-${req._id}`;
        notifs.push({
          id: notifId,
          type: 'match_request',
          title: 'New Match Request',
          message: `${req.requester?.name} wants to learn from you`,
          link: '/requests',
          timestamp: req.createdAt,
          unread: !viewedNotifications.has(notifId),
        });
      });

      // Unread chat messages
      chats.forEach((chat) => {
        const unreadCount = chat.unreadCount?.[user._id] || 0;
        if (unreadCount > 0) {
          const otherUser = chat.participants.find(p => p._id !== user._id);
          const notifId = `chat-${chat._id}-${chat.lastMessageAt}`;
          notifs.push({
            id: notifId,
            type: 'new_message',
            title: 'New Message',
            message: `${otherUser.name}: ${chat.lastMessage || 'Sent a message'}`,
            link: '/chats',
            timestamp: chat.lastMessageAt,
            unread: !viewedNotifications.has(notifId),
          });
        }
      });

      // Upcoming sessions (within 24 hours)
      const now = new Date();
      const upcomingSessions = sessions.filter((s) => {
        if (s.status !== 'scheduled') return false;
        const sessionDate = new Date(s.scheduledDate);
        const timeDiff = sessionDate - now;
        return timeDiff > 0 && timeDiff < 24 * 60 * 60 * 1000;
      });

      upcomingSessions.forEach((session) => {
        const otherPerson = session.learner._id === user._id ? session.mentor : session.learner;
        const notifId = `session-${session._id}`;
        notifs.push({
          id: notifId,
          type: 'session_reminder',
          title: 'Upcoming Session',
          message: `Session with ${otherPerson.name} in ${getTimeUntil(session.scheduledDate)}`,
          link: '/sessions',
          timestamp: session.scheduledDate,
          unread: !viewedNotifications.has(notifId),
        });
      });

      // Accepted requests
      const acceptedRequests = requests.filter(
        (r) => r.status === 'accepted' && new Date(r.respondedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      );
      acceptedRequests.forEach((req) => {
        const notifId = `accepted-${req._id}`;
        notifs.push({
          id: notifId,
          type: 'request_accepted',
          title: 'Request Accepted!',
          message: `${req.mentor?.name} accepted your request`,
          link: '/requests',
          timestamp: req.respondedAt,
          unread: !viewedNotifications.has(notifId),
        });
      });

      // Sort by timestamp (newest first)
      notifs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setNotifications(notifs.slice(0, 10)); // Show latest 10
      
      // Count only unread notifications
      const unreadNotifs = notifs.filter(n => n.unread);
      setUnreadCount(unreadNotifs.length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleBellClick = () => {
    setShowDropdown(!showDropdown);
    
    // Mark all current notifications as viewed when opening dropdown
    if (!showDropdown && notifications.length > 0) {
      const newViewed = new Set(viewedNotifications);
      notifications.forEach(notif => {
        newViewed.add(notif.id);
      });
      setViewedNotifications(newViewed);
      localStorage.setItem('viewedNotifications', JSON.stringify([...newViewed]));
      
      // Update unread count to 0
      setUnreadCount(0);
    }
  };

  const clearAllNotifications = () => {
    const allIds = notifications.map(n => n.id);
    const newViewed = new Set([...viewedNotifications, ...allIds]);
    setViewedNotifications(newViewed);
    localStorage.setItem('viewedNotifications', JSON.stringify([...newViewed]));
    setUnreadCount(0);
  };

  const getTimeUntil = (date) => {
    const diff = new Date(date) - new Date();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getNotificationIcon = (type) => {
    const icons = {
      match_request: '🤝',
      session_reminder: '📅',
      request_accepted: '✅',
      session_completed: '🎉',
      new_message: '💬',
    };
    return icons[type] || '🔔';
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return minutes < 1 ? 'Just now' : `${minutes}m ago`;
    }
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (!user) return null;

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={handleBellClick}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />

          {/* Dropdown Content */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                {notifications.length > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearAllNotifications();
                    }}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-gray-400 text-4xl mb-2">🔔</div>
                  <p className="text-gray-600">No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notif) => (
                    <Link
                      key={notif.id}
                      to={notif.link}
                      onClick={() => setShowDropdown(false)}
                      className="block p-4 hover:bg-gray-50 transition"
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{getNotificationIcon(notif.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-sm text-gray-900">
                              {notif.title}
                            </p>
                            {notif.unread && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {notif.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTime(notif.timestamp)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200">
                <Link
                  to="/requests"
                  onClick={() => setShowDropdown(false)}
                  className="block text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  View All Requests
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
