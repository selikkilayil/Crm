import { useState, useEffect } from 'react'
import { tagsService } from '../services'
import { Tag, TagFormData } from '../types'

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTags = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await tagsService.getAll()
      setTags(data)
    } catch (err) {
      console.error('Failed to fetch tags:', err)
      setError('Failed to fetch tags')
      setTags([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTags()
  }, [])

  const addTag = async (tagData: TagFormData) => {
    try {
      const newTag = await tagsService.create(tagData)
      setTags(prev => [...prev, newTag])
      return newTag
    } catch (error) {
      console.error('Failed to create tag:', error)
      throw error
    }
  }

  const updateTag = async (id: string, tagData: Partial<TagFormData>) => {
    try {
      const updatedTag = await tagsService.update(id, tagData)
      setTags(prev => prev.map(tag => 
        tag.id === id ? updatedTag : tag
      ))
      return updatedTag
    } catch (error) {
      console.error('Failed to update tag:', error)
      throw error
    }
  }

  const removeTag = async (id: string) => {
    try {
      await tagsService.delete(id)
      setTags(prev => prev.filter(tag => tag.id !== id))
    } catch (error) {
      console.error('Failed to delete tag:', error)
      throw error
    }
  }

  const refreshTags = () => {
    fetchTags()
  }

  return {
    tags,
    loading,
    error,
    refreshTags,
    addTag,
    updateTag,
    removeTag
  }
}