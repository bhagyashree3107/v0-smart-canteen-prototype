"use client"

import type React from "react"
import { StudentSidebar } from "@/components/student/student-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <StudentSidebar />
      <SidebarInset>
        <main className="min-h-screen bg-slate-50">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
