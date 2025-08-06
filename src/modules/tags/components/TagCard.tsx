'use client'

import { useState } from 'react'
import { Tag } from '../types'

interface TagCardProps {
  tag: Tag
  onEdit: () => void
  onDelete: (id: string) => void
}

export default function TagCard({ tag, onEdit, onDelete }: TagCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const totalUsage = tag._count.leads + tag._count.customers

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div 
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: tag.color }}
            />
            <h3 className="text-lg font-medium text-gray-900 truncate">{tag.name}</h3>
          </div>
          
          <div className="relative ml-2">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-400 hover:text-gray-600 p-2 -m-2"
            >
              ⋮
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-32">
                <button
                  onClick={() => { onEdit(); setShowMenu(false) }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => { onDelete(tag.id); setShowMenu(false) }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
        
        {tag.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{tag.description}</p>
        )}
        
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Used in {totalUsage} item{totalUsage !== 1 ? 's' : ''}</span>
          </div>
          
          {(tag._count.leads > 0 || tag._count.customers > 0) && (
            <div className="flex space-x-4 text-xs text-gray-500">
              {tag._count.leads > 0 && (
                <span>{tag._count.leads} lead{tag._count.leads !== 1 ? 's' : ''}</span>
              )}
              {tag._count.customers > 0 && (
                <span>{tag._count.customers} customer{tag._count.customers !== 1 ? 's' : ''}</span>
              )}
            </div>
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Created {new Date(tag.createdAt).toLocaleDateString()}</span>
            <button
              onClick={onEdit}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Edit →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}