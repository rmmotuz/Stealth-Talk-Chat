import './Tag.css';

export const Tag = ({ label, isActive, onClick }) => {
  return (
    <button className={`tag ${isActive ? 'active' : ''}`} onClick={onClick}>
      {label}
    </button>
  );
};
