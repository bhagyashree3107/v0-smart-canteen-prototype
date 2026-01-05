"use client"

import { useCanteen } from "@/lib/canteen-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, CheckCircle, ChefHat, Package, AlertTriangle, XCircle, Users, Timer } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

const statusConfig = {
  New: { color: "bg-blue-100 text-blue-700 border-blue-200", icon: Clock },
  Accepted: { color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: CheckCircle },
  Preparing: { color: "bg-orange-100 text-orange-700 border-orange-200", icon: ChefHat },
  Ready: { color: "bg-green-100 text-green-700 border-green-200", icon: Package },
  Rejected: { color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
}

export default function CanteenOrdersPage() {
  const {
    orders,
    updateOrderStatus,
    loggedInCanteen,
    foodItems,
    getStockImpact,
    getSlotImpact,
    getDelayedOrders,
    timeSlots,
  } = useCanteen()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (!loggedInCanteen) {
      router.push("/")
    }
  }, [loggedInCanteen, router])

  if (!loggedInCanteen) return null

  const canteenOrders = orders.filter((o) => o.canteenId === loggedInCanteen.id)
  const canteenItems = foodItems.filter((f) => f.canteenId === loggedInCanteen.id)
  const canteenSlots = timeSlots.filter((s) => s.canteenId === loggedInCanteen.id)
  const delayedOrders = getDelayedOrders(loggedInCanteen.id)

  const ordersByStatus = {
    New: canteenOrders.filter((o) => o.status === "New"),
    Accepted: canteenOrders.filter((o) => o.status === "Accepted"),
    Preparing: canteenOrders.filter((o) => o.status === "Preparing"),
    Ready: canteenOrders.filter((o) => o.status === "Ready"),
  }

  const canAcceptOrder = (order: (typeof orders)[0]) => {
    return order.items.every((item) => {
      const currentItem = foodItems.find((f) => f.id === item.foodItem.id)
      return currentItem && currentItem.quantity >= item.quantity
    })
  }

  const handleStatusUpdate = (orderId: string, newStatus: "Accepted" | "Preparing" | "Ready") => {
    const order = orders.find((o) => o.id === orderId)

    if (newStatus === "Accepted" && order && !canAcceptOrder(order)) {
      toast({
        title: "Insufficient Stock",
        description: "Cannot accept order due to low inventory",
        variant: "destructive",
      })
      return
    }

    updateOrderStatus(orderId, newStatus)
    toast({
      title: "Order Updated",
      description: `Order ${orderId} is now ${newStatus}`,
    })
  }

  const handleRejectOrder = (orderId: string, reason: string) => {
    updateOrderStatus(orderId, "Rejected", reason)
    toast({
      title: "Order Rejected",
      description: `Order ${orderId} has been rejected and refunded`,
      variant: "destructive",
    })
  }

  const renderOrderCard = (order: (typeof orders)[0]) => {
    const config = statusConfig[order.status as keyof typeof statusConfig]
    const StatusIcon = config.icon
    const canAccept = canAcceptOrder(order)
    const stockImpact = getStockImpact(order)
    const slotImpact = getSlotImpact(order.slotTime, order.canteenId)

    // Check if order is delayed
    const isDelayed = delayedOrders.some((d) => d.id === order.id)
    const orderAge = Math.round((new Date().getTime() - new Date(order.createdAt).getTime()) / (1000 * 60))

    return (
      <Card
        key={order.id}
        className={`border-l-4 ${config.color.split(" ")[0].replace("bg-", "border-l-").replace("-100", "-500")} ${isDelayed ? "ring-2 ring-red-300" : ""}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg text-foreground">{order.id}</CardTitle>
              <p className="text-sm text-muted-foreground">{order.studentName}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge className={`${config.color} hover:${config.color}`}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {order.status}
              </Badge>
              {isDelayed && (
                <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                  <Timer className="h-3 w-3 mr-1" />
                  {orderAge}min waiting
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Order Items */}
          <div className="space-y-2 mb-4">
            {order.items.map((item, idx) => {
              const impact = stockImpact.find((s) => s.itemName === item.foodItem.name)
              const insufficientStock = impact && impact.afterStock < 0 && order.status === "New"

              return (
                <div
                  key={idx}
                  className={`flex justify-between text-sm p-2 rounded ${insufficientStock ? "bg-red-50" : "bg-slate-50"}`}
                >
                  <span className={`text-foreground ${insufficientStock ? "text-red-600" : ""}`}>
                    {item.foodItem.name} × {item.quantity}
                    {insufficientStock && <AlertTriangle className="h-3 w-3 inline ml-1 text-red-500" />}
                  </span>
                  <span className="text-muted-foreground">₹{item.foodItem.price * item.quantity}</span>
                </div>
              )
            })}
          </div>

          {order.status === "New" && (
            <div className="space-y-2 mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-xs font-semibold text-amber-800 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                If accepted:
              </p>
              {stockImpact.map((impact, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="text-amber-700">{impact.itemName} stock:</span>
                  <span className={impact.isLow ? "text-red-600 font-medium" : "text-amber-700"}>
                    {impact.currentStock} → {impact.afterStock} units
                    {impact.isLow && " (Low Stock Risk)"}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-amber-200">
                <span className="text-amber-700">Slot {order.slotTime}:</span>
                <span className={slotImpact.isOverload ? "text-red-600 font-medium" : "text-amber-700"}>
                  {Math.round((slotImpact.currentFill / slotImpact.capacity) * 100)}% →{" "}
                  {Math.round((slotImpact.afterFill / slotImpact.capacity) * 100)}%
                  {slotImpact.isOverload && " (Slot Overload Risk)"}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Pickup: {order.slotTime}</p>
              <p className="font-semibold text-blue-600">Total: ₹{order.totalAmount}</p>
            </div>

            <div className="flex gap-2">
              {order.status === "New" && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-300 hover:bg-red-50 bg-transparent"
                    onClick={() => handleRejectOrder(order.id, "Insufficient stock or capacity")}
                  >
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleStatusUpdate(order.id, "Accepted")}
                    disabled={!canAccept}
                  >
                    Accept
                  </Button>
                </>
              )}
              {order.status === "Accepted" && (
                <Button
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                  onClick={() => handleStatusUpdate(order.id, "Preparing")}
                >
                  Start Preparing
                </Button>
              )}
              {order.status === "Preparing" && (
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => handleStatusUpdate(order.id, "Ready")}
                >
                  Mark Ready
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Order Management</h1>
        <p className="text-muted-foreground mt-1">{loggedInCanteen.name} - Process incoming orders in real-time</p>
      </div>

      {delayedOrders.length > 0 && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-800">{delayedOrders.length} students waiting longer than expected</p>
                <p className="text-sm text-red-700">Orders: {delayedOrders.map((o) => o.id).join(", ")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {(["New", "Accepted", "Preparing", "Ready"] as const).map((status) => {
          const config = statusConfig[status]
          const StatusIcon = config.icon
          return (
            <Card key={status} className={config.color}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{status}</p>
                    <p className="text-2xl font-bold">{ordersByStatus[status].length}</p>
                  </div>
                  <StatusIcon className="h-8 w-8 opacity-50" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Orders Tabs */}
      <Tabs defaultValue="New" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="New" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            New ({ordersByStatus.New.length})
          </TabsTrigger>
          <TabsTrigger value="Accepted" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Accepted ({ordersByStatus.Accepted.length})
          </TabsTrigger>
          <TabsTrigger value="Preparing" className="flex items-center gap-2">
            <ChefHat className="h-4 w-4" />
            Preparing ({ordersByStatus.Preparing.length})
          </TabsTrigger>
          <TabsTrigger value="Ready" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Ready ({ordersByStatus.Ready.length})
          </TabsTrigger>
        </TabsList>

        {(["New", "Accepted", "Preparing", "Ready"] as const).map((status) => (
          <TabsContent key={status} value={status} className="mt-4">
            {ordersByStatus[status].length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No {status.toLowerCase()} orders</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ordersByStatus[status].map(renderOrderCard)}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
