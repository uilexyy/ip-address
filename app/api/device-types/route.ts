import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-utils'

const DEVICE_TYPES = [
  'Desktop PC', 'Laptop', 'Server', 'Printer', 'Scanner',
  'UPS', 'Access Point', 'CCTV', 'IP Phone', 'Tablet',
]

export async function GET() {
  const authError = await requireAuth()
  if (authError) return authError
  return NextResponse.json(DEVICE_TYPES)
}
