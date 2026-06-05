import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-utils'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await requireAuth()
  if (userId instanceof NextResponse) return userId
  const { id } = await params
  const body = await request.json()
  const nama = (body.nama || '').trim()

  if (!nama) {
    return NextResponse.json({ error: 'Nama lantai wajib diisi' }, { status: 400 })
  }

  const existing = await prisma.lantai.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const dup = await prisma.lantai.findFirst({ where: { nama, NOT: { id } } })
  if (dup) {
    return NextResponse.json({ error: 'Lantai sudah terdaftar' }, { status: 409 })
  }

  const lantai = await prisma.lantai.update({ where: { id }, data: { nama } })
  return NextResponse.json(lantai)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await requireAuth()
  if (userId instanceof NextResponse) return userId
  const { id } = await params

  const counts = await prisma.lantai.findUnique({
    where: { id },
    include: { _count: { select: { departemens: true, ipAddresses: true } } },
  })
  if (!counts) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (counts._count.departemens > 0 || counts._count.ipAddresses > 0) {
    return NextResponse.json(
      { error: 'Tidak bisa dihapus: lantai masih memiliki departemen atau IP Address.' },
      { status: 409 }
    )
  }

  await prisma.lantai.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
