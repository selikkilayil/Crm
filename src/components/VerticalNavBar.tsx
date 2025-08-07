'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { usePermissions } from '@/hooks/usePermissions'

interface VerticalNavBarProps {
  currentPage?: 'home' | 'leads' | 'customers' | 'products' | 'activities' | 'tasks' | 'tags' | 'users' | 'roles' | 'profile' | 'quotations' | 'settings' | 'functions'
}

export default function VerticalNavBar({ currentPage }: VerticalNavBarProps) {
  const { user, logout } = useAuth()
  const { canAccessResource, loading: permissionsLoading } = usePermissions()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showSettingsMenu, setShowSettingsMenu] = useState(false)
  const [showFunctionsMenu, setShowFunctionsMenu] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const settingsMenuRef = useRef<HTMLDivElement>(null)
  const functionsMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setShowMobileMenu(false)
      }
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target as Node)) {
        setShowSettingsMenu(false)
      }
      if (functionsMenuRef.current && !functionsMenuRef.current.contains(event.target as Node)) {
        setShowFunctionsMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Auto-collapse on smaller screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true)
      } else {
        setIsCollapsed(false)
      }
      if (window.innerWidth < 768) {
        setShowMobileMenu(false)
      }
    }

    handleResize() // Check on mount
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const navItems = [
    { href: '/leads', label: 'Leads', key: 'leads', resource: 'leads', icon: '🎯' },
    { href: '/customers', label: 'Customers', key: 'customers', resource: 'customers', icon: '🤝' },
    { href: '/products', label: 'Products', key: 'products', resource: 'products', icon: '📦' },
    { href: '/quotations', label: 'Quotations', key: 'quotations', resource: 'quotations', icon: '📄' },
  ]

  const functionsItems = [
    { href: '/activities', label: 'Activities', key: 'activities', resource: 'activities', icon: '📊' },
    { href: '/tasks', label: 'Tasks', key: 'tasks', resource: 'tasks', icon: '✅' },
    { href: '/tags', label: 'Tags', key: 'tags', resource: 'tags', icon: '🏷️' },
  ]

  const settingsItems = [
    { href: '/users', label: 'Users', key: 'users', resource: 'users', icon: '👥' },
    { href: '/roles', label: 'Roles', key: 'roles', resource: 'roles', icon: '🛡️' },
    { href: '/settings', label: 'PDF Settings', key: 'settings', resource: 'settings', icon: '📄' },
  ]

  const filteredFunctionsItems = functionsItems.filter((item) => {
    if (!user || permissionsLoading) return false
    if (user.role === 'SUPERADMIN') return true
    return canAccessResource(item.resource)
  })

  const filteredSettingsItems = settingsItems.filter((item) => {
    if (!user || permissionsLoading) return false
    if (user.role === 'SUPERADMIN') return true
    return canAccessResource(item.resource)
  })

  const hasFunctionsAccess = filteredFunctionsItems.length > 0
  const hasSettingsAccess = filteredSettingsItems.length > 0

  const filteredNavItems = navItems.filter((item) => {
    if (!user || permissionsLoading) return false
    if (user.role === 'SUPERADMIN') return true
    return canAccessResource(item.resource)
  })

  const sidebarWidth = isCollapsed ? 'w-16' : 'w-64'

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden bg-white shadow-sm sticky top-0 z-50">
        <div className="flex justify-between items-center h-16 px-4">
          {/* Logo */}
          <Link href="/" className="text-lg font-semibold text-gray-900 truncate">
            {user?.role === 'SUPERADMIN' ? 'Admin' : 'CRM'}
          </Link>
          
          {/* Mobile controls */}
          <div className="flex items-center space-x-2">
            {/* Mobile User Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
              user?.role === 'SUPERADMIN' ? 'bg-purple-500' : 'bg-blue-500'
            }`}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            
            {/* Hamburger Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50 min-w-[44px] min-h-[44px] transition-colors"
            >
              <span className="sr-only">Open main menu</span>
              {!showMobileMenu ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className={`hidden md:fixed md:inset-y-0 md:flex md:flex-col ${sidebarWidth} transition-all duration-300 z-40`}>
        <div className="flex flex-col flex-1 bg-white border-r border-gray-200">
          {/* Logo and Toggle */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <Link href="/" className={`font-semibold text-gray-900 truncate ${isCollapsed ? 'text-sm' : 'text-lg'}`}>
              {isCollapsed ? (
                user?.role === 'SUPERADMIN' ? 'SA' : 'CRM'
              ) : (
                user?.role === 'SUPERADMIN' ? 'Super Admin Panel' : 'RAW CRM'
              )}
            </Link>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <svg 
                className={`w-5 h-5 transform transition-transform ${isCollapsed ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {/* Main Navigation */}
              {filteredNavItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors min-h-[44px] ${
                    currentPage === item.key
                      ? 'bg-blue-100 text-blue-900 border-r-2 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <span className="text-lg">{item.icon}</span>
                  {!isCollapsed && <span className="ml-3">{item.label}</span>}
                </Link>
              ))}

              {/* Functions Section */}
              {hasFunctionsAccess && (
                <>
                  <div className={`px-2 py-2 ${isCollapsed ? 'border-t border-gray-200 mt-2' : ''}`}>
                    {!isCollapsed && (
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide border-t border-gray-200 pt-2">
                        Functions
                      </div>
                    )}
                    {isCollapsed && (
                      <button
                        onClick={() => setShowFunctionsMenu(!showFunctionsMenu)}
                        className={`group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md transition-colors min-h-[44px] ${
                          currentPage === 'activities' || currentPage === 'tasks' || currentPage === 'tags' || currentPage === 'functions'
                            ? 'bg-blue-100 text-blue-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                        title="Functions"
                      >
                        <span className="text-lg">🔧</span>
                      </button>
                    )}
                  </div>
                  {(!isCollapsed || showFunctionsMenu) && (
                    <div className={isCollapsed ? 'absolute left-16 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50' : ''}>
                      {filteredFunctionsItems.map((item) => (
                        <Link
                          key={item.key}
                          href={item.href}
                          onClick={() => setShowFunctionsMenu(false)}
                          className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors min-h-[44px] ${
                            isCollapsed ? 'px-4 hover:bg-gray-100' : ''
                          } ${
                            currentPage === item.key
                              ? 'bg-blue-100 text-blue-900 border-r-2 border-blue-600'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                          title={isCollapsed ? item.label : undefined}
                        >
                          <span className="text-lg">{item.icon}</span>
                          {(!isCollapsed || showFunctionsMenu) && <span className="ml-3">{item.label}</span>}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Settings Section */}
              {hasSettingsAccess && (
                <>
                  <div className={`px-2 py-2 ${isCollapsed ? 'border-t border-gray-200 mt-2' : ''}`}>
                    {!isCollapsed && (
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide border-t border-gray-200 pt-2">
                        Settings
                      </div>
                    )}
                    {isCollapsed && (
                      <button
                        onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                        className={`group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md transition-colors min-h-[44px] ${
                          currentPage === 'users' || currentPage === 'roles' || currentPage === 'settings'
                            ? 'bg-blue-100 text-blue-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                        title="Settings"
                      >
                        <span className="text-lg">⚙️</span>
                      </button>
                    )}
                  </div>
                  {(!isCollapsed || showSettingsMenu) && (
                    <div className={isCollapsed ? 'absolute left-16 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50' : ''}>
                      {filteredSettingsItems.map((item) => (
                        <Link
                          key={item.key}
                          href={item.href}
                          onClick={() => setShowSettingsMenu(false)}
                          className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors min-h-[44px] ${
                            isCollapsed ? 'px-4 hover:bg-gray-100' : ''
                          } ${
                            currentPage === item.key
                              ? 'bg-blue-100 text-blue-900 border-r-2 border-blue-600'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                          title={isCollapsed ? item.label : undefined}
                        >
                          <span className="text-lg">{item.icon}</span>
                          {(!isCollapsed || showSettingsMenu) && <span className="ml-3">{item.label}</span>}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </nav>

            {/* User Menu at Bottom */}
            <div className="flex-shrink-0 border-t border-gray-200">
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="group w-full flex items-center px-2 py-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                  title={isCollapsed ? user?.name : undefined}
                >
                  <div className={`${isCollapsed ? 'w-8 h-8' : 'w-10 h-10'} rounded-full flex items-center justify-center text-white font-medium ${
                    user?.role === 'SUPERADMIN' ? 'bg-purple-500' : 'bg-blue-500'
                  }`}>
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  {!isCollapsed && (
                    <div className="ml-3 flex-1 text-left">
                      <div className="text-sm font-medium text-gray-900 truncate">{user?.name}</div>
                      <div className="text-xs text-gray-500 truncate">
                        {user?.customRole ? user.customRole.name : user?.role}
                      </div>
                    </div>
                  )}
                  {!isCollapsed && (
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>

                {showUserMenu && (
                  <div className={`absolute ${isCollapsed ? 'left-16 bottom-0' : 'right-0 bottom-full'} mb-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border`}>
                    <div className="px-4 py-2 text-xs text-gray-500 border-b">
                      {user?.customRole ? user.customRole.name : user?.role}
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 min-h-[44px]"
                    >
                      <span className="mr-3">👤</span>
                      My Profile
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        logout()
                      }}
                      className="flex items-center w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 min-h-[44px]"
                    >
                      <span className="mr-3">🚪</span>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
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
          />
          
          {/* Mobile menu panel */}
          <div 
            ref={mobileMenuRef}
            className="fixed inset-y-0 left-0 w-full max-w-sm bg-white shadow-xl"
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
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                    user?.role === 'SUPERADMIN' ? 'bg-purple-500' : 'bg-blue-500'
                  }`}>
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                    <div className="text-xs text-gray-500">
                      {user?.customRole ? user.customRole.name : user?.role}
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="py-2">
                {filteredNavItems.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={() => setShowMobileMenu(false)}
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

                {/* Functions Section */}
                {hasFunctionsAccess && (
                  <>
                    <div className="px-4 py-2 border-t mt-2">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Functions</div>
                    </div>
                    {filteredFunctionsItems.map((item) => (
                      <Link
                        key={item.key}
                        href={item.href}
                        onClick={() => setShowMobileMenu(false)}
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
                  </>
                )}

                {/* Settings Section */}
                {hasSettingsAccess && (
                  <>
                    <div className="px-4 py-2 border-t mt-2">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Settings</div>
                    </div>
                    {filteredSettingsItems.map((item) => (
                      <Link
                        key={item.key}
                        href={item.href}
                        onClick={() => setShowMobileMenu(false)}
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
                  </>
                )}
              </div>

              {/* User Actions */}
              <div className="border-t pt-2 mt-2">
                <Link
                  href="/profile"
                  onClick={() => setShowMobileMenu(false)}
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
    </>
  )
}