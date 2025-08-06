import { Plugin, PluginHooks } from '../PluginManager'

// Sales Performance Analytics Plugin
export class SalesAnalyticsPlugin implements Plugin {
  id = 'sales-analytics'
  name = 'Sales Performance Analytics'
  version = '1.0.0'
  description = 'Generates comprehensive sales performance reports and analytics'
  enabled = true

  private reportingData = {
    leadConversions: new Map(),
    quotationWinRates: new Map(),
    salesPerformance: new Map()
  }

  hooks: PluginHooks = {
    afterLeadUpdate: this.trackLeadProgress.bind(this),
    afterQuotationCreate: this.trackQuotationCreated.bind(this),
    afterQuotationSend: this.trackQuotationSent.bind(this)
  }

  async initialize(): Promise<void> {
    console.log('Sales Analytics Plugin initialized')
    // TODO: Load historical data for analytics
  }

  private async trackLeadProgress(lead: any, changes: any): Promise<void> {
    if (changes.status) {
      const conversionData = {
        leadId: lead.id,
        fromStatus: changes.previousData?.status,
        toStatus: lead.status,
        timestamp: new Date(),
        assignedUserId: lead.assignedUserId
      }

      this.reportingData.leadConversions.set(lead.id, conversionData)
      
      // Generate conversion metrics
      if (lead.status === 'CONVERTED') {
        await this.generateConversionReport(lead)
      }

      console.log('Lead progress tracked:', conversionData)
    }
  }

  private async trackQuotationCreated(quotation: any): Promise<void> {
    const quotationData = {
      quotationId: quotation.id,
      customerId: quotation.customerId,
      amount: quotation.totalAmount,
      createdAt: new Date(),
      status: quotation.status
    }

    this.reportingData.quotationWinRates.set(quotation.id, quotationData)
    console.log('Quotation creation tracked:', quotationData)
  }

  private async trackQuotationSent(quotation: any): Promise<void> {
    const existingData = this.reportingData.quotationWinRates.get(quotation.id)
    if (existingData) {
      existingData.sentAt = new Date()
      console.log('Quotation sent tracked:', existingData)
    }
  }

  private async generateConversionReport(lead: any): Promise<void> {
    // TODO: Generate detailed conversion analytics
    console.log(`Conversion report generated for lead ${lead.name}`)
  }

  // Public method to get analytics data
  async getAnalytics(timeRange: 'week' | 'month' | 'quarter' = 'month'): Promise<any> {
    const now = new Date()
    const startDate = new Date()
    
    switch (timeRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3)
        break
    }

    return {
      leadConversions: this.calculateConversionRates(startDate, now),
      quotationWinRates: this.calculateWinRates(startDate, now),
      salesPerformance: this.calculateSalesPerformance(startDate, now)
    }
  }

  private calculateConversionRates(startDate: Date, endDate: Date): any {
    // Mock implementation
    return {
      totalLeads: 150,
      convertedLeads: 23,
      conversionRate: 15.3,
      averageConversionTime: '14 days'
    }
  }

  private calculateWinRates(startDate: Date, endDate: Date): any {
    // Mock implementation
    return {
      totalQuotations: 45,
      wonQuotations: 18,
      winRate: 40.0,
      averageQuotationValue: 15000
    }
  }

  private calculateSalesPerformance(startDate: Date, endDate: Date): any {
    // Mock implementation
    return {
      totalRevenue: 270000,
      averageDealSize: 15000,
      salesCycleLength: '21 days',
      topPerformers: [
        { userId: 'user1', deals: 8, revenue: 120000 },
        { userId: 'user2', deals: 6, revenue: 90000 }
      ]
    }
  }
}

// Custom Dashboard Plugin
export class CustomDashboardPlugin implements Plugin {
  id = 'custom-dashboard'
  name = 'Custom Dashboard Widgets'
  version = '1.0.0'
  description = 'Provides customizable dashboard widgets for key metrics'
  enabled = true

  private dashboardWidgets: Map<string, any> = new Map()

  async initialize(): Promise<void> {
    // Initialize default dashboard widgets
    this.registerWidget('lead-funnel', {
      name: 'Lead Funnel',
      type: 'chart',
      refreshInterval: 300000, // 5 minutes
      getData: this.getLeadFunnelData.bind(this)
    })

    this.registerWidget('revenue-trend', {
      name: 'Revenue Trend',
      type: 'line-chart',
      refreshInterval: 600000, // 10 minutes
      getData: this.getRevenueTrendData.bind(this)
    })

    this.registerWidget('top-leads', {
      name: 'Top Scoring Leads',
      type: 'table',
      refreshInterval: 180000, // 3 minutes
      getData: this.getTopLeadsData.bind(this)
    })

    console.log('Custom Dashboard Plugin initialized with default widgets')
  }

  registerWidget(id: string, widget: any): void {
    this.dashboardWidgets.set(id, {
      ...widget,
      id,
      lastUpdated: new Date()
    })
    console.log(`Dashboard widget ${id} registered`)
  }

  async getWidgetData(widgetId: string): Promise<any> {
    const widget = this.dashboardWidgets.get(widgetId)
    if (!widget) {
      throw new Error(`Widget ${widgetId} not found`)
    }

    try {
      const data = await widget.getData()
      widget.lastUpdated = new Date()
      return {
        ...widget,
        data
      }
    } catch (error) {
      console.error(`Error getting data for widget ${widgetId}:`, error)
      throw error
    }
  }

  getAllWidgets(): any[] {
    return Array.from(this.dashboardWidgets.values())
  }

  private async getLeadFunnelData(): Promise<any> {
    // TODO: Get actual lead funnel data from repository
    return {
      stages: [
        { name: 'New', count: 45, percentage: 100 },
        { name: 'Contacted', count: 32, percentage: 71 },
        { name: 'Qualified', count: 18, percentage: 40 },
        { name: 'Converted', count: 8, percentage: 18 }
      ],
      totalLeads: 45
    }
  }

  private async getRevenueTrendData(): Promise<any> {
    // TODO: Get actual revenue data from repository
    const last6Months = []
    const now = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now)
      date.setMonth(date.getMonth() - i)
      
      last6Months.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: Math.floor(Math.random() * 100000) + 50000,
        target: 75000
      })
    }

    return {
      data: last6Months,
      totalRevenue: last6Months.reduce((sum, month) => sum + month.revenue, 0)
    }
  }

  private async getTopLeadsData(): Promise<any> {
    // TODO: Get actual top leads data from repository
    return {
      leads: [
        { id: '1', name: 'Acme Corp', score: 95, value: 50000, status: 'Qualified' },
        { id: '2', name: 'Tech Solutions', score: 88, value: 35000, status: 'Contacted' },
        { id: '3', name: 'Global Industries', score: 82, value: 75000, status: 'Qualified' },
        { id: '4', name: 'StartUp Inc', score: 76, value: 25000, status: 'New' },
        { id: '5', name: 'Enterprise Ltd', score: 71, value: 100000, status: 'Contacted' }
      ]
    }
  }
}

// Automated Reporting Plugin
export class AutomatedReportingPlugin implements Plugin {
  id = 'automated-reporting'
  name = 'Automated Report Generation'
  version = '1.0.0'
  description = 'Generates and sends automated reports on a scheduled basis'
  enabled = true

  private reportSchedules: Map<string, any> = new Map()

  async initialize(): Promise<void> {
    // Schedule default reports
    this.scheduleReport('weekly-sales', {
      name: 'Weekly Sales Report',
      frequency: 'weekly',
      recipients: ['admin@company.com'],
      template: 'sales-summary',
      generateReport: this.generateWeeklySalesReport.bind(this)
    })

    this.scheduleReport('monthly-performance', {
      name: 'Monthly Performance Report',
      frequency: 'monthly',
      recipients: ['management@company.com'],
      template: 'performance-detailed',
      generateReport: this.generateMonthlyPerformanceReport.bind(this)
    })

    console.log('Automated Reporting Plugin initialized')
  }

  scheduleReport(id: string, config: any): void {
    this.reportSchedules.set(id, {
      ...config,
      id,
      lastGenerated: null,
      nextScheduled: this.calculateNextSchedule(config.frequency)
    })
    console.log(`Report ${id} scheduled`)
  }

  private calculateNextSchedule(frequency: string): Date {
    const now = new Date()
    const next = new Date()

    switch (frequency) {
      case 'daily':
        next.setDate(now.getDate() + 1)
        break
      case 'weekly':
        next.setDate(now.getDate() + 7)
        break
      case 'monthly':
        next.setMonth(now.getMonth() + 1)
        break
    }

    return next
  }

  async generateScheduledReports(): Promise<void> {
    const now = new Date()

    for (const report of this.reportSchedules.values()) {
      if (now >= report.nextScheduled) {
        try {
          console.log(`Generating scheduled report: ${report.name}`)
          const reportData = await report.generateReport()
          
          // TODO: Send report to recipients
          console.log(`Report ${report.name} generated and sent to:`, report.recipients)
          
          report.lastGenerated = now
          report.nextScheduled = this.calculateNextSchedule(report.frequency)
          
        } catch (error) {
          console.error(`Error generating report ${report.name}:`, error)
        }
      }
    }
  }

  private async generateWeeklySalesReport(): Promise<any> {
    // TODO: Generate actual weekly sales report data
    return {
      period: 'Last 7 days',
      totalLeads: 23,
      convertedLeads: 4,
      totalQuotations: 8,
      totalRevenue: 45000,
      topPerformer: 'John Doe'
    }
  }

  private async generateMonthlyPerformanceReport(): Promise<any> {
    // TODO: Generate actual monthly performance report data
    return {
      period: 'Last 30 days',
      leadsGenerated: 95,
      conversionRate: 16.8,
      averageDealSize: 18500,
      totalRevenue: 184000,
      goals: {
        revenue: { target: 200000, actual: 184000, achievement: 92 },
        conversions: { target: 20, actual: 16, achievement: 80 }
      }
    }
  }
}