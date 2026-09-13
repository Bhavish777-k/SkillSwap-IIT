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

const asArray = (value) => {
    if (Array.isArray(value)) return value;
    if (value === null || value === undefined) return [];
    return [value];
};

const isObject = (value) =>
    value !== null && typeof value === 'object' && !Array.isArray(value);

const displaySkill = (skill) => {
    if (isObject(skill)) {
        return skill.name || JSON.stringify(skill) || 'Unknown skill';
    }

    return String(skill ?? 'Unknown skill');
};

const renderSkillDetails = (skill) => {
    if (typeof skill !== 'object' || skill === null) {
        return displaySkill(skill);
    }

    return displaySkill(skill);
};

const formatInlineText = (text) => {
    const normalized = String(text)
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');

    return normalized.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g)
        .filter(Boolean)
        .map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index}>{part.slice(2, -2)}</strong>;
            }

            if (part.startsWith('`') && part.endsWith('`')) {
                return (
                    <code key={index} className="rounded bg-slate-100 px-1.5 py-0.5 text-sm text-slate-800">
                        {part.slice(1, -1)}
                    </code>
                );
            }

            const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
            if (link) {
                return (
                    <a
                        key={index}
                        href={link[2]}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-blue-700 underline decoration-blue-300 underline-offset-2 hover:text-blue-900"
                    >
                        {link[1]}
                    </a>
                );
            }

            return <span key={index}>{part}</span>;
        });
};

const normalizeRoadmap = (response, targetRole) => {
    const envelope = response?.data && isObject(response.data)
        ? response.data
        : response;
    const roadmapCandidate = envelope?.roadmap || envelope?.result || envelope;
    const roadmap = isObject(roadmapCandidate) ? roadmapCandidate : {};

    return {
        ...roadmap,
        role: roadmap.role || roadmap.target_role || targetRole,
        currentSkills: asArray(roadmap.currentSkills ?? roadmap.current_skills),
        missingSkills: asArray(roadmap.missingSkills ?? roadmap.missing_skills),
        missingByCategory: isObject(
            roadmap.missingByCategory ?? roadmap.missing_by_category
        )
            ? roadmap.missingByCategory ?? roadmap.missing_by_category
            : {},
        aiRawResponse:
            roadmap.aiRawResponse ?? roadmap.ai_raw_response ?? roadmap.roadmap ?? roadmap,
    };
};

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

            setResult(normalizeRoadmap(data, targetRole));
        } catch (err) {
            console.error('AI Roadmap Error:', err);

            setError(
                err.response?.data?.message ||
                err.response?.data?.detail ||
                (err.code === 'ERR_NETWORK'
                    ? 'Cannot reach the deployed server. Check that the backend is running.'
                    : null) ||
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

    const renderRoadmapText = (text) => {
        const normalizedText = String(text)
            .replace(/\r/g, '')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/([^\n])(?=(?:#{1,4}\s|Phase\s+\d+\s*:|Week\s+\d+\s*:|Checkpoint\s+\d+\s*:|\d+[.)]\s+\*\*))/gi, '$1\n')
            .replace(/([^\n])(?=\d+[.)]\s+(?=[A-Z]))/g, '$1\n')
            .replace(/([^\n])(?=[•]\s*\*?\*)/g, '$1\n');
        const lines = normalizedText.split('\n');
        const blocks = [];
        let inCodeBlock = false;
        let codeLines = [];

        for (let index = 0; index < lines.length; index += 1) {
            const rawLine = lines[index];
            const line = rawLine.trim();

            if (line.startsWith('```')) {
                if (inCodeBlock) {
                    blocks.push({ type: 'code', text: codeLines.join('\n') });
                    codeLines = [];
                }
                inCodeBlock = !inCodeBlock;
                continue;
            }

            if (inCodeBlock) {
                codeLines.push(rawLine);
                continue;
            }

            if (!line || line === '---' || line === '```') continue;

            if (line.startsWith('|')) {
                const rows = [];
                while (index < lines.length && lines[index].startsWith('|')) {
                    const cells = lines[index]
                        .split('|')
                        .slice(1, -1)
                        .map((cell) => cell.trim());
                    if (!cells.every((cell) => /^:?-{2,}:?$/.test(cell))) {
                        rows.push(cells);
                    }
                    index += 1;
                }
                index -= 1;
                blocks.push({ type: 'table', rows });
                continue;
            }

            const heading = line.match(/^#{1,6}\s*(.+)$/);
            const roadmapHeading = line.match(/^(Phase\s+\d+\s*:.*|Week\s+\d+\s*:.*|Checkpoint\s+\d+\s*:?.*|\d+[.)]\s+\*\*[^*]+\*\*:?$)/i);
            if (heading || roadmapHeading) {
                blocks.push({
                    type: 'heading',
                    text: (heading || roadmapHeading)[1].replace(/^\d+[.)]\s+/, ''),
                });
                continue;
            }

            const bullet = rawLine.match(/^(\s*)([-*•]|\d+[.)])\s*(.+)$/);
            if (bullet) {
                blocks.push({
                    type: bullet[2].match(/^\d/) ? 'numbered' : 'bullet',
                    text: bullet[3],
                    level: Math.floor(bullet[1].length / 2),
                    number: bullet[2].match(/^\d+/)?.[0],
                });
                continue;
            }

            blocks.push({ type: 'paragraph', text: line });
        }

        if (inCodeBlock && codeLines.length) {
            blocks.push({ type: 'code', text: codeLines.join('\n') });
        }

        const groupedBlocks = blocks.reduce((groups, block) => {
            const previous = groups[groups.length - 1];

            if (block.type === 'bullet' || block.type === 'numbered') {
                if (previous?.type === 'list' && previous.listType === block.type) {
                    previous.items.push(block);
                } else {
                    groups.push({ type: 'list', listType: block.type, items: [block] });
                }
                return groups;
            }

            if (block.type === 'paragraph' && previous?.type === 'paragraph') {
                previous.text += ` ${block.text}`;
                return groups;
            }

            groups.push(block);
            return groups;
        }, []);

        return (
            <div className="space-y-4 text-slate-700 leading-7">
                {groupedBlocks.map((block, index) => {
                    if (block.type === 'heading') {
                        const isCheckpoint = /checkpoint|milestone|deliverable/i.test(block.text);
                        return (
                            <div
                                key={index}
                                className={isCheckpoint
                                    ? 'rounded-lg border border-amber-200 bg-amber-50 p-4'
                                    : 'border-l-4 border-blue-500 bg-slate-50 px-4 py-3'}
                            >
                                <h3 className="text-lg font-bold text-slate-900">
                                    {formatInlineText(block.text)}
                                </h3>
                            </div>
                        );
                    }

                    if (block.type === 'list') {
                        const isNumbered = block.listType === 'numbered';
                        return (
                            <ul key={index} className="space-y-2 rounded-lg bg-white/60 px-2 py-1">
                                {block.items.map((item, itemIndex) => (
                                    <li
                                        key={itemIndex}
                                        className="flex gap-3"
                                        style={{ marginLeft: `${item.level * 1.25}rem` }}
                                    >
                                        <span className={isNumbered
                                            ? 'flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700'
                                            : 'mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-500'}>
                                            {isNumbered ? item.number || itemIndex + 1 : ''}
                                        </span>
                                        <p className="flex-1">{formatInlineText(item.text)}</p>
                                    </li>
                                ))}
                            </ul>
                        );
                    }

                    if (block.type === 'table') {
                        return (
                            <div key={index} className="overflow-x-auto rounded-lg border border-slate-200">
                                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                                    <thead className="bg-slate-800 text-white">
                                        <tr>
                                            {block.rows[0]?.map((cell, cellIndex) => (
                                                <th key={cellIndex} className="whitespace-nowrap px-4 py-3 font-semibold">
                                                    {formatInlineText(cell)}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {block.rows.slice(1).map((row, rowIndex) => (
                                            <tr key={rowIndex} className="align-top even:bg-slate-50">
                                                {row.map((cell, cellIndex) => (
                                                    <td key={cellIndex} className="min-w-32 px-4 py-3">
                                                        {formatInlineText(cell)}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        );
                    }

                    if (block.type === 'code') {
                        return (
                            <pre key={index} className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm leading-6 text-slate-100">
                                <code>{block.text}</code>
                            </pre>
                        );
                    }

                    return (
                        <p key={index} className="max-w-5xl">
                            {formatInlineText(block.text)}
                        </p>
                    );
                })}
            </div>
        );
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
                                                {renderSkillDetails(skill)}
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
                                                {renderSkillDetails(skill)}
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
                                    {Object.entries(result.missingByCategory).map(
                                        ([category, skills]) => (
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
                                                                {renderSkillDetails(skill)}
                                                            </span>
                                                        )
                                                    )}
                                            </div>
                                        </div>
                                        )
                                    )}
                                </div>
                            </div>
                        )}

                        {/* AI Raw Response */}
                        {result.aiRawResponse && (
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-5">
                                    🚀 AI Recommended Roadmap
                                </h2>

                                {typeof result.aiRawResponse === 'string'
                                    ? renderRoadmapText(result.aiRawResponse)
                                    : renderValue(result.aiRawResponse)}
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