const activeTooltipHiders = new Set<() => void>()

let initialized = false

function initScrollListener() {
  if (initialized) return
  initialized = true
  if (typeof window === "undefined") return
  window.addEventListener(
    "scroll",
    () => {
      activeTooltipHiders.forEach((hide) => hide())
      activeTooltipHiders.clear()
    },
    { passive: true }
  )
}

export function registerTooltipHider(hide: () => void) {
  initScrollListener()
  activeTooltipHiders.add(hide)
}

export function unregisterTooltipHider(hide: () => void) {
  activeTooltipHiders.delete(hide)
}
