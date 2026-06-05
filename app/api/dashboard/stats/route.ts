import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-utils'

export async function GET() {
  const authError = await requireAuth()
  if (authError) return authError
  const [totalIp, aktif, nonaktif, totalDepartemen] = await Promise.all([
    prisma.ipAddress.count(),
    prisma.ipAddress.count({ where: { status: 'AKTIF' } }),
    prisma.ipAddress.count({ where: { status: 'NONAKTIF' } }),
    prisma.departemen.count(),
  ])

  return NextResponse.json({ totalIp, aktif, nonaktif, totalDepartemen })
}
