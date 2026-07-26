import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminNav from '@/components/admin/AdminNav';
import AdminClientWrapper from '@/components/admin/AdminClientWrapper';
import { isAdminRole, type AdminRole } from '@/lib/admin/roles';
import { isEmailAllowed } from '@/lib/admin/access';
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

  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (!userRole || !isAdminRole(userRole.role)) {
    await supabase.auth.signOut();
    redirect('/admin/login?error=unauthorized');
  }

  const role: AdminRole = userRole.role;
  const email = user.email || '';

  return (
    <AdminClientWrapper>
      <div className="min-h-screen bg-background text-white-custom font-main selection:bg-primary/30 overflow-x-hidden">
        <AdminNav role={role} userEmail={email} />
        <div className="lg:pl-72 pt-16 lg:pt-0 transition-all duration-300 min-h-screen">
          <div className="p-3 sm:p-4 md:p-6 lg:p-8 xl:p-12 max-w-[1600px] mx-auto w-full">
            {children}
          </div>
        </div>
      </div>
    </AdminClientWrapper>
  );
}
