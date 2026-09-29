import * as React from 'react';
import { cn } from '@/lib/utils';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[70px] w-full rounded-md border border-[#1c2636] bg-[#07090e] px-3 py-2 text-xs text-[#f8fafc] placeholder:text-[#4b5a6f] transition-colors focus-visible:outline-none focus-visible:border-[#06b6d4] focus-visible:ring-1 focus-visible:ring-[#06b6d4] disabled:cursor-not-allowed disabled:opacity-50 resize-y font-sans',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';
