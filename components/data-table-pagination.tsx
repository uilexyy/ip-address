"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"

interface DataTablePaginationProps {
  page: number
  totalPages: number
  total: number
  perPage: number
  onPageChange: (page: number) => void
}

export function DataTablePagination({
  page,
  totalPages,
  total,
  perPage,
  onPageChange,
}: DataTablePaginationProps) {
  const pageButtons = useMemo(() => {
    const pages: number[] = []
    const startPage = Math.max(1, Math.min(page - 2, totalPages - 4))
    const endPage = Math.min(totalPages, startPage + 4)
    for (let i = startPage; i <= endPage; i++) pages.push(i)
    if (startPage > 1) pages.unshift(-1)
    if (endPage < totalPages) pages.push(-1)
    return pages
  }, [page, totalPages])

  const from = total === 0 ? 0 : (page - 1) * perPage + 1
  const to = Math.min(page * perPage, total)

  return (
    <div className="flex items-center justify-between rounded-xl border border-zinc-200/60 dark:border-zinc-800/40 bg-white dark:bg-zinc-900 px-4 py-3 text-sm shadow-xs transition-colors">
      <p className="text-muted-foreground">
        Menampilkan{" "}
        <span className="font-medium text-foreground">
          {from}-{to}
        </span>{" "}
        dari{" "}
        <span className="font-medium text-foreground">{total}</span> data
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Sebelumnya
        </Button>
        <div className="hidden items-center gap-1 px-2 sm:flex">
          {pageButtons.map((p, i) =>
            p === -1 ? (
              <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground">
                ...
              </span>
            ) : (
              <Button
                key={p}
                variant={page === p ? "default" : "ghost"}
                size="xs"
                className="min-w-7"
                onClick={() => onPageChange(p)}
              >
                {p}
              </Button>
            )
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Selanjutnya
        </Button>
      </div>
    </div>
  )
}
