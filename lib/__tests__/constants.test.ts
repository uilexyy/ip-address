import { describe, it, expect } from "vitest"
import { isValidIp } from "@/lib/constants"

describe("isValidIp", () => {
  it("returns true for valid IPs", () => {
    expect(isValidIp("192.168.1.1")).toBe(true)
    expect(isValidIp("10.0.0.1")).toBe(true)
    expect(isValidIp("255.255.255.255")).toBe(true)
    expect(isValidIp("0.0.0.0")).toBe(true)
  })

  it("returns false for invalid IPs", () => {
    expect(isValidIp("256.1.1.1")).toBe(false)
    expect(isValidIp("1.2.3")).toBe(false)
    expect(isValidIp("abc.def.ghi.jkl")).toBe(false)
    expect(isValidIp("")).toBe(false)
    expect(isValidIp("192.168.1")).toBe(false)
  })
})
