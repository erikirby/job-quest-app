import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseClasses = 'px-6 py-2 rounded-full font-bold text-sm shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white/0 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transform';
  
  const variantClasses = {
    primary: 'bg-gradient-to-br from-cyan-400 to-blue-500 text-white hover:shadow-lg focus:ring-cyan-400',
    secondary: 'bg-gradient-to-br from-purple-400 to-pink-500 text-white hover:shadow-lg focus:ring-purple-400',
    ghost: 'bg-white/30 text-slate-700 hover:bg-white/50 focus:ring-slate-400',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;