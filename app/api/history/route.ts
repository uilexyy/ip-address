import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError
  const { searchParams } = request.nextUrl
  const search = searchParams.get('search') || ''
  const aksi = searchParams.get('aksi') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  const where: Record<string, unknown> = {}
  if (aksi) where.aksi = aksi
  if (search) {
    where.OR = [
      { detail: { contains: search, mode: 'insensitive' } },
      { ipAddress: { is: { ipAddress: { contains: search, mode: 'insensitive' } } } },
      { ipAddress: { is: { hostname: { contains: search, mode: 'insensitive' } } } },
    ]
  }

  const [data, total] = await Promise.all([
    prisma.history.findMany({
      where,
      include: {
        ipAddress: { select: { id: true, ipAddress: true, hostname: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.history.count({ where }),
  ])

  return NextResponse.json({ data, total, page, totalPages: Math.ceil(total / limit) })
}
