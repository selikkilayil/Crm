'use client'

import { Tag } from '../types'
import TagCard from './TagCard'

interface TagsListProps {
  tags: Tag[]
  onEdit: (tag: Tag) => void
  onDelete: (id: string) => void
}

export default function TagsList({ tags, onEdit, onDelete }: TagsListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tags.map((tag) => (
        <TagCard
          key={tag.id}
          tag={tag}
          onEdit={() => onEdit(tag)}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}