import React from 'react';

export const PixelCard: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white border-2 border-agency-text rounded-xl shadow-pixel p-4 relative ${className} ${onClick ? 'cursor-pointer active:shadow-pixel-active active:translate-x-[4px] active:translate-y-[4px] transition-all' : ''}`}
  >
    {children}
  </div>
);

export const PixelButton: React.FC<{ children: React.ReactNode; onClick?: () => void; className?: string; disabled?: boolean }> = ({ children, onClick, className = '', disabled }) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className={`
      font-pixel text-lg font-bold border-2 border-agency-text rounded-lg px-6 py-2 shadow-pixel 
      active:shadow-pixel-active active:translate-x-[4px] active:translate-y-[4px] transition-all
      disabled:opacity-50 disabled:cursor-not-allowed
      ${className}
    `}
  >
    {children}
  </button>
);

export const PixelInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    className={`font-body w-full border-2 border-agency-text rounded-lg p-2 shadow-pixel-sm focus:outline-none focus:ring-2 focus:ring-agency-pink ${props.className || ''}`}
  />
);

export const PixelTextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea
    {...props}
    className={`font-body w-full border-2 border-agency-text rounded-lg p-2 shadow-pixel-sm focus:outline-none focus:ring-2 focus:ring-agency-pink ${props.className || ''}`}
  />
);

export const PixelProgressBar: React.FC<{ current: number; max: number; label?: string }> = ({ current, max, label }) => {
  const percentage = Math.min(100, Math.max(0, (current / max) * 100));
  return (
    <div className="w-full">
      <div className="flex justify-between font-pixel text-lg mb-1 font-bold">
        <span>{label || `Level ${current}`}</span>
        <span>{Math.floor(percentage)}%</span>
      </div>
      <div className="h-6 border-2 border-agency-text bg-white rounded-full p-[2px] shadow-pixel-sm">
        <div
          className="h-full bg-agency-pink-dark rounded-full transition-all duration-500 relative overflow-hidden flex items-center justify-center"
          style={{ width: `${percentage}%` }}
        >
          {/* Shine effect */}
          <div className="absolute top-0 left-0 w-full h-1/2 bg-white opacity-30"></div>
        </div>
      </div>
    </div>
  );
};

export const TypeBadge: React.FC<{ type: string; color: string; icon: string }> = ({ type, color, icon }) => (
  <span className={`${color} border border-agency-text text-agency-text px-2 py-1 rounded-md text-xs font-bold font-pixel flex items-center gap-1`}>
    <span>{icon}</span> {type}
  </span>
);