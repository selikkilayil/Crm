'use client'

import { Quotation } from '../types'

interface QuotationsStatsProps {
  quotations: Quotation[]
}

export default function QuotationsStats({ quotations }: QuotationsStatsProps) {
  const stats = [
    { 
      label: 'Total', 
      value: quotations.length, 
      color: 'bg-gradient-to-br from-blue-500 to-blue-600', 
      icon: '📄' 
    },
    { 
      label: 'Draft', 
      value: quotations.filter(q => q.status === 'DRAFT').length, 
      color: 'bg-gradient-to-br from-gray-500 to-gray-600', 
      icon: '📝' 
    },
    { 
      label: 'Sent', 
      value: quotations.filter(q => q.status === 'SENT').length, 
      color: 'bg-gradient-to-br from-blue-500 to-indigo-600', 
      icon: '📤' 
    },
    { 
      label: 'Accepted', 
      value: quotations.filter(q => q.status === 'ACCEPTED').length, 
      color: 'bg-gradient-to-br from-green-500 to-green-600', 
      icon: '✅' 
    },
    { 
      label: 'Rejected', 
      value: quotations.filter(q => q.status === 'REJECTED').length, 
      color: 'bg-gradient-to-br from-red-500 to-red-600', 
      icon: '❌' 
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="p-4">
            <div className="flex items-center">
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-white mr-3 shadow-lg`}>
                <span className="text-lg">{stat.icon}</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}