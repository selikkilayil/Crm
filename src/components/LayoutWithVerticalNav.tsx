'use client'

import { ReactNode } from 'react'
import VerticalNavBar from './VerticalNavBar'

interface LayoutWithVerticalNavProps {
  children: ReactNode
  currentPage?: 'home' | 'leads' | 'customers' | 'products' | 'activities' | 'tasks' | 'tags' | 'users' | 'roles' | 'profile' | 'quotations' | 'settings' | 'functions'
}

export default function LayoutWithVerticalNav({ children, currentPage }: LayoutWithVerticalNavProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <VerticalNavBar currentPage={currentPage} />
      
      {/* Main content area that adjusts for sidebar */}
      <div className="md:pl-16 lg:pl-64 transition-all duration-300">
        {children}
      </div>
    </div>
  )
}