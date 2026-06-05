import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-utils'

export async function GET() {
  const authError = await requireAuth()
  if (authError) return authError
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
