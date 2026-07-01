import { Home, Layout, Image, Settings } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface BottomNavProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const tabs = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'workflows', icon: Layout, label: 'Workflows' },
  { id: 'gallery', icon: Image, label: 'Gallery' },
  { id: 'settings', icon: Settings, label: 'Settings' },
]

export function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-surface border-t border-border flex items-center justify-around px-2 z-50">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
              isActive ? "text-neon-purple" : "text-gray-400 hover:text-gray-300"
            )}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] uppercase font-bold tracking-wider">
              {tab.label}
            </span>
            {isActive && (
              <div className="absolute bottom-0 w-8 h-1 bg-neon-purple rounded-t-full shadow-[0_0_8px_rgba(188,19,254,0.6)]" />
            )}
          </button>
        )
      })}
    </nav>
  )
}
