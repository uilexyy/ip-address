import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const data = await prisma.ipAddress.findMany({
    include: { lantai: true, departemen: true },
    orderBy: { updatedAt: 'desc' },
    take: 10,
  })

  return NextResponse.json(data)
}
