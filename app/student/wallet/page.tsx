"use client"

import { useState } from "react"
import { useCanteen } from "@/lib/canteen-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, CreditCard } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const quickAmounts = [100, 200, 500, 1000]

export default function WalletPage() {
  const { walletBalance, addMoney, transactions } = useCanteen()
  const { toast } = useToast()

  const [showAddMoney, setShowAddMoney] = useState(false)
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [processing, setProcessing] = useState(false)

  const handleAddMoney = () => {
    if (!selectedAmount) return

    setProcessing(true)
    // Simulate payment processing
    setTimeout(() => {
      addMoney(selectedAmount)
      setProcessing(false)
      setShowAddMoney(false)
      setSelectedAmount(null)
      toast({ title: "Money Added!", description: `₹${selectedAmount} has been added to your wallet` })
    }, 1500)
  }

  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Wallet</h1>
        <p className="text-muted-foreground mt-1">Manage your canteen wallet</p>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Available Balance</p>
              <p className="text-4xl font-bold mt-1">₹{walletBalance.toFixed(2)}</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <Wallet className="h-8 w-8" />
            </div>
          </div>
          <Button className="mt-6 bg-white text-blue-600 hover:bg-blue-50" onClick={() => setShowAddMoney(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Money
          </Button>
        </CardContent>
      </Card>

      {/* Quick Add */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-foreground">Quick Add</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            {quickAmounts.map((amount) => (
              <Button
                key={amount}
                variant="outline"
                onClick={() => {
                  setSelectedAmount(amount)
                  setShowAddMoney(true)
                }}
              >
                ₹{amount}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === "credit" ? "bg-green-100" : "bg-red-100"
                    }`}
                  >
                    {tx.type === "credit" ? (
                      <ArrowDownLeft className="h-5 w-5 text-green-600" />
                    ) : (
                      <ArrowUpRight className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{tx.description}</p>
                    <p className="text-sm text-muted-foreground">{new Date(tx.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <Badge
                  className={
                    tx.type === "credit"
                      ? "bg-green-100 text-green-700 hover:bg-green-100"
                      : "bg-red-100 text-red-700 hover:bg-red-100"
                  }
                >
                  {tx.type === "credit" ? "+" : "-"}₹{tx.amount}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Money Dialog */}
      <Dialog open={showAddMoney} onOpenChange={setShowAddMoney}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground">Add Money to Wallet</DialogTitle>
            <DialogDescription>Select an amount to add to your wallet</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {quickAmounts.map((amount) => (
                <Button
                  key={amount}
                  variant={selectedAmount === amount ? "default" : "outline"}
                  className={selectedAmount === amount ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}
                  onClick={() => setSelectedAmount(amount)}
                >
                  ₹{amount}
                </Button>
              ))}
            </div>

            {selectedAmount && (
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Amount to add</p>
                <p className="text-2xl font-bold text-blue-600">₹{selectedAmount}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddMoney(false)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleAddMoney}
              disabled={!selectedAmount || processing}
            >
              {processing ? (
                <>Processing...</>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Proceed to Pay
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
