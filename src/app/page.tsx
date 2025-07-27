'use client'

import Link from 'next/link'
import AuthGuard from '@/components/AuthGuard'
import NavBar from '@/components/NavBar'
import PermissionGuard from '@/components/PermissionGuard'
import { useAuth } from '@/hooks/useAuth'
import { usePermissions } from '@/hooks/usePermissions'

export default function Home() {
  const { user } = useAuth()
  const { canAccessResource, loading: permissionsLoading } = usePermissions()

  const quickAccessItems = [
    { 
      href: '/leads', 
      label: 'Leads', 
      icon: '🎯', 
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
  ]

  // Check if user has access to functions (activities, tasks, tags)
  const hasFunctionsAccess = !permissionsLoading && user && (
    canAccessResource('activities') || canAccessResource('tasks') || canAccessResource('tags')
  )

  // Check if user has access to settings (users or roles)
  const hasSettingsAccess = !permissionsLoading && user && (
    canAccessResource('users') || canAccessResource('roles')
  )

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <NavBar currentPage="home" />

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Dashboard Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Dashboard
              </h1>
              <p className="text-lg text-gray-600">
                Welcome back, {user?.name}! Here's what's happening with your business.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-sm">🎯</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Leads</p>
                    <p className="text-2xl font-semibold text-gray-900">24</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-sm">🤝</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Active Customers</p>
                    <p className="text-2xl font-semibold text-gray-900">12</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                      <span className="text-amber-600 text-sm">📄</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Pending Quotations</p>
                    <p className="text-2xl font-semibold text-gray-900">8</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 text-sm">✅</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Open Tasks</p>
                    <p className="text-2xl font-semibold text-gray-900">15</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Quick Actions */}
              <div className="lg:col-span-2">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {!permissionsLoading && quickAccessItems
                    .filter(item => user && canAccessResource(item.resource))
                    .map((item) => (
                      <Link 
                        key={item.resource}
                        href={item.href} 
                        className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border"
                      >
                        <div className={`${item.color} text-2xl mb-2`}>{item.icon}</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.label}</h3>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </Link>
                    ))}

                  {/* Functions Card */}
                  {hasFunctionsAccess && (
                    <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border">
                      <div className="text-gray-600 text-2xl mb-2">🔧</div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Functions</h3>
                      <div className="space-y-1 mt-3">
                        {canAccessResource('activities') && (
                          <Link 
                            href="/activities"
                            className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <span className="mr-2">📊</span>
                            Activities
                          </Link>
                        )}
                        {canAccessResource('tasks') && (
                          <Link 
                            href="/tasks"
                            className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <span className="mr-2">✅</span>
                            Tasks
                          </Link>
                        )}
                        {canAccessResource('tags') && (
                          <Link 
                            href="/tags"
                            className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <span className="mr-2">🏷️</span>
                            Tags
                          </Link>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Settings Card */}
                  {hasSettingsAccess && (
                    <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border">
                      <div className="text-gray-600 text-2xl mb-2">⚙️</div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Settings</h3>
                      <div className="space-y-1 mt-3">
                        {canAccessResource('users') && (
                          <Link 
                            href="/users"
                            className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <span className="mr-2">👥</span>
                            Users
                          </Link>
                        )}
                        {canAccessResource('roles') && (
                          <Link 
                            href="/roles"
                            className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <span className="mr-2">🛡️</span>
                            Roles
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Activity Sidebar */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">New lead <span className="font-medium">John Doe</span> was added</p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">Quotation <span className="font-medium">QT-2025-0008</span> was approved</p>
                        <p className="text-xs text-gray-500">4 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">Task <span className="font-medium">Follow up with ABC Corp</span> is due</p>
                        <p className="text-xs text-gray-500">6 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">Customer <span className="font-medium">XYZ Industries</span> updated their profile</p>
                        <p className="text-xs text-gray-500">1 day ago</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t">
                    <Link 
                      href="/activities" 
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View all activity →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
