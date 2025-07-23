'use client'

import Link from 'next/link'
import { useAuth } from './AuthGuard'

interface NavBarProps {
  currentPage?: 'home' | 'leads' | 'customers' | 'activities' | 'tasks' | 'tags' | 'dashboard'
}

export default function NavBar({ currentPage }: NavBarProps) {
  const { user, logout } = useAuth()

  const navItems = [
    { href: '/leads', label: 'Leads', key: 'leads' },
    { href: '/customers', label: 'Customers', key: 'customers' },
    { href: '/activities', label: 'Activities', key: 'activities' },
    { href: '/tasks', label: 'Tasks', key: 'tasks' },
    { href: '/tags', label: 'Tags', key: 'tags' },
    { href: '/dashboard', label: 'Dashboard', key: 'dashboard' },
  ]

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-semibold text-gray-900">
              CRM + Production
            </Link>
          </div>
          
          <div className="flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`${
                  currentPage === item.key
                    ? 'text-blue-600 font-medium'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {item.label}
              </Link>
            ))}
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.name}
              </span>
              <button
                onClick={logout}
                className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded border hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}