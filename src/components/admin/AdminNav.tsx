"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  LogOut,
  LayoutDashboard,
  Users,
  Clock,
  Menu,
  X,
  CreditCard,
  Webhook,
  BookOpen,
  Ticket,
  Mail,
  Activity,
  ScrollText,
  MessagesSquare,
  BarChart3,
  Search,
  ExternalLink,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { NAV_ITEMS } from '@/lib/admin/permissions';
import { ADMIN_ROLE_LABELS, type AdminRole } from '@/lib/admin/roles';

const NAV_ICONS: Record<string, LucideIcon> = {
  '/admin': LayoutDashboard,
  '/admin/leads': Users,
  '/admin/tickets': Ticket,
  '/admin/feed': MessagesSquare,
  '/admin/timer': Clock,
  '/admin/invoices': CreditCard,
  '/admin/reports/time': BarChart3,
  '/admin/subscribers': Mail,
  '/admin/webhooks': Webhook,
  '/admin/logs': Activity,
  '/admin/audit': ScrollText,
  '/admin/docs': BookOpen,
};

const GROUP_LABELS = {
  core: 'CRM',
  ops: 'Operaciones',
  system: 'Sistema',
} as const;

interface AdminNavProps {
  role: AdminRole;
  userEmail?: string;
}

export default function AdminNav({ role, userEmail }: AdminNavProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileCloseButtonRef = useRef<HTMLButtonElement>(null);
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);

  const getSupabase = () => {
    if (!supabaseRef.current) supabaseRef.current = createClient();
    return supabaseRef.current;
  };

  const navItems = NAV_ITEMS.map((item) => ({
    ...item,
    icon: NAV_ICONS[item.href] || LayoutDashboard,
  }));

  const visibleItems = navItems.filter((item) => item.roles.includes(role));
  const roleLabel = ADMIN_ROLE_LABELS[role];
  const userInitial = userEmail?.[0]?.toUpperCase() || '?';

  const closeMobileMenu = (restoreFocus = false) => {
    setIsMobileMenuOpen(false);
    if (restoreFocus) {
      window.requestAnimationFrame(() => mobileMenuButtonRef.current?.focus());
    }
  };

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    document.documentElement.classList.add('admin-menu-open');
    document.body.classList.add('admin-menu-open');
    const focusTimer = window.setTimeout(() => {
      mobileCloseButtonRef.current?.focus();
    }, 80);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMobileMenu(true);
        return;
      }

      if (event.key !== 'Tab' || !mobileMenuRef.current) return;

      const focusable = Array.from(
        mobileMenuRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((element) => !element.hasAttribute('hidden'));

      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      document.documentElement.classList.remove('admin-menu-open');
      document.body.classList.remove('admin-menu-open');
    };
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    await getSupabase().auth.signOut();
    window.location.href = '/admin/login';
  };

  const NavLink = ({
    item,
    onClick,
  }: {
    item: (typeof navItems)[0];
    onClick?: () => void;
  }) => {
    const isActive =
      item.href === '/admin'
        ? pathname === '/admin'
        : pathname.startsWith(item.href);
    const Icon = item.icon;

    return (
      <Link
        href={item.href}
        onClick={onClick}
        aria-current={isActive ? 'page' : undefined}
        className={`group flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors duration-200 ${
          isActive
            ? 'border-primary/20 bg-primary/10 text-primary shadow-[inset_3px_0_0_var(--primary-color)]'
            : 'border-transparent text-text-muted hover:border-admin-line hover:bg-white/[0.04] hover:text-admin-ink'
        }`}
      >
        <Icon
          size={18}
          className={
            isActive
              ? 'text-primary'
              : 'text-text-muted transition-colors group-hover:text-primary'
          }
        />
        <span className="truncate">{item.label}</span>
        <ChevronRight
          size={14}
          className={`ml-auto transition-all ${
            isActive
              ? 'translate-x-0 text-primary/70'
              : '-translate-x-1 text-transparent group-hover:translate-x-0 group-hover:text-text-muted/60'
          }`}
        />
      </Link>
    );
  };

  const NavGroups = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="space-y-6">
      {(['core', 'ops', 'system'] as const).map((group) => {
        const groupItems = visibleItems.filter((item) => item.group === group);
        if (groupItems.length === 0) return null;

        return (
          <div key={group}>
            <div className="mb-2 px-3 font-mono-label text-[10px] text-text-muted/50">
              {GROUP_LABELS[group]}
            </div>
            <div className="space-y-1">
              {groupItems.map((item) => (
                <NavLink key={item.href} item={item} onClick={onNavigate} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  const UserCard = () => (
    <div className="flex items-center gap-3 rounded-xl border border-admin-line bg-admin-raised/70 p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-xs font-black text-primary">
        {userInitial}
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-bold text-admin-ink">{userEmail}</p>
        <p className="font-mono-label mt-0.5 text-[9px] text-primary/70">{roleLabel}</p>
      </div>
    </div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 flex-col border-r border-admin-line bg-admin-surface/95 backdrop-blur-xl lg:flex">
        <div className="border-b border-admin-line p-5">
          <Link href="/admin" className="group flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-custom-primary transition-transform duration-200 group-hover:scale-105">
              <ShieldCheck size={22} />
            </div>
            <div className="min-w-0">
              <p className="font-display text-xl italic leading-none text-admin-ink">
                Admin Suite
              </p>
              <p className="font-mono-label mt-1.5 text-[9px] text-primary/70">
                Omar Hernández
              </p>
            </div>
          </Link>

          <form action="/admin/leads" className="group relative mt-5">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-primary"
            />
            <input
              type="search"
              name="q"
              placeholder="Buscar leads..."
              aria-label="Buscar leads"
              className="w-full rounded-xl border border-admin-line bg-admin-bg/60 py-2.5 pl-9 pr-3 text-xs font-medium text-admin-ink outline-none transition-colors placeholder:text-text-muted/60 focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
            />
          </form>
        </div>

        <nav
          className="flex-1 overflow-y-auto px-3 py-4"
          aria-label="Navegación principal"
        >
          <NavGroups />
        </nav>

        <div className="space-y-3 border-t border-admin-line p-4">
          <div className="flex items-center justify-between px-1">
            <span className="inline-flex items-center gap-1.5 font-mono-label text-[9px] text-admin-success">
              <span className="h-1.5 w-1.5 rounded-full bg-admin-success shadow-[0_0_8px_var(--admin-success)]" />
              Sistema operativo
            </span>
            <Link
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[10px] font-bold text-text-muted transition-colors hover:text-primary"
            >
              Ver sitio
              <ExternalLink size={11} />
            </Link>
          </div>

          <UserCard />

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-semibold text-red-400 transition-colors hover:border-red-500/20 hover:bg-red-500/10"
          >
            <LogOut size={17} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-admin-line bg-admin-surface/90 px-4 backdrop-blur-xl lg:hidden">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
            <ShieldCheck size={19} />
          </div>
          <span className="font-display text-lg italic text-admin-ink">
            Admin Suite
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/leads"
            aria-label="Buscar leads"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-admin-line bg-white/[0.04] p-0 text-text-muted transition-colors hover:text-primary"
          >
            <Search size={18} />
          </Link>
          <button
            ref={mobileMenuButtonRef}
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Abrir menú de administración"
            aria-controls="admin-mobile-nav"
            aria-expanded={isMobileMenuOpen}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-admin-line bg-white/[0.04] p-0 text-admin-ink transition-colors hover:text-primary"
          >
            <Menu size={21} />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => closeMobileMenu(true)}
              aria-hidden="true"
              className="fixed inset-0 z-[55] bg-black/65 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              ref={mobileMenuRef}
              id="admin-mobile-nav"
              role="dialog"
              aria-modal="true"
              aria-label="Navegación de administración"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed inset-y-0 right-0 z-[60] flex w-[min(88vw,22rem)] flex-col border-l border-admin-line bg-admin-surface shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-admin-line p-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                    <ShieldCheck size={19} />
                  </div>
                  <div>
                    <p className="font-display text-lg italic leading-none text-admin-ink">
                      Admin Suite
                    </p>
                    <p className="font-mono-label mt-1 text-[9px] text-primary/70">
                      {roleLabel}
                    </p>
                  </div>
                </div>
                <button
                  ref={mobileCloseButtonRef}
                  type="button"
                  onClick={() => closeMobileMenu(true)}
                  aria-label="Cerrar menú de administración"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-admin-line p-0 text-text-muted transition-colors hover:bg-white/5 hover:text-admin-ink"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="border-b border-admin-line p-4">
                <form action="/admin/leads" className="group relative">
                  <Search
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-primary"
                  />
                  <input
                    type="search"
                    name="q"
                    placeholder="Buscar leads..."
                    aria-label="Buscar leads"
                    className="w-full rounded-xl border border-admin-line bg-admin-bg/60 py-2.5 pl-9 pr-3 text-xs font-medium text-admin-ink outline-none transition-colors placeholder:text-text-muted/60 focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                  />
                </form>
              </div>

              <nav
                className="flex-1 overflow-y-auto p-4"
                aria-label="Navegación principal móvil"
              >
                <NavGroups onNavigate={() => closeMobileMenu()} />
              </nav>

              <div className="space-y-3 border-t border-admin-line p-4">
                <UserCard />
                <div className="flex items-center justify-between">
                  <Link
                    href="/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-text-muted transition-colors hover:text-primary"
                  >
                    Ver sitio
                    <ExternalLink size={11} />
                  </Link>
                  <span className="inline-flex items-center gap-1.5 font-mono-label text-[9px] text-admin-success">
                    <span className="h-1.5 w-1.5 rounded-full bg-admin-success" />
                    Online
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-400 transition-colors hover:bg-red-500/15"
                >
                  <LogOut size={17} />
                  Cerrar sesión
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
