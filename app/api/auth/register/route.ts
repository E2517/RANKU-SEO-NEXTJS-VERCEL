import { NextResponse } from 'next/server';
import User from '@/models/User';
import { connectDB } from '@/lib/mongoose';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  await connectDB();

  try {
    const { username, email, password } = await request.json();
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'El correo electrónico ya está registrado.' },
        { status: 400 }
      );
    }

    const newUser = new User({ username, email, password });
    await newUser.save();

    (await cookies()).set('user_id', newUser._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return NextResponse.json({ success: true, message: 'Registro exitoso.' });
  } catch (err) {
    console.error('Error en el registro:', err);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}