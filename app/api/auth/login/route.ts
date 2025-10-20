import { NextResponse } from 'next/server'
import User from '@/models/User'
import { connectDB } from '@/lib/mongoose'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  await connectDB()

  try {
    const { email, password } = await request.json()
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return NextResponse.json({ success: false, message: 'Credenciales incorrectas.' }, { status: 401 })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return NextResponse.json({ success: false, message: 'Credenciales incorrectas.' }, { status: 401 })
    }

    (await cookies()).set('user_id', user._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return NextResponse.json({ success: true, message: 'Inicio de sesión exitoso.' })
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Error interno del servidor.' }, { status: 500 })
  }
}
