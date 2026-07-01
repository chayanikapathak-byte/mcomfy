import { Wifi, WifiOff, Layers } from 'lucide-react'
import { useConnectionStore } from '../store/useConnectionStore'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function TopBar() {
  const { status, queueCount } = useConnectionStore()
  const isConnected = status === 'connected'

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-surface/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 z-50">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center shadow-[0_0_12px_rgba(108,92,231,0.4)]">
          <Layers className="text-white" size={18} />
        </div>
        <h1 className="text-lg font-black italic tracking-tighter">
          COMFY<span className="text-neon-purple">POCKET</span>
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1 px-2 py-1 bg-background rounded-full border border-border">
          <div className={cn(
            "w-2 h-2 rounded-full",
            queueCount > 0 ? "bg-neon-green animate-pulse" : "bg-gray-600"
          )} />
          <span className="text-[10px] font-mono font-bold text-gray-300">
            Q: {queueCount}
          </span>
        </div>

        <div className={cn(
          "flex items-center space-x-1 transition-colors",
          isConnected ? "text-neon-green" : status === 'error' ? "text-red-500" : "text-gray-400"
        )}>
          {isConnected ? <Wifi size={18} /> : <WifiOff size={18} />}
          <span className="text-[10px] font-bold uppercase hidden xs:inline">
            {status}
          </span>
        </div>
      </div>
    </header>
  )
}
