import { useState } from 'react';
import { roadmapService } from '../services';

const ROLES = [
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Android Developer',
    'Data Scientist',
    'AI Engineer',
    'UI/UX Designer',
    'Creative Professional',
    'Project Manager',
];

const AIRoadmapPage = () => {
    const [targetRole, setTargetRole] = useState('AI Engineer');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);

    const generateRoadmap = async () => {
        try {
            setLoading(true);
            setError('');
            setResult(null);

            const data = await roadmapService.generateRoadmap(targetRole);

            console.log('AI Response:', data);

            setResult(data);
        } catch (err) {
            console.error('AI Roadmap Error:', err);

            setError(
                err.response?.data?.message ||
                err.response?.data?.detail ||
                'Failed to generate AI roadmap. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const renderValue = (value) => {
        if (value === null || value === undefined) {
            return null;
        }

        if (typeof value === 'string') {
            return (
                <div className="whitespace-pre-wrap text-gray-700 leading-7">
                    {value}
                </div>
            );
        }

        if (Array.isArray(value)) {
            return (
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    {value.map((item, index) => (
                        <li key={index}>
                            {typeof item === 'object'
                                ? JSON.stringify(item, null, 2)
                                : String(item)}
                        </li>
                    ))}
                </ul>
            );
        }

        if (typeof value === 'object') {
            return (
                <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto text-sm text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(value, null, 2)}
                </pre>
            );
        }

        return <span>{String(value)}</span>;
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        🤖 AI Career Roadmap
                    </h1>

                    <p className="mt-2 text-gray-600">
                        Get a personalized learning roadmap based on your
                        current skills and target career.
                    </p>
                </div>

                {/* Role Selection */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Choose Your Target Role
                    </h2>

                    <div className="flex flex-col md:flex-row gap-4">
                        <select
                            value={targetRole}
                            onChange={(e) => setTargetRole(e.target.value)}
                            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {ROLES.map((role) => (
                                <option key={role} value={role}>
                                    {role}
                                </option>
                            ))}
                        </select>

                        <button
                            onClick={generateRoadmap}
                            disabled={loading}
                            className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {loading
                                ? 'Generating...'
                                : 'Generate Roadmap'}
                        </button>
                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="bg-white rounded-xl shadow-sm p-10 text-center mb-8">
                        <div className="text-4xl mb-4">🤖</div>

                        <h2 className="text-xl font-semibold text-gray-900">
                            AI is analyzing your skills...
                        </h2>

                        <p className="text-gray-500 mt-2">
                            This may take a few seconds.
                        </p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-8">
                        {error}
                    </div>
                )}

                {/* Result */}
                {result && !loading && (
                    <div className="space-y-8">

                        {/* Role */}
                        {result.role && (
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <p className="text-sm text-gray-500">
                                    Target Role
                                </p>

                                <h2 className="text-2xl font-bold text-blue-600 mt-1">
                                    {result.role}
                                </h2>
                            </div>
                        )}

                        {/* Current Skills */}
                        {result.currentSkills && (
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">
                                    ✅ Your Current Skills
                                </h2>

                                <div className="flex flex-wrap gap-2">
                                    {result.currentSkills.map(
                                        (skill, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                                            >
                                                {skill}
                                            </span>
                                        )
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Missing Skills */}
                        {result.missingSkills && (
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">
                                    📚 Skills You Need to Learn
                                </h2>

                                <div className="flex flex-wrap gap-2">
                                    {result.missingSkills.map(
                                        (skill, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
                                            >
                                                {skill}
                                            </span>
                                        )
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Missing By Category */}
                        {result.missingByCategory && (
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-5">
                                    📊 Skills by Category
                                </h2>

                                <div className="space-y-5">
                                    {Object.entries(
                                        result.missingByCategory
                                    ).map(([category, skills]) => (
                                        <div key={category}>
                                            <h3 className="font-semibold text-gray-800 mb-2">
                                                {category}
                                            </h3>

                                            <div className="flex flex-wrap gap-2">
                                                {Array.isArray(skills) &&
                                                    skills.map(
                                                        (skill, index) => (
                                                            <span
                                                                key={index}
                                                                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm"
                                                            >
                                                                {skill}
                                                            </span>
                                                        )
                                                    )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* AI Raw Response */}
                        {result.aiRawResponse && (
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-5">
                                    🚀 AI Recommended Roadmap
                                </h2>

                                {renderValue(result.aiRawResponse)}
                            </div>
                        )}

                    </div>
                )}

                {/* Initial state */}
                {!result && !loading && !error && (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <div className="text-5xl mb-4">🧠</div>

                        <h2 className="text-2xl font-bold text-gray-900">
                            Build Your Career Roadmap
                        </h2>

                        <p className="text-gray-500 mt-2">
                            Select a target role and let AI analyze your
                            current skills.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIRoadmapPage;