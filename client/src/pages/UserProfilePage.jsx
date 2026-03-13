import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userService, matchService, skillService } from '../services';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const UserProfilePage = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [requestData, setRequestData] = useState({
    skillOffered: '',
    skillNeeded: '',
    message: '',
  });
  const [editData, setEditData] = useState({
    name: '',
    bio: '',
    branch: '',
    year: '',
    linkedin: '',
    github: '',
    portfolio: '',
    skillsOffered: [],
    skillsNeeded: [],
  });
  const [submitting, setSubmitting] = useState(false);

  // If no ID in params, use current user (own profile)
  const profileUserId = id || currentUser?._id;
  const isOwnProfile = !id || currentUser?._id === id;

  useEffect(() => {
    if (profileUserId) {
      fetchUserProfile();
      fetchSkills();
    }
  }, [profileUserId]);

  const fetchUserProfile = async () => {
    try {
      const response = await userService.getUser(profileUserId);
      setUser(response.data);
      // Populate edit form with current data
      if (isOwnProfile) {
        setEditData({
          name: response.data.name || '',
          bio: response.data.bio || '',
          branch: response.data.branch || '',
          year: response.data.year || '',
          linkedin: response.data.linkedin || '',
          github: response.data.github || '',
          portfolio: response.data.portfolio || '',
          skillsOffered: response.data.skillsOffered?.map(s => s._id) || [],
          skillsNeeded: response.data.skillsNeeded?.map(s => s._id) || [],
        });
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSkills = async () => {
    try {
      const response = await skillService.getSkills();
      setSkills(response.data);
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  const handleSendRequest = async () => {
    if (!requestData.skillNeeded) {
      alert('Please select a skill you want to learn');
      return;
    }

    setSubmitting(true);
    try {
      await matchService.sendRequest({
        mentorId: profileUserId,
        ...requestData,
        skillOffered: requestData.skillOffered || null,
      });
      alert('Request sent successfully!');
      setShowRequestModal(false);
      navigate('/requests');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to send request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProfile = async () => {
    setSubmitting(true);
    try {
      await userService.updateProfile(editData);
      alert('Profile updated successfully!');
      setShowEditModal(false);
      fetchUserProfile();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSkill = (skillId, type) => {
    const field = type === 'offered' ? 'skillsOffered' : 'skillsNeeded';
    const currentSkills = editData[field];
    
    if (currentSkills.includes(skillId)) {
      setEditData({
        ...editData,
        [field]: currentSkills.filter(id => id !== skillId)
      });
    } else {
      setEditData({
        ...editData,
        [field]: [...currentSkills, skillId]
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">User not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="card mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <img
              src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=150&background=random`}
              alt={user.name}
              className="w-32 h-32 rounded-full object-cover"
            />
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{user.name}</h1>
                {user.isPremium && (
                  <span className="badge badge-warning">⭐ Premium</span>
                )}
              </div>
              
              <p className="text-gray-600 mb-4">
                {user.branch} • {user.college} • Year {user.year}
              </p>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  <span className="text-yellow-500 text-xl">★</span>
                  <span className="ml-1 font-semibold">{user.rating?.average?.toFixed(1) || 'N/A'}</span>
                  <span className="ml-1 text-sm text-gray-500">({user.rating?.count || 0} reviews)</span>
                </div>
              </div>

              {user.bio && (
                <p className="text-gray-700 mb-4">{user.bio}</p>
              )}

              {/* Social Links */}
              <div className="flex gap-3">
                {user.linkedin && (
                  <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline text-sm">
                    LinkedIn
                  </a>
                )}
                {user.github && (
                  <a href={user.github} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline text-sm">
                    GitHub
                  </a>
                )}
                {user.portfolio && (
                  <a href={user.portfolio} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline text-sm">
                    Portfolio
                  </a>
                )}
              </div>

              {!isOwnProfile && (
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="btn btn-primary mt-6"
                >
                  Send Match Request
                </button>
              )}

              {isOwnProfile && (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="btn btn-primary mt-6"
                >
                  ✏️ Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Skills Offered</h2>
            {user.skillsOffered && user.skillsOffered.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.skillsOffered.map((skill) => (
                  <span key={skill._id} className="badge badge-primary">
                    {skill.icon} {skill.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No skills listed</p>
            )}
          </div>

          <div className="card">
            <h2 className="text-xl font-bold mb-4">Skills Needed</h2>
            {user.skillsNeeded && user.skillsNeeded.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.skillsNeeded.map((skill) => (
                  <span key={skill._id} className="badge badge-warning">
                    {skill.icon} {skill.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No skills listed</p>
            )}
          </div>
        </div>

        {/* Reviews */}
        {user.reviews && user.reviews.length > 0 && (
          <div className="card mt-6">
            <h2 className="text-xl font-bold mb-4">Reviews</h2>
            <div className="space-y-4">
              {user.reviews.map((review) => (
                <div key={review._id} className="border-b pb-4 last:border-0">
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={review.reviewer?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.reviewer?.name || 'User')}&size=40&background=random`}
                      alt={review.reviewer?.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium">{review.reviewer?.name}</p>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < review.rating ? 'text-yellow-500' : 'text-gray-300'}>
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-gray-700 text-sm">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Send Match Request</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What do you want to learn from {user.name}? *
                </label>
                <select
                  className="input"
                  value={requestData.skillNeeded}
                  onChange={(e) => setRequestData({ ...requestData, skillNeeded: e.target.value })}
                >
                  <option value="">Select a skill</option>
                  {user.skillsOffered?.map((skill) => (
                    <option key={skill._id} value={skill._id}>
                      {skill.icon} {skill.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What can you teach in return?
                </label>
                <select
                  className="input"
                  value={requestData.skillOffered}
                  onChange={(e) => setRequestData({ ...requestData, skillOffered: e.target.value })}
                >
                  <option value="">Select a skill (optional)</option>
                  {currentUser?.skillsOffered && skills.length > 0 && 
                    skills
                      .filter(skill => currentUser.skillsOffered.includes(skill._id))
                      .map((skill) => (
                        <option key={skill._id} value={skill._id}>
                          {skill.icon} {skill.name}
                        </option>
                      ))
                  }
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  className="input"
                  rows="4"
                  placeholder="Introduce yourself and explain why you want to learn this skill..."
                  value={requestData.message}
                  onChange={(e) => setRequestData({ ...requestData, message: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSendRequest}
                disabled={submitting}
                className="btn btn-primary flex-1"
              >
                {submitting ? 'Sending...' : 'Send Request'}
              </button>
              <button
                onClick={() => setShowRequestModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full my-8">
            <div className="p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    className="input"
                    rows="3"
                    placeholder="Tell others about yourself..."
                    value={editData.bio}
                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                  />
                </div>

                {/* Branch */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Branch/Major
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g., Computer Science"
                    value={editData.branch}
                    onChange={(e) => setEditData({ ...editData, branch: e.target.value })}
                  />
                </div>

                {/* Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year
                  </label>
                  <select
                    className="input"
                    value={editData.year}
                    onChange={(e) => setEditData({ ...editData, year: e.target.value })}
                  >
                    <option value="">Select year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                    <option value="5">5th Year</option>
                  </select>
                </div>

                {/* Social Links */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      className="input"
                      placeholder="https://linkedin.com/in/..."
                      value={editData.linkedin}
                      onChange={(e) => setEditData({ ...editData, linkedin: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GitHub
                    </label>
                    <input
                      type="url"
                      className="input"
                      placeholder="https://github.com/..."
                      value={editData.github}
                      onChange={(e) => setEditData({ ...editData, github: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Portfolio
                  </label>
                  <input
                    type="url"
                    className="input"
                    placeholder="https://yourwebsite.com"
                    value={editData.portfolio}
                    onChange={(e) => setEditData({ ...editData, portfolio: e.target.value })}
                  />
                </div>

                {/* Skills Offered */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills I Can Teach
                  </label>
                  <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {skills.map((skill) => (
                        <label key={skill._id} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editData.skillsOffered.includes(skill._id)}
                            onChange={() => toggleSkill(skill._id, 'offered')}
                            className="rounded"
                          />
                          <span className="text-sm">{skill.icon} {skill.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Skills Needed */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills I Want to Learn
                  </label>
                  <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {skills.map((skill) => (
                        <label key={skill._id} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editData.skillsNeeded.includes(skill._id)}
                            onChange={() => toggleSkill(skill._id, 'needed')}
                            className="rounded"
                          />
                          <span className="text-sm">{skill.icon} {skill.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleUpdateProfile}
                  disabled={submitting}
                  className="btn btn-primary flex-1"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
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
  );
};

export default UserProfilePage;
