import { Link } from 'react-router-dom';

const SkillCard = ({ skill, showActions = false, onRemove }) => {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
      <span>{skill.icon || '🎯'}</span>
      <span>{skill.name}</span>
      {showActions && onRemove && (
        <button
          onClick={() => onRemove(skill._id)}
          className="text-primary-500 hover:text-primary-700 ml-1"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default SkillCard;
