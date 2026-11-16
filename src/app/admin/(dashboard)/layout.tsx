import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminNav from '@/components/admin/AdminNav';
import AdminClientWrapper from '@/components/admin/AdminClientWrapper';
import type { AdminRole } from '@/lib/admin/roles';
import { isEmailAllowed } from '@/lib/admin/access';
import { resolverRolDeUsuario } from '@/lib/admin/roleCache';
import { necesitaDesafioMfa } from '@/lib/admin/mfa';
import { serverEnv } from '@/config/env';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  if (!isEmailAllowed(user.email, serverEnv.ADMIN_ALLOWED_EMAILS)) {
    await supabase.auth.signOut();
    redirect('/admin/login?error=unauthorized');
  }

  const role: AdminRole | null = await resolverRolDeUsuario(user.id, () =>
    supabase.from('user_roles').select('role').eq('id', user.id).maybeSingle()
  );

  if (!role) {
    await supabase.auth.signOut();
    redirect('/admin/login?error=unauthorized');
  }

  // MFA (T-19): esta página vive fuera de (dashboard) (en /admin/mfa-challenge),
  // así que esta redirección nunca se dispara contra sí misma.
  if (role === 'owner') {
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal && necesitaDesafioMfa(aal)) {
      redirect('/admin/mfa-challenge');
    }
  }

  const email = user.email || '';

  return (
    <AdminClientWrapper>
      <div className="admin-shell min-h-dvh overflow-x-hidden font-main text-text-main">
        <a
          href="#admin-content"
          className="sr-only z-[100] rounded-lg bg-primary px-4 py-2 text-sm font-bold text-background focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Saltar al contenido
        </a>
        <AdminNav role={role} userEmail={email} />
        <div className="min-h-dvh pt-16 transition-[padding] duration-300 lg:pl-72 lg:pt-0">
          <main
            id="admin-content"
            className="mx-auto w-full max-w-[1600px] p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10"
          >
            {children}
          </main>
        </div>
      </div>
    </AdminClientWrapper>
  );
}
