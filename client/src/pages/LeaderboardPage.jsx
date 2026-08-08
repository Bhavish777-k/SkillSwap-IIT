import { useEffect, useState } from 'react';
import { skillService, leaderboardService } from '../services';
import LoadingSpinner from '../components/LoadingSpinner';

const LeaderboardPage = () => {
  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [teachers, setTeachers] = useState([]);

  const [loadingSkills, setLoadingSkills] = useState(true);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [error, setError] = useState('');

  // ----------------------------------------
  // Load skills when page opens
  // ----------------------------------------
  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setLoadingSkills(true);

      const response = await skillService.getSkills();

      setSkills(response.data || []);
    } catch (error) {
      console.error('Error fetching skills:', error);
      setError('Unable to load skills.');
    } finally {
      setLoadingSkills(false);
    }
  };

  // ----------------------------------------
  // Load leaderboard for selected skill
  // ----------------------------------------
  const fetchLeaderboard = async (skillId) => {
    if (!skillId) {
      setTeachers([]);
      return;
    }

    try {
      setLoadingLeaderboard(true);
      setError('');

      const response =
        await leaderboardService.getTeachersBySkill(skillId);

      setTeachers(response.data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);

      setTeachers([]);
      setError(
        error.response?.data?.message ||
        'Unable to load leaderboard.'
      );
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  // ----------------------------------------
  // Skill dropdown
  // ----------------------------------------
  const handleSkillChange = (e) => {
    const skillId = e.target.value;

    setSelectedSkill(skillId);

    fetchLeaderboard(skillId);
  };

  // ----------------------------------------
  // Convert minutes into readable time
  // ----------------------------------------
  const formatTeachingTime = (minutes) => {
    if (!minutes) {
      return '0 min';
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours === 0) {
      return `${remainingMinutes} min`;
    }

    if (remainingMinutes === 0) {
      return `${hours} hr`;
    }

    return `${hours} hr ${remainingMinutes} min`;
  };

  // ----------------------------------------
  // Medal for top 3
  // ----------------------------------------
  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';

    return `#${rank}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* -------------------------------- */}
        {/* Header */}
        {/* -------------------------------- */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            🏆 Teacher Leaderboard
          </h1>

          <p className="text-gray-600 mt-2">
            Discover the best teachers based on ratings,
            teaching points, and teaching experience.
          </p>
        </div>

        {/* -------------------------------- */}
        {/* Skill Selection */}
        {/* -------------------------------- */}
        <div className="card mb-8">
          <h2 className="text-lg font-semibold mb-4">
            Select a Skill
          </h2>

          {loadingSkills ? (
            <div className="py-4">
              <LoadingSpinner />
            </div>
          ) : (
            <select
              value={selectedSkill}
              onChange={handleSkillChange}
              className="input w-full md:w-1/2"
            >
              <option value="">
                Select a skill
              </option>

              {skills.map((skill) => (
                <option
                  key={skill._id}
                  value={skill._id}
                >
                  {skill.icon} {skill.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* -------------------------------- */}
        {/* Error */}
        {/* -------------------------------- */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* -------------------------------- */}
        {/* No skill selected */}
        {/* -------------------------------- */}
        {!selectedSkill && !loadingSkills && (
          <div className="card text-center py-16">
            <div className="text-6xl mb-4">
              🏆
            </div>

            <h2 className="text-xl font-bold text-gray-900">
              Choose a skill
            </h2>

            <p className="text-gray-500 mt-2">
              Select a skill above to see the top teachers.
            </p>
          </div>
        )}

        {/* -------------------------------- */}
        {/* Loading */}
        {/* -------------------------------- */}
        {loadingLeaderboard && (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* -------------------------------- */}
        {/* Leaderboard */}
        {/* -------------------------------- */}
        {!loadingLeaderboard &&
          selectedSkill &&
          teachers.length > 0 && (
            <div className="space-y-4">

              {/* Explanation */}
              <div className="card">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">

                  <div>
                    <div className="text-2xl">
                      ⭐
                    </div>

                    <p className="font-semibold">
                      Rating
                    </p>

                    <p className="text-sm text-gray-500">
                      40% of score
                    </p>
                  </div>

                  <div>
                    <div className="text-2xl">
                      🏆
                    </div>

                    <p className="font-semibold">
                      Teaching Points
                    </p>

                    <p className="text-sm text-gray-500">
                      30% of score
                    </p>
                  </div>

                  <div>
                    <div className="text-2xl">
                      ⏱️
                    </div>

                    <p className="font-semibold">
                      Teaching Time
                    </p>

                    <p className="text-sm text-gray-500">
                      30% of score
                    </p>
                  </div>

                </div>
              </div>

              {/* Teacher cards */}
              {teachers.map((teacher) => (
                <div
                  key={teacher.teacherId}
                  className={`card ${
                    teacher.rank <= 3
                      ? 'border-2 border-primary-100'
                      : ''
                  }`}
                >

                  <div className="flex flex-col md:flex-row md:items-center gap-5">

                    {/* Rank */}
                    <div className="w-16 text-center">
                      <div className="text-3xl">
                        {getRankIcon(teacher.rank)}
                      </div>

                      <p className="text-xs text-gray-500 mt-1">
                        Rank
                      </p>
                    </div>

                    {/* Avatar */}
                    <div>
                      <img
                        src={
                          teacher.teacherAvatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            teacher.teacherName
                          )}&background=random`
                        }
                        alt={teacher.teacherName}
                        className="w-16 h-16 rounded-full"
                      />
                    </div>

                    {/* Teacher information */}
                    <div className="flex-1">

                      <h2 className="text-xl font-bold text-gray-900">
                        {teacher.teacherName}
                      </h2>

                      <p className="text-primary-600 mt-1">
                        {teacher.skillIcon} {teacher.skillName}
                      </p>

                      {teacher.teacherBio && (
                        <p className="text-sm text-gray-500 mt-2">
                          {teacher.teacherBio}
                        </p>
                      )}

                    </div>

                    {/* Score */}
                    <div className="text-center md:text-right">
                      <p className="text-3xl font-bold text-primary-600">
                        {teacher.leaderboardScore}
                      </p>

                      <p className="text-sm text-gray-500">
                        Leaderboard Score
                      </p>
                    </div>

                  </div>

                  {/* Statistics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-5 border-t">

                    <div>
                      <p className="text-sm text-gray-500">
                        Rating
                      </p>

                      <p className="font-bold text-yellow-600">
                        ⭐ {teacher.averageRating.toFixed(1)}
                      </p>

                      <p className="text-xs text-gray-400">
                        {teacher.reviewCount} reviews
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Teaching Points
                      </p>

                      <p className="font-bold text-primary-600">
                        🏆 {teacher.totalPoints}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Teaching Time
                      </p>

                      <p className="font-bold text-green-600">
                        ⏱️{' '}
                        {formatTeachingTime(
                          teacher.totalTeachingMinutes
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Students Taught
                      </p>

                      <p className="font-bold text-blue-600">
                        👨‍🎓 {teacher.totalStudents}
                      </p>

                      <p className="text-xs text-gray-400">
                        {teacher.totalSessions} sessions
                      </p>
                    </div>

                  </div>

                </div>
              ))}

            </div>
          )}

        {/* -------------------------------- */}
        {/* No teachers */}
        {/* -------------------------------- */}
        {!loadingLeaderboard &&
          selectedSkill &&
          teachers.length === 0 &&
          !error && (
            <div className="card text-center py-16">

              <div className="text-5xl mb-4">
                👨‍🏫
              </div>

              <h2 className="text-xl font-bold">
                No teachers yet
              </h2>

              <p className="text-gray-500 mt-2">
                No completed teaching sessions were found
                for this skill.
              </p>

            </div>
          )}

      </div>
    </div>
  );
};

export default LeaderboardPage;