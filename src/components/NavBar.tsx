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
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setShowMobileMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile menu when window resizes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowMobileMenu(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const navItems = [
    { href: '/leads', label: 'Leads', key: 'leads', resource: 'leads', icon: '🎯' },
    { href: '/customers', label: 'Customers', key: 'customers', resource: 'customers', icon: '🤝' },
    { href: '/activities', label: 'Activities', key: 'activities', resource: 'activities', icon: '📊' },
    { href: '/tasks', label: 'Tasks', key: 'tasks', resource: 'tasks', icon: '✅' },
    { href: '/tags', label: 'Tags', key: 'tags', resource: 'tags', icon: '🏷️' },
    { href: '/users', label: 'Users', key: 'users', resource: 'users', icon: '👥' },
    { href: '/dashboard', label: 'Dashboard', key: 'dashboard', resource: 'dashboard', icon: '📈' },
  ]

  const filteredNavItems = navItems.filter((item) => user && canAccessResource(user.role, item.resource))

  const handleMobileNavClick = () => {
    setShowMobileMenu(false)
  }

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
              <span className="hidden sm:inline">CRM + Production</span>
              <span className="sm:hidden">CRM</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {filteredNavItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`min-h-[44px] flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === item.key
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="hidden lg:inline">{item.icon}</span>
                <span className={`${item.icon ? 'lg:ml-2' : ''}`}>{item.label}</span>
              </Link>
            ))}
            
            {/* Desktop User Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-50 min-h-[44px] transition-colors"
              >
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden xl:inline">{user?.name}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                  <Link
                    href="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 min-h-[44px] flex items-center"
                  >
                    👤 My Profile
                  </Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      logout()
                    }}
                    className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 min-h-[44px] flex items-center"
                  >
                    🚪 Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile User Avatar */}
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            
            {/* Hamburger Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50 min-w-[44px] min-h-[44px] transition-colors"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!showMobileMenu ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setShowMobileMenu(false)}
          ></div>
          
          {/* Mobile menu panel */}
          <div 
            ref={mobileMenuRef}
            className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <div className="text-lg font-semibold text-gray-900">Menu</div>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50 min-w-[44px] min-h-[44px]"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="py-2">
              {/* User Info */}
              <div className="px-4 py-3 border-b bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                    <div className="text-xs text-gray-500">{user?.role}</div>
                  </div>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="py-2">
                {filteredNavItems.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={handleMobileNavClick}
                    className={`flex items-center px-4 py-3 text-base font-medium min-h-[48px] transition-colors ${
                      currentPage === item.key
                        ? 'text-blue-600 bg-blue-50 border-r-2 border-blue-600'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-lg mr-3">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* User Actions */}
              <div className="border-t pt-2 mt-2">
                <Link
                  href="/profile"
                  onClick={handleMobileNavClick}
                  className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 min-h-[48px]"
                >
                  <span className="text-lg mr-3">👤</span>
                  My Profile
                </Link>
                <button
                  onClick={() => {
                    setShowMobileMenu(false)
                    logout()
                  }}
                  className="flex items-center w-full px-4 py-3 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 min-h-[48px]"
                >
                  <span className="text-lg mr-3">🚪</span>
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}