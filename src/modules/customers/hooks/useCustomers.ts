import { useState, useEffect } from 'react'
import { Customer } from '../types'
import { customersService } from '../services'

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await customersService.getAll()
      setCustomers(data)
    } catch (err) {
      console.error('Failed to fetch customers:', err)
      setError('Failed to fetch customers')
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const refreshCustomers = () => {
    fetchCustomers()
  }

  const addCustomer = (customer: Customer) => {
    setCustomers(prev => [customer, ...prev])
  }

  const updateCustomer = (updatedCustomer: Customer) => {
    setCustomers(prev => 
      prev.map(customer => 
        customer.id === updatedCustomer.id ? updatedCustomer : customer
      )
    )
  }

  const removeCustomer = (customerId: string) => {
    setCustomers(prev => prev.filter(customer => customer.id !== customerId))
  }

  return {
    customers,
    loading,
    error,
    refreshCustomers,
    addCustomer,
    updateCustomer,
    removeCustomer
  }
}