import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-utils'

export async function GET() {
  const userId = await requireAuth()
  if (userId instanceof NextResponse) return userId
  const data = await prisma.ipAddress.findMany({
    include: { lantai: true, departemen: true },
    orderBy: { updatedAt: 'desc' },
    take: 10,
  })

  return NextResponse.json(data)
}
