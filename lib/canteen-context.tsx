"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"

// Types
export interface FoodItem {
  id: string
  name: string
  price: number
  image: string
  isVeg: boolean
  quantity: number
  canteenId: string
  avgPrepTime: number // minutes
  dailyDemand: number // average daily orders
}

export interface Order {
  id: string
  studentId: string
  studentName: string
  items: { foodItem: FoodItem; quantity: number }[]
  totalAmount: number
  status: "New" | "Accepted" | "Preparing" | "Ready" | "Rejected"
  canteenId: string
  createdAt: string
  acceptedAt?: string
  preparingAt?: string
  readyAt?: string
  slotTime: string
  rejectionReason?: string
  delayReason?: string
}

export interface Transaction {
  id: string
  type: "credit" | "debit" | "refund"
  amount: number
  description: string
  createdAt: string
}

export interface TimeSlot {
  time: string
  capacity: number
  filled: number
  canteenId: string
}

export interface Canteen {
  id: string
  name: string
  type: "main" | "juice" | "snack"
  crowdLevel: "Low" | "Medium" | "High"
  staffId: string
  staffPassword: string
}

export interface LoggedInCanteen {
  id: string
  name: string
}

interface CanteenContextType {
  // Food items
  foodItems: FoodItem[]
  updateFoodStock: (itemId: string, quantity: number) => void

  // Orders
  orders: Order[]
  createOrder: (
    studentId: string,
    studentName: string,
    items: { foodItem: FoodItem; quantity: number }[],
    canteenId: string,
    slotTime: string,
  ) => boolean
  updateOrderStatus: (orderId: string, status: Order["status"], reason?: string) => void

  // Wallet
  walletBalance: number
  addMoney: (amount: number) => void
  transactions: Transaction[]

  // Slots
  timeSlots: TimeSlot[]
  getSlotsByCanteen: (canteenId: string) => TimeSlot[]

  // Canteens
  canteens: Canteen[]

  // Current user - student
  currentStudent: { id: string; name: string }
  selectedCanteen: string
  setSelectedCanteen: (id: string) => void

  // Current canteen - management
  loggedInCanteen: LoggedInCanteen | null
  loginCanteen: (staffId: string, password: string) => boolean
  logoutCanteen: () => void

  // Decision helpers
  getStockImpact: (order: Order) => { itemName: string; currentStock: number; afterStock: number; isLow: boolean }[]
  getSlotImpact: (
    slotTime: string,
    canteenId: string,
  ) => { currentFill: number; afterFill: number; capacity: number; isOverload: boolean }
  getWaitingStudents: (canteenId: string) => number
  getDelayedOrders: (canteenId: string) => Order[]
  predictSelloutTime: (itemId: string) => string | null
}

const CanteenContext = createContext<CanteenContextType | undefined>(undefined)

const initialFoodItems: FoodItem[] = [
  // Main Canteen - Meals & Heavy Items
  {
    id: "1",
    name: "Chicken Biryani",
    price: 120,
    image: "/chicken-biryani-rice.jpg",
    isVeg: false,
    quantity: 25,
    canteenId: "canteen-1",
    avgPrepTime: 8,
    dailyDemand: 45,
  },
  {
    id: "2",
    name: "Paneer Butter Masala",
    price: 90,
    image: "/paneer-butter-masala-curry.jpg",
    isVeg: true,
    quantity: 12,
    canteenId: "canteen-1",
    avgPrepTime: 6,
    dailyDemand: 35,
  },
  {
    id: "3",
    name: "Veg Fried Rice",
    price: 70,
    image: "/vegetable-fried-rice.png",
    isVeg: true,
    quantity: 40,
    canteenId: "canteen-1",
    avgPrepTime: 5,
    dailyDemand: 30,
  },
  {
    id: "4",
    name: "Egg Curry",
    price: 60,
    image: "/egg-curry-indian.jpg",
    isVeg: false,
    quantity: 8,
    canteenId: "canteen-1",
    avgPrepTime: 5,
    dailyDemand: 20,
  },
  {
    id: "5",
    name: "Veg Thali",
    price: 100,
    image: "/vegetarian-thali-indian-meal.jpg",
    isVeg: true,
    quantity: 20,
    canteenId: "canteen-1",
    avgPrepTime: 4,
    dailyDemand: 40,
  },
  {
    id: "6",
    name: "Fish Curry",
    price: 130,
    image: "/fish-curry-indian.jpg",
    isVeg: false,
    quantity: 15,
    canteenId: "canteen-1",
    avgPrepTime: 10,
    dailyDemand: 18,
  },

  // Juice Shop - Drinks Only
  {
    id: "7",
    name: "Fresh Orange Juice",
    price: 40,
    image: "/fresh-orange-juice-glass.jpg",
    isVeg: true,
    quantity: 50,
    canteenId: "canteen-2",
    avgPrepTime: 2,
    dailyDemand: 60,
  },
  {
    id: "8",
    name: "Mango Lassi",
    price: 45,
    image: "/mango-lassi.png",
    isVeg: true,
    quantity: 35,
    canteenId: "canteen-2",
    avgPrepTime: 2,
    dailyDemand: 50,
  },
  {
    id: "9",
    name: "Cold Coffee",
    price: 50,
    image: "/cold-coffee-drink.jpg",
    isVeg: true,
    quantity: 40,
    canteenId: "canteen-2",
    avgPrepTime: 3,
    dailyDemand: 55,
  },
  {
    id: "10",
    name: "Watermelon Juice",
    price: 35,
    image: "/watermelon-juice-fresh.jpg",
    isVeg: true,
    quantity: 30,
    canteenId: "canteen-2",
    avgPrepTime: 2,
    dailyDemand: 40,
  },
  {
    id: "11",
    name: "Banana Shake",
    price: 45,
    image: "/banana-milkshake.jpg",
    isVeg: true,
    quantity: 25,
    canteenId: "canteen-2",
    avgPrepTime: 2,
    dailyDemand: 35,
  },

  // Snack Counter - Quick Bites
  {
    id: "12",
    name: "Masala Dosa",
    price: 50,
    image: "/masala-dosa-south-indian.png",
    isVeg: true,
    quantity: 35,
    canteenId: "canteen-3",
    avgPrepTime: 4,
    dailyDemand: 50,
  },
  {
    id: "13",
    name: "Vada Pav",
    price: 25,
    image: "/vada-pav-indian-snack.jpg",
    isVeg: true,
    quantity: 45,
    canteenId: "canteen-3",
    avgPrepTime: 2,
    dailyDemand: 70,
  },
  {
    id: "14",
    name: "Samosa",
    price: 15,
    image: "/samosa-indian-snack.jpg",
    isVeg: true,
    quantity: 60,
    canteenId: "canteen-3",
    avgPrepTime: 1,
    dailyDemand: 80,
  },
  {
    id: "15",
    name: "Idli Vada",
    price: 40,
    image: "/idli-vada-sambar.jpg",
    isVeg: true,
    quantity: 30,
    canteenId: "canteen-3",
    avgPrepTime: 3,
    dailyDemand: 45,
  },
  {
    id: "16",
    name: "Filter Coffee",
    price: 20,
    image: "/south-indian-filter-coffee.jpg",
    isVeg: true,
    quantity: 100,
    canteenId: "canteen-3",
    avgPrepTime: 2,
    dailyDemand: 120,
  },
  {
    id: "17",
    name: "Chicken Momos",
    price: 60,
    image: "/chicken-momos-dumplings.jpg",
    isVeg: false,
    quantity: 25,
    canteenId: "canteen-3",
    avgPrepTime: 5,
    dailyDemand: 40,
  },
]

const initialCanteens: Canteen[] = [
  {
    id: "canteen-1",
    name: "Main Canteen",
    type: "main",
    crowdLevel: "Medium",
    staffId: "MAIN001",
    staffPassword: "main123",
  },
  {
    id: "canteen-2",
    name: "Juice Shop",
    type: "juice",
    crowdLevel: "Low",
    staffId: "JUICE001",
    staffPassword: "juice123",
  },
  {
    id: "canteen-3",
    name: "Snack Counter",
    type: "snack",
    crowdLevel: "High",
    staffId: "SNACK001",
    staffPassword: "snack123",
  },
]

const initialTimeSlots: TimeSlot[] = [
  // Main Canteen slots
  { time: "11:00 AM - 11:30 AM", capacity: 30, filled: 12, canteenId: "canteen-1" },
  { time: "11:30 AM - 12:00 PM", capacity: 30, filled: 20, canteenId: "canteen-1" },
  { time: "12:00 PM - 12:30 PM", capacity: 30, filled: 28, canteenId: "canteen-1" },
  { time: "12:30 PM - 1:00 PM", capacity: 30, filled: 25, canteenId: "canteen-1" },
  { time: "1:00 PM - 1:30 PM", capacity: 30, filled: 18, canteenId: "canteen-1" },
  { time: "1:30 PM - 2:00 PM", capacity: 30, filled: 10, canteenId: "canteen-1" },
  // Juice Shop slots
  { time: "11:00 AM - 11:30 AM", capacity: 20, filled: 5, canteenId: "canteen-2" },
  { time: "11:30 AM - 12:00 PM", capacity: 20, filled: 8, canteenId: "canteen-2" },
  { time: "12:00 PM - 12:30 PM", capacity: 20, filled: 15, canteenId: "canteen-2" },
  { time: "12:30 PM - 1:00 PM", capacity: 20, filled: 12, canteenId: "canteen-2" },
  { time: "1:00 PM - 1:30 PM", capacity: 20, filled: 10, canteenId: "canteen-2" },
  { time: "1:30 PM - 2:00 PM", capacity: 20, filled: 6, canteenId: "canteen-2" },
  // Snack Counter slots
  { time: "11:00 AM - 11:30 AM", capacity: 25, filled: 10, canteenId: "canteen-3" },
  { time: "11:30 AM - 12:00 PM", capacity: 25, filled: 18, canteenId: "canteen-3" },
  { time: "12:00 PM - 12:30 PM", capacity: 25, filled: 23, canteenId: "canteen-3" },
  { time: "12:30 PM - 1:00 PM", capacity: 25, filled: 20, canteenId: "canteen-3" },
  { time: "1:00 PM - 1:30 PM", capacity: 25, filled: 15, canteenId: "canteen-3" },
  { time: "1:30 PM - 2:00 PM", capacity: 25, filled: 8, canteenId: "canteen-3" },
]

export function CanteenProvider({ children }: { children: React.ReactNode }) {
  const [foodItems, setFoodItems] = useState<FoodItem[]>(initialFoodItems)
  const [orders, setOrders] = useState<Order[]>([])
  const [walletBalance, setWalletBalance] = useState(500)
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: "t1", type: "credit", amount: 500, description: "Initial balance", createdAt: new Date().toISOString() },
  ])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(initialTimeSlots)
  const [canteens] = useState<Canteen[]>(initialCanteens)
  const [selectedCanteen, setSelectedCanteen] = useState("canteen-1")
  const [loggedInCanteen, setLoggedInCanteen] = useState<LoggedInCanteen | null>(null)

  const currentStudent = { id: "student-1", name: "Rahul Kumar" }

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem("canteen-data-v2")
    if (savedData) {
      const data = JSON.parse(savedData)
      setFoodItems(data.foodItems || initialFoodItems)
      setOrders(data.orders || [])
      setWalletBalance(data.walletBalance ?? 500)
      setTransactions(data.transactions || [])
      setTimeSlots(data.timeSlots || initialTimeSlots)
    }

    const savedCanteen = localStorage.getItem("logged-in-canteen")
    if (savedCanteen) {
      setLoggedInCanteen(JSON.parse(savedCanteen))
    }
  }, [])

  // Save to localStorage on changes
  useEffect(() => {
    localStorage.setItem(
      "canteen-data-v2",
      JSON.stringify({
        foodItems,
        orders,
        walletBalance,
        transactions,
        timeSlots,
      }),
    )
  }, [foodItems, orders, walletBalance, transactions, timeSlots])

  const loginCanteen = useCallback(
    (staffId: string, password: string): boolean => {
      const canteen = canteens.find(
        (c) => c.staffId.toLowerCase() === staffId.toLowerCase().trim() && c.staffPassword === password.trim(),
      )
      console.log("[v0] loginCanteen called:", { staffId, password, found: !!canteen })
      if (canteen) {
        const loggedIn = { id: canteen.id, name: canteen.name }
        setLoggedInCanteen(loggedIn)
        localStorage.setItem("logged-in-canteen", JSON.stringify(loggedIn))
        return true
      }
      return false
    },
    [canteens],
  )

  const logoutCanteen = useCallback(() => {
    setLoggedInCanteen(null)
    localStorage.removeItem("logged-in-canteen")
  }, [])

  const getSlotsByCanteen = useCallback(
    (canteenId: string) => {
      return timeSlots.filter((s) => s.canteenId === canteenId)
    },
    [timeSlots],
  )

  const updateFoodStock = useCallback((itemId: string, quantity: number) => {
    setFoodItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, quantity } : item)))
  }, [])

  const getStockImpact = useCallback(
    (order: Order) => {
      return order.items.map((item) => {
        const currentItem = foodItems.find((f) => f.id === item.foodItem.id)
        const currentStock = currentItem?.quantity || 0
        const afterStock = currentStock - item.quantity
        return {
          itemName: item.foodItem.name,
          currentStock,
          afterStock,
          isLow: afterStock < 10,
        }
      })
    },
    [foodItems],
  )

  const getSlotImpact = useCallback(
    (slotTime: string, canteenId: string) => {
      const slot = timeSlots.find((s) => s.time === slotTime && s.canteenId === canteenId)
      if (!slot) return { currentFill: 0, afterFill: 0, capacity: 0, isOverload: false }
      const afterFill = slot.filled + 1
      return {
        currentFill: slot.filled,
        afterFill,
        capacity: slot.capacity,
        isOverload: afterFill / slot.capacity > 0.9,
      }
    },
    [timeSlots],
  )

  const getWaitingStudents = useCallback(
    (canteenId: string) => {
      return orders.filter(
        (o) => o.canteenId === canteenId && (o.status === "New" || o.status === "Accepted" || o.status === "Preparing"),
      ).length
    },
    [orders],
  )

  const getDelayedOrders = useCallback(
    (canteenId: string) => {
      const now = new Date()
      return orders.filter((o) => {
        if (o.canteenId !== canteenId) return false
        if (o.status === "Ready" || o.status === "Rejected") return false

        const orderTime = new Date(o.createdAt)
        const diffMinutes = (now.getTime() - orderTime.getTime()) / (1000 * 60)

        // Consider delayed if: New > 3min, Accepted > 5min, Preparing > 10min
        if (o.status === "New" && diffMinutes > 3) return true
        if (o.status === "Accepted" && diffMinutes > 5) return true
        if (o.status === "Preparing" && diffMinutes > 10) return true
        return false
      })
    },
    [orders],
  )

  const predictSelloutTime = useCallback(
    (itemId: string): string | null => {
      const item = foodItems.find((f) => f.id === itemId)
      if (!item || item.quantity >= 20) return null

      // Simple prediction based on daily demand
      const hourlyRate = item.dailyDemand / 6 // 6 hours of operation
      const hoursLeft = item.quantity / hourlyRate

      if (hoursLeft < 0.5) return "30 minutes"
      if (hoursLeft < 1) return "1 hour"
      if (hoursLeft < 2) return "2 hours"
      return null
    },
    [foodItems],
  )

  const createOrder = useCallback(
    (
      studentId: string,
      studentName: string,
      items: { foodItem: FoodItem; quantity: number }[],
      canteenId: string,
      slotTime: string,
    ) => {
      const totalAmount = items.reduce((sum, item) => sum + item.foodItem.price * item.quantity, 0)

      if (totalAmount > walletBalance) {
        return false
      }

      const newOrder: Order = {
        id: `ORD-${Date.now()}`,
        studentId,
        studentName,
        items,
        totalAmount,
        status: "New",
        canteenId,
        createdAt: new Date().toISOString(),
        slotTime,
      }

      setOrders((prev) => [...prev, newOrder])
      setWalletBalance((prev) => prev - totalAmount)
      setTransactions((prev) => [
        ...prev,
        {
          id: `t-${Date.now()}`,
          type: "debit",
          amount: totalAmount,
          description: `Order ${newOrder.id}`,
          createdAt: new Date().toISOString(),
        },
      ])

      // Update slot capacity for specific canteen
      setTimeSlots((prev) =>
        prev.map((slot) =>
          slot.time === slotTime && slot.canteenId === canteenId ? { ...slot, filled: slot.filled + 1 } : slot,
        ),
      )

      return true
    },
    [walletBalance],
  )

  const updateOrderStatus = useCallback((orderId: string, status: Order["status"], reason?: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const updates: Partial<Order> = { status }

          // Add timestamps
          if (status === "Accepted") updates.acceptedAt = new Date().toISOString()
          if (status === "Preparing") updates.preparingAt = new Date().toISOString()
          if (status === "Ready") updates.readyAt = new Date().toISOString()
          if (status === "Rejected") {
            updates.rejectionReason = reason || "Insufficient stock"
            // Refund the order
            setWalletBalance((prev) => prev + order.totalAmount)
            setTransactions((prev) => [
              ...prev,
              {
                id: `t-${Date.now()}`,
                type: "refund",
                amount: order.totalAmount,
                description: `Refund for ${order.id} - ${reason || "Order rejected"}`,
                createdAt: new Date().toISOString(),
              },
            ])
          }

          // Deduct inventory when order is accepted
          if (status === "Accepted") {
            order.items.forEach((item) => {
              setFoodItems((prevItems) =>
                prevItems.map((foodItem) =>
                  foodItem.id === item.foodItem.id
                    ? { ...foodItem, quantity: Math.max(0, foodItem.quantity - item.quantity) }
                    : foodItem,
                ),
              )
            })
          }

          return { ...order, ...updates }
        }
        return order
      }),
    )
  }, [])

  const addMoney = useCallback((amount: number) => {
    setWalletBalance((prev) => prev + amount)
    setTransactions((prev) => [
      ...prev,
      {
        id: `t-${Date.now()}`,
        type: "credit",
        amount,
        description: "Added to wallet",
        createdAt: new Date().toISOString(),
      },
    ])
  }, [])

  return (
    <CanteenContext.Provider
      value={{
        foodItems,
        updateFoodStock,
        orders,
        createOrder,
        updateOrderStatus,
        walletBalance,
        addMoney,
        transactions,
        timeSlots,
        getSlotsByCanteen,
        canteens,
        currentStudent,
        selectedCanteen,
        setSelectedCanteen,
        loggedInCanteen,
        loginCanteen,
        logoutCanteen,
        getStockImpact,
        getSlotImpact,
        getWaitingStudents,
        getDelayedOrders,
        predictSelloutTime,
      }}
    >
      {children}
    </CanteenContext.Provider>
  )
}

export function useCanteen() {
  const context = useContext(CanteenContext)
  if (!context) {
    throw new Error("useCanteen must be used within a CanteenProvider")
  }
  return context
}
