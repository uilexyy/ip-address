import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-utils'

export async function GET() {
  const userId = await requireAuth()
  if (userId instanceof NextResponse) return userId
  const data = await prisma.lantai.findMany({
    orderBy: { nama: 'asc' },
    include: { _count: { select: { departemens: true, ipAddresses: true } } },
  })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const userId = await requireAuth()
  if (userId instanceof NextResponse) return userId
  const body = await request.json()
  const nama = (body.nama || '').trim()

  if (!nama) {
    return NextResponse.json({ error: 'Nama lantai wajib diisi' }, { status: 400 })
  }

  const existing = await prisma.lantai.findUnique({ where: { nama } })
  if (existing) {
    return NextResponse.json({ error: 'Lantai sudah terdaftar' }, { status: 409 })
  }

  const lantai = await prisma.lantai.create({ data: { nama } })
  return NextResponse.json(lantai, { status: 201 })
}

export async function DELETE() {
  const userId = await requireAuth()
  if (userId instanceof NextResponse) return userId
  const blocking = await prisma.lantai.count({
    where: {
      OR: [{ departemens: { some: {} } }, { ipAddresses: { some: {} } }],
    },
  })
  if (blocking > 0) {
    return NextResponse.json(
      { error: 'Tidak bisa hapus semua: masih ada lantai yang memiliki departemen atau IP Address.' },
      { status: 409 }
    )
  }

  await prisma.lantai.deleteMany()
  return NextResponse.json({ success: true })
}
