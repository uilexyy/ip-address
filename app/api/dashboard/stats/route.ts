import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const [totalIp, aktif, nonaktif, totalDepartemen] = await Promise.all([
    prisma.ipAddress.count(),
    prisma.ipAddress.count({ where: { status: 'AKTIF' } }),
    prisma.ipAddress.count({ where: { status: 'NONAKTIF' } }),
    prisma.departemen.count(),
  ])

  return NextResponse.json({ totalIp, aktif, nonaktif, totalDepartemen })
}
