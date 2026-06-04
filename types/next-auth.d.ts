import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      nama: string
    } & DefaultSession["user"]
  }

  interface JWT {
    id?: string
    nama?: string
  }
}
