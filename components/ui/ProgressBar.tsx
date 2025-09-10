import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, className = '' }) => {
  const clampedValue = Math.max(0, Math.min(100, value));

  return (
    <div className={`w-full bg-white/30 rounded-full h-3.5 overflow-hidden backdrop-blur-sm border border-white/20 ${className}`}>
      <div
        className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-green-300 via-yellow-300 to-orange-400"
        style={{ width: `${clampedValue}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;