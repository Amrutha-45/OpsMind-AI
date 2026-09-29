import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#06b6d4] disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'bg-[#06b6d4] text-[#07090e] font-semibold hover:bg-[#22d3ee] shadow-sm active:scale-[0.98]',
        destructive:
          'bg-[#ef4444]/15 text-[#f87171] border border-[#ef4444]/30 hover:bg-[#ef4444]/25',
        outline:
          'border border-[#28374d] bg-[#0c1017] text-[#cbd5e1] hover:bg-[#121824] hover:text-[#f8fafc]',
        secondary:
          'bg-[#121824] text-[#cbd5e1] border border-[#1c2636] hover:bg-[#172030] hover:text-[#f8fafc]',
        ghost:
          'text-[#8292a8] hover:bg-[#121824] hover:text-[#f8fafc]',
        link:
          'text-[#06b6d4] underline-offset-4 hover:underline',
        emerald:
          'bg-[#10b981]/15 text-[#34d399] border border-[#10b981]/30 hover:bg-[#10b981]/25 font-semibold',
        purple:
          'bg-[#a855f7]/15 text-[#c084fc] border border-[#a855f7]/30 hover:bg-[#a855f7]/25 font-semibold',
      },
      size: {
        default: 'h-8 px-3 py-1.5',
        sm: 'h-7 rounded px-2.5 text-[11px]',
        lg: 'h-9 rounded-md px-4 text-sm',
        icon: 'h-8 w-8',
        iconSm: 'h-6 w-6 rounded',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
