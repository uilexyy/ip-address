import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-utils'

export async function GET() {
  const userId = await requireAuth()
  if (userId instanceof NextResponse) return userId
  const floors = await prisma.lantai.findMany({
    include: {
      departemens: {
        include: {
          ipAddresses: {
            orderBy: { hostname: 'asc' },
          },
        },
      },
    },
    orderBy: { nama: 'asc' },
  })

  return NextResponse.json(floors)
}
