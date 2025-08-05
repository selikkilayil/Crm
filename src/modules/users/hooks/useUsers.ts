import { useState, useEffect } from 'react'
import { User, CustomRole } from '../types'
import { usersService } from '../services'

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await usersService.getAll()
      setUsers(data)
    } catch (err) {
      console.error('Failed to fetch users:', err)
      setError('Failed to fetch users')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomRoles = async () => {
    try {
      const roles = await usersService.getCustomRoles()
      setCustomRoles(roles)
    } catch (err) {
      console.error('Failed to fetch custom roles:', err)
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchCustomRoles()
  }, [])

  const refreshUsers = () => {
    fetchUsers()
  }

  const addUser = (user: User) => {
    setUsers(prev => [user, ...prev])
  }

  const updateUser = (updatedUser: User) => {
    setUsers(prev => 
      prev.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      )
    )
  }

  const removeUser = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId))
  }

  return {
    users,
    customRoles,
    loading,
    error,
    refreshUsers,
    addUser,
    updateUser,
    removeUser
  }
}