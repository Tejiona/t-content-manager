import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');
  
  if (secret !== 'tejiona-seed-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const existing = await prisma.admin.findUnique({
    where: { email: 'enrique.tejiona@gmail.com' }
  });

  if (existing) {
    return NextResponse.json({ message: 'Admin already exists' });
  }

  const password = 'TejionaAdmin2026!';
  const hash = await bcrypt.hash(password, 12);

  const admin = await prisma.admin.create({
    data: {
      email: 'enrique.tejiona@gmail.com',
      password: hash,
      name: 'Enrique Tejiona',
      role: 'super_admin',
      lang: 'fr',
    }
  });

  return NextResponse.json({
    message: 'Admin created',
    email: admin.email,
    name: admin.name,
    role: admin.role,
  });
}
