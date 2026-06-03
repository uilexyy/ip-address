import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const ip = await prisma.ipAddress.findUnique({
    where: { id },
    include: { lantai: true, departemen: true },
  })
  if (!ip) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(ip)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { ipAddress, hostname, macAddress, lantaiId, departemenId, subDepartemen, tipe, pic, status, keterangan } = body

  const existing = await prisma.ipAddress.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const dup = await prisma.ipAddress.findFirst({
    where: { ipAddress, NOT: { id } },
  })
  if (dup) return NextResponse.json({ error: 'IP sudah terdaftar' }, { status: 409 })

  const ip = await prisma.ipAddress.update({
    where: { id },
    data: {
      ipAddress,
      hostname,
      macAddress: macAddress || null,
      lantaiId,
      departemenId,
      subDepartemen: subDepartemen || null,
      tipe,
      pic: pic || '',
      status,
      keterangan: keterangan || null,
      histories: {
        create: { aksi: 'UPDATED', detail: `IP ${ipAddress} diperbarui` },
      },
    },
    include: { lantai: true, departemen: true },
  })

  return NextResponse.json(ip)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.ipAddress.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
