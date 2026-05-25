import { cn } from '@/lib/utils';

interface GoldButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
  icon?: React.ReactNode;
}

export function GoldButton({ variant = 'primary', children, onClick, className, type = 'button', disabled, icon }: GoldButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-full font-body font-semibold text-[15px] uppercase tracking-[0.05em] transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-champagne-gold text-deep-espresso px-10 py-4 hover:scale-[1.03] hover:shadow-gold active:scale-[0.98]',
    secondary: 'border border-deep-espresso/50 dark:border-light-cream/50 bg-transparent text-deep-espresso dark:text-light-cream px-9 py-3.5 hover:bg-deep-espresso/[0.08] dark:hover:bg-light-cream/[0.08] active:scale-[0.98]',
    ghost: 'bg-transparent text-deep-espresso dark:text-light-cream px-6 py-2 underline-offset-4 hover:underline active:opacity-70',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(base, variants[variant], className)}
    >
      {icon}
      {children}
    </button>
  );
}
