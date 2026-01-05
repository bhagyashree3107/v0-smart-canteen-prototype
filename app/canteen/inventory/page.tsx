"use client"

import { useCanteen } from "@/lib/canteen-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Leaf, Drumstick, AlertTriangle, Plus, Minus, Clock } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function InventoryPage() {
  const { foodItems, updateFoodStock, loggedInCanteen, predictSelloutTime } = useCanteen()
  const router = useRouter()

  useEffect(() => {
    if (!loggedInCanteen) {
      router.push("/")
    }
  }, [loggedInCanteen, router])

  if (!loggedInCanteen) return null

  const canteenItems = foodItems.filter((item) => item.canteenId === loggedInCanteen.id)

  const handleStockChange = (itemId: string, delta: number) => {
    const item = foodItems.find((f) => f.id === itemId)
    if (item) {
      updateFoodStock(itemId, Math.max(0, item.quantity + delta))
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
        <p className="text-muted-foreground mt-1">{loggedInCanteen.name} - Manage food stock and availability</p>
      </div>

      {/* Low Stock Alert */}
      {canteenItems.some((item) => item.quantity < 10) && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">Low Stock Alert</p>
                <p className="text-sm text-yellow-700">
                  {canteenItems
                    .filter((i) => i.quantity < 10)
                    .map((i) => i.name)
                    .join(", ")}{" "}
                  running low
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {canteenItems.map((item) => {
          const selloutTime = predictSelloutTime(item.id)

          return (
            <Card key={item.id} className={item.quantity < 10 ? "border-yellow-300" : ""}>
              <div className="flex">
                <div className="relative w-24 h-24 shrink-0">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    fill
                    className="object-cover rounded-l-lg"
                  />
                </div>
                <div className="flex-1 p-3">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-foreground">{item.name}</h3>
                    <Badge className={item.isVeg ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                      {item.isVeg ? <Leaf className="h-3 w-3" /> : <Drumstick className="h-3 w-3" />}
                    </Badge>
                  </div>
                  <p className="text-blue-600 font-medium mb-2">₹{item.price}</p>

                  {selloutTime && (
                    <div className="flex items-center gap-1 text-xs text-red-600 mb-2">
                      <Clock className="h-3 w-3" />
                      May sell out in {selloutTime}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 bg-transparent"
                      onClick={() => handleStockChange(item.id, -5)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <div
                      className={`px-3 py-1 rounded font-medium text-sm ${
                        item.quantity < 10
                          ? "bg-red-100 text-red-700"
                          : item.quantity < 20
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                      }`}
                    >
                      {item.quantity} units
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 bg-transparent"
                      onClick={() => handleStockChange(item.id, 5)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
