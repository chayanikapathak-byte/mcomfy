import { create } from 'zustand'
import { ConnectionStatus } from '../types/comfy'

interface ConnectionState {
  status: ConnectionStatus
  url: string
  queueCount: number
  setStatus: (status: ConnectionStatus) => void
  setUrl: (url: string) => void
  setQueueCount: (count: number) => void
}

export const useConnectionStore = create<ConnectionState>((set) => ({
  status: 'disconnected',
  url: 'http://localhost:8188',
  queueCount: 0,
  setStatus: (status) => set({ status }),
  setUrl: (url) => set({ url }),
  setQueueCount: (count) => set({ queueCount: count }),
}))
