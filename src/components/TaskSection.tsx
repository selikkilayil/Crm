'use client'

import { useState, useEffect } from 'react'

interface Task {
  id: string
  title: string
  description: string | null
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  dueDate: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
  assignedTo?: {
    id: string
    name: string
    email: string
    role: string
  }
  createdBy?: {
    id: string
    name: string
    email: string
  }
  lead?: {
    id: string
    name: string
    company: string | null
    email: string
    phone: string | null
  }
  customer?: {
    id: string
    name: string
    company: string | null
    email: string
    phone: string | null
  }
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface TaskSectionProps {
  leadId?: string
  customerId?: string
  maxItems?: number
  compact?: boolean
}

export default function TaskSection({ leadId, customerId, maxItems = 10, compact = false }: TaskSectionProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')

  useEffect(() => {
    fetchTasks()
    fetchUsers()
  }, [leadId, customerId])

  const fetchTasks = async () => {
    try {
      const params = new URLSearchParams()
      if (leadId) params.append('leadId', leadId)
      if (customerId) params.append('customerId', customerId)
      
      const response = await fetch(`/api/tasks?${params}`)
      const data = await response.json()
      
      if (response.ok && Array.isArray(data)) {
        setTasks(data)
      } else {
        console.error('Failed to fetch tasks:', data)
        setTasks([])
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      const data = await response.json()
      
      if (response.ok && Array.isArray(data)) {
        setUsers(data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const createTask = async (taskData: Partial<Task>) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...taskData,
          leadId,
          customerId,
          createdById: 'user-1' // Use the seeded demo user ID
        }),
      })

      if (response.ok) {
        fetchTasks()
        setShowCreateForm(false)
      }
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }

  const updateTaskStatus = async (taskId: string, status: Task['status']) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        fetchTasks()
      }
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return task.status !== 'COMPLETED'
    if (filter === 'completed') return task.status === 'COMPLETED'
    return true
  }).slice(0, maxItems)

  const priorityColors = {
    LOW: 'text-green-600 bg-green-100',
    MEDIUM: 'text-yellow-600 bg-yellow-100',
    HIGH: 'text-red-600 bg-red-100'
  }

  const statusColors = {
    PENDING: 'text-gray-600 bg-gray-100',
    IN_PROGRESS: 'text-blue-600 bg-blue-100',
    COMPLETED: 'text-green-600 bg-green-100'
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className={`font-medium text-gray-900 ${compact ? 'text-base' : 'text-lg'}`}>
          Tasks
        </h3>
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className={`font-medium text-gray-900 ${compact ? 'text-base' : 'text-lg'}`}>
          Tasks ({filteredTasks.length})
        </h3>
        
        {!compact && (
          <div className="flex space-x-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="text-xs border border-gray-300 rounded px-2 py-1 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
            
            <button
              onClick={() => setShowCreateForm(true)}
              className="text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
            >
              Add Task
            </button>
          </div>
        )}
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-4">
            <div className="text-2xl text-gray-400 mb-2">✅</div>
            <p className="text-sm text-gray-500">No tasks found</p>
            {!compact && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="mt-2 text-xs text-purple-600 hover:text-purple-800"
              >
                Create first task
              </button>
            )}
          </div>
        ) : (
          filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              compact={compact}
              onStatusChange={updateTaskStatus}
            />
          ))
        )}
      </div>

      {/* Create Task Form */}
      {showCreateForm && (
        <CreateTaskForm
          users={users}
          onSubmit={createTask}
          onClose={() => setShowCreateForm(false)}
          compact={compact}
        />
      )}

      {/* Show More Link */}
      {!compact && tasks.length > maxItems && (
        <div className="text-center">
          <a
            href="/tasks"
            className="text-sm text-purple-600 hover:text-purple-800 font-medium"
          >
            View all tasks →
          </a>
        </div>
      )}
    </div>
  )
}

function TaskCard({ task, compact, onStatusChange }: {
  task: Task
  compact?: boolean
  onStatusChange: (taskId: string, status: Task['status']) => void
}) {
  const [showMenu, setShowMenu] = useState(false)
  
  const isOverdue = task.dueDate && task.status !== 'COMPLETED' && 
    new Date(task.dueDate) < new Date()

  const priorityColors = {
    LOW: 'text-green-600 bg-green-100',
    MEDIUM: 'text-yellow-600 bg-yellow-100',
    HIGH: 'text-red-600 bg-red-100'
  }

  const statusColors = {
    PENDING: 'text-gray-600 bg-gray-100',
    IN_PROGRESS: 'text-blue-600 bg-blue-100',
    COMPLETED: 'text-green-600 bg-green-100'
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${compact ? 'p-3' : 'p-4'} ${
      isOverdue ? 'border-red-300 bg-red-50' : ''
    }`}>
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <h4 className={`font-medium text-gray-900 truncate ${compact ? 'text-sm' : 'text-base'}`}>
              {task.title}
            </h4>
            
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>
            
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[task.status]}`}>
              {task.status.replace('_', ' ')}
            </span>
          </div>
          
          {task.description && !compact && (
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{task.description}</p>
          )}
          
          <div className={`flex flex-wrap items-center gap-2 text-xs text-gray-500 ${compact ? 'text-xs' : 'text-sm'}`}>
            {task.assignedTo && (
              <span className="flex items-center">
                <span className="mr-1">👤</span>
                {task.assignedTo.name}
              </span>
            )}
            
            {task.dueDate && (
              <span className={`flex items-center ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                <span className="mr-1">📅</span>
                {new Date(task.dueDate).toLocaleDateString()}
                {isOverdue && ' (Overdue)'}
              </span>
            )}
            
            <span className="flex items-center">
              <span className="mr-1">🕒</span>
              {new Date(task.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        <div className="relative ml-2">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            ⋮
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-32">
              {task.status !== 'COMPLETED' && (
                <button
                  onClick={() => {
                    onStatusChange(task.id, task.status === 'PENDING' ? 'IN_PROGRESS' : 'COMPLETED')
                    setShowMenu(false)
                  }}
                  className="block w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                >
                  {task.status === 'PENDING' ? 'Start Task' : 'Complete'}
                </button>
              )}
              
              {task.status === 'COMPLETED' && (
                <button
                  onClick={() => {
                    onStatusChange(task.id, 'IN_PROGRESS')
                    setShowMenu(false)
                  }}
                  className="block w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                >
                  Reopen
                </button>
              )}
              
              <button
                onClick={() => setShowMenu(false)}
                className="block w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
              >
                View Details
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CreateTaskForm({ users, onSubmit, onClose, compact }: {
  users: User[]
  onSubmit: (data: Partial<Task>) => void
  onClose: () => void
  compact?: boolean
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as Task['priority'],
    dueDate: '',
    assignedToId: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      status: 'PENDING' as Task['status'],
      dueDate: formData.dueDate || null,
      assignedToId: formData.assignedToId || null,
    })
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <h4 className={`font-medium text-gray-900 mb-3 ${compact ? 'text-sm' : 'text-base'}`}>
        Create New Task
      </h4>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input
            type="text"
            placeholder="Task title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
        
        <div>
          <textarea
            placeholder="Description (optional)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            rows={2}
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
            className="px-3 py-2 border border-gray-300 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="LOW">Low Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="HIGH">High Priority</option>
          </select>
          
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
          
          <select
            value={formData.assignedToId}
            onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="">Assign to...</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Create Task
          </button>
        </div>
      </form>
    </div>
  )
}