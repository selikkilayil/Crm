'use client'

import { useState } from 'react'
import { TaskStatus, TaskPriority } from '@prisma/client'
import { useConfirm } from '@/lib/confirmation-context'
import { AuthGuard, NavBar } from '@/shared/components'
import { useAuth } from '@/shared/hooks'
import {
  TaskBoard,
  TaskList,
  TaskForm,
  useTasks,
  taskStatuses,
  taskPriorities,
  Task,
  TaskStatusFilter,
  TaskPriorityFilter,
  TaskViewMode
} from '@/modules/tasks'

export default function TasksPage() {
  const confirm = useConfirm()
  const { user } = useAuth()
  const { tasks, loading, addTask, updateTask, updateTaskStatus, removeTask } = useTasks(user?.id)
  const [viewMode, setViewMode] = useState<TaskViewMode>('board')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filterStatus, setFilterStatus] = useState<TaskStatusFilter>('ALL')
  const [filterPriority, setFilterPriority] = useState<TaskPriorityFilter>('ALL')
  const [filterAssignee, setFilterAssignee] = useState<string>('ALL')
  const [searchTerm, setSearchTerm] = useState('')

  const handleCreateTask = async (taskData: any) => {
    try {
      await addTask(taskData, user?.id || 'user-1')
      setShowAddForm(false)
    } catch (error) {
      console.error('Failed to add task:', error)
      throw error
    }
  }

  const handleUpdateTask = async (taskData: any) => {
    try {
      if (!editingTask) return
      
      await updateTask(editingTask.id, taskData)
      setShowEditForm(false)
      setEditingTask(null)
    } catch (error) {
      console.error('Failed to update task:', error)
      throw error
    }
  }

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus)
    } catch (error) {
      console.error('Failed to update task status:', error)
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setShowEditForm(true)
  }

  const handleDeleteTask = async (taskId: string) => {
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
      await removeTask(taskId)
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
            <TaskBoard 
              tasks={filteredTasks}
              onStatusChange={handleStatusChange}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              getStatusInfo={getStatusInfo}
              getPriorityInfo={getPriorityInfo}
              isOverdue={isOverdue}
            />
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <TaskList 
              tasks={filteredTasks}
              onStatusChange={handleStatusChange}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
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
          <TaskForm 
            onSubmit={handleCreateTask} 
            onClose={() => setShowAddForm(false)}
            title="Create New Task"
            submitLabel="Create Task"
          />
        )}

        {showEditForm && editingTask && (
          <TaskForm 
            initialData={editingTask}
            onSubmit={handleUpdateTask} 
            onClose={() => {
              setShowEditForm(false)
              setEditingTask(null)
            }}
            title="Edit Task"
            submitLabel="Update Task"
          />
        )}
      </div>
    </AuthGuard>
  )
}
