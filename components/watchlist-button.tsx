"use client"

import { Button } from "@/components/ui/button"
import { BookmarkIcon } from "lucide-react"
import { useWatchlist } from "@/lib/watchlist-context"
import { useState } from "react"

interface WatchlistButtonProps {
  item: {
    type: "facility" | "location" | "chemical"
    name: string
    data?: any
  }
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
}

export function WatchlistButton({ item, variant = "outline", size = "sm" }: WatchlistButtonProps) {
  const { addToWatchlist, removeFromWatchlist, isWatched, watchlist } = useWatchlist()
  const [isLoading, setIsLoading] = useState(false)

  const watched = isWatched(item.name, item.type)
  const watchedItem = watchlist.find((w) => w.name === item.name && w.type === item.type)

  const handleToggle = async () => {
    setIsLoading(true)
    try {
      if (watched && watchedItem) {
        removeFromWatchlist(watchedItem.id)
      } else {
        addToWatchlist(item)
      }
    } catch (error) {
      console.error("Failed to update watchlist:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={watched ? "default" : variant}
      size={size}
      onClick={handleToggle}
      disabled={isLoading}
      className={watched ? "bg-primary text-primary-foreground" : ""}
    >
      <BookmarkIcon className={`h-4 w-4 mr-2 ${watched ? "fill-current" : ""}`} />
      {watched ? "Watching" : "Watch"}
    </Button>
  )
}
