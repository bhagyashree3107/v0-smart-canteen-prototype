"use client"

import type React from "react"
import { CanteenSidebar } from "@/components/canteen/canteen-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function CanteenLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <CanteenSidebar />
      <SidebarInset>
        <main className="min-h-screen bg-slate-50">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
