import React from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md';

const BASE_CLASSES =
  'inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-50';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'border border-primary bg-primary text-background shadow-custom-primary hover:bg-primary/90',
  secondary:
    'border border-admin-line bg-white/[0.04] text-admin-ink hover:border-primary/30 hover:bg-white/[0.07]',
  ghost:
    'border border-transparent text-text-muted hover:bg-white/[0.05] hover:text-admin-ink',
  danger:
    'border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/15',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-xs',
  md: 'px-4 py-2.5 text-sm',
};

export function adminButtonClasses({
  variant = 'secondary',
  size = 'md',
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return clsx(BASE_CLASSES, VARIANT_CLASSES[variant], SIZE_CLASSES[size], className);
}

interface AdminButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
}

export function AdminButton({
  variant = 'secondary',
  size = 'md',
  icon,
  className,
  children,
  ...props
}: AdminButtonProps) {
  return (
    <button
      className={adminButtonClasses({ variant, size, className })}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

interface AdminButtonLinkProps
  extends React.ComponentProps<typeof Link> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
}

export function AdminButtonLink({
  variant = 'secondary',
  size = 'md',
  icon,
  className,
  children,
  ...props
}: AdminButtonLinkProps) {
  return (
    <Link
      className={adminButtonClasses({ variant, size, className })}
      {...props}
    >
      {icon}
      {children}
    </Link>
  );
}
