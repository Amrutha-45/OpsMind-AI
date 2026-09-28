import * as React from 'react';
import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-8 w-full rounded-md border border-[#1c2636] bg-[#07090e] px-3 py-1 text-xs text-[#f8fafc] placeholder:text-[#4b5a6f] transition-colors focus-visible:outline-none focus-visible:border-[#06b6d4] focus-visible:ring-1 focus-visible:ring-[#06b6d4] disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
