import { Play, Clock, Zap } from 'lucide-react'

export default function Home() {
  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="space-y-4">
        <h2 className="text-2xl font-black tracking-tight uppercase italic">Recent Workflows</h2>
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-surface border border-border p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-surface-lighter rounded-lg flex items-center justify-center">
                <Zap className="text-neon-purple" size={20} />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Text-to-Image Base</h3>
                <p className="text-xs text-gray-500">SDXL 1.0 • Last run 2m ago</p>
              </div>
            </div>
            <button className="w-10 h-10 bg-neon-purple/10 text-neon-purple rounded-full flex items-center justify-center">
              <Play size={18} fill="currentColor" />
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-black tracking-tight uppercase italic">Queue Status</h2>
        <div className="bg-surface border border-border rounded-xl p-6 text-center space-y-2">
          <Clock className="mx-auto text-gray-600" size={32} />
          <p className="text-gray-400 font-medium">Your queue is currently empty</p>
          <button className="text-neon-teal text-sm font-bold uppercase tracking-wider">
            Connect to ComfyUI
          </button>
        </div>
      </section>
    </div>
  )
}
