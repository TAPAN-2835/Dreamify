import React from 'react';

const base = 'px-6 py-2 rounded-full font-semibold transition-all duration-200 shadow focus:outline-none';
const variants = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105',
  secondary: 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50 hover:scale-105',
  danger: 'bg-red-600 text-white hover:bg-red-700 hover:scale-105',
  disabled: 'bg-gray-400 text-white cursor-not-allowed',
};

const Button = ({
  children,
  onClick,
  type = 'button',
  disabled = false,
  variant = 'primary',
  className = '',
  ...props
}) => {
  const style = disabled ? variants.disabled : variants[variant] || variants.primary;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${style} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button; 