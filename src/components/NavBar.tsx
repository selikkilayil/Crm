'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { canAccessResource } from '@/lib/permissions'

interface NavBarProps {
  currentPage?: 'home' | 'leads' | 'customers' | 'activities' | 'tasks' | 'tags' | 'users' | 'dashboard' | 'profile'
}

export default function NavBar({ currentPage }: NavBarProps) {
  const { user, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navItems = [
    { href: '/leads', label: 'Leads', key: 'leads', resource: 'leads' },
    { href: '/customers', label: 'Customers', key: 'customers', resource: 'customers' },
    { href: '/activities', label: 'Activities', key: 'activities', resource: 'activities' },
    { href: '/tasks', label: 'Tasks', key: 'tasks', resource: 'tasks' },
    { href: '/tags', label: 'Tags', key: 'tags', resource: 'tags' },
    { href: '/users', label: 'Users', key: 'users', resource: 'users' },
    { href: '/dashboard', label: 'Dashboard', key: 'dashboard', resource: 'dashboard' },
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
            {navItems
              .filter((item) => user && canAccessResource(user.role, item.resource))
              .map((item) => (
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
            
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded hover:bg-gray-50"
              >
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span>{user?.name}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                  <Link
                    href="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    My Profile
                  </Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      logout()
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}