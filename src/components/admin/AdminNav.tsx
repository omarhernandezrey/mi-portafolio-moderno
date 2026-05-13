"use client";

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShieldCheck, 
  LogOut, 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  Clock, 
  Menu, 
  X,
  CreditCard,
  Webhook,
  BookOpen,
  Ticket,
  Palette
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { usePalette } from '@/hooks/usePalette';

interface AdminNavProps {
  role: string;
  userEmail?: string;
}

export default function AdminNav({ role, userEmail }: AdminNavProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  const getSupabase = () => {
    if (!supabaseRef.current) supabaseRef.current = createClient();
    return supabaseRef.current;
  };
  const { togglePalette } = usePalette();

  const handleLogout = async () => {
    await getSupabase().auth.signOut();
    window.location.href = '/admin/login';
  };

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, roles: ['owner', 'assistant', 'viewer'] },
    { label: 'Leads', href: '/admin/leads', icon: Users, roles: ['owner', 'assistant', 'viewer'] },
    { label: 'Conversaciones', href: '/admin/conversations', icon: MessageSquare, roles: ['owner', 'assistant', 'viewer'] },
    { label: 'Tickets', href: '/admin/tickets', icon: Ticket, roles: ['owner', 'assistant', 'viewer'] },
    { label: 'Timer', href: '/admin/timer', icon: Clock, roles: ['owner', 'assistant'] },
    { label: 'Facturación', href: '/admin/invoices', icon: CreditCard, roles: ['owner'] },
    { label: 'Webhooks', href: '/admin/webhooks', icon: Webhook, roles: ['owner'] },
    { label: 'Docs', href: '/admin/docs', icon: BookOpen, roles: ['owner', 'assistant'] },
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(role));

  const NavLink = ({ item, onClick }: { item: typeof navItems[0], onClick?: () => void }) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;
    
    return (
      <Link 
        href={item.href}
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${
          isActive 
            ? 'text-primary bg-primary/10 shadow-[inset_0_0_10px_rgba(var(--primary-color-rgb),0.05)]' 
            : 'text-text-muted hover:text-white-custom hover:bg-white/5'
        }`}
      >
        <Icon size={20} className={isActive ? 'text-primary' : 'text-text-muted group-hover:text-primary transition-colors'} />
        <span>{item.label}</span>
        {isActive && (
          <motion.div 
            layoutId="active-pill"
            className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
          />
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 h-screen fixed left-0 top-0 bg-card-bg border-r border-white/5 z-50">
        <div className="p-8">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 group-hover:scale-110 transition-transform">
              <ShieldCheck size={24} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-white-custom leading-tight">Admin Suite</span>
              <span className="text-[10px] uppercase tracking-[0.2em] font-black text-primary/60">Omar Hernández</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto scrollbar-hide">
          <div className="mb-4 px-4 text-[10px] uppercase tracking-widest font-black text-text-muted opacity-40">
            Navegación
          </div>
          {visibleItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>

        <div className="p-6 mt-auto border-t border-white/5 bg-background/30 space-y-4">
          {/* Palette Toggle */}
          <button 
            onClick={togglePalette}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-text-muted hover:text-primary hover:bg-primary/5 transition-all group"
            title="Cambiar Paleta de Colores"
          >
            <Palette size={18} className="group-hover:rotate-90 transition-transform duration-500" />
            <span>Tema Visual</span>
            <div className="ml-auto flex gap-1">
               <div className="w-2 h-2 rounded-full bg-primary" />
               <div className="w-2 h-2 rounded-full bg-accent" />
            </div>
          </button>

          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
              {userEmail?.[0].toUpperCase()}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold text-white-custom truncate">{userEmail}</span>
              <span className="text-[10px] uppercase tracking-wider text-primary font-black opacity-70">{role}</span>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 transition-all group"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Nav */}
      <header className="lg:hidden h-16 bg-card-bg/80 backdrop-blur-lg border-b border-white/5 fixed top-0 left-0 right-0 z-50 px-4 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2">
          <ShieldCheck className="text-primary" size={24} />
          <span className="font-bold text-white-custom">Admin Suite</span>
        </Link>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={togglePalette}
            className="p-2 rounded-lg bg-white/5 text-primary"
          >
            <Palette size={20} />
          </button>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg bg-white/5 text-white-custom"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="lg:hidden fixed inset-0 bg-background z-[60] p-6 flex flex-col"
          >
            <div className="flex justify-between items-center mb-12">
              <ShieldCheck className="text-primary" size={32} />
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X size={32} className="text-white-custom" />
              </button>
            </div>

            <nav className="space-y-2 flex-1 overflow-y-auto">
              {visibleItems.map((item) => (
                <NavLink 
                  key={item.href} 
                  item={item} 
                  onClick={() => setIsMobileMenuOpen(false)} 
                />
              ))}
            </nav>

            <div className="pt-6 border-t border-white/5 space-y-4">
              <button 
                onClick={togglePalette}
                className="flex w-full items-center justify-center gap-3 p-4 rounded-2xl bg-primary/10 text-primary font-bold"
              >
                <Palette size={20} />
                <span>Cambiar Tema Visual</span>
              </button>

              <button 
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-3 p-4 rounded-2xl bg-red-500/10 text-red-400 font-bold"
              >
                <LogOut size={20} />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
