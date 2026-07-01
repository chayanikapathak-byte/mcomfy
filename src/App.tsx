import { useState, Suspense, lazy } from 'react'
import { TopBar } from './components/TopBar'
import { BottomNav } from './components/BottomNav'

// Lazy load pages for better performance as requested
const Home = lazy(() => import('./pages/Home'))
const WorkflowEditor = lazy(() => import('./pages/WorkflowEditor'))
const Gallery = lazy(() => import('./pages/Gallery'))
const Settings = lazy(() => import('./pages/Settings'))

function App() {
  const [activeTab, setActiveTab] = useState('home')

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <TopBar />
      
      <main className="flex-1 pt-14 pb-16 overflow-x-hidden overflow-y-auto">
        <Suspense fallback={
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-neon-purple border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          {activeTab === 'home' && <Home />}
          {activeTab === 'workflows' && <WorkflowEditor />}
          {activeTab === 'gallery' && <Gallery />}
          {activeTab === 'settings' && <Settings />}
        </Suspense>
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  )
}

export default App
