"use client"

import * as React from "react"
import { X, Search } from "lucide-react"
import { cn } from "@/lib/utils/cn"

interface Specialty {
  id: string
  name: string
  slug: string
  description?: string | null
}

interface SpecialtySelectorProps {
  value: string[]
  onChange: (value: string[]) => void
  label?: string
  description?: string
  maxSelections?: number
  className?: string
}

export function SpecialtySelector({
  value,
  onChange,
  label,
  description,
  maxSelections = 10,
  className,
}: SpecialtySelectorProps) {
  const [specialties, setSpecialties] = React.useState<Specialty[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [error, setError] = React.useState<string | undefined>()

  // Fetch specialties
  React.useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const response = await fetch("/api/specialties")
        if (!response.ok) {
          throw new Error("Failed to fetch specialties")
        }
        const data = await response.json()
        setSpecialties(data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load specialties")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSpecialties()
  }, [])

  const selectedSpecialties = React.useMemo(() => {
    return specialties.filter((sp) => value.includes(sp.id))
  }, [specialties, value])

  const availableSpecialties = React.useMemo(() => {
    return specialties.filter((sp) => !value.includes(sp.id))
  }, [specialties, value])

  const filteredSpecialties = React.useMemo(() => {
    if (!search) return availableSpecialties
    const searchLower = search.toLowerCase()
    return availableSpecialties.filter(
      (sp) =>
        sp.name.toLowerCase().includes(searchLower) ||
        sp.description?.toLowerCase().includes(searchLower)
    )
  }, [availableSpecialties, search])

  const handleSelect = (specialtyId: string) => {
    if (value.length >= maxSelections) {
      return
    }
    onChange([...value, specialtyId])
    setSearch("")
  }

  const handleRemove = (specialtyId: string) => {
    onChange(value.filter((id) => id !== specialtyId))
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

      {/* Selected specialties */}
      {selectedSpecialties.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedSpecialties.map((sp) => (
            <div
              key={sp.id}
              className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1.5 text-sm font-medium text-green-900"
            >
              <span>{sp.name}</span>
              <button
                type="button"
                onClick={() => handleRemove(sp.id)}
                className="rounded-full hover:bg-green-200"
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
            placeholder="Search specialties..."
            className="h-10 w-full rounded-md border border-gray-300 bg-white pl-10 pr-3 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      )}

      {/* Available specialties */}
      {value.length < maxSelections && search && (
        <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-gray-300 bg-white p-4">
          {filteredSpecialties.length === 0 ? (
            <p className="text-center text-sm text-gray-500">No specialties found</p>
          ) : (
            filteredSpecialties.map((sp) => (
              <button
                key={sp.id}
                type="button"
                onClick={() => handleSelect(sp.id)}
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-left transition-colors hover:bg-gray-100"
              >
                <div className="font-medium text-gray-900">{sp.name}</div>
                {sp.description && (
                  <div className="mt-1 text-sm text-gray-600">{sp.description}</div>
                )}
              </button>
            ))
          )}
        </div>
      )}

      {/* Info text */}
      <p className="text-xs text-gray-500">
        {value.length} / {maxSelections} selected
        {value.length === 0 && " (at least 1 required)"}
      </p>
    </div>
  )
}
