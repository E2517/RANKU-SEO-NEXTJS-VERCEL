import { NextResponse } from 'next/server';
import User from '@/models/User';
import { connectDB } from '@/lib/mongoose';
import transporter from '@/lib/nodemailer';
import crypto from 'crypto';

export async function POST(request: Request) {
  await connectDB();

  try {
    const { email } = await request.json();

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return NextResponse.json({
        success: true,
        message: 'Si el correo existe y tiene contraseña, recibirás un enlace.',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hora
    await user.save();

    const resetUrl = `${process.env.APP_URL}/auth/reset-password?token=${encodeURIComponent(resetToken)}`;

    await transporter.sendMail({
      to: user.email,
      from: process.env.EMAIL_USER!,
      subject: 'Restablece tu contraseña - Ranku',
      html: `<p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>El enlace expira en 1 hora.</p>`,
    });

    return NextResponse.json({
      success: true,
      message: 'Si el correo existe y tiene contraseña, recibirás un enlace.',
    });
  } catch (err) {
    console.error('Error en forgot-password:', err);
    return NextResponse.json(
      { success: false, message: 'Error al enviar el correo.' },
      { status: 500 }
    );
  }
}
