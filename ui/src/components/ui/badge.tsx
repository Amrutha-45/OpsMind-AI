import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 font-mono font-semibold rounded px-1.5 py-0.5 text-[10px] border',
  {
    variants: {
      variant: {
        default:   'bg-[rgba(6,182,212,0.12)]  text-[#06b6d4]  border-[rgba(6,182,212,0.35)]',
        memory:    'bg-[rgba(20,184,166,0.12)] text-[#14b8a6]  border-[rgba(20,184,166,0.35)]',
        reflect:   'bg-[rgba(168,85,247,0.12)] text-[#a855f7]  border-[rgba(168,85,247,0.35)]',
        resolve:   'bg-[rgba(16,185,129,0.12)] text-[#10b981]  border-[rgba(16,185,129,0.35)]',
        muted:     'bg-[#121824] text-[#8292a8] border-[#1c2636]',
        sev1:      'bg-[rgba(239,68,68,0.12)]  text-[#f87171]  border-[rgba(239,68,68,0.4)]',
        sev2:      'bg-[rgba(249,115,22,0.12)] text-[#fb923c]  border-[rgba(249,115,22,0.4)]',
        sev3:      'bg-[rgba(234,179,8,0.12)]  text-[#facc15]  border-[rgba(234,179,8,0.4)]',
        sev4:      'bg-[rgba(148,163,184,0.12)] text-[#94a3b8] border-[rgba(148,163,184,0.35)]',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
