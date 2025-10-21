import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  (await cookies()).delete('user_id');

  const baseUrl = process.env.APP_URL || 'http://localhost:3000';;
  return NextResponse.redirect(new URL('/', baseUrl));
}
