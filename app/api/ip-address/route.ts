import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError
  const { searchParams } = request.nextUrl
  const search = searchParams.get('search') || ''
  const lantai = searchParams.get('lantai') || ''
  const departemen = searchParams.get('departemen') || ''
  const status = searchParams.get('status') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  const where: Record<string, unknown> = {}
  if (search) {
    where.OR = [
      { ipAddress: { contains: search, mode: 'insensitive' } },
      { hostname: { contains: search, mode: 'insensitive' } },
      { pic: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (lantai) where.lantaiId = lantai
  if (departemen) where.departemenId = departemen
  if (status) where.status = status

  const [data, total] = await Promise.all([
    prisma.ipAddress.findMany({
      where,
      include: { lantai: true, departemen: true },
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.ipAddress.count({ where }),
  ])

  return NextResponse.json({ data, total, page, totalPages: Math.ceil(total / limit) })
}

export async function DELETE() {
  const authError = await requireAuth()
  if (authError) return authError
  await prisma.ipAddress.deleteMany()
  return NextResponse.json({ success: true })
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError
  const body = await request.json()
  const { ipAddress, hostname, macAddress, lantaiId, departemenId, subDepartemen, tipe, pic, status, keterangan } = body

  const existing = await prisma.ipAddress.findUnique({ where: { ipAddress } })
  if (existing) {
    return NextResponse.json({ error: 'IP sudah terdaftar' }, { status: 409 })
  }

  const ip = await prisma.ipAddress.create({
    data: {
      ipAddress,
      hostname,
      macAddress: macAddress || null,
      lantaiId,
      departemenId,
      subDepartemen: subDepartemen || null,
      tipe,
      pic: pic || '',
      status: status || 'AKTIF',
      keterangan: keterangan || null,
      histories: {
        create: { aksi: 'CREATED', detail: `IP ${ipAddress} ditambahkan` },
      },
    },
    include: { lantai: true, departemen: true },
  })

  return NextResponse.json(ip, { status: 201 })
}
