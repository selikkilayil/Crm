'use client'

import { useState } from 'react'

interface Tag {
  id: string
  name: string
  color: string
  description?: string | null
}

interface TagComponentProps {
  tags: Tag[]
  availableTags?: Tag[]
  editable?: boolean
  onTagAdd?: (tagId: string) => void
  onTagRemove?: (tagId: string) => void
  compact?: boolean
  maxDisplay?: number
}

export default function TagComponent({ 
  tags, 
  availableTags = [], 
  editable = false, 
  onTagAdd, 
  onTagRemove,
  compact = false,
  maxDisplay 
}: TagComponentProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [showAll, setShowAll] = useState(false)

  const displayTags = maxDisplay && !showAll ? tags.slice(0, maxDisplay) : tags
  const hiddenCount = maxDisplay && !showAll ? Math.max(0, tags.length - maxDisplay) : 0
  
  const unassignedTags = availableTags.filter(
    availableTag => !tags.some(tag => tag.id === availableTag.id)
  )

  return (
    <div className="space-y-2">
      {/* Tags Display */}
      <div className="flex flex-wrap gap-1 sm:gap-2">
        {displayTags.map(tag => (
          <TagBadge
            key={tag.id}
            tag={tag}
            compact={compact}
            removable={editable}
            onRemove={onTagRemove}
          />
        ))}
        
        {hiddenCount > 0 && (
          <button
            onClick={() => setShowAll(true)}
            className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200"
          >
            +{hiddenCount} more
          </button>
        )}
        
        {showAll && hiddenCount > 0 && (
          <button
            onClick={() => setShowAll(false)}
            className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200"
          >
            Show less
          </button>
        )}
        
        {editable && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 border border-dashed border-gray-300"
          >
            <span className="mr-1">+</span>
            Add Tag
          </button>
        )}
      </div>

      {/* Add Tag Form */}
      {showAddForm && editable && unassignedTags.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Add Tags</h4>
          <div className="flex flex-wrap gap-1">
            {unassignedTags.map(tag => (
              <button
                key={tag.id}
                onClick={() => {
                  onTagAdd?.(tag.id)
                  setShowAddForm(false)
                }}
                className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-white rounded-full border hover:bg-gray-50"
              >
                <div 
                  className="w-2 h-2 rounded-full mr-1"
                  style={{ backgroundColor: tag.color }}
                />
                {tag.name}
              </button>
            ))}
          </div>
          <div className="mt-2 flex justify-end">
            <button
              onClick={() => setShowAddForm(false)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* No unassigned tags message */}
      {showAddForm && editable && unassignedTags.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
          <p className="text-sm text-gray-500">All available tags are already assigned.</p>
          <div className="mt-2 flex justify-end">
            <button
              onClick={() => setShowAddForm(false)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function TagBadge({ tag, compact, removable, onRemove }: {
  tag: Tag
  compact?: boolean
  removable?: boolean
  onRemove?: (tagId: string) => void
}) {
  const baseClasses = compact 
    ? "inline-flex items-center px-2 py-1 text-xs font-medium rounded-full"
    : "inline-flex items-center px-2.5 py-1 text-sm font-medium rounded-full"

  return (
    <span 
      className={`${baseClasses} text-white`}
      style={{ backgroundColor: tag.color }}
      title={tag.description || tag.name}
    >
      <div 
        className={`${compact ? 'w-1.5 h-1.5 mr-1' : 'w-2 h-2 mr-1.5'} rounded-full bg-white bg-opacity-30`}
      />
      {tag.name}
      
      {removable && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove(tag.id)
          }}
          className={`${compact ? 'ml-1' : 'ml-1.5'} hover:bg-white hover:bg-opacity-20 rounded-full p-0.5`}
        >
          <svg className={`${compact ? 'w-3 h-3' : 'w-4 h-4'}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </span>
  )
}

export { TagBadge }