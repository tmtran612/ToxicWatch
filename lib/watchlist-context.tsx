"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface WatchlistItem {
  id: string
  type: "facility" | "location" | "chemical"
  name: string
  data: any
  addedAt: Date
}

interface WatchlistContextType {
  watchlist: WatchlistItem[]
  addToWatchlist: (item: Omit<WatchlistItem, "id" | "addedAt">) => void
  removeFromWatchlist: (id: string) => void
  isWatched: (name: string, type: string) => boolean
  getWatchlistByType: (type: string) => WatchlistItem[]
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined)

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])

  // Load watchlist from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("toxicwatch-watchlist")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setWatchlist(
          parsed.map((item: any) => ({
            ...item,
            addedAt: new Date(item.addedAt),
          })),
        )
      } catch (error) {
        console.error("Failed to load watchlist:", error)
      }
    }
  }, [])

  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("toxicwatch-watchlist", JSON.stringify(watchlist))
  }, [watchlist])

  const addToWatchlist = (item: Omit<WatchlistItem, "id" | "addedAt">) => {
    const newItem: WatchlistItem = {
      ...item,
      id: `${item.type}-${item.name}-${Date.now()}`,
      addedAt: new Date(),
    }
    setWatchlist((prev) => [...prev, newItem])
  }

  const removeFromWatchlist = (id: string) => {
    setWatchlist((prev) => prev.filter((item) => item.id !== id))
  }

  const isWatched = (name: string, type: string) => {
    return watchlist.some((item) => item.name === name && item.type === type)
  }

  const getWatchlistByType = (type: string) => {
    return watchlist.filter((item) => item.type === type)
  }

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        addToWatchlist,
        removeFromWatchlist,
        isWatched,
        getWatchlistByType,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  )
}

export function useWatchlist() {
  const context = useContext(WatchlistContext)
  if (context === undefined) {
    throw new Error("useWatchlist must be used within a WatchlistProvider")
  }
  return context
}
