import { NextResponse } from 'next/server';
import { serverEnv } from '@/config/env';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { password } = await req.json();

    if (!password) {
      return NextResponse.json({ error: 'Contraseña requerida' }, { status: 400 });
    }

    if (password !== serverEnv.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
    }

    // Generar un token simple basado en la contraseña y el secreto
    const token = crypto
      .createHmac('sha256', serverEnv.ADMIN_SECRET)
      .update(password)
      .digest('hex');

    // Establecer la cookie de sesión
    const cookieStore = await cookies();
    cookieStore.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 días
      path: '/',
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Admin Login Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
