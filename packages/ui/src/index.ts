import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, glass = true, className = '', ...props }) => {
  const baseStyle = glass 
    ? 'bg-white/80 backdrop-blur-md border border-slate-200 shadow-sm rounded-xl transition-all duration-300 hover:shadow-md hover:border-blue-500'
    : 'bg-white border border-slate-200 rounded-xl transition-all duration-300';
    
  return (
    <div className={`${baseStyle} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const PulseBadge: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-600 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
      </span>
      <span className="text-xs font-semibold text-blue-600 tracking-wide">{text}</span>
    </div>
  );
};
