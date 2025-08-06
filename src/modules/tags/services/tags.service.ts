import { apiClient } from '@/shared/services'
import { Tag, TagFormData } from '../types'

export class TagsService {
  async getAll(): Promise<Tag[]> {
    try {
      const data = await apiClient.get('/api/tags')
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error('Failed to fetch tags:', error)
      return []
    }
  }

  async create(tagData: TagFormData): Promise<Tag> {
    return await apiClient.post('/api/tags', tagData)
  }

  async update(id: string, tagData: Partial<TagFormData>): Promise<Tag> {
    return await apiClient.put(`/api/tags/${id}`, tagData)
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/tags/${id}`)
  }
}

export const tagsService = new TagsService()