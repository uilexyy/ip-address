import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-utils'

export async function GET() {
  const authError = await requireAuth()
  if (authError) return authError
  const data = await prisma.ipAddress.findMany({
    include: { lantai: true, departemen: true },
    orderBy: { updatedAt: 'desc' },
    take: 10,
  })

  return NextResponse.json(data)
}
