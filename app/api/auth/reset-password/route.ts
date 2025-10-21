import { NextResponse } from 'next/server';
import User from '@/models/User';
import { connectDB } from '@/lib/mongoose';

export async function GET(request: Request) {
  await connectDB();

  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/auth', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'));
  }

  let decodedToken: string;
  try {
    decodedToken = decodeURIComponent(token);
  } catch {
    return new NextResponse('Enlace inválido.', { status: 400 });
  }

  const user = await User.findOne({
    resetPasswordToken: decodedToken,
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!user) {
    return new NextResponse('Enlace inválido o expirado.', { status: 400 });
  }

  return NextResponse.redirect(
    new URL(`/auth/reset-password?token=${encodeURIComponent(decodedToken)}`, process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
  );
}

export async function POST(request: Request) {
  await connectDB();

  try {
    const { token, password } = await request.json();

    if (!password || typeof password !== 'string' || password.trim().length < 6) {
      return NextResponse.json(
        { success: false, message: 'La contraseña debe tener al menos 6 caracteres.' },
        { status: 400 }
      );
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Enlace inválido o expirado.' },
        { status: 400 }
      );
    }

    user.password = password.trim();
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return NextResponse.json({ success: true, message: 'Contraseña actualizada. Redirigiendo...' });
  } catch (err) {
    console.error('Error en reset-password POST:', err);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}