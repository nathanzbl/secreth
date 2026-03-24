import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...rest }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-sans font-semibold uppercase tracking-[0.15em] text-stone-400"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full rounded-md bg-stone-900/80 px-4 py-2.5
            text-parchment-100 placeholder-stone-600 font-body
            border border-stone-700/60
            focus:outline-none focus:ring-1 focus:ring-amber-700/60 focus:border-amber-700/60
            transition-all duration-200
            disabled:opacity-40 disabled:cursor-not-allowed
            ${error ? 'border-red-800/60 focus:ring-red-800/60 focus:border-red-800/60' : ''}
            ${className}
          `}
          {...rest}
        />
        {error && (
          <p className="text-xs font-sans text-red-400/80 mt-0.5">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
