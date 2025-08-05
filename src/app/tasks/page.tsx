'use client'

import { useState, useEffect } from 'react'
import { TaskStatus, TaskPriority } from '@prisma/client'
import { useConfirm } from '@/lib/confirmation-context'
import { AuthGuard, NavBar } from '@/shared/components'
import { FormWrapper, FormField, FormButton, FormErrorMessage } from '@/shared/components'
import * as Yup from 'yup'
import { useAuth } from '@/shared/hooks'
import { apiClient } from '@/shared/services'

interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  dueDate: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
  assignedToId?: string | null
  leadId?: string | null
  customerId?: string | null
  assignedTo?: {
    id: string
    name: string
    email: string
    role: string
  }
  createdBy: {
    id: string
    name: string
    email: string
  }
  lead?: {
    id: string
    name: string
    company: string | null
  }
  customer?: {
    id: string
    name: string
    company: string | null
  }
}

const taskStatuses = [
  { value: 'PENDING', label: 'Pending', color: 'bg-gray-100 text-gray-800', icon: '⏳' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-100 text-blue-800', icon: '🔄' },
  { value: 'COMPLETED', label: 'Completed', color: 'bg-green-100 text-green-800', icon: '✅' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: '❌' },
]

const taskPriorities = [
  { value: 'LOW', label: 'Low', color: 'bg-green-100 text-green-800', icon: '🔽' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-yellow-100 text-yellow-800', icon: '➡️' },
  { value: 'HIGH', label: 'High', color: 'bg-orange-100 text-orange-800', icon: '🔼' },
  { value: 'URGENT', label: 'Urgent', color: 'bg-red-100 text-red-800', icon: '🚨' },
]

export default function TasksPage() {
  const confirm = useConfirm()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'ALL'>('ALL')
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'ALL'>('ALL')
  const [filterAssignee, setFilterAssignee] = useState<string>('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchTasks()
    }
  }, [user])

  const fetchTasks = async () => {
    try {
      const data = await apiClient.get('/api/tasks')
      
      if (Array.isArray(data)) {
        setTasks(data)
      } else {
        console.error('API returned non-array data:', data)
        // If it's an error object, log it more specifically
        if (data && typeof data === 'object' && 'error' in data) {
          console.error('API Error:', (data as any).error)
        }
        setTasks([])
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  const addTask = async (taskData: any) => {
    try {
      await apiClient.post('/api/tasks', {
        ...taskData,
        createdById: user?.id || 'user-1',
      })

      fetchTasks()
      setShowAddForm(false)
    } catch (error) {
      console.error('Failed to add task:', error)
    }
  }

  const updateTask = async (taskData: any) => {
    try {
      if (!editingTask) return
      
      await apiClient.put(`/api/tasks/${editingTask.id}`, taskData)
      
      fetchTasks()
      setShowEditForm(false)
      setEditingTask(null)
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  const updateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await apiClient.put(`/api/tasks/${taskId}`, { 
        status: newStatus,
        ...(newStatus === 'COMPLETED' && { completedAt: new Date().toISOString() })
      })

      fetchTasks()
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setShowEditForm(true)
  }

  const deleteTask = async (taskId: string) => {
    const result = await confirm({
      title: 'Delete Task',
      message: 'Are you sure you want to delete this task? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
      icon: 'delete'
    })
    
    if (!result) return

    try {
      await apiClient.delete(`/api/tasks/${taskId}`)
      fetchTasks()
    } catch (error) {
      console.error('Failed to delete task:', error)
      alert('Failed to delete task. Please try again.')
    }
  }

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filterStatus === 'ALL' || task.status === filterStatus
    const matchesPriority = filterPriority === 'ALL' || task.priority === filterPriority
    const matchesAssignee = filterAssignee === 'ALL' || 
      (filterAssignee === 'ME' && task.assignedTo?.id === user?.id) ||
      (filterAssignee === 'UNASSIGNED' && !task.assignedTo) ||
      task.assignedTo?.id === filterAssignee
    const matchesSearch = searchTerm === '' ||
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.lead?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.customer?.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesStatus && matchesPriority && matchesAssignee && matchesSearch
  })

  const getTasksByStatus = (status: TaskStatus) => {
    return filteredTasks.filter(task => task.status === status)
  }

  const getStatusInfo = (status: TaskStatus) => {
    return taskStatuses.find(s => s.value === status) || taskStatuses[0]
  }

  const getPriorityInfo = (priority: TaskPriority) => {
    return taskPriorities.find(p => p.value === priority) || taskPriorities[0]
  }

  const isOverdue = (task: Task) => {
    if (!task.dueDate || task.status === 'COMPLETED' || task.status === 'CANCELLED') return false
    return new Date(task.dueDate) < new Date()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-700">Loading tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <NavBar currentPage="tasks" />

        <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          {/* Mobile-first Header */}
          <div className="flex flex-col space-y-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Task Management</h1>
                <p className="text-sm sm:text-base text-gray-600">Total: {filteredTasks.length} tasks</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center justify-center min-h-[44px] transition-colors"
                >
                  <span className="mr-2">🔍</span>
                  <span className="hidden sm:inline">Filters</span>
                  <span className="sm:hidden">Filter</span>
                </button>
                
                <div className="flex bg-white border border-gray-300 rounded-md">
                  <button
                    onClick={() => setViewMode('board')}
                    className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-l-md ${
                      viewMode === 'board' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="hidden sm:inline">Board</span>
                    <span className="sm:hidden">📋</span>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-r-md border-l ${
                      viewMode === 'list' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-700 hover:bg-gray-50 border-gray-300'
                    }`}
                  >
                    <span className="hidden sm:inline">List</span>
                    <span className="sm:hidden">☰</span>
                  </button>
                </div>
                
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center justify-center"
                >
                  <span className="mr-2">+</span>
                  <span className="hidden sm:inline">Add Task</span>
                  <span className="sm:hidden">Add</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile-optimized Filters */}
          {showFilters && (
            <div className="bg-white p-4 rounded-lg shadow mb-6 border border-gray-200">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <input
                    type="text"
                    placeholder="Search tasks, contacts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as TaskStatus | 'ALL')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="ALL">All Status</option>
                      {taskStatuses.map(status => (
                        <option key={status.value} value={status.value}>
                          {status.icon} {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value as TaskPriority | 'ALL')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="ALL">All Priorities</option>
                      {taskPriorities.map(priority => (
                        <option key={priority.value} value={priority.value}>
                          {priority.icon} {priority.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assignee</label>
                    <select
                      value={filterAssignee}
                      onChange={(e) => setFilterAssignee(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="ALL">All Assignees</option>
                      <option value="ME">My Tasks</option>
                      <option value="UNASSIGNED">Unassigned</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setFilterStatus('ALL')
                      setFilterPriority('ALL')
                      setFilterAssignee('ALL')
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 border border-gray-300 text-sm"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Board View */}
          {viewMode === 'board' && (
            <>
              {/* Mobile: Stack columns vertically */}
              <div className="block md:hidden space-y-6">
                {taskStatuses.map(statusColumn => (
                  <div key={statusColumn.value} className={`${statusColumn.color} bg-opacity-20 rounded-lg p-4 border-2`}>
                    <h3 className={`font-semibold mb-4 text-gray-900 text-sm sm:text-base`}>
                      {statusColumn.icon} {statusColumn.label} ({getTasksByStatus(statusColumn.value as TaskStatus).length})
                    </h3>
                    
                    <div className="space-y-3">
                      {getTasksByStatus(statusColumn.value as TaskStatus).map(task => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onStatusChange={updateTaskStatus}
                          onEdit={handleEditTask}
                          onDelete={deleteTask}
                          getStatusInfo={getStatusInfo}
                          getPriorityInfo={getPriorityInfo}
                          isOverdue={isOverdue}
                        />
                      ))}
                      {getTasksByStatus(statusColumn.value as TaskStatus).length === 0 && (
                        <div className="text-center py-6 text-gray-500 text-sm">
                          No {statusColumn.label.toLowerCase()} tasks
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Desktop: Grid layout */}
              <div className="hidden md:block">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {taskStatuses.map(statusColumn => (
                    <div key={statusColumn.value} className={`${statusColumn.color} bg-opacity-20 rounded-lg p-4 min-h-96 border-2`}>
                      <h3 className={`font-semibold mb-4 text-gray-900`}>
                        {statusColumn.icon} {statusColumn.label} ({getTasksByStatus(statusColumn.value as TaskStatus).length})
                      </h3>
                      
                      <div className="space-y-3">
                        {getTasksByStatus(statusColumn.value as TaskStatus).map(task => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onStatusChange={updateTaskStatus}
                            onEdit={handleEditTask}
                            onDelete={deleteTask}
                            getStatusInfo={getStatusInfo}
                            getPriorityInfo={getPriorityInfo}
                            isOverdue={isOverdue}
                          />
                        ))}
                        {getTasksByStatus(statusColumn.value as TaskStatus).length === 0 && (
                          <div className="text-center py-6 text-gray-500 text-sm">
                            No {statusColumn.label.toLowerCase()} tasks
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <TaskList 
              tasks={filteredTasks}
              onStatusChange={updateTaskStatus}
              onEdit={handleEditTask}
              onDelete={deleteTask}
              getStatusInfo={getStatusInfo}
              getPriorityInfo={getPriorityInfo}
              isOverdue={isOverdue}
            />
          )}

          {/* No Results */}
          {filteredTasks.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-4xl text-gray-400 mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || filterStatus !== 'ALL' || filterPriority !== 'ALL' || filterAssignee !== 'ALL'
                  ? 'Try adjusting your search criteria' 
                  : 'Start organizing work by creating your first task'}
              </p>
              {!searchTerm && filterStatus === 'ALL' && filterPriority === 'ALL' && filterAssignee === 'ALL' && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700"
                >
                  Create First Task
                </button>
              )}
            </div>
          )}
        </main>

        {/* Add Task Modal */}
        {showAddForm && (
          <AddTaskModal 
            onAdd={addTask} 
            onClose={() => setShowAddForm(false)}
            taskStatuses={taskStatuses}
            taskPriorities={taskPriorities}
            currentUser={user}
          />
        )}

        {showEditForm && editingTask && (
          <EditTaskModal 
            task={editingTask}
            onEdit={updateTask} 
            onClose={() => {
              setShowEditForm(false)
              setEditingTask(null)
            }}
            taskStatuses={taskStatuses}
            taskPriorities={taskPriorities}
            currentUser={user}
          />
        )}
      </div>
    </AuthGuard>
  )
}

// Task Card Component
function TaskCard({ task, onStatusChange, onEdit, onDelete, getStatusInfo, getPriorityInfo, isOverdue }: {
  task: Task
  onStatusChange: (id: string, status: TaskStatus) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  getStatusInfo: (status: TaskStatus) => any
  getPriorityInfo: (priority: TaskPriority) => any
  isOverdue: (task: Task) => boolean
}) {
  const [showMenu, setShowMenu] = useState(false)
  const statusInfo = getStatusInfo(task.status)
  const priorityInfo = getPriorityInfo(task.priority)
  const overdue = isOverdue(task)

  return (
    <div className={`bg-white p-3 sm:p-4 rounded-md shadow-sm border-2 hover:shadow-md transition-shadow relative ${
      overdue ? 'border-red-300 bg-red-50' : 'border-gray-200'
    }`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 min-w-0 pr-2">
          <h4 className="font-medium text-gray-900 text-sm sm:text-base leading-tight">{task.title}</h4>
          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityInfo.color}`}>
              {priorityInfo.icon} <span className="ml-1">{priorityInfo.label}</span>
            </span>
            {overdue && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                🔥 <span className="ml-1">Overdue</span>
              </span>
            )}
          </div>
        </div>
        
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="text-gray-400 hover:text-gray-600 p-2 -m-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <span className="text-lg">⋮</span>
        </button>
      </div>
      
      {task.description && (
        <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">{task.description}</p>
      )}
      
      <div className="space-y-2 text-xs sm:text-sm text-gray-500">
        {task.assignedTo && (
          <div className="flex items-center">
            <span className="mr-2 text-sm">👤</span>
            <span className="truncate">{task.assignedTo.name}</span>
          </div>
        )}
        
        {task.lead && (
          <div className="flex items-center">
            <span className="mr-2 text-sm">🎯</span>
            <span className="truncate">Lead: {task.lead.name}</span>
          </div>
        )}
        
        {task.customer && (
          <div className="flex items-center">
            <span className="mr-2 text-sm">🤝</span>
            <span className="truncate">Customer: {task.customer.name}</span>
          </div>
        )}
        
        {task.dueDate && (
          <div className={`flex items-center ${overdue ? 'text-red-600 font-medium' : ''}`}>
            <span className="mr-2 text-sm">📅</span>
            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Actions Menu */}
      {showMenu && (
        <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-md shadow-lg z-20 min-w-40 sm:min-w-44">
          <button
            onClick={() => {
              onEdit(task)
              setShowMenu(false)
            }}
            className="block w-full text-left px-4 py-3 sm:py-2 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100 min-h-[44px] flex items-center"
          >
            <span className="mr-2">✏️</span>
            Edit Task
          </button>
          <button
            onClick={() => {
              onDelete(task.id)
              setShowMenu(false)
            }}
            className="block w-full text-left px-4 py-3 sm:py-2 text-sm text-red-600 hover:bg-red-50 border-b border-gray-100 min-h-[44px] flex items-center"
          >
            <span className="mr-2">🗑️</span>
            Delete Task
          </button>
          <div className="py-1">
            <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
              Change Status
            </div>
            {taskStatuses
              .filter(status => status.value !== task.status)
              .map(status => (
                <button
                  key={status.value}
                  onClick={() => { 
                    onStatusChange(task.id, status.value as TaskStatus)
                    setShowMenu(false)
                  }}
                  className="block w-full text-left px-4 py-3 sm:py-2 text-sm text-gray-700 hover:bg-gray-50 min-h-[44px] flex items-center"
                >
                  <span className="mr-2">{status.icon}</span>
                  {status.label}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

// List View Component
function TaskList({ tasks, onStatusChange, onEdit, onDelete, getStatusInfo, getPriorityInfo, isOverdue }: {
  tasks: Task[]
  onStatusChange: (id: string, status: TaskStatus) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  getStatusInfo: (status: TaskStatus) => any
  getPriorityInfo: (priority: TaskPriority) => any
  isOverdue: (task: Task) => boolean
}) {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
      <ul className="divide-y divide-gray-200">
        {tasks.map((task) => {
          const statusInfo = getStatusInfo(task.status)
          const priorityInfo = getPriorityInfo(task.priority)
          const overdue = isOverdue(task)
          
          return (
            <li key={task.id} className={`px-4 py-4 hover:bg-gray-50 ${overdue ? 'bg-red-50' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${statusInfo.color}`}>
                    <span className="text-sm">{statusInfo.icon}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {task.title}
                      </p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityInfo.color}`}>
                        {priorityInfo.icon}
                      </span>
                      {overdue && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          🔥 Overdue
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs text-gray-500">
                      <span>{statusInfo.label}</span>
                      {task.assignedTo && <span>👤 {task.assignedTo.name}</span>}
                      {task.dueDate && (
                        <span className={overdue ? 'text-red-600 font-medium' : ''}>
                          📅 {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                      {task.lead && <span>🎯 {task.lead.name}</span>}
                      {task.customer && <span>🤝 {task.customer.name}</span>}
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                    )}
                  </div>
                </div>
                
                <div className="ml-4 flex items-center space-x-2 flex-shrink-0">
                  <select
                    value={task.status}
                    onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
                    className="text-xs border border-gray-300 rounded px-2 py-1 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {taskStatuses.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.icon} {status.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => onEdit(task)}
                    className="text-xs text-gray-600 hover:text-gray-800 border border-gray-300 rounded px-2 py-1"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => onDelete(task.id)}
                    className="text-xs text-red-600 hover:text-red-800 border border-red-300 rounded px-2 py-1"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// Task Modal Components at the end of file

function EditTaskModal({ task, onEdit, onClose, taskStatuses, taskPriorities, currentUser }: {
  task: Task
  onEdit: (data: unknown) => void
  onClose: () => void
  taskStatuses: Array<{value: string, label: string, color: string, icon: string}>
  taskPriorities: Array<{value: string, label: string, color: string, icon: string}>
  currentUser: unknown
}) {
  const [formData, setFormData] = useState({
    title: task.title || '',
    description: task.description || '',
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '',
    assignedToId: task.assignedToId || '',
    leadId: task.leadId || '',
    customerId: task.customerId || '',
  })

  const [leads, setLeads] = useState([])
  const [customers, setCustomers] = useState([])
  const [users, setUsers] = useState([])

  useEffect(() => {
    // Fetch leads, customers, and users for assignment
    Promise.all([
      apiClient.get('/api/leads').catch(() => []),
      apiClient.get('/api/customers').catch(() => []),
      apiClient.get('/api/users').catch(() => [])
    ]).then(([leadsData, customersData, usersData]) => {
      setLeads(Array.isArray(leadsData) ? leadsData : [])
      setCustomers(Array.isArray(customersData) ? customersData : [])
      setUsers(Array.isArray(usersData) ? usersData : [])
    })
  }, [])

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const submitData = {
      ...formData,
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
      assignedToId: formData.assignedToId || null,
      leadId: formData.leadId || null,
      customerId: formData.customerId || null,
    }
    
    onEdit(submitData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[95vh] sm:max-h-screen overflow-y-auto">
        <div className="p-4 sm:p-6">
          {/* Mobile-friendly header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Edit Task</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center sm:hidden"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleEditSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm border p-3 sm:p-2 text-base sm:text-sm text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-h-[44px]"
                placeholder="Task title"
              />
            </div>
            
            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm border p-3 sm:p-2 text-base sm:text-sm text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-h-[100px] resize-y"
                rows={3}
                placeholder="Task details and requirements"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                  className="block w-full rounded-md border-gray-300 shadow-sm border p-3 sm:p-2 text-base sm:text-sm text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-h-[44px]"
                >
                  {taskPriorities.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.icon} {priority.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                  className="block w-full rounded-md border-gray-300 shadow-sm border p-3 sm:p-2 text-base sm:text-sm text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-h-[44px]"
                >
                  {taskStatuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.icon} {status.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Due Date</label>
                <input
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="block w-full rounded-md border-gray-300 shadow-sm border p-3 sm:p-2 text-base sm:text-sm text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-h-[44px]"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Assign To</label>
                <select
                  value={formData.assignedToId}
                  onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
                  className="block w-full rounded-md border-gray-300 shadow-sm border p-3 sm:p-2 text-base sm:text-sm text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-h-[44px]"
                >
                  <option value="">Select User</option>
                  {users.map((user: {id: string, name: string, role: string}) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Link to Lead</label>
                <select
                  value={formData.leadId}
                  onChange={(e) => setFormData({ ...formData, leadId: e.target.value, customerId: e.target.value ? '' : formData.customerId })}
                  className="block w-full rounded-md border-gray-300 shadow-sm border p-3 sm:p-2 text-base sm:text-sm text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-h-[44px]"
                >
                  <option value="">Select Lead</option>
                  {leads.map((lead: {id: string, name: string, company?: string}) => (
                    <option key={lead.id} value={lead.id}>
                      {lead.name} {lead.company && `(${lead.company})`}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Link to Customer</label>
                <select
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value, leadId: e.target.value ? '' : formData.leadId })}
                  className="block w-full rounded-md border-gray-300 shadow-sm border p-3 sm:p-2 text-base sm:text-sm text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-h-[44px]"
                >
                  <option value="">Select Customer</option>
                  {customers.map((customer: {id: string, name: string, company?: string}) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} {customer.company && `(${customer.company})`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 sm:py-2 text-base sm:text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 min-h-[44px] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 sm:py-2 text-base sm:text-sm font-medium bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[44px] transition-colors"
              >
                Update Task
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="p-4 sm:p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Create New Task</h2>
          
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm border p-3 sm:p-2 text-base sm:text-sm text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-h-[44px]"
                placeholder="Task title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm border p-3 sm:p-2 text-base sm:text-sm text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-h-[44px]"
                rows={3}
                placeholder="Task details and requirements"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                  className="block w-full rounded-md border-gray-300 shadow-sm border p-3 sm:p-2 text-base sm:text-sm text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-h-[44px]"
                >
                  {taskPriorities.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.icon} {priority.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                  className="block w-full rounded-md border-gray-300 shadow-sm border p-3 sm:p-2 text-base sm:text-sm text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-h-[44px]"
                >
                  {taskStatuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.icon} {status.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Due Date</label>
                <input
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="block w-full rounded-md border-gray-300 shadow-sm border p-3 sm:p-2 text-base sm:text-sm text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-h-[44px]"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Assign To</label>
                <select
                  value={formData.assignedToId}
                  onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
                  className="block w-full rounded-md border-gray-300 shadow-sm border p-3 sm:p-2 text-base sm:text-sm text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-h-[44px]"
                >
                  <option value="">Select User</option>
                  <option value="user-1">Me (Demo User)</option>
                  {users.filter((user: any) => user.id !== 'user-1').map((user: any) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Link to Lead</label>
                <select
                  value={formData.leadId}
                  onChange={(e) => setFormData({ ...formData, leadId: e.target.value, customerId: e.target.value ? '' : formData.customerId })}
                  className="block w-full rounded-md border-gray-300 shadow-sm border p-3 sm:p-2 text-base sm:text-sm text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-h-[44px]"
                >
                  <option value="">Select Lead</option>
                  {leads.map((lead: {id: string, name: string, company?: string}) => (
                    <option key={lead.id} value={lead.id}>
                      {lead.name} {lead.company && `(${lead.company})`}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Link to Customer</label>
                <select
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value, leadId: e.target.value ? '' : formData.leadId })}
                  className="block w-full rounded-md border-gray-300 shadow-sm border p-3 sm:p-2 text-base sm:text-sm text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-h-[44px]"
                >
                  <option value="">Select Customer</option>
                  {customers.map((customer: {id: string, name: string, company?: string}) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} {customer.company && `(${customer.company})`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 sm:py-2 text-base sm:text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 min-h-[44px] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 sm:py-2 text-base sm:text-sm font-medium bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[44px] transition-colors"
              >
                Update Task
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// Add Task Modal - Formik Version
function AddTaskModal({ onAdd, onClose, taskStatuses, taskPriorities, currentUser }: {
  onAdd: (data: unknown) => void
  onClose: () => void
  taskStatuses: Array<{value: string, label: string, color: string, icon: string}>
  taskPriorities: Array<{value: string, label: string, color: string, icon: string}>
  currentUser: unknown
}) {
  const [error, setError] = useState('')
  const [leads, setLeads] = useState([])
  const [customers, setCustomers] = useState([])
  const [users, setUsers] = useState([])

  useEffect(() => {
    // Fetch leads, customers, and users for assignment
    Promise.all([
      apiClient.get('/api/leads').catch(() => []),
      apiClient.get('/api/customers').catch(() => []),
      apiClient.get('/api/users').catch(() => [])
    ]).then(([leadsData, customersData, usersData]) => {
      setLeads(Array.isArray(leadsData) ? leadsData : [])
      setCustomers(Array.isArray(customersData) ? customersData : [])
      setUsers(Array.isArray(usersData) ? usersData : [])
    })
  }, [])

  const validationSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    description: Yup.string().nullable(),
    status: Yup.string().required('Status is required'),
    priority: Yup.string().required('Priority is required'),
    dueDate: Yup.string().nullable(),
    assignedToId: Yup.string().nullable(),
    leadId: Yup.string().nullable(),
    customerId: Yup.string().nullable(),
  })

  const initialValues = {
    title: '',
    description: '',
    status: 'PENDING' as TaskStatus,
    priority: 'MEDIUM' as TaskPriority,
    dueDate: '',
    assignedToId: '',
    leadId: '',
    customerId: '',
  }

  const handleSubmit = async (values: typeof initialValues, { setSubmitting }: any) => {
    try {
      setError('')
      const submitData = {
        ...values,
        dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
        assignedToId: values.assignedToId || null,
        leadId: values.leadId || null,
        customerId: values.customerId || null,
      }
      await onAdd(submitData)
    } catch (err: any) {
      setError(err.message || 'Failed to create task')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="p-4 sm:p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Create New Task</h2>
          
          <FormWrapper
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, values, setFieldValue }: any) => (
              <>
                <FormErrorMessage message={error} />
                
                <FormField name="title" label="Title" required placeholder="Task title" />
                <FormField name="description" label="Description" as="textarea" rows={3} placeholder="Task details and requirements" />
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField name="priority" label="Priority" as="select">
                    {taskPriorities.map(priority => (
                      <option key={priority.value} value={priority.value}>
                        {priority.icon} {priority.label}
                      </option>
                    ))}
                  </FormField>
                  
                  <FormField name="status" label="Status" as="select">
                    {taskStatuses.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.icon} {status.label}
                      </option>
                    ))}
                  </FormField>
                  
                  <FormField name="dueDate" label="Due Date" type="datetime-local" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField name="assignedToId" label="Assign To" as="select">
                    <option value="">Select User</option>
                    {users.map((user: {id: string, name: string, role: string}) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </option>
                    ))}
                  </FormField>
                  
                  <FormField 
                    name="leadId" 
                    label="Link to Lead" 
                    as="select"
                    onChange={(e: any) => {
                      setFieldValue('leadId', e.target.value)
                      if (e.target.value) setFieldValue('customerId', '')
                    }}
                  >
                    <option value="">Select Lead</option>
                    {leads.map((lead: {id: string, name: string, company?: string}) => (
                      <option key={lead.id} value={lead.id}>
                        {lead.name} {lead.company && `(${lead.company})`}
                      </option>
                    ))}
                  </FormField>
                  
                  <FormField 
                    name="customerId" 
                    label="Link to Customer" 
                    as="select"
                    onChange={(e: any) => {
                      setFieldValue('customerId', e.target.value)
                      if (e.target.value) setFieldValue('leadId', '')
                    }}
                  >
                    <option value="">Select Customer</option>
                    {customers.map((customer: {id: string, name: string, company?: string}) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} {customer.company && `(${customer.company})`}
                      </option>
                    ))}
                  </FormField>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6">
                  <FormButton 
                    type="button" 
                    variant="secondary" 
                    onClick={onClose}
                    className="w-full sm:w-auto min-h-[44px]"
                  >
                    Cancel
                  </FormButton>
                  <FormButton 
                    type="submit" 
                    variant="primary" 
                    loading={isSubmitting}
                    className="w-full sm:w-auto min-h-[44px] bg-purple-600 hover:bg-purple-700 focus:ring-purple-500"
                  >
                    Create Task
                  </FormButton>
                </div>
              </>
            )}
          </FormWrapper>
        </div>
      </div>
    </div>
  )
}