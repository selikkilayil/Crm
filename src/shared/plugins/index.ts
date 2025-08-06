export { PluginManager, pluginManager } from './PluginManager'
export type { Plugin, PluginHooks, PluginContext } from './PluginManager'
export * from './core'

// Initialize the entire plugin system
import { initializeCorePlugins } from './core'
import { initializeEventHandlers } from '../events'

export async function initializePluginSystem(): Promise<void> {
  // Initialize event system first
  initializeEventHandlers()
  
  // Then initialize plugins
  await initializeCorePlugins()
  
  console.log('CRM Plugin System fully initialized')
}

// Cleanup function
export async function destroyPluginSystem(): Promise<void> {
  const { pluginManager } = await import('./PluginManager')
  const { cleanupEventHandlers } = await import('../events')
  
  await pluginManager.destroy()
  cleanupEventHandlers()
  
  console.log('CRM Plugin System destroyed')
}