import React from 'react';
import { createClient } from '@/lib/supabase/server';
import AdminNav from '@/components/admin/AdminNav';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // No redirigimos aquí si no hay usuario para permitir que la página de login se renderice
  // Pero el layout se aplica a TODAS las páginas bajo /admin.
  // Podríamos mover la página de login fuera o manejarlo aquí.
  // Si estamos en /admin/login, no mostramos el nav.
  
  // Para simplificar, obtenemos el rol solo si hay usuario
  let role = 'viewer';
  let email = '';

  if (user) {
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    role = userRole?.role || 'viewer';
    email = user.email || '';
  }

  return (
    <div className="min-h-screen bg-[var(--background-color)] text-[var(--white-color)]">
      {user && <AdminNav role={role} userEmail={email} />}
      {children}
    </div>
  );
}
