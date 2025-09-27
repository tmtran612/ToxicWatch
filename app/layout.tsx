import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { WatchlistProvider } from "@/lib/watchlist-context"
import "./globals.css"

export const metadata: Metadata = {
  title: "ToxicWatch - EPA Release Mapper",
  description: "AI-powered toxic release mapping and community health insights",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <WatchlistProvider>
          <Suspense fallback={null}>{children}</Suspense>
        </WatchlistProvider>
        <Analytics />
      </body>
    </html>
  )
}
