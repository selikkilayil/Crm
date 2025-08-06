export interface Plugin {
  id: string
  name: string
  version: string
  description?: string
  enabled: boolean
  dependencies?: string[]
  hooks?: PluginHooks
  initialize?(): Promise<void> | void
  destroy?(): Promise<void> | void
}

export interface PluginHooks {
  beforeLeadCreate?: (data: any) => Promise<any> | any
  afterLeadCreate?: (lead: any) => Promise<void> | void
  beforeLeadUpdate?: (id: string, data: any) => Promise<any> | any
  afterLeadUpdate?: (lead: any, changes: any) => Promise<void> | void
  beforeCustomerCreate?: (data: any) => Promise<any> | any
  afterCustomerCreate?: (customer: any) => Promise<void> | void
  beforeQuotationCreate?: (data: any) => Promise<any> | any
  afterQuotationCreate?: (quotation: any) => Promise<void> | void
  beforeQuotationSend?: (quotation: any) => Promise<void> | void
  afterQuotationSend?: (quotation: any) => Promise<void> | void
  beforeTaskCreate?: (data: any) => Promise<any> | any
  afterTaskCreate?: (task: any) => Promise<void> | void
  beforeActivityCreate?: (data: any) => Promise<any> | any
  afterActivityCreate?: (activity: any) => Promise<void> | void
}

export interface PluginContext {
  userId?: string
  userRole?: string
  metadata?: Record<string, any>
}

export class PluginManager {
  private static instance: PluginManager
  private plugins: Map<string, Plugin> = new Map()
  private initialized: boolean = false

  private constructor() {}

  static getInstance(): PluginManager {
    if (!PluginManager.instance) {
      PluginManager.instance = new PluginManager()
    }
    return PluginManager.instance
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return
    }

    // Initialize enabled plugins
    for (const plugin of this.plugins.values()) {
      if (plugin.enabled && plugin.initialize) {
        try {
          await plugin.initialize()
          console.log(`Plugin ${plugin.name} initialized`)
        } catch (error) {
          console.error(`Failed to initialize plugin ${plugin.name}:`, error)
        }
      }
    }

    this.initialized = true
    console.log('Plugin system initialized')
  }

  async destroy(): Promise<void> {
    // Destroy all plugins
    for (const plugin of this.plugins.values()) {
      if (plugin.enabled && plugin.destroy) {
        try {
          await plugin.destroy()
          console.log(`Plugin ${plugin.name} destroyed`)
        } catch (error) {
          console.error(`Failed to destroy plugin ${plugin.name}:`, error)
        }
      }
    }

    this.plugins.clear()
    this.initialized = false
    console.log('Plugin system destroyed')
  }

  register(plugin: Plugin): void {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin with ID ${plugin.id} already exists`)
    }

    // Validate dependencies
    if (plugin.dependencies) {
      for (const depId of plugin.dependencies) {
        if (!this.plugins.has(depId)) {
          throw new Error(`Plugin ${plugin.id} depends on ${depId} which is not registered`)
        }
      }
    }

    this.plugins.set(plugin.id, plugin)
    console.log(`Plugin ${plugin.name} registered`)
  }

  unregister(pluginId: string): void {
    const plugin = this.plugins.get(pluginId)
    if (plugin && plugin.destroy) {
      plugin.destroy()
    }
    this.plugins.delete(pluginId)
    console.log(`Plugin ${pluginId} unregistered`)
  }

  enable(pluginId: string): void {
    const plugin = this.plugins.get(pluginId)
    if (plugin) {
      plugin.enabled = true
      if (this.initialized && plugin.initialize) {
        plugin.initialize()
      }
    }
  }

  disable(pluginId: string): void {
    const plugin = this.plugins.get(pluginId)
    if (plugin) {
      plugin.enabled = false
      if (plugin.destroy) {
        plugin.destroy()
      }
    }
  }

  getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId)
  }

  getEnabledPlugins(): Plugin[] {
    return Array.from(this.plugins.values()).filter(plugin => plugin.enabled)
  }

  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values())
  }

  async executeHook<T = any>(
    hookName: keyof PluginHooks, 
    data: T, 
    context: PluginContext = {}
  ): Promise<T> {
    let result = data

    for (const plugin of this.getEnabledPlugins()) {
      if (plugin.hooks && plugin.hooks[hookName]) {
        try {
          const hookResult = await plugin.hooks[hookName]!(result, context)
          if (hookResult !== undefined) {
            result = hookResult
          }
        } catch (error) {
          console.error(`Error executing hook ${hookName} in plugin ${plugin.name}:`, error)
        }
      }
    }

    return result
  }

  async executeAsyncHook(
    hookName: keyof PluginHooks, 
    data: any, 
    context: PluginContext = {}
  ): Promise<void> {
    const promises = this.getEnabledPlugins()
      .filter(plugin => plugin.hooks && plugin.hooks[hookName])
      .map(async (plugin) => {
        try {
          await plugin.hooks![hookName]!(data, context)
        } catch (error) {
          console.error(`Error executing async hook ${hookName} in plugin ${plugin.name}:`, error)
        }
      })

    await Promise.allSettled(promises)
  }

  hasHook(hookName: keyof PluginHooks): boolean {
    return this.getEnabledPlugins().some(plugin => 
      plugin.hooks && plugin.hooks[hookName]
    )
  }

  getPluginsWithHook(hookName: keyof PluginHooks): Plugin[] {
    return this.getEnabledPlugins().filter(plugin => 
      plugin.hooks && plugin.hooks[hookName]
    )
  }
}

// Global plugin manager instance
export const pluginManager = PluginManager.getInstance()