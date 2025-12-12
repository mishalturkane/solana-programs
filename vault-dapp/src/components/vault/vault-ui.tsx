'use client'

import { useVaultProgram } from './vault-data-access'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState, useEffect } from 'react'
import { 
  Loader2, 
  Lock, 
  Plus, 
  Minus, 
  X, 
  Shield,
  AlertCircle,
  CheckCircle,
  Coins,
  Copy
} from 'lucide-react'

// Toast Component (same as before)
function Toast({ message, type, onClose }: { 
  message: string, 
  type: 'success' | 'error' | 'info', 
  onClose: () => void 
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  const bgColor = type === 'success' ? 'bg-green-100 border-green-300 text-green-800' :
                 type === 'error' ? 'bg-red-100 border-red-300 text-red-800' :
                 'bg-blue-100 border-blue-300 text-blue-800'

  return (
    <div className={`fixed top-4 right-4 z-50 border rounded-lg shadow-lg p-4 min-w-[300px] animate-in slide-in-from-right-5 ${bgColor}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {type === 'success' && <CheckCircle className="h-5 w-5" />}
          {type === 'error' && <AlertCircle className="h-5 w-5" />}
          {type === 'info' && <AlertCircle className="h-5 w-5" />}
          <span>{message}</span>
        </div>
        <button onClick={onClose} className="ml-4 text-gray-500 hover:text-gray-700">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// Toast hook
function useSimpleToast() {
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null)

  const success = (message: string) => setToast({ message, type: 'success' })
  const error = (message: string) => setToast({ message, type: 'error' })
  const info = (message: string) => setToast({ message, type: 'info' })

  const ToastComponent = () => {
    if (!toast) return null
    return <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
  }

  return { success, error, info, ToastComponent }
}

export function VaultDashboard() {
  const { getVaultAccount } = useVaultProgram()
  const { success, ToastComponent } = useSimpleToast()

  if (getVaultAccount.isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
        <div className="flex items-center justify-center space-x-3">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
          <span className="text-gray-700">Loading vault status...</span>
        </div>
      </div>
    )
  }

  const vaultData = getVaultAccount.data
  const hasVault = vaultData?.vaultExists === true

  if (!hasVault) {
    return (
      <>
        <ToastComponent />
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg p-8 border border-amber-200">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-amber-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-amber-800 mb-2">No Vault Found</h3>
              <p className="text-amber-700">
                You don't have a vault yet. Click "Initialize Vault" to create one.
              </p>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <ToastComponent />
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Shield className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Your Secure Vault</h2>
                <p className="text-indigo-100">On-chain storage for your SOL</p>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <span className="text-sm">Active</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Coins className="h-6 w-6" />
                <h3 className="text-lg font-semibold">Vault Balance</h3>
              </div>
              <div className="text-4xl font-bold">
                {vaultData?.balance?.toFixed(4) || '0.0000'} SOL
              </div>
              <p className="text-indigo-200 text-sm mt-2">
                ≈ ${((vaultData?.balance || 0) * 100).toFixed(2)} USD
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="h-6 w-6" />
                <h3 className="text-lg font-semibold">Vault Address</h3>
              </div>
              <div className="font-mono text-sm truncate">
                {vaultData?.vaultPDA?.toString().slice(0, 20) || 'Loading...'}...
              </div>
              <button
                onClick={() => {
                  if (vaultData?.vaultPDA) {
                    navigator.clipboard.writeText(vaultData.vaultPDA.toString())
                    success("Vault address copied!")
                  }
                }}
                className="text-indigo-200 hover:text-white text-sm mt-2 flex items-center gap-1"
              >
                <Copy className="h-4 w-4" />
                Copy Address
              </button>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-6 w-6" />
                <h3 className="text-lg font-semibold">Security Status</h3>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-300" />
                <span>PDA Secured</span>
              </div>
              {vaultData?.vaultStateAccount && (
                <div className="mt-2 text-sm text-indigo-200">
                  State Bump: {vaultData.vaultStateAccount.stateBump}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export function VaultInitialize() {
  const { initializeVault, getVaultAccount } = useVaultProgram()
  const { success, error, ToastComponent } = useSimpleToast()
  const [isLoading, setIsLoading] = useState(false)

  const vaultData = getVaultAccount.data
  const hasVault = vaultData?.vaultExists === true

  const handleInitialize = async () => {
    try {
      setIsLoading(true)
      await initializeVault.mutateAsync()
      success("Vault initialized successfully! 🎉")
    } catch (err: any) {
      error(`Failed to initialize vault: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <ToastComponent />
      <div className="space-y-4">
        {hasVault ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Vault already initialized</span>
            </div>
            <p className="text-sm text-green-700 mt-2">
              Your vault is ready! You can deposit SOL or withdraw anytime.
            </p>
          </div>
        ) : (
          <Button
            onClick={handleInitialize}
            disabled={initializeVault.isPending || isLoading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {initializeVault.isPending || isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Initializing...
              </>
            ) : (
              <>
                <Lock className="h-5 w-5 mr-2" />
                Initialize Vault
              </>
            )}
          </Button>
        )}
        <p className="text-xs text-gray-500 text-center">
          {hasVault ? 'Vault is active and ready to use' : 'Creates PDAs for secure storage'}
        </p>
      </div>
    </>
  )
}

export function VaultDeposit() {
  const { depositToVault, getVaultAccount } = useVaultProgram()
  const { success, error, ToastComponent } = useSimpleToast()
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const vaultData = getVaultAccount.data
  const hasVault = vaultData?.vaultExists === true

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      error("Please enter a valid amount")
      return
    }

    try {
      setIsLoading(true)
      await depositToVault.mutateAsync(parseFloat(amount))
      success("Deposit successful! 💰")
      setAmount('')
    } catch (err: any) {
      error(`Failed to deposit: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <ToastComponent />
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Amount (SOL)</label>
          <div className="relative">
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pr-12"
              disabled={!hasVault || depositToVault.isPending || isLoading}
              min="0"
              step="0.01"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">SOL</span>
          </div>
          <div className="flex gap-2">
            {[0.1, 0.5, 1, 5].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val.toString())}
                disabled={!hasVault}
                className={`flex-1 text-center text-sm rounded-lg py-2 transition-colors ${
                  !hasVault 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {val} SOL
              </button>
            ))}
          </div>
        </div>
        
        <Button
          onClick={handleDeposit}
          disabled={!hasVault || depositToVault.isPending || isLoading || !amount}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {depositToVault.isPending || isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Depositing...
            </>
          ) : (
            <>
              <Plus className="h-5 w-5 mr-2" />
              Deposit SOL
            </>
          )}
        </Button>
      </div>
    </>
  )
}

export function VaultWithdraw() {
  const { withdrawFromVault, getVaultAccount } = useVaultProgram()
  const { success, error, ToastComponent } = useSimpleToast()
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const vaultData = getVaultAccount.data
  const hasVault = vaultData?.vaultExists === true
  const maxAmount = vaultData?.balance || 0

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      error("Please enter a valid amount")
      return
    }

    try {
      setIsLoading(true)
      await withdrawFromVault.mutateAsync(parseFloat(amount))
      success("Withdrawal successful! 💸")
      setAmount('')
    } catch (err: any) {
      error(`Failed to withdraw: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <ToastComponent />
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-700">Amount (SOL)</label>
            <button
              onClick={() => setAmount(maxAmount.toString())}
              disabled={!hasVault}
              className={`text-sm ${hasVault ? 'text-indigo-600 hover:text-indigo-800' : 'text-gray-400'}`}
            >
              Max: {maxAmount.toFixed(4)} SOL
            </button>
          </div>
          <div className="relative">
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pr-12"
              disabled={!hasVault || withdrawFromVault.isPending || isLoading}
              min="0"
              max={maxAmount}
              step="0.01"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">SOL</span>
          </div>
        </div>
        
        <Button
          onClick={handleWithdraw}
          disabled={!hasVault || withdrawFromVault.isPending || isLoading || !amount || parseFloat(amount) > maxAmount}
          className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {withdrawFromVault.isPending || isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Withdrawing...
            </>
          ) : (
            <>
              <Minus className="h-5 w-5 mr-2" />
              Withdraw SOL
            </>
          )}
        </Button>
      </div>
    </>
  )
}

export function VaultClose() {
  const { closeVault, getVaultAccount } = useVaultProgram()
  const { success, error, ToastComponent } = useSimpleToast()
  const [isLoading, setIsLoading] = useState(false)
  const [confirmClose, setConfirmClose] = useState(false)

  const vaultData = getVaultAccount.data
  const hasVault = vaultData?.vaultExists === true

  const handleClose = async () => {
    if (!confirmClose) {
      setConfirmClose(true)
      return
    }

    try {
      setIsLoading(true)
      await closeVault.mutateAsync()
      success("Vault closed successfully! 🔒")
      setConfirmClose(false)
    } catch (err: any) {
      error(`Failed to close vault: ${err.message}`)
      setConfirmClose(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <ToastComponent />
      <div className="space-y-4">
        {!confirmClose ? (
          <Button
            onClick={handleClose}
            disabled={!hasVault || closeVault.isPending || isLoading}
            className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {closeVault.isPending || isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Closing...
              </>
            ) : (
              <>
                <X className="h-5 w-5 mr-2" />
                Close Vault
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800 mb-2">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Are you sure?</span>
              </div>
              <p className="text-sm text-red-700">
                This will close your vault and withdraw all remaining SOL. This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setConfirmClose(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleClose}
                disabled={closeVault.isPending || isLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {closeVault.isPending || isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Closing...
                  </>
                ) : (
                  'Confirm Close'
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export function VaultProgramInfo() {
  const { getProgramAccount } = useVaultProgram()

  if (getProgramAccount.isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="inline-flex items-center gap-3">
          <div className="h-5 w-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
          <span className="text-gray-700 font-medium">Loading program info...</span>
        </div>
      </div>
    )
  }
  
  if (getProgramAccount.isError) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-red-700">Error Loading Program</h3>
            <p className="text-red-600">Please check your connection</p>
          </div>
        </div>
      </div>
    )
  }
  
  const accountData = getProgramAccount.data?.value
  
  if (!accountData) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-amber-100 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-amber-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-amber-800 mb-1">Program Not Found</h3>
            <p className="text-amber-700">
              Make sure you have deployed the program and are on the correct cluster.
            </p>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
     
      
    </div>
  )
}