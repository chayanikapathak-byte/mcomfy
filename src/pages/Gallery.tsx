import { useGalleryStore } from '../store/useGalleryStore'
import { Image as ImageIcon, Search } from 'lucide-react'

export default function Gallery() {
  const { images } = useGalleryStore()

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black tracking-tight uppercase italic">Gallery</h2>
        <button className="text-gray-400 hover:text-white">
          <Search size={20} />
        </button>
      </div>

      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center border border-border">
            <ImageIcon className="text-gray-600" size={32} />
          </div>
          <div className="space-y-1">
            <p className="font-bold text-gray-400 uppercase tracking-wider">No generations yet</p>
            <p className="text-xs text-gray-600">Images you generate will appear here</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 xs:grid-cols-3 gap-2">
          {images.map((img) => (
            <div key={img.id} className="aspect-square bg-surface border border-border rounded-lg overflow-hidden relative group">
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}
      
      {/* Skeleton placeholders if empty to show grid potential */}
      {images.length === 0 && (
        <div className="grid grid-cols-2 xs:grid-cols-3 gap-2 opacity-20 pointer-events-none">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="aspect-square bg-surface-lighter border border-border rounded-lg" />
          ))}
        </div>
      )}
    </div>
  )
}
