"use client"

import { useCanteen } from "@/lib/canteen-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Clock, AlertTriangle, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function SlotsPage() {
  const { getSlotsByCanteen, loggedInCanteen, orders } = useCanteen()
  const router = useRouter()

  useEffect(() => {
    if (!loggedInCanteen) {
      router.push("/")
    }
  }, [loggedInCanteen, router])

  if (!loggedInCanteen) return null

  const canteenSlots = getSlotsByCanteen(loggedInCanteen.id)
  const canteenOrders = orders.filter((o) => o.canteenId === loggedInCanteen.id && o.status !== "Rejected")

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Slot Management</h1>
        <p className="text-muted-foreground mt-1">{loggedInCanteen.name} - Monitor pickup slot capacity</p>
      </div>

      {/* Slots Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {canteenSlots.map((slot) => {
          const fillPercent = (slot.filled / slot.capacity) * 100
          const isAlmostFull = fillPercent >= 80
          const isFull = slot.filled >= slot.capacity

          const slotOrders = canteenOrders.filter((o) => o.slotTime === slot.time)
          const pendingInSlot = slotOrders.filter((o) => o.status !== "Ready").length

          return (
            <Card
              key={slot.time}
              className={`${isAlmostFull && !isFull ? "border-yellow-300" : ""} ${isFull ? "border-red-300" : ""}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-foreground flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    {slot.time}
                  </CardTitle>
                  {isAlmostFull && !isFull && (
                    <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Almost Full
                    </Badge>
                  )}
                  {isFull && <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Full</Badge>}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      Bookings
                    </span>
                    <span className="font-medium text-foreground">
                      {slot.filled} / {slot.capacity}
                    </span>
                  </div>

                  <Progress
                    value={fillPercent}
                    className={`h-3 ${
                      fillPercent >= 90
                        ? "[&>div]:bg-red-500"
                        : fillPercent >= 70
                          ? "[&>div]:bg-yellow-500"
                          : "[&>div]:bg-green-500"
                    }`}
                  />

                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{slot.capacity - slot.filled} spots available</span>
                    <span>{fillPercent.toFixed(0)}% filled</span>
                  </div>

                  {pendingInSlot > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-amber-600">
                        {pendingInSlot} order{pendingInSlot > 1 ? "s" : ""} still being processed for this slot
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Summary Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-foreground">Today's Summary - {loggedInCanteen.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{canteenSlots.reduce((sum, s) => sum + s.filled, 0)}</p>
              <p className="text-sm text-muted-foreground">Total Bookings</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {canteenSlots.reduce((sum, s) => sum + (s.capacity - s.filled), 0)}
              </p>
              <p className="text-sm text-muted-foreground">Available Spots</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">
                {(
                  (canteenSlots.reduce((sum, s) => sum + s.filled, 0) /
                    canteenSlots.reduce((sum, s) => sum + s.capacity, 0)) *
                  100
                ).toFixed(0)}
                %
              </p>
              <p className="text-sm text-muted-foreground">Overall Capacity</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
