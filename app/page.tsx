"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCanteen } from "@/lib/canteen-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sparkles, Clock, Users, TrendingDown, GraduationCap, Store } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function HomePage() {
  const router = useRouter()
  const { loginCanteen, canteens } = useCanteen()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState<"student" | "management">("student")
  const [registerNumber, setRegisterNumber] = useState("")
  const [password, setPassword] = useState("")
  const [staffId, setStaffId] = useState("")
  const [staffPassword, setStaffPassword] = useState("")

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (registerNumber && password) {
      router.push("/student")
    }
  }

  const handleManagementLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedStaffId = staffId.trim()
    const trimmedPassword = staffPassword.trim()

    console.log("[v0] Attempting login with:", { staffId: trimmedStaffId, password: trimmedPassword })
    console.log(
      "[v0] Available canteens:",
      canteens.map((c) => ({ staffId: c.staffId, staffPassword: c.staffPassword })),
    )

    if (trimmedStaffId && trimmedPassword) {
      const success = loginCanteen(trimmedStaffId, trimmedPassword)
      console.log("[v0] Login result:", success)
      if (success) {
        router.push("/canteen")
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid staff ID or password. Try: MAIN001 / main123",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Blue Gradient Hero */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-500 via-blue-600 to-teal-400 p-12 flex-col justify-between text-white">
        <div>
          <div className="flex items-center gap-2 mb-20">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-semibold">Smart Canteen</span>
          </div>

          <h1 className="text-5xl font-bold leading-tight mb-6 text-balance">Queue-Free Campus Dining with AI</h1>
          <p className="text-lg text-white/80 mb-12">AI that saves student time, food, and campus energy.</p>

          <div className="flex gap-4">
            <div className="bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm rounded-2xl p-5 flex-1">
              <Clock className="h-6 w-6 mb-3 text-white/80" />
              <div className="text-3xl font-bold">15min</div>
              <div className="text-sm text-white/70">Average saved</div>
            </div>
            <div className="bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm rounded-2xl p-5 flex-1">
              <Users className="h-6 w-6 mb-3 text-white/80" />
              <div className="text-3xl font-bold">5000+</div>
              <div className="text-sm text-white/70">Active users</div>
            </div>
            <div className="bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm rounded-2xl p-5 flex-1">
              <TrendingDown className="h-6 w-6 mb-3 text-white/80" />
              <div className="text-3xl font-bold">40%</div>
              <div className="text-sm text-white/70">Less wastage</div>
            </div>
          </div>
        </div>

        <div className="text-sm text-white/60">Powered by Google Gemini AI</div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-semibold text-foreground">Smart Canteen</span>
          </div>

          <h2 className="text-3xl font-bold text-foreground mb-2">Welcome back</h2>
          <p className="text-muted-foreground mb-8">Sign in to access your dashboard</p>

          <div className="flex border border-border rounded-xl p-1 mb-8">
            <button
              onClick={() => setActiveTab("student")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === "student"
                  ? "bg-white shadow-sm text-foreground border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              Student
            </button>
            <button
              onClick={() => setActiveTab("management")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === "management"
                  ? "bg-white shadow-sm text-foreground border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Store className="h-4 w-4" />
              Management
            </button>
          </div>

          {activeTab === "student" ? (
            <form onSubmit={handleStudentLogin} className="space-y-5">
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground">Student Login</h3>
                <p className="text-sm text-muted-foreground">Enter your register number to continue</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="registerNumber">Register Number</Label>
                <Input
                  id="registerNumber"
                  type="text"
                  placeholder="e.g., 21BCS001"
                  value={registerNumber}
                  onChange={(e) => setRegisterNumber(e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12"
                />
              </div>

              <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white text-base">
                Continue to Dashboard
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                New student?{" "}
                <button type="button" className="text-blue-600 hover:underline font-medium">
                  Register here
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleManagementLogin} className="space-y-5">
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground">Canteen Management Login</h3>
                <p className="text-sm text-muted-foreground">Enter your canteen staff credentials</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="staffId">Staff ID</Label>
                <Input
                  id="staffId"
                  type="text"
                  placeholder="e.g., MAIN001"
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="staffPassword">Password</Label>
                <Input
                  id="staffPassword"
                  type="password"
                  placeholder="Enter your password"
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  className="h-12"
                />
              </div>

              <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white text-base">
                Continue to Dashboard
              </Button>

              <div className="bg-slate-50 rounded-lg p-4 mt-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">Demo Credentials:</p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  {canteens.map((c) => (
                    <div key={c.id} className="flex justify-between">
                      <span>{c.name}:</span>
                      <span className="font-mono">
                        {c.staffId} / {c.staffPassword}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
