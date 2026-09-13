import { useState, useEffect } from 'react';
import { matchService, skillService } from '../services';
import UserCard from '../components/UserCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

const BrowsePage = () => {
  const [matches, setMatches] = useState([]);
  const [skills, setSkills] = useState([]);
  const [filters, setFilters] = useState({
    skillNeeded: '',
    skillOffered: '',
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSkills();
    fetchMatches();
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await skillService.getSkills();
      setSkills(response.data);
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const response = await matchService.findMatches(filters);
      setMatches(response.data);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = () => {
    fetchMatches();
  };

  const handleSendRequest = (user) => {
    navigate(`/users/${user._id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Browse Mentors</h1>
          <p className="text-gray-600 mt-2">Find students who can help you learn new skills</p>
        </div>

        {/* Filters */}
        <div className="card mb-8">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I want to learn
              </label>
              <select
                name="skillNeeded"
                className="input"
                value={filters.skillNeeded}
                onChange={handleFilterChange}
              >
                <option value="">All Skills</option>
                {skills.map((skill) => (
                  <option key={skill._id} value={skill._id}>
                    {skill.icon} {skill.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I can teach
              </label>
              <select
                name="skillOffered"
                className="input"
                value={filters.skillOffered}
                onChange={handleFilterChange}
              >
                <option value="">All Skills</option>
                {skills.map((skill) => (
                  <option key={skill._id} value={skill._id}>
                    {skill.icon} {skill.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button onClick={handleSearch} className="btn btn-primary w-full">
                Search Matches
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : matches.length > 0 ? (
          <div className="space-y-4">
            <p className="text-gray-600 mb-4">
              Found {matches.length} match{matches.length !== 1 ? 'es' : ''}
            </p>
            {matches.map((match) => (
              <UserCard
                key={match.user._id}
                user={match.user}
                showMatchScore={true}
                matchScore={match.matchScore}
                onSendRequest={handleSendRequest}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No matches found</p>
            <p className="text-gray-400 mt-2">Try adjusting your filters or add more skills to your profile</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowsePage;
