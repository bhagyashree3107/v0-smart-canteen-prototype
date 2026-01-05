"use client"

import { useState, useRef, useEffect } from "react"
import { useCanteen } from "@/lib/canteen-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bot, Send, User, Sparkles } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

const quickQuestions = [
  "Why is my order delayed?",
  "Which slot is fastest now?",
  "What's popular today?",
  "Which canteen has less crowd?",
  "Why was my order rejected?",
]

export default function AssistantPage() {
  const { orders, canteens, foodItems, currentStudent, selectedCanteen, getSlotsByCanteen } = useCanteen()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hi! I'm your Smart Canteen AI Assistant. I can help you understand order delays, find the best time slots, recommend food, and explain any issues. How can I help you today?",
    },
  ])
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const generateResponse = (query: string): string => {
    const q = query.toLowerCase()
    const myOrders = orders.filter((o) => o.studentId === currentStudent.id)
    const latestOrder = myOrders[myOrders.length - 1]

    if (q.includes("delay") || q.includes("taking long") || q.includes("waiting")) {
      if (!latestOrder) {
        return "You don't have any active orders. Place an order from the Menu to track it!"
      }

      const orderAge = Math.round((new Date().getTime() - new Date(latestOrder.createdAt).getTime()) / (1000 * 60))
      const canteen = canteens.find((c) => c.id === latestOrder.canteenId)

      if (latestOrder.status === "Ready") {
        return `Good news! Your order ${latestOrder.id} is ready for pickup at ${canteen?.name}. Head there now!`
      }

      if (latestOrder.status === "Rejected") {
        return `Your order ${latestOrder.id} was rejected: ${latestOrder.rejectionReason || "Insufficient stock"}. The amount has been refunded to your wallet.`
      }

      const reasons = []
      if (canteen?.crowdLevel === "High") reasons.push("The canteen is experiencing high crowd levels")
      if (latestOrder.items.some((i) => i.foodItem.avgPrepTime > 5))
        reasons.push("Your order contains items that take longer to prepare")
      if (orderAge > 5) reasons.push(`Your order has been waiting for ${orderAge} minutes`)

      if (reasons.length > 0) {
        return `Your order ${latestOrder.id} is currently "${latestOrder.status}".\n\n**Why the delay:**\n• ${reasons.join("\n• ")}\n\n**Expected wait:** Based on current load, approximately ${Math.max(5, 15 - orderAge)} more minutes. The canteen is working on it!`
      }

      return `Your order ${latestOrder.id} is "${latestOrder.status}" and progressing normally. It's been ${orderAge} minutes since you placed it.`
    }

    if (q.includes("reject") || q.includes("cancelled") || q.includes("refund")) {
      const rejectedOrder = myOrders.find((o) => o.status === "Rejected")
      if (rejectedOrder) {
        return `Your order ${rejectedOrder.id} was rejected.\n\n**Reason:** ${rejectedOrder.rejectionReason || "The canteen couldn't fulfill this order due to stock or capacity issues."}\n\n**Refund:** ₹${rejectedOrder.totalAmount} has been credited back to your wallet.\n\n**What to do:** Try ordering from a different canteen or choose alternative items.`
      }
      return "You don't have any rejected orders. All your orders are being processed normally!"
    }

    if (q.includes("slot") || q.includes("fastest") || q.includes("best time") || q.includes("when should")) {
      const currentCanteen = canteens.find((c) => c.id === selectedCanteen)
      const slots = getSlotsByCanteen(selectedCanteen)
      const sortedSlots = [...slots].sort((a, b) => a.filled / a.capacity - b.filled / b.capacity)
      const bestSlot = sortedSlots[0]

      if (bestSlot) {
        const fillPercent = Math.round((bestSlot.filled / bestSlot.capacity) * 100)
        return `**Best slot at ${currentCanteen?.name}:**\n\n${bestSlot.time}\n• Only ${fillPercent}% full (${bestSlot.capacity - bestSlot.filled} spots available)\n• Least crowded option right now\n\n**Avoid:** ${sortedSlots[sortedSlots.length - 1].time} is ${Math.round((sortedSlots[sortedSlots.length - 1].filled / sortedSlots[sortedSlots.length - 1].capacity) * 100)}% full.`
      }
      return "All slots are currently available. Pick any time that works for you!"
    }

    if (q.includes("crowd") || q.includes("less crowded") || q.includes("which canteen")) {
      const sortedCanteens = [...canteens].sort((a, b) => {
        const levels = { Low: 1, Medium: 2, High: 3 }
        return levels[a.crowdLevel] - levels[b.crowdLevel]
      })

      return `**Canteen crowd levels right now:**\n\n${sortedCanteens.map((c) => `• ${c.name}: ${c.crowdLevel} crowd ${c.crowdLevel === "Low" ? "✓ Recommended" : ""}`).join("\n")}\n\n**My recommendation:** ${sortedCanteens[0].name} has the least crowd. You'll get faster service there!`
    }

    // Popular food
    if (q.includes("popular") || q.includes("recommend") || q.includes("what should i") || q.includes("best food")) {
      const canteenItems = foodItems.filter((f) => f.canteenId === selectedCanteen)
      const popular = canteenItems.sort((a, b) => b.dailyDemand - a.dailyDemand).slice(0, 3)
      const canteen = canteens.find((c) => c.id === selectedCanteen)

      return `**Popular at ${canteen?.name} today:**\n\n${popular.map((f, i) => `${i + 1}. ${f.name} - ₹${f.price} ${f.quantity < 10 ? "(Running low!)" : ""}`).join("\n")}\n\nThese are flying off the shelves! Order soon before they sell out.`
    }

    // Order status
    if (
      q.includes("order") &&
      (q.includes("status") || q.includes("where") || q.includes("check") || q.includes("track"))
    ) {
      if (!latestOrder) {
        return "You don't have any orders yet. Head to the Menu to place your first order!"
      }
      const canteen = canteens.find((c) => c.id === latestOrder.canteenId)

      return `**Your latest order (${latestOrder.id}):**\n\n• Status: ${latestOrder.status}\n• Canteen: ${canteen?.name}\n• Pickup slot: ${latestOrder.slotTime}\n• Total: ₹${latestOrder.totalAmount}\n\n${
        latestOrder.status === "New"
          ? "The canteen will accept it soon."
          : latestOrder.status === "Accepted"
            ? "It's been accepted and will be prepared shortly."
            : latestOrder.status === "Preparing"
              ? "Your food is being prepared right now!"
              : latestOrder.status === "Ready"
                ? "Your order is ready! Head to the canteen for pickup."
                : "This order was rejected. Check your wallet for the refund."
      }`
    }

    // Veg options
    if (q.includes("veg") || q.includes("vegetarian")) {
      const canteenItems = foodItems.filter((f) => f.canteenId === selectedCanteen && f.isVeg)
      const canteen = canteens.find((c) => c.id === selectedCanteen)

      return `**Vegetarian options at ${canteen?.name}:**\n\n${canteenItems
        .slice(0, 5)
        .map((f) => `• ${f.name} - ₹${f.price}`)
        .join("\n")}\n\nAll fresh and delicious!`
    }

    // Wallet / balance
    if (q.includes("wallet") || q.includes("balance") || q.includes("money") || q.includes("payment")) {
      return "You can check your wallet balance in the **Wallet** section. There you can:\n\n• View your current balance\n• Add money instantly\n• See transaction history\n\nAll payments are cashless through your wallet!"
    }

    // Default response
    return 'I can help you with:\n\n• **Order delays** - "Why is my order delayed?"\n• **Best slots** - "Which slot is fastest now?"\n• **Canteen crowds** - "Which canteen is less crowded?"\n• **Popular food** - "What\'s popular today?"\n• **Rejected orders** - "Why was my order rejected?"\n• **Order status** - "Check my order status"\n\nWhat would you like to know?'
  }

  const handleSend = (text?: string) => {
    const query = text || input.trim()
    if (!query) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: query,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")

    setTimeout(() => {
      const response = generateResponse(query)
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
      }
      setMessages((prev) => [...prev, aiMessage])
    }, 500)
  }

  return (
    <div className="p-6 h-[calc(100vh-2rem)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Bot className="h-8 w-8 text-blue-600" />
          AI Assistant
        </h1>
        <p className="text-muted-foreground mt-1">Ask me anything about the canteen</p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="border-b bg-blue-50">
          <CardTitle className="text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            Smart Canteen Bot
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <Bot className="h-5 w-5 text-blue-600" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.role === "user" ? "bg-blue-600 text-white" : "bg-slate-100 text-foreground"
                }`}
              >
                <p className="whitespace-pre-line">{msg.content}</p>
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-white" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Quick Questions */}
        <div className="p-3 border-t bg-slate-50">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {quickQuestions.map((q) => (
              <Button
                key={q}
                variant="outline"
                size="sm"
                className="shrink-0 bg-transparent"
                onClick={() => handleSend(q)}
              >
                {q}
              </Button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1"
            />
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}
