'use client'

import { useState, useEffect } from 'react'
import AuthGuard from '@/components/AuthGuard'
import NavBar from '@/components/NavBar'

interface Tag {
  id: string
  name: string
  color: string
  description: string | null
  createdAt: string
  updatedAt: string
  _count: {
    leads: number
    customers: number
  }
}

const predefinedColors = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280', // Gray
]

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null)

  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags')
      const data = await response.json()
      
      if (response.ok && Array.isArray(data)) {
        setTags(data)
      } else {
        console.error('API Error:', data)
        setTags([])
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error)
      setTags([])
    } finally {
      setLoading(false)
    }
  }

  const createTag = async (tagData: Partial<Tag>) => {
    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tagData),
      })

      if (response.ok) {
        fetchTags()
        setShowCreateForm(false)
      }
    } catch (error) {
      console.error('Failed to create tag:', error)
    }
  }

  const updateTag = async (tagId: string, tagData: Partial<Tag>) => {
    try {
      const response = await fetch(`/api/tags/${tagId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tagData),
      })

      if (response.ok) {
        fetchTags()
        setSelectedTag(null)
      }
    } catch (error) {
      console.error('Failed to update tag:', error)
    }
  }

  const deleteTag = async (tagId: string) => {
    if (!confirm('Are you sure you want to delete this tag? It will be removed from all leads and customers.')) {
      return
    }

    try {
      const response = await fetch(`/api/tags/${tagId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchTags()
      }
    } catch (error) {
      console.error('Failed to delete tag:', error)
    }
  }

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tag.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-700">Loading tags...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <NavBar currentPage="tags" />

        <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col space-y-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Tag Management</h1>
                <p className="text-gray-600">Organize and categorize your leads and customers</p>
              </div>
              
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center"
              >
                <span className="mr-2">+</span>
                <span className="hidden sm:inline">Create Tag</span>
                <span className="sm:hidden">Create</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Tags Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredTags.map(tag => (
              <TagCard
                key={tag.id}
                tag={tag}
                onEdit={() => setSelectedTag(tag)}
                onDelete={deleteTag}
              />
            ))}
          </div>

          {/* No Results */}
          {filteredTags.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-4xl text-gray-400 mb-4">🏷️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tags found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'Try adjusting your search criteria' : 'Get started by creating your first tag'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                >
                  Create First Tag
                </button>
              )}
            </div>
          )}
        </main>

        {/* Modals */}
        {showCreateForm && (
          <CreateTagModal 
            onSubmit={createTag} 
            onClose={() => setShowCreateForm(false)} 
          />
        )}

        {selectedTag && (
          <EditTagModal
            tag={selectedTag}
            onSubmit={(data) => updateTag(selectedTag.id, data)}
            onClose={() => setSelectedTag(null)}
          />
        )}
      </div>
    </AuthGuard>
  )
}

function TagCard({ tag, onEdit, onDelete }: {
  tag: Tag
  onEdit: () => void
  onDelete: (id: string) => void
}) {
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

function CreateTagModal({ onSubmit, onClose }: { 
  onSubmit: (data: Partial<Tag>) => void
  onClose: () => void 
}) {
  const [formData, setFormData] = useState({
    name: '',
    color: predefinedColors[0],
    description: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-screen overflow-y-auto">
        <div className="p-4 sm:p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Create New Tag</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter tag name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Color *</label>
              <div className="grid grid-cols-5 gap-2">
                {predefinedColors.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-10 h-10 rounded-full border-2 ${
                      formData.color === color ? 'border-gray-800' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="mt-2 w-full h-10 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Optional description"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Tag
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function EditTagModal({ tag, onSubmit, onClose }: { 
  tag: Tag
  onSubmit: (data: Partial<Tag>) => void
  onClose: () => void 
}) {
  const [formData, setFormData] = useState({
    name: tag.name,
    color: tag.color,
    description: tag.description || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-screen overflow-y-auto">
        <div className="p-4 sm:p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Edit Tag</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Color *</label>
              <div className="grid grid-cols-5 gap-2">
                {predefinedColors.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-10 h-10 rounded-full border-2 ${
                      formData.color === color ? 'border-gray-800' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="mt-2 w-full h-10 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Usage Statistics</h4>
              <div className="text-sm text-gray-600">
                <div>Used in {tag._count.leads + tag._count.customers} total items</div>
                <div>{tag._count.leads} leads • {tag._count.customers} customers</div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Update Tag
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}