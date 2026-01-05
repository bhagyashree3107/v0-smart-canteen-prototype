"use client"

import { useCanteen } from "@/lib/canteen-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, ShoppingBag, Clock, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function StudentDashboard() {
  const { walletBalance, orders, timeSlots, canteens, currentStudent } = useCanteen()

  const activeOrders = orders.filter((o) => o.studentId === currentStudent.id && o.status !== "Ready")
  const completedOrders = orders.filter((o) => o.studentId === currentStudent.id && o.status === "Ready")

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Welcome, {currentStudent.name}!</h1>
        <p className="text-muted-foreground mt-1">Here's your canteen overview for today</p>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Wallet Balance</CardTitle>
            <Wallet className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">₹{walletBalance.toFixed(0)}</p>
            <Link href="/student/wallet">
              <Button variant="link" className="p-0 h-auto text-blue-600">
                Add Money →
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-green-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Orders</CardTitle>
            <ShoppingBag className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{activeOrders.length}</p>
            <Link href="/student/orders">
              <Button variant="link" className="p-0 h-auto text-green-600">
                View Orders →
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-orange-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Best Slot</CardTitle>
            <Clock className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold text-orange-600">1:30 - 2:00 PM</p>
            <p className="text-sm text-muted-foreground">Least crowded</p>
          </CardContent>
        </Card>

        <Card className="border-purple-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Orders This Week</CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">{completedOrders.length}</p>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Canteen Status & Active Orders */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Canteen Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Canteen Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {canteens.map((canteen) => (
              <div key={canteen.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
                <div>
                  <p className="font-medium text-foreground">{canteen.name}</p>
                  <p className="text-sm text-muted-foreground">Currently open</p>
                </div>
                <Badge
                  variant={
                    canteen.crowdLevel === "Low"
                      ? "secondary"
                      : canteen.crowdLevel === "Medium"
                        ? "default"
                        : "destructive"
                  }
                  className={
                    canteen.crowdLevel === "Low"
                      ? "bg-green-100 text-green-700 hover:bg-green-100"
                      : canteen.crowdLevel === "Medium"
                        ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                        : ""
                  }
                >
                  {canteen.crowdLevel} Crowd
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Time Slots */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Today's Slots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {timeSlots.map((slot) => {
                const fillPercent = (slot.filled / slot.capacity) * 100
                return (
                  <div key={slot.time} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground">{slot.time}</span>
                      <span className="text-muted-foreground">
                        {slot.filled}/{slot.capacity}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          fillPercent > 80 ? "bg-red-500" : fillPercent > 50 ? "bg-yellow-500" : "bg-green-500"
                        }`}
                        style={{ width: `${fillPercent}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Link href="/student/menu">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">Order Food</Button>
              </Link>
              <Link href="/student/wallet">
                <Button variant="outline">Add Money</Button>
              </Link>
              <Link href="/student/assistant">
                <Button variant="outline">Ask AI Assistant</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
