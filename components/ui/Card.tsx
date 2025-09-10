import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white/50 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 transition-all duration-300 ${className}`}>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;