import { useState, useEffect, useRef } from 'react';
import { chatService } from '../services';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

const ChatsPage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchChats();
    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchChats, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Auto-create/open chat if userId is in URL
    const userId = searchParams.get('userId');
    if (userId && !loading) {
      handleCreateOrOpenChat(userId);
    }
  }, [searchParams, loading]);

  useEffect(() => {
    if (selectedChat) {
      fetchChatDetails(selectedChat._id);
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChats = async () => {
    try {
      const response = await chatService.getChats();
      setChats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching chats:', error);
      setLoading(false);
    }
  };

  const fetchChatDetails = async (chatId) => {
    try {
      const response = await chatService.getChat(chatId);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching chat details:', error);
    }
  };

  const handleCreateOrOpenChat = async (userId) => {
    try {
      // Check if chat already exists
      const existingChat = chats.find(chat => 
        chat.participants.some(p => p._id === userId)
      );
      
      if (existingChat) {
        setSelectedChat(existingChat);
      } else {
        // Create new chat
        const response = await chatService.getOrCreateChat(userId);
        setSelectedChat(response.data);
        fetchChats(); // Refresh chat list
      }
    } catch (error) {
      console.error('Error creating/opening chat:', error);
      alert('Failed to open chat');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    setSending(true);
    try {
      await chatService.sendMessage(selectedChat._id, newMessage);
      setNewMessage('');
      fetchChatDetails(selectedChat._id);
      fetchChats(); // Update chat list
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const getOtherParticipant = (chat) => {
    return chat.participants.find((p) => p._id !== user._id);
  };

  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const now = new Date();
    const diff = now - d;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return minutes < 1 ? 'Just now' : `${minutes}m ago`;
    }
    if (hours < 24) return `${hours}h ago`;
    
    return d.toLocaleDateString('en-US', {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Chat List */}
          <div className="w-full md:w-1/3 bg-white border-r overflow-y-auto">
            {chats.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-400 text-5xl mb-4">💬</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                <p className="text-sm text-gray-600">
                  Start a conversation by accepting a match request
                </p>
              </div>
            ) : (
              <div>
                {chats.map((chat) => {
                  const otherUser = getOtherParticipant(chat);
                  const isSelected = selectedChat?._id === chat._id;
                  const unreadCount = chat.unreadCount?.[user._id] || 0;

                  return (
                    <div
                      key={chat._id}
                      onClick={() => setSelectedChat(chat)}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${
                        isSelected ? 'bg-blue-50 border-l-4 border-primary-600' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={
                            otherUser.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              otherUser.name
                            )}&size=48&background=random`
                          }
                          alt={otherUser.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {otherUser.name}
                            </h3>
                            {chat.lastMessageAt && (
                              <span className="text-xs text-gray-500">
                                {formatTime(chat.lastMessageAt)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600 truncate">
                              {chat.lastMessage || 'No messages yet'}
                            </p>
                            {unreadCount > 0 && (
                              <span className="ml-2 bg-primary-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                                {unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Chat Messages */}
          <div className="flex-1 flex flex-col bg-white">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="px-6 py-4 border-b flex items-center gap-3">
                  <img
                    src={
                      getOtherParticipant(selectedChat).avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        getOtherParticipant(selectedChat).name
                      )}&size=40&background=random`
                    }
                    alt={getOtherParticipant(selectedChat).name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {getOtherParticipant(selectedChat).name}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {getOtherParticipant(selectedChat).college}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    messages.map((message, index) => {
                      const isMyMessage = message.sender?._id === user._id || message.sender === user._id;
                      return (
                        <div
                          key={index}
                          className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            style={{
                              backgroundColor: isMyMessage ? '#3B82F6' : '#E5E7EB',
                              color: isMyMessage ? 'white' : '#111827'
                            }}
                            className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg"
                          >
                            <p className="text-sm break-words">{message.content}</p>
                            <p
                              style={{
                                color: isMyMessage ? '#DBEAFE' : '#4B5563'
                              }}
                              className="text-xs mt-1"
                            >
                              {formatTime(message.createdAt || message.timestamp)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="px-6 py-4 border-t">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 input"
                      disabled={sending}
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className="btn btn-primary"
                    >
                      {sending ? 'Sending...' : 'Send'}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <p className="text-lg">Select a chat to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatsPage;
