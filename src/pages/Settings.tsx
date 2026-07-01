import { useConnectionStore } from '../store/useConnectionStore'
import { Server, Globe, Shield, Github } from 'lucide-react'

export default function Settings() {
  const { url, setUrl, status } = useConnectionStore()
  const isConnected = status === 'connected'

  return (
    <div className="p-6 pb-12 space-y-8 animate-in fade-in duration-500">
      <h2 className="text-2xl font-black tracking-tight uppercase italic">Settings</h2>
      
      <section className="space-y-4">
        <div className="flex items-center space-x-2 text-neon-teal">
          <Server size={16} />
          <h3 className="text-xs font-bold uppercase tracking-widest">Connection</h3>
        </div>
        
        <div className="bg-surface border border-border rounded-xl p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">ComfyUI Endpoint</label>
            <input 
              type="text" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-4 py-3 font-mono text-sm focus:outline-none focus:border-neon-purple transition-colors text-foreground"
              placeholder="http://localhost:8188"
            />
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-gray-400">Status</span>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-neon-green shadow-[0_0_8px_#39ff14]' : status === 'error' ? 'bg-red-500' : 'bg-gray-600'}`} />
              <span className={`text-xs font-bold uppercase ${isConnected ? 'text-neon-green' : status === 'error' ? 'text-red-500' : 'text-gray-400'}`}>
                {status}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center space-x-2 text-neon-purple">
          <Shield size={16} />
          <h3 className="text-xs font-bold uppercase tracking-widest">App Info</h3>
        </div>
        
        <div className="bg-surface border border-border rounded-xl divide-y divide-border overflow-hidden">
          <div className="p-4 flex items-center justify-between">
            <span className="text-sm text-gray-300">Version</span>
            <span className="text-sm font-mono text-gray-500">0.1.0-alpha</span>
          </div>
          <a href="#" className="p-4 flex items-center justify-between hover:bg-surface-lighter transition-colors">
            <div className="flex items-center space-x-3">
              <Github size={18} className="text-gray-400" />
              <span className="text-sm text-gray-300">Source Code</span>
            </div>
            <Globe size={14} className="text-gray-600" />
          </a>
        </div>
      </section>

      <div className="text-center pt-4">
        <p className="text-[10px] text-gray-700 uppercase font-bold tracking-tighter">
          ComfyPocket &copy; 2026 • Performance Optimized Mobile UI
        </p>
      </div>
    </div>
  )
}
