import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { Spinner } from './Spinner';

type ButtonVariant = 'primary' | 'danger' | 'success' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-b from-amber-700 to-amber-900 text-parchment-100 border border-amber-600/50 hover:from-amber-600 hover:to-amber-800 shadow-lg shadow-amber-950/40',
  danger:
    'bg-gradient-to-b from-red-800 to-red-950 text-parchment-100 border border-red-700/50 hover:from-red-700 hover:to-red-900 shadow-lg shadow-red-950/40',
  success:
    'bg-gradient-to-b from-green-800 to-green-950 text-parchment-100 border border-green-700/50 hover:from-green-700 hover:to-green-900 shadow-lg shadow-green-950/40',
  ghost:
    'bg-stone-900/60 text-parchment-200 border border-stone-600/50 hover:bg-stone-800/80 hover:border-stone-500/60 hover:text-parchment-100',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-2.5 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm rounded-md',
  md: 'px-3 py-2 text-sm sm:px-5 sm:py-2.5 sm:text-base rounded-lg',
  lg: 'px-5 py-2.5 text-base sm:px-8 sm:py-3.5 sm:text-lg rounded-lg',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  children,
  onClick,
  ...rest
}) => {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      whileHover={isDisabled ? undefined : { scale: 1.02 }}
      whileTap={isDisabled ? undefined : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      disabled={isDisabled}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center gap-2 font-display font-bold tracking-wider uppercase
        transition-colors duration-200 cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      {...rest}
    >
      {loading && <Spinner size={size === 'lg' ? 'md' : 'sm'} />}
      {children}
    </motion.button>
  );
};
