"use client"

import * as React from "react"
import { X, Search } from "lucide-react"
import { cn } from "@/lib/utils/cn"

interface TechStack {
  id: string
  name: string
  slug: string
  category: string
  icon?: string | null
}

interface TechStackSelectorProps {
  value: string[]
  onChange: (value: string[]) => void
  label?: string
  description?: string
  maxSelections?: number
  className?: string
}

export function TechStackSelector({
  value,
  onChange,
  label,
  description,
  maxSelections = 20,
  className,
}: TechStackSelectorProps) {
  const [techStacks, setTechStacks] = React.useState<TechStack[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [error, setError] = React.useState<string | undefined>()

  // Fetch tech stacks
  React.useEffect(() => {
    const fetchTechStacks = async () => {
      try {
        const response = await fetch("/api/tech-stacks")
        if (!response.ok) {
          throw new Error("Failed to fetch tech stacks")
        }
        const data = await response.json()
        setTechStacks(data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "技術スタックの読み込みに失敗しました")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTechStacks()
  }, [])

  const selectedTechStacks = React.useMemo(() => {
    return techStacks.filter((ts) => value.includes(ts.id))
  }, [techStacks, value])

  const availableTechStacks = React.useMemo(() => {
    return techStacks.filter((ts) => !value.includes(ts.id))
  }, [techStacks, value])

  const filteredTechStacks = React.useMemo(() => {
    if (!search) return availableTechStacks
    const searchLower = search.toLowerCase()
    return availableTechStacks.filter(
      (ts) =>
        ts.name.toLowerCase().includes(searchLower) ||
        ts.category.toLowerCase().includes(searchLower)
    )
  }, [availableTechStacks, search])

  const groupedTechStacks = React.useMemo(() => {
    const groups: Record<string, TechStack[]> = {}
    filteredTechStacks.forEach((ts) => {
      if (!groups[ts.category]) {
        groups[ts.category] = []
      }
      groups[ts.category].push(ts)
    })
    return groups
  }, [filteredTechStacks])

  const handleSelect = (techStackId: string) => {
    if (value.length >= maxSelections) {
      return
    }
    onChange([...value, techStackId])
    setSearch("")
  }

  const handleRemove = (techStackId: string) => {
    onChange(value.filter((id) => id !== techStackId))
  }

  if (isLoading) {
    return (
      <div className={cn("space-y-2", className)}>
        {label && <label className="text-sm font-medium">{label}</label>}
        <div className="flex h-40 items-center justify-center rounded-lg border border-gray-300">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn("space-y-2", className)}>
        {label && <label className="text-sm font-medium">{label}</label>}
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && <label className="text-sm font-medium">{label}</label>}
      {description && <p className="text-sm text-gray-500">{description}</p>}

      {/* Selected tech stacks */}
      {selectedTechStacks.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTechStacks.map((ts) => (
            <div
              key={ts.id}
              className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-900"
            >
              <span>{ts.name}</span>
              <button
                type="button"
                onClick={() => handleRemove(ts.id)}
                className="rounded-full hover:bg-blue-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search input */}
      {value.length < maxSelections && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="技術スタックを検索..."
            className="h-10 w-full rounded-md border border-gray-300 bg-white pl-10 pr-3 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      )}

      {/* Available tech stacks */}
      {value.length < maxSelections && search && (
        <div className="max-h-64 space-y-4 overflow-y-auto rounded-lg border border-gray-300 bg-white p-4">
          {Object.keys(groupedTechStacks).length === 0 ? (
            <p className="text-center text-sm text-gray-500">技術スタックが見つかりません</p>
          ) : (
            Object.entries(groupedTechStacks).map(([category, stacks]) => (
              <div key={category}>
                <h4 className="mb-2 text-xs font-semibold uppercase text-gray-500">
                  {category.replace("_", " ")}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {stacks.map((ts) => (
                    <button
                      key={ts.id}
                      type="button"
                      onClick={() => handleSelect(ts.id)}
                      className="rounded-full border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100"
                    >
                      {ts.name}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Info text */}
      <p className="text-xs text-gray-500">
        {value.length} / {maxSelections} 選択済み
        {value.length === 0 && " (最低1つ必須)"}
      </p>
    </div>
  )
}
