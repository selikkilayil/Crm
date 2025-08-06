'use client'

import { useState } from 'react'
import { useConfirm } from '@/lib/confirmation-context'
import { AuthGuard } from '@/shared/components'
import { NavBar } from '@/shared/components'
import { TagsList, TagForm, useTags, Tag, TagFormData } from '@/modules/tags'

export default function TagsPage() {
  const confirm = useConfirm()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null)
  
  const { tags, loading, createTag, updateTag, deleteTag } = useTags()

  const handleCreateTag = async (data: TagFormData) => {
    await createTag(data)
    setShowCreateForm(false)
  }

  const handleUpdateTag = async (data: TagFormData) => {
    if (selectedTag) {
      await updateTag(selectedTag.id, data)
      setSelectedTag(null)
    }
  }

  const handleDeleteTag = async (tagId: string) => {
    const result = await confirm({
      title: 'Delete Tag',
      message: 'Are you sure you want to delete this tag? It will be removed from all leads and customers.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
      icon: 'delete'
    })
    
    if (result) {
      await deleteTag(tagId)
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
          <TagsList 
            tags={filteredTags}
            onEdit={(tag) => setSelectedTag(tag)}
            onDelete={handleDeleteTag}
          />

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
          <TagForm
            onSubmit={handleCreateTag}
            onClose={() => setShowCreateForm(false)}
            title="Create New Tag"
            submitLabel="Create Tag"
          />
        )}

        {selectedTag && (
          <TagForm
            onSubmit={handleUpdateTag}
            onClose={() => setSelectedTag(null)}
            initialData={selectedTag}
            title="Edit Tag"
            submitLabel="Update Tag"
          />
        )}
      </div>
    </AuthGuard>
  )
}