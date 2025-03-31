import React from 'react';
import { Printer } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
}

const Logo: React.FC<LogoProps> = ({ size = 'md', variant = 'dark' }) => {
  const sizes = {
    sm: {
      container: 'p-1.5 rounded-md',
      icon: 'h-5 w-5',
      text: 'ml-2 text-base',
    },
    md: {
      container: 'p-2 rounded-lg',
      icon: 'h-6 w-6',
      text: 'ml-2.5 text-xl',
    },
    lg: {
      container: 'p-2.5 rounded-lg',
      icon: 'h-8 w-8',
      text: 'ml-3 text-2xl',
    },
  };

  const variants = {
    dark: {
      container: 'bg-gradient-to-br from-indigo-600 to-purple-700',
      icon: 'text-white',
      text: 'bg-gradient-to-r from-indigo-600 to-purple-700 bg-clip-text text-transparent',
    },
    light: {
      container: 'bg-gradient-to-br from-indigo-400 to-purple-500',
      icon: 'text-white',
      text: 'text-white',
    },
  };

  return (
    <div className="flex items-center">
      <div className={`${sizes[size].container} ${variants[variant].container} shadow-lg`}>
        <Printer className={`${sizes[size].icon} ${variants[variant].icon}`} />
      </div>
      <span className={`${sizes[size].text} ${variants[variant].text} font-bold tracking-tight`}>
        PrintFlow
      </span>
    </div>
  );
};

export default Logo; 