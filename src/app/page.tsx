'use client'

import Link from 'next/link'
import AuthGuard from '@/components/AuthGuard'
import NavBar from '@/components/NavBar'
import PermissionGuard from '@/components/PermissionGuard'
import { useAuth } from '@/hooks/useAuth'
import { canAccessResource } from '@/lib/client-permissions'

export default function Home() {
  const { user } = useAuth()

  const dashboardItems = [
    { 
      href: '/leads', 
      label: 'Leads', 
      icon: '👥', 
      color: 'text-blue-600',
      description: 'Track and manage potential customers',
      resource: 'leads'
    },
    { 
      href: '/customers', 
      label: 'Customers', 
      icon: '🤝', 
      color: 'text-green-600',
      description: 'Manage existing customer relationships',
      resource: 'customers'
    },
    { 
      href: '/quotations', 
      label: 'Quotations', 
      icon: '📄', 
      color: 'text-amber-600',
      description: 'Create and manage quotations',
      resource: 'quotations'
    },
    { 
      href: '/activities', 
      label: 'Activities', 
      icon: '📋', 
      color: 'text-orange-600',
      description: 'Track interactions and follow-ups',
      resource: 'activities'
    },
    { 
      href: '/tasks', 
      label: 'Tasks', 
      icon: '✅', 
      color: 'text-purple-600',
      description: 'Assign and track work items',
      resource: 'tasks'
    },
    { 
      href: '/tags', 
      label: 'Tags', 
      icon: '🏷️', 
      color: 'text-pink-600',
      description: 'Organize and categorize',
      resource: 'tags'
    },
    { 
      href: '/users', 
      label: 'Users', 
      icon: '👤', 
      color: 'text-cyan-600',
      description: 'Manage team members',
      resource: 'users'
    },
    { 
      href: '/dashboard', 
      label: 'Dashboard', 
      icon: '📊', 
      color: 'text-indigo-600',
      description: 'View analytics and insights',
      resource: 'dashboard'
    },
  ]

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <NavBar currentPage="home" />

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to Your CRM
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Manage leads, customers, and production workflow all in one place
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-6 max-w-7xl mx-auto">
                {dashboardItems
                  .filter(item => user && canAccessResource(user.role, item.resource))
                  .map((item) => (
                    <Link 
                      key={item.resource}
                      href={item.href} 
                      className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                    >
                      <div className={`${item.color} text-3xl mb-2`}>{item.icon}</div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.label}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
