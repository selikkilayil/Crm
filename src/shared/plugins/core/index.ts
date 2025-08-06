// Lead Management Plugins
export { 
  LeadScoringPlugin, 
  LeadAutoAssignmentPlugin, 
  LeadEnrichmentPlugin 
} from './LeadPlugins'

// Reporting Plugins
export { 
  SalesAnalyticsPlugin, 
  CustomDashboardPlugin, 
  AutomatedReportingPlugin 
} from './ReportPlugins'

// Integration Plugins
export { 
  EmailMarketingPlugin, 
  CrmIntegrationPlugin, 
  AccountingIntegrationPlugin, 
  CalendarIntegrationPlugin 
} from './IntegrationPlugins'

// Plugin registration helper
import { pluginManager } from '../PluginManager'
import { 
  LeadScoringPlugin, 
  LeadAutoAssignmentPlugin, 
  LeadEnrichmentPlugin 
} from './LeadPlugins'
import { 
  SalesAnalyticsPlugin, 
  CustomDashboardPlugin, 
  AutomatedReportingPlugin 
} from './ReportPlugins'
import { 
  EmailMarketingPlugin, 
  CrmIntegrationPlugin, 
  AccountingIntegrationPlugin, 
  CalendarIntegrationPlugin 
} from './IntegrationPlugins'

export function registerCorePlugins(): void {
  // Lead Management Plugins
  pluginManager.register(new LeadScoringPlugin())
  pluginManager.register(new LeadAutoAssignmentPlugin())
  pluginManager.register(new LeadEnrichmentPlugin())

  // Reporting Plugins
  pluginManager.register(new SalesAnalyticsPlugin())
  pluginManager.register(new CustomDashboardPlugin())
  pluginManager.register(new AutomatedReportingPlugin())

  // Integration Plugins
  pluginManager.register(new EmailMarketingPlugin())
  pluginManager.register(new CrmIntegrationPlugin())
  pluginManager.register(new AccountingIntegrationPlugin())
  pluginManager.register(new CalendarIntegrationPlugin())

  console.log('Core CRM plugins registered')
}

// Initialize all core plugins
export async function initializeCorePlugins(): Promise<void> {
  registerCorePlugins()
  await pluginManager.initialize()
  console.log('Core CRM plugins initialized')
}