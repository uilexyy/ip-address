import { LoaderCircle } from "lucide-react"

export default function MainLoading() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <LoaderCircle className="size-8 animate-spin text-blue-600" />
        <p className="text-sm">Memuat data...</p>
      </div>
    </div>
  )
}
