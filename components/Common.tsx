import React from 'react';

// --- Buttons ---

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  theme?: 'parent' | 'child';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  theme = 'parent',
  className = '', 
  ...props 
}) => {
  const baseStyles = "font-bold rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-cartoon tracking-wide";
  
  const sizeStyles = {
    sm: "px-3 py-2 text-sm",
    md: "px-5 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  // Color logic based on Theme and Variant
  let colorStyles = "";
  
  if (theme === 'parent') {
    if (variant === 'primary') colorStyles = "bg-parent-blue text-white hover:bg-blue-500 border-2 border-transparent";
    if (variant === 'secondary') colorStyles = "bg-white text-parent-dark border-2 border-gray-200";
    if (variant === 'success') colorStyles = "bg-green-500 text-white border-2 border-transparent";
    if (variant === 'danger') colorStyles = "bg-red-400 text-white border-2 border-transparent";
    if (variant === 'ghost') colorStyles = "bg-transparent shadow-none text-gray-500 hover:bg-gray-100";
  } else {
    // Child Theme - More vibrant
    if (variant === 'primary') colorStyles = "bg-kid-orange text-white border-b-4 border-orange-600 active:border-b-0 active:translate-y-1";
    if (variant === 'secondary') colorStyles = "bg-kid-yellow text-amber-900 border-b-4 border-amber-400 active:border-b-0 active:translate-y-1";
    if (variant === 'success') colorStyles = "bg-kid-green text-white border-b-4 border-emerald-600 active:border-b-0 active:translate-y-1";
    if (variant === 'danger') colorStyles = "bg-red-400 text-white border-b-4 border-red-600 active:border-b-0 active:translate-y-1";
    if (variant === 'ghost') colorStyles = "bg-white/50 text-kid-orange shadow-none";
  }

  return (
    <button className={`${baseStyles} ${sizeStyles[size]} ${colorStyles} ${className}`} {...props}>
      {children}
    </button>
  );
};

// --- Inputs ---

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => (
  <div className="flex flex-col gap-2 w-full text-left">
    {label && <label className="text-sm font-bold text-gray-500 ml-1">{label}</label>}
    <input 
      className={`bg-white border-2 border-gray-100 focus:border-parent-blue outline-none rounded-xl px-4 py-3 text-gray-700 transition-colors placeholder:text-gray-300 ${className}`}
      {...props}
    />
  </div>
);

// --- Cards ---

interface CardProps {
  children: React.ReactNode;
  className?: string;
  theme?: 'parent' | 'child';
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', theme = 'parent', onClick }) => {
  const base = "bg-white rounded-3xl p-4 relative overflow-hidden";
  const styling = theme === 'child' 
    ? "shadow-cartoon border-2 border-orange-100" 
    : "shadow-sm border border-gray-100";
  
  return (
    <div 
      onClick={onClick}
      className={`${base} ${styling} ${className} ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''}`}
    >
      {children}
    </div>
  );
};

// --- Badge ---

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    PENDING: "bg-gray-100 text-gray-500",
    WAITING_VERIFICATION: "bg-blue-100 text-blue-600 animate-pulse",
    COMPLETED: "bg-green-100 text-green-600",
    FAILED: "bg-red-100 text-red-600",
  };
  
  const labels: Record<string, string> = {
    PENDING: "待完成",
    WAITING_VERIFICATION: "待核验",
    COMPLETED: "已完成",
    FAILED: "未完成",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[status] || styles.PENDING}`}>
      {labels[status] || status}
    </span>
  );
};