import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  (await cookies()).delete('user_id');
  return NextResponse.redirect(new URL('/auth', process.env.APP_URL || 'http://localhost:3000'));
}
