import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
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
