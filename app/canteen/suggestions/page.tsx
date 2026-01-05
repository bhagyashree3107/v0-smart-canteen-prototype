"use client"

import { useCanteen } from "@/lib/canteen-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, TrendingUp, Clock, Package, AlertTriangle, Users, Zap, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function SuggestionsPage() {
  const { foodItems, orders, loggedInCanteen, getSlotsByCanteen, getDelayedOrders, predictSelloutTime, canteens } =
    useCanteen()
  const router = useRouter()

  useEffect(() => {
    if (!loggedInCanteen) {
      router.push("/")
    }
  }, [loggedInCanteen, router])

  if (!loggedInCanteen) return null

  const canteenItems = foodItems.filter((i) => i.canteenId === loggedInCanteen.id)
  const canteenOrders = orders.filter((o) => o.canteenId === loggedInCanteen.id)
  const canteenSlots = getSlotsByCanteen(loggedInCanteen.id)
  const delayedOrders = getDelayedOrders(loggedInCanteen.id)

  const suggestions: {
    type: string
    priority: "critical" | "high" | "medium" | "low"
    icon: typeof AlertTriangle
    title: string
    description: string
    consequence: string
    action: string
    color: string
  }[] = []

  // Critical: Delayed orders
  if (delayedOrders.length > 0) {
    suggestions.push({
      type: "delay",
      priority: "critical",
      icon: Users,
      title: `${delayedOrders.length} students waiting too long`,
      description: `Orders ${delayedOrders.map((o) => o.id).join(", ")} have exceeded expected wait time.`,
      consequence: "Students may miss their classes or leave negative feedback.",
      action: "Prioritize these orders immediately and consider pausing new order acceptance.",
      color: "text-red-600 bg-red-50",
    })
  }

  // Critical: Items about to sell out
  canteenItems.forEach((item) => {
    const selloutTime = predictSelloutTime(item.id)
    if (selloutTime && item.quantity < 15) {
      const pendingOrders = canteenOrders.filter(
        (o) => o.status === "New" && o.items.some((i) => i.foodItem.id === item.id),
      ).length

      suggestions.push({
        type: "inventory",
        priority: "critical",
        icon: AlertTriangle,
        title: `${item.name} will sell out in ${selloutTime}`,
        description: `Only ${item.quantity} units left. ${pendingOrders} pending orders contain this item.`,
        consequence: `If not restocked, approximately ${Math.ceil(item.dailyDemand * 0.3)} more students will face unavailability.`,
        action: `Prepare ${Math.max(20, item.dailyDemand - item.quantity)} extra portions OR limit new orders for this item.`,
        color: "text-red-600 bg-red-50",
      })
    }
  })

  // High: Slot congestion
  const overloadedSlots = canteenSlots.filter((s) => s.filled / s.capacity > 0.85)
  if (overloadedSlots.length > 0) {
    overloadedSlots.forEach((slot) => {
      const ordersInSlot = canteenOrders.filter(
        (o) => o.slotTime === slot.time && o.status !== "Ready" && o.status !== "Rejected",
      ).length

      suggestions.push({
        type: "capacity",
        priority: "high",
        icon: Clock,
        title: `Slot ${slot.time} at ${Math.round((slot.filled / slot.capacity) * 100)}% capacity`,
        description: `${ordersInSlot} orders pending for this slot. Only ${slot.capacity - slot.filled} spots remaining.`,
        consequence: "Accepting more orders will cause delays and student frustration.",
        action: "Shift preparation focus to this slot OR temporarily disable new bookings for this time.",
        color: "text-orange-600 bg-orange-50",
      })
    })
  }

  // High: Fast-moving items need preparation
  const fastMovingItems = canteenItems.filter((i) => i.dailyDemand > 40 && i.quantity < i.dailyDemand * 0.5)
  fastMovingItems.forEach((item) => {
    suggestions.push({
      type: "demand",
      priority: "high",
      icon: TrendingUp,
      title: `${item.name} demand rising faster than stock`,
      description: `Daily demand: ${item.dailyDemand} units. Current stock: ${item.quantity} units.`,
      consequence: `Without action, ${item.dailyDemand - item.quantity} students may not get their preferred item.`,
      action: `Prepare ${Math.ceil((item.dailyDemand - item.quantity) * 1.2)} additional portions immediately.`,
      color: "text-orange-600 bg-orange-50",
    })
  })

  // Medium: Popular items trending
  const orderCounts: { [key: string]: number } = {}
  canteenOrders.forEach((order) => {
    order.items.forEach((item) => {
      orderCounts[item.foodItem.name] = (orderCounts[item.foodItem.name] || 0) + item.quantity
    })
  })
  const topItems = Object.entries(orderCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  if (topItems.length > 0) {
    suggestions.push({
      type: "trending",
      priority: "medium",
      icon: TrendingUp,
      title: "Today's Trending Items",
      description: `${topItems.map(([name, count]) => `${name} (${count} sold)`).join(", ")} are performing well.`,
      consequence: "Maintaining stock for these items ensures maximum revenue.",
      action: "Keep extra portions ready for these items during peak hours.",
      color: "text-blue-600 bg-blue-50",
    })
  }

  // Low: Veg vs Non-veg balance
  const vegOrders = canteenOrders.reduce(
    (sum, o) => sum + o.items.filter((i) => i.foodItem.isVeg).reduce((s, i) => s + i.quantity, 0),
    0,
  )
  const nonVegOrders = canteenOrders.reduce(
    (sum, o) => sum + o.items.filter((i) => !i.foodItem.isVeg).reduce((s, i) => s + i.quantity, 0),
    0,
  )

  if (vegOrders > nonVegOrders * 1.5) {
    suggestions.push({
      type: "insight",
      priority: "low",
      icon: Lightbulb,
      title: "Shift focus to vegetarian items",
      description: `Veg items are selling ${Math.round((vegOrders / (nonVegOrders || 1)) * 100)}% more than non-veg today.`,
      consequence: "Over-preparing non-veg may lead to wastage.",
      action: "Reduce non-veg preparation by 20% and increase veg items accordingly.",
      color: "text-blue-600 bg-blue-50",
    })
  }

  // Compare with other canteens
  const otherCanteens = canteens.filter((c) => c.id !== loggedInCanteen.id)
  const thisCanteenLoad =
    canteenSlots.reduce((sum, s) => sum + s.filled, 0) / canteenSlots.reduce((sum, s) => sum + s.capacity, 0)

  if (thisCanteenLoad < 0.5) {
    suggestions.push({
      type: "insight",
      priority: "low",
      icon: Zap,
      title: "Your canteen has lower load than others",
      description: `Current utilization: ${Math.round(thisCanteenLoad * 100)}%. You can handle more orders.`,
      consequence: "Opportunity to serve more students and increase revenue.",
      action: "Consider promoting your canteen's specialty items to attract more students.",
      color: "text-green-600 bg-green-50",
    })
  }

  // Default tip
  if (suggestions.length < 3) {
    suggestions.push({
      type: "insight",
      priority: "low",
      icon: Package,
      title: "Preparation Reminder",
      description: "Peak lunch hours (12-1 PM) typically see 40% more orders.",
      consequence: "Being unprepared causes delays and lost orders.",
      action: "Pre-prepare popular items 30 minutes before peak time.",
      color: "text-blue-600 bg-blue-50",
    })
  }

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
  suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Lightbulb className="h-8 w-8 text-yellow-500" />
          AI Suggestions
        </h1>
        <p className="text-muted-foreground mt-1">{loggedInCanteen.name} - Smart recommendations for your operations</p>
      </div>

      {/* Suggestions Grid */}
      <div className="space-y-4">
        {suggestions.map((suggestion, idx) => {
          const Icon = suggestion.icon
          return (
            <Card
              key={idx}
              className={`border-l-4 ${
                suggestion.priority === "critical"
                  ? "border-l-red-500"
                  : suggestion.priority === "high"
                    ? "border-l-orange-500"
                    : suggestion.priority === "medium"
                      ? "border-l-blue-500"
                      : "border-l-green-500"
              }`}
            >
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${suggestion.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-foreground">{suggestion.title}</h3>
                      <Badge
                        variant="outline"
                        className={
                          suggestion.priority === "critical"
                            ? "border-red-300 text-red-600 bg-red-50"
                            : suggestion.priority === "high"
                              ? "border-orange-300 text-orange-600 bg-orange-50"
                              : suggestion.priority === "medium"
                                ? "border-blue-300 text-blue-600 bg-blue-50"
                                : "border-green-300 text-green-600 bg-green-50"
                        }
                      >
                        {suggestion.priority}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-3">{suggestion.description}</p>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2 p-2 bg-amber-50 rounded">
                        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-medium text-amber-800">What will happen: </span>
                          <span className="text-amber-700">{suggestion.consequence}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 p-2 bg-blue-50 rounded">
                        <ArrowRight className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-medium text-blue-800">Recommended action: </span>
                          <span className="text-blue-700">{suggestion.action}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Stats */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-foreground">Quick Insights - {loggedInCanteen.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-3xl font-bold text-blue-600">
                {canteenOrders.filter((o) => o.status !== "Rejected").length}
              </p>
              <p className="text-sm text-blue-700">Orders Today</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-600">
                ₹{canteenOrders.filter((o) => o.status !== "Rejected").reduce((sum, o) => sum + o.totalAmount, 0)}
              </p>
              <p className="text-sm text-green-700">Revenue Today</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-3xl font-bold text-orange-600">{canteenItems.filter((i) => i.quantity < 15).length}</p>
              <p className="text-sm text-orange-700">Low Stock Items</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-3xl font-bold text-red-600">{delayedOrders.length}</p>
              <p className="text-sm text-red-700">Delayed Orders</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
