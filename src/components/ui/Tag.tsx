import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TagProps {
  status: 'ok' | 'erro' | 'pendente' | 'warning';
  children: ReactNode;
  className?: string;
}

const statusStyles = {
  ok: 'bg-success/10 text-success border-success/20',
  erro: 'bg-error/10 text-error border-error/20',
  pendente: 'bg-muted text-muted-foreground border-border',
  warning: 'bg-warning/10 text-warning border-warning/20'
};

export function Tag({ status, children, className }: TagProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border',
      statusStyles[status],
      className
    )}>
      {children}
    </span>
  );
}