import React from 'react';
import './OptionButton.css';

interface OptionButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export const OptionButton: React.FC<OptionButtonProps> = ({ label, onClick, disabled = false }) => {
  return (
    <button className="option-button" type="button" onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
};
