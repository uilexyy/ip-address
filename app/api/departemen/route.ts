import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-utils'

export async function GET() {
  const authError = await requireAuth()
  if (authError) return authError
  const data = await prisma.departemen.findMany({
    include: { lantai: true, _count: { select: { ipAddresses: true } } },
    orderBy: { nama: 'asc' },
  })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError
  const body = await request.json()
  const nama = (body.nama || '').trim()
  const lantaiId = body.lantaiId || ''

  if (!nama) {
    return NextResponse.json({ error: 'Nama departemen wajib diisi' }, { status: 400 })
  }
  if (!lantaiId) {
    return NextResponse.json({ error: 'Lantai wajib dipilih' }, { status: 400 })
  }

  const existing = await prisma.departemen.findUnique({ where: { nama } })
  if (existing) {
    return NextResponse.json({ error: 'Departemen sudah terdaftar' }, { status: 409 })
  }

  const departemen = await prisma.departemen.create({
    data: { nama, lantaiId },
    include: { lantai: true },
  })
  return NextResponse.json(departemen, { status: 201 })
}

export async function DELETE() {
  const authError = await requireAuth()
  if (authError) return authError
  const blocking = await prisma.departemen.count({
    where: { ipAddresses: { some: {} } },
  })
  if (blocking > 0) {
    return NextResponse.json(
      { error: 'Tidak bisa hapus semua: masih ada departemen yang memiliki IP Address.' },
      { status: 409 }
    )
  }

  await prisma.departemen.deleteMany()
  return NextResponse.json({ success: true })
}
