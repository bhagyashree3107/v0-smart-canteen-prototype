"use client"

import { useState } from "react"
import { useCanteen } from "@/lib/canteen-context"
import { Card, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { ShoppingCart, Plus, Minus, Check, Leaf, Drumstick, Store, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

export default function MenuPage() {
  const {
    foodItems,
    canteens,
    createOrder,
    currentStudent,
    walletBalance,
    selectedCanteen,
    setSelectedCanteen,
    getSlotsByCanteen,
  } = useCanteen()
  const { toast } = useToast()

  const [cart, setCart] = useState<{ [key: string]: number }>({})
  const [showCheckout, setShowCheckout] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState("")
  const [filter, setFilter] = useState<"all" | "veg" | "nonveg">("all")

  const timeSlots = getSlotsByCanteen(selectedCanteen)

  const filteredItems = foodItems
    .filter((item) => item.canteenId === selectedCanteen)
    .filter((item) => {
      if (filter === "veg") return item.isVeg
      if (filter === "nonveg") return !item.isVeg
      return true
    })

  const cartItems = Object.entries(cart)
    .filter(([_, qty]) => qty > 0)
    .map(([id, qty]) => ({
      foodItem: foodItems.find((f) => f.id === id)!,
      quantity: qty,
    }))

  const cartTotal = cartItems.reduce((sum, item) => sum + item.foodItem.price * item.quantity, 0)

  const handleCanteenChange = (canteenId: string) => {
    setSelectedCanteen(canteenId)
    setCart({})
    setSelectedSlot("")
  }

  const updateCart = (itemId: string, delta: number) => {
    const item = foodItems.find((f) => f.id === itemId)
    if (!item) return

    setCart((prev) => {
      const current = prev[itemId] || 0
      const newQty = Math.max(0, Math.min(current + delta, item.quantity))
      return { ...prev, [itemId]: newQty }
    })
  }

  const handleOrder = () => {
    if (!selectedSlot) {
      toast({ title: "Select a time slot", description: "Please choose a pickup time slot", variant: "destructive" })
      return
    }

    if (cartTotal > walletBalance) {
      toast({ title: "Insufficient balance", description: "Please add money to your wallet", variant: "destructive" })
      return
    }

    const success = createOrder(currentStudent.id, currentStudent.name, cartItems, selectedCanteen, selectedSlot)

    if (success) {
      toast({ title: "Order placed!", description: "Your order has been submitted successfully" })
      setCart({})
      setShowCheckout(false)
      setSelectedSlot("")
    } else {
      toast({ title: "Order failed", description: "Something went wrong", variant: "destructive" })
    }
  }

  const selectedCanteenInfo = canteens.find((c) => c.id === selectedCanteen)

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Menu</h1>
          <p className="text-muted-foreground mt-1">Order your favorite food</p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={selectedCanteen} onValueChange={handleCanteenChange}>
            <SelectTrigger className="w-[200px]">
              <Store className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {canteens.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  <div className="flex flex-col">
                    <span>{c.name}</span>
                    <span className="text-xs text-muted-foreground capitalize">{c.type} items</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filter} onValueChange={(v: "all" | "veg" | "nonveg") => setFilter(v)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              <SelectItem value="veg">Veg Only</SelectItem>
              <SelectItem value="nonveg">Non-Veg</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedCanteenInfo && (
        <Card className="mb-6 bg-blue-50 border-blue-100">
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">{selectedCanteenInfo.name}</h3>
                <p className="text-sm text-blue-700 capitalize">
                  {selectedCanteenInfo.type === "main" && "Full meals, Biryani, Thali, Curries"}
                  {selectedCanteenInfo.type === "juice" && "Fresh juices, Shakes, Cold beverages"}
                  {selectedCanteenInfo.type === "snack" && "Quick bites, Dosa, Samosa, Coffee"}
                </p>
              </div>
              <Badge
                className={
                  selectedCanteenInfo.crowdLevel === "Low"
                    ? "bg-green-100 text-green-700"
                    : selectedCanteenInfo.crowdLevel === "Medium"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                }
              >
                {selectedCanteenInfo.crowdLevel} Crowd
              </Badge>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Food Items Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-24">
        {filteredItems.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <div className="relative aspect-square bg-slate-100">
              <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
              <Badge
                className={`absolute top-2 right-2 ${
                  item.isVeg ? "bg-green-500 hover:bg-green-500 text-white" : "bg-red-500 hover:bg-red-500 text-white"
                }`}
              >
                {item.isVeg ? <Leaf className="h-3 w-3 mr-1" /> : <Drumstick className="h-3 w-3 mr-1" />}
                {item.isVeg ? "Veg" : "Non-Veg"}
              </Badge>
              {item.quantity > 0 && item.quantity < 10 && (
                <Badge className="absolute top-2 left-2 bg-amber-500 hover:bg-amber-500 text-white">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Only {item.quantity} left
                </Badge>
              )}
            </div>
            <CardHeader className="pb-2">
              <h3 className="font-semibold text-foreground">{item.name}</h3>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-blue-600">₹{item.price}</span>
                <span className="text-sm text-muted-foreground">{item.quantity} left</span>
              </div>
            </CardHeader>
            <CardFooter className="pt-0">
              {item.quantity === 0 ? (
                <Button disabled className="w-full">
                  Out of Stock
                </Button>
              ) : cart[item.id] ? (
                <div className="flex items-center justify-between w-full">
                  <Button variant="outline" size="icon" onClick={() => updateCart(item.id, -1)}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="font-semibold text-foreground">{cart[item.id]}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateCart(item.id, 1)}
                    disabled={cart[item.id] >= item.quantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => updateCart(item.id, 1)}
                >
                  Add to Cart
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Cart Summary Fixed Bar */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-foreground">{cartItems.length} items</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">₹{cartTotal}</span>
            </div>
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setShowCheckout(true)}
            >
              Proceed to Checkout
            </Button>
          </div>
        </div>
      )}

      {/* Checkout Dialog */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Confirm Order</DialogTitle>
            <DialogDescription>
              Review your order and select a pickup slot at {selectedCanteenInfo?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              {cartItems.map((item) => (
                <div key={item.foodItem.id} className="flex justify-between text-sm">
                  <span className="text-foreground">
                    {item.foodItem.name} × {item.quantity}
                  </span>
                  <span className="text-muted-foreground">₹{item.foodItem.price * item.quantity}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span className="text-foreground">Total</span>
                <span className="text-blue-600">₹{cartTotal}</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Select Pickup Slot</label>
              <Select value={selectedSlot} onValueChange={setSelectedSlot}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a time slot" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => {
                    const isFull = slot.filled >= slot.capacity
                    const isAlmostFull = slot.filled / slot.capacity > 0.85
                    return (
                      <SelectItem key={slot.time} value={slot.time} disabled={isFull}>
                        <span className={isAlmostFull && !isFull ? "text-amber-600" : ""}>
                          {slot.time} ({slot.capacity - slot.filled} spots left)
                          {isAlmostFull && !isFull && " - Filling fast"}
                        </span>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Wallet Balance</span>
                <span className="text-foreground">₹{walletBalance}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">After Order</span>
                <span className={cartTotal > walletBalance ? "text-red-500" : "text-green-600"}>
                  ₹{walletBalance - cartTotal}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCheckout(false)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleOrder}
              disabled={cartTotal > walletBalance || !selectedSlot}
            >
              <Check className="h-4 w-4 mr-2" />
              Place Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
