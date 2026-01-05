"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { UtensilsCrossed, Home, Menu, Wallet, ShoppingBag, Bot, LogOut } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useCanteen } from "@/lib/canteen-context"

const menuItems = [
  { title: "Dashboard", url: "/student", icon: Home },
  { title: "Menu", url: "/student/menu", icon: Menu },
  { title: "My Orders", url: "/student/orders", icon: ShoppingBag },
  { title: "Wallet", url: "/student/wallet", icon: Wallet },
  { title: "AI Assistant", url: "/student/assistant", icon: Bot },
]

export function StudentSidebar() {
  const pathname = usePathname()
  const { currentStudent, walletBalance } = useCanteen()

  return (
    <Sidebar className="border-r bg-white">
      <SidebarHeader className="border-b px-6 py-4">
        <Link href="/student" className="flex items-center gap-2">
          <UtensilsCrossed className="h-7 w-7 text-blue-600" />
          <span className="text-xl font-bold text-foreground">Smart Canteen</span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-4 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground mb-2">Student Portal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className="data-[active=true]:bg-blue-50 data-[active=true]:text-blue-600"
                  >
                    <Link href={item.url}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t px-4 py-4">
        <div className="rounded-lg bg-blue-50 p-4 mb-4">
          <p className="text-sm text-muted-foreground">Wallet Balance</p>
          <p className="text-2xl font-bold text-blue-600">₹{walletBalance.toFixed(2)}</p>
        </div>
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 font-semibold">{currentStudent.name.charAt(0)}</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{currentStudent.name}</p>
            <p className="text-xs text-muted-foreground">Student</p>
          </div>
          <Link href="/">
            <LogOut className="h-5 w-5 text-muted-foreground hover:text-foreground" />
          </Link>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
