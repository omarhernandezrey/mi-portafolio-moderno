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
    <div className="min-h-screen bg-background text-white-custom font-main selection:bg-primary/30">
      {user && <AdminNav role={role} userEmail={email} />}
      <div className={`${user ? 'lg:pl-72 pt-16 lg:pt-0' : ''} transition-all duration-300`}>
        {children}
      </div>
    </div>
  );
}
