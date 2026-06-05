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
  const lantaiId = body.lantaiId || ''

  if (!nama) {
    return NextResponse.json({ error: 'Nama departemen wajib diisi' }, { status: 400 })
  }
  if (!lantaiId) {
    return NextResponse.json({ error: 'Lantai wajib dipilih' }, { status: 400 })
  }

  const existing = await prisma.departemen.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const dup = await prisma.departemen.findFirst({ where: { nama, NOT: { id } } })
  if (dup) {
    return NextResponse.json({ error: 'Departemen sudah terdaftar' }, { status: 409 })
  }

  const departemen = await prisma.departemen.update({
    where: { id },
    data: { nama, lantaiId },
    include: { lantai: true },
  })
  return NextResponse.json(departemen)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await requireAuth()
  if (userId instanceof NextResponse) return userId
  const { id } = await params

  const counts = await prisma.departemen.findUnique({
    where: { id },
    include: { _count: { select: { ipAddresses: true } } },
  })
  if (!counts) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (counts._count.ipAddresses > 0) {
    return NextResponse.json(
      { error: 'Tidak bisa dihapus: departemen masih memiliki IP Address.' },
      { status: 409 }
    )
  }

  await prisma.departemen.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
