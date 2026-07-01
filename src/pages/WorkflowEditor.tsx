import { ReactFlow, Background, Controls } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useWorkflowStore } from '../store/useWorkflowStore'

export default function WorkflowEditor() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useWorkflowStore()

  return (
    <div className="h-full w-full bg-background relative flex flex-col">
      <div className="flex-1 min-h-0">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          colorMode="dark"
        >
          <Background color="#2e2e3e" gap={20} />
          <Controls />
        </ReactFlow>
      </div>
      
      {/* Mobile Optimized Controls Overlay */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2 pointer-events-none">
        <button className="bg-neon-purple text-white px-6 py-3 rounded-xl font-black italic tracking-tighter shadow-lg shadow-neon-purple/40 active:scale-95 transition-transform pointer-events-auto">
          QUEUE PROMPT
        </button>
      </div>
      
      <div className="absolute top-4 left-4 pointer-events-none">
        <div className="bg-surface/80 backdrop-blur-sm border border-border px-3 py-1.5 rounded-lg pointer-events-auto">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Canvas
          </span>
        </div>
      </div>
    </div>
  )
}
