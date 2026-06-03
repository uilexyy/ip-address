import { NextResponse } from 'next/server'

const DEVICE_TYPES = [
  'Desktop PC', 'Laptop', 'Server', 'Printer', 'Scanner',
  'UPS', 'Access Point', 'CCTV', 'IP Phone', 'Tablet',
]

export async function GET() {
  return NextResponse.json(DEVICE_TYPES)
}
