"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { UtensilsCrossed, Package, Boxes, Clock, Lightbulb, LogOut } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"

const menuItems = [
  { title: "Orders", url: "/canteen", icon: Package },
  { title: "Inventory", url: "/canteen/inventory", icon: Boxes },
  { title: "Slots", url: "/canteen/slots", icon: Clock },
  { title: "AI Suggestions", url: "/canteen/suggestions", icon: Lightbulb },
]

export function CanteenSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { loggedInCanteen, logoutCanteen, orders, foodItems, getDelayedOrders } = useCanteen()

  const handleLogout = () => {
    logoutCanteen()
    router.push("/")
  }

  const canteenOrders = loggedInCanteen ? orders.filter((o) => o.canteenId === loggedInCanteen.id) : []
  const newOrdersCount = canteenOrders.filter((o) => o.status === "New").length
  const canteenItems = loggedInCanteen ? foodItems.filter((f) => f.canteenId === loggedInCanteen.id) : []
  const lowStockCount = canteenItems.filter((i) => i.quantity < 10).length
  const delayedCount = loggedInCanteen ? getDelayedOrders(loggedInCanteen.id).length : 0

  return (
    <Sidebar className="border-r bg-white">
      <SidebarHeader className="border-b px-6 py-4">
        <Link href="/canteen" className="flex items-center gap-2">
          <UtensilsCrossed className="h-7 w-7 text-blue-600" />
          <span className="text-xl font-bold text-foreground">Canteen Portal</span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-4 py-4">
        {loggedInCanteen && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-xs text-blue-600 font-medium mb-1">Logged in as</p>
            <p className="font-semibold text-foreground">{loggedInCanteen.name}</p>
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground mb-2">Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                let badgeCount = 0
                let badgeColor = ""
                if (item.title === "Orders" && newOrdersCount > 0) {
                  badgeCount = newOrdersCount
                  badgeColor = "bg-blue-600"
                }
                if (item.title === "Inventory" && lowStockCount > 0) {
                  badgeCount = lowStockCount
                  badgeColor = "bg-yellow-500"
                }
                if (item.title === "AI Suggestions" && delayedCount > 0) {
                  badgeCount = delayedCount
                  badgeColor = "bg-red-500"
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                      className="data-[active=true]:bg-blue-50 data-[active=true]:text-blue-600"
                    >
                      <Link href={item.url} className="flex items-center justify-between w-full">
                        <span className="flex items-center gap-2">
                          <item.icon className="h-5 w-5" />
                          <span>{item.title}</span>
                        </span>
                        {badgeCount > 0 && (
                          <Badge className={`${badgeColor} text-white text-xs px-2 py-0`}>{badgeCount}</Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t px-4 py-4">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 font-semibold">{loggedInCanteen?.name?.charAt(0) || "C"}</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{loggedInCanteen?.name || "Canteen Staff"}</p>
            <p className="text-xs text-muted-foreground">Manager</p>
          </div>
          <button onClick={handleLogout}>
            <LogOut className="h-5 w-5 text-muted-foreground hover:text-foreground" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
