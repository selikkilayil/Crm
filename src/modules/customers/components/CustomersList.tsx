'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Customer, Tag } from '../types'
import TagComponent from '@/components/TagComponent'

interface CustomersListProps {
  customers: Customer[]
  availableTags: Tag[]
  viewMode: 'grid' | 'table'
  onAddTag: (customerId: string, tagId: string) => Promise<void>
  onRemoveTag: (customerId: string, tagId: string) => Promise<void>
}

export default function CustomersList({
  customers,
  availableTags,
  viewMode,
  onAddTag,
  onRemoveTag
}: CustomersListProps) {
  const router = useRouter()

  if (viewMode === 'table') {
    return (
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tags
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.map((customer) => (
                <tr
                  key={customer.id}
                  onClick={() => router.push(`/customers/${customer.id}`)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                      <div className="text-sm text-gray-500">{customer.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {customer.company || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {customer.phone || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {customer.tags?.map((tag) => (
                        <TagComponent
                          key={tag.id}
                          tag={tag}
                          onRemove={() => onRemoveTag(customer.id, tag.id)}
                          size="sm"
                        />
                      ))}
                      <TagComponent
                        availableTags={availableTags}
                        onAdd={(tagId) => onAddTag(customer.id, tagId)}
                        size="sm"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // Grid view
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {customers.map((customer) => (
        <div
          key={customer.id}
          onClick={() => router.push(`/customers/${customer.id}`)}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow cursor-pointer"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate">{customer.name}</h3>
              {customer.company && (
                <p className="text-sm text-gray-600 truncate">{customer.company}</p>
              )}
            </div>
            <div className="ml-2 flex-shrink-0">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                {customer.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <span className="mr-2">📧</span>
              <span className="truncate">{customer.email}</span>
            </div>
            {customer.phone && (
              <div className="flex items-center text-sm text-gray-600">
                <span className="mr-2">📞</span>
                <span>{customer.phone}</span>
              </div>
            )}
            {customer.gstin && (
              <div className="flex items-center text-sm text-gray-600">
                <span className="mr-2">🏢</span>
                <span className="truncate">{customer.gstin}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {customer.tags?.map((tag) => (
              <TagComponent
                key={tag.id}
                tag={tag}
                onRemove={() => onRemoveTag(customer.id, tag.id)}
                size="sm"
              />
            ))}
            <TagComponent
              availableTags={availableTags}
              onAdd={(tagId) => onAddTag(customer.id, tagId)}
              size="sm"
            />
          </div>

          {/* Footer */}
          <div className="text-xs text-gray-500 pt-3 border-t border-gray-100">
            Added {new Date(customer.createdAt).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  )
}