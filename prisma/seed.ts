import 'dotenv/config'
import { PrismaClient } from '../lib/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import type { IpStatus } from '../lib/generated/prisma/enums'

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})

const floors = ['LT 1', 'LT 2', 'LT 3', 'LT 4']
const deptByFloor: Record<string, string[]> = {
  'LT 1': ['IGD', 'Radiologi', 'Farmasi', 'Rekam Medis'],
  'LT 2': ['Rawat Inap A', 'ICU', 'Laboratorium', 'Gizi'],
  'LT 3': ['Kamar Operasi', 'Rawat Inap B', 'NICU', 'CSSD'],
  'LT 4': ['Administrasi', 'Keuangan', 'HRD', 'Laundry'],
}
const deviceTypes = [
  'Desktop PC', 'Laptop', 'Server', 'Printer', 'Scanner',
  'UPS', 'Access Point', 'CCTV', 'IP Phone', 'Tablet',
]
const picNames = [
  'Dr. Andi Pratama', 'Siti Rahmawati', 'Budi Santoso', 'Dewi Lestari',
  'Ahmad Fauzi', 'Rina Marlina', 'Hendra Gunawan', 'Maya Sari',
  'Rudi Hermawan', 'Indah Permata', 'Agus Wijaya', 'Fitri Handayani',
]
const statuses: IpStatus[] = ['AKTIF', 'NONAKTIF', 'MAINTENANCE']

let seedCounter = 0
function detRand() {
  seedCounter++
  return (Math.sin(seedCounter * 42.5) * 10000) - Math.floor(Math.sin(seedCounter * 42.5) * 10000)
}
const pick = <T>(arr: T[]): T => arr[Math.floor(detRand() * arr.length)]

async function main() {
  console.log('Seeding database...')

  const createdFloors = await Promise.all(
    floors.map((nama) => prisma.lantai.create({ data: { nama } }))
  )
  console.log(`Created ${createdFloors.length} floors`)

  const floorMap = Object.fromEntries(createdFloors.map((f) => [f.nama, f.id]))
  const deptMap: Record<string, string> = {}

  for (const [floorNama, depts] of Object.entries(deptByFloor)) {
    for (const deptNama of depts) {
      const dept = await prisma.departemen.create({
        data: { nama: deptNama, lantaiId: floorMap[floorNama] },
      })
      deptMap[deptNama] = dept.id
    }
  }
  console.log(`Created ${Object.keys(deptMap).length} departments`)

  for (let i = 1; i <= 150; i++) {
    const lantai = pick(floors)
    const departemen = pick(Object.keys(deptByFloor).flatMap((f) => deptByFloor[f]))
    const tipe = pick(deviceTypes)
    const status = pick(statuses)
    const day = Math.floor(detRand() * 30) + 1
    const month = Math.floor(detRand() * 12) + 1

    await prisma.ipAddress.create({
      data: {
        ipAddress: `10.${Math.floor(detRand() * 255)}.${Math.floor(detRand() * 255)}.${i + 1}`,
        hostname: `${departemen.toLowerCase().replace(/\s+/g, '-')}-${String(i).padStart(3, '0')}`,
        lantaiId: floorMap[lantai],
        departemenId: deptMap[departemen],
        subDepartemen: detRand() > 0.5 ? `Sub ${departemen}` : undefined,
        tipe,
        pic: pick(picNames),
        status: i === 150 ? 'MAINTENANCE' : status,
        macAddress: `00:1A:${String(Math.floor(detRand() * 256)).padStart(2, '0')}:${String(Math.floor(detRand() * 256)).padStart(2, '0')}:${String(Math.floor(detRand() * 256)).padStart(2, '0')}:${String(Math.floor(detRand() * 256)).padStart(2, '0')}`,
        keterangan: detRand() > 0.7 ? `Terminal ${pick(['A', 'B', 'C', 'D'])} - ${pick(['Poli', 'Gudang', 'Ruang Kepala', 'Lobi'])}` : undefined,
        histories: {
          create: {
            aksi: 'CREATED',
            detail: `IP ${departemen} dibuat`,
            createdAt: new Date(2026, month - 1, day),
          },
        },
      },
    })
  }
  console.log('Created 150 IP addresses with history')

  await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@rs.com',
      password: 'admin123',
      nama: 'Admin RS',
      role: 'admin',
    },
  })
  console.log('Created admin user')

  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
