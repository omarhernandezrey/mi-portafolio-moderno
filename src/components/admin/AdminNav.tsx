"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface AdminNavProps {
  role: string;
  userEmail?: string;
}

export default function AdminNav({ role, userEmail }: AdminNavProps) {
  const pathname = usePathname();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/admin/login';
  };

  const navItems = [
    { label: 'Dashboard', href: '/admin', roles: ['owner', 'assistant', 'viewer'] },
    { label: 'Leads', href: '/admin/leads', roles: ['owner', 'assistant', 'viewer'] },
    { label: 'Tickets', href: '/admin/tickets', roles: ['owner', 'assistant', 'viewer'] },
    { label: 'Webhooks', href: '/admin/webhooks', roles: ['owner'] },
    { label: 'Timer', href: '/admin/timer', roles: ['owner', 'assistant'] },
    { label: 'Facturación', href: '/admin/invoices', roles: ['owner'] },
    { label: 'Docs', href: '/admin/docs', roles: ['owner', 'assistant'] },
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(role));

  return (
    <nav className="border-b border-[var(--primary-color)]/10 bg-[var(--card-bg-color)]/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="flex items-center gap-2 group">
              <ShieldCheck className="text-[var(--primary-color)] group-hover:scale-110 transition-transform" size={24} />
              <span className="font-bold text-xl tracking-tight hidden sm:block">Omar Admin</span>
            </Link>
            
            <div className="hidden md:flex gap-1">
              {visibleItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    pathname === item.href 
                      ? 'text-[var(--primary-color)] bg-[var(--primary-color)]/10' 
                      : 'text-[var(--muted-color)] hover:text-[var(--white-color)] hover:bg-[var(--white-color)]/5'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex flex-col items-end mr-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary-color)]">{role}</span>
              <span className="text-[10px] text-[var(--muted-color)]">{userEmail}</span>
            </div>
            
            <button 
              onClick={handleLogout}
              className="p-2 rounded-full hover:bg-red-500/10 text-[var(--muted-color)] hover:text-red-400 transition-all"
              title="Cerrar sesión"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
