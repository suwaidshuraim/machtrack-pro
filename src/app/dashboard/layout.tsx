
"use client"

import React from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Navigation is now handled globally in the root layout.tsx
  // This layout is kept for route-specific organization if needed later.
  return <>{children}</>
}
