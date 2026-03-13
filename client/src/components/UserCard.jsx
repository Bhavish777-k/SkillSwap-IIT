import { Link } from 'react-router-dom';

const UserCard = ({ user, showMatchScore = false, matchScore, onSendRequest }) => {
  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4">
        <img
          src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=80&background=random`}
          alt={user.name}
          className="w-20 h-20 rounded-full object-cover"
        />
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <Link to={`/users/${user._id}`} className="text-lg font-semibold text-gray-900 hover:text-primary-600">
                {user.name}
              </Link>
              {user.isPremium && (
                <span className="ml-2 badge badge-warning text-xs">⭐ Premium</span>
              )}
            </div>
            {showMatchScore && matchScore !== undefined && (
              <div className="badge badge-primary">
                {matchScore}% Match
              </div>
            )}
          </div>
          
          <p className="text-sm text-gray-600 mt-1">
            {user.branch} • {user.college}
          </p>
          
          {user.bio && (
            <p className="text-sm text-gray-700 mt-2 line-clamp-2">{user.bio}</p>
          )}
          
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-gray-500">Rating:</span>
            <div className="flex items-center">
              <span className="text-yellow-500">★</span>
              <span className="ml-1 text-sm font-medium">
                {user.rating?.average?.toFixed(1) || 'N/A'}
              </span>
              <span className="ml-1 text-xs text-gray-500">
                ({user.rating?.count || 0} reviews)
              </span>
            </div>
          </div>

          {user.skillsOffered && user.skillsOffered.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-2">Offers:</p>
              <div className="flex flex-wrap gap-2">
                {user.skillsOffered.slice(0, 3).map((skill) => (
                  <span key={skill._id} className="badge badge-primary text-xs">
                    {skill.icon} {skill.name}
                  </span>
                ))}
                {user.skillsOffered.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{user.skillsOffered.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {onSendRequest && (
            <div className="mt-4">
              <button
                onClick={() => onSendRequest(user)}
                className="btn btn-primary text-sm w-full sm:w-auto"
              >
                Send Request
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserCard;
