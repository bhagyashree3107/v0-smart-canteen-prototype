"use client"

import { useCanteen } from "@/lib/canteen-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, ChefHat, Package, XCircle, AlertTriangle, Timer } from "lucide-react"

const statusConfig = {
  New: { color: "bg-blue-100 text-blue-700", icon: Clock, label: "Order Placed" },
  Accepted: { color: "bg-yellow-100 text-yellow-700", icon: CheckCircle, label: "Accepted" },
  Preparing: { color: "bg-orange-100 text-orange-700", icon: ChefHat, label: "Preparing" },
  Ready: { color: "bg-green-100 text-green-700", icon: Package, label: "Ready for Pickup" },
  Rejected: { color: "bg-red-100 text-red-700", icon: XCircle, label: "Rejected" },
}

const statusOrder = ["New", "Accepted", "Preparing", "Ready"] as const

export default function OrdersPage() {
  const { orders, currentStudent, canteens } = useCanteen()

  const myOrders = orders
    .filter((o) => o.studentId === currentStudent.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const isOrderDelayed = (order: (typeof orders)[0]) => {
    if (order.status === "Ready" || order.status === "Rejected") return false
    const now = new Date()
    const orderTime = new Date(order.createdAt)
    const diffMinutes = (now.getTime() - orderTime.getTime()) / (1000 * 60)
    if (order.status === "New" && diffMinutes > 3) return true
    if (order.status === "Accepted" && diffMinutes > 5) return true
    if (order.status === "Preparing" && diffMinutes > 10) return true
    return false
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">My Orders</h1>
        <p className="text-muted-foreground mt-1">Track your order status in real-time</p>
      </div>

      {myOrders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-foreground mb-2">No orders yet</h3>
            <p className="text-muted-foreground">Your orders will appear here once you place them</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {myOrders.map((order) => {
            const config = statusConfig[order.status as keyof typeof statusConfig]
            const StatusIcon = config.icon
            const currentIndex =
              order.status === "Rejected" ? -1 : statusOrder.indexOf(order.status as (typeof statusOrder)[number])
            const canteen = canteens.find((c) => c.id === order.canteenId)
            const delayed = isOrderDelayed(order)
            const orderAge = Math.round((new Date().getTime() - new Date(order.createdAt).getTime()) / (1000 * 60))

            return (
              <Card key={order.id} className={delayed ? "ring-2 ring-amber-300" : ""}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg text-foreground">{order.id}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleString()} • {canteen?.name} • Pickup: {order.slotTime}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge className={`${config.color} hover:${config.color}`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {config.label}
                      </Badge>
                      {delayed && (
                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                          <Timer className="h-3 w-3 mr-1" />
                          Preparing longer than expected
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {order.status === "Rejected" && (
                    <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center gap-2 text-red-700">
                        <XCircle className="h-4 w-4" />
                        <span className="font-medium">Order Rejected</span>
                      </div>
                      <p className="text-sm text-red-600 mt-1">
                        {order.rejectionReason || "This order could not be fulfilled."}
                      </p>
                      <p className="text-xs text-red-500 mt-1">Amount refunded to your wallet</p>
                    </div>
                  )}

                  {delayed && order.status !== "Rejected" && (
                    <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-center gap-2 text-amber-700">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-medium">Delayed due to high demand</span>
                      </div>
                      <p className="text-sm text-amber-600 mt-1">
                        Your order is taking longer than usual ({orderAge} min). The canteen is experiencing high
                        volume.
                      </p>
                    </div>
                  )}

                  {/* Progress Tracker - only show for non-rejected orders */}
                  {order.status !== "Rejected" && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between relative">
                        <div className="absolute top-4 left-0 right-0 h-1 bg-slate-200 -z-10" />
                        <div
                          className="absolute top-4 left-0 h-1 bg-blue-600 -z-10 transition-all"
                          style={{ width: `${(currentIndex / (statusOrder.length - 1)) * 100}%` }}
                        />
                        {statusOrder.map((status, idx) => {
                          const isActive = idx <= currentIndex
                          const StepIcon = statusConfig[status].icon
                          return (
                            <div key={status} className="flex flex-col items-center">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  isActive ? "bg-blue-600 text-white" : "bg-slate-200 text-muted-foreground"
                                }`}
                              >
                                <StepIcon className="h-4 w-4" />
                              </div>
                              <span
                                className={`text-xs mt-2 ${isActive ? "text-blue-600 font-medium" : "text-muted-foreground"}`}
                              >
                                {statusConfig[status].label}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Order Items */}
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm bg-slate-50 p-3 rounded-lg">
                        <span className="text-foreground">
                          {item.foodItem.name} × {item.quantity}
                        </span>
                        <span className="text-muted-foreground">₹{item.foodItem.price * item.quantity}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-semibold pt-2 border-t">
                      <span className="text-foreground">Total</span>
                      <span className={order.status === "Rejected" ? "text-red-500 line-through" : "text-blue-600"}>
                        ₹{order.totalAmount}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
