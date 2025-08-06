import { Plugin, PluginHooks } from '../PluginManager'
import { EventEmitter } from '../../events'

// Lead Scoring Plugin
export class LeadScoringPlugin implements Plugin {
  id = 'lead-scoring'
  name = 'Lead Scoring System'
  version = '1.0.0'
  description = 'Automatically calculates and assigns lead scores based on various factors'
  enabled = true

  hooks: PluginHooks = {
    beforeLeadCreate: this.calculateLeadScore.bind(this),
    afterLeadUpdate: this.recalculateLeadScore.bind(this)
  }

  private async calculateLeadScore(data: any): Promise<any> {
    let score = 0

    // Email domain scoring
    if (data.email) {
      const domain = data.email.split('@')[1]
      const businessDomains = ['company.com', 'business.com', 'corp.com']
      const freeEmailProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com']
      
      if (businessDomains.some(bd => domain.includes(bd))) {
        score += 20
      } else if (!freeEmailProviders.includes(domain)) {
        score += 10
      }
    }

    // Company scoring
    if (data.company && data.company.trim()) {
      score += 15
    }

    // Phone number scoring
    if (data.phone && data.phone.trim()) {
      score += 10
    }

    // Source scoring
    if (data.source) {
      const sourceScores: Record<string, number> = {
        'website': 15,
        'referral': 20,
        'linkedin': 12,
        'cold_call': 5,
        'email_campaign': 8,
        'trade_show': 18
      }
      score += sourceScores[data.source] || 0
    }

    // Add score to lead data
    return {
      ...data,
      score,
      scoringFactors: this.getScoreExplanation(data, score)
    }
  }

  private async recalculateLeadScore(lead: any, changes: any): Promise<void> {
    if (this.shouldRecalculateScore(changes)) {
      const newScore = await this.calculateLeadScore(lead)
      console.log(`Lead score recalculated for ${lead.name}: ${newScore.score}`)
      
      // TODO: Update lead score in database
      // await leadRepository.update(lead.id, { score: newScore.score })
    }
  }

  private shouldRecalculateScore(changes: any): boolean {
    const scoreFactors = ['email', 'company', 'phone', 'source', 'status']
    return scoreFactors.some(factor => factor in changes)
  }

  private getScoreExplanation(data: any, score: number): string[] {
    const factors: string[] = []
    
    if (data.email) {
      const domain = data.email.split('@')[1]
      if (!['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'].includes(domain)) {
        factors.push('Business email domain')
      }
    }
    
    if (data.company) factors.push('Company provided')
    if (data.phone) factors.push('Phone number provided')
    if (data.source) factors.push(`Source: ${data.source}`)
    
    return factors
  }
}

// Lead Auto-Assignment Plugin
export class LeadAutoAssignmentPlugin implements Plugin {
  id = 'lead-auto-assignment'
  name = 'Lead Auto Assignment'
  version = '1.0.0'
  description = 'Automatically assigns leads to sales representatives based on configurable rules'
  enabled = true

  private assignmentRules = {
    byRegion: true,
    byIndustry: true,
    roundRobin: true,
    balanceWorkload: true
  }

  hooks: PluginHooks = {
    beforeLeadCreate: this.autoAssignLead.bind(this)
  }

  private async autoAssignLead(data: any): Promise<any> {
    if (data.assignedUserId) {
      // Already assigned, skip auto-assignment
      return data
    }

    let assignedUserId: string | undefined

    try {
      // Try region-based assignment first
      if (this.assignmentRules.byRegion) {
        assignedUserId = await this.assignByRegion(data)
      }

      // Fall back to industry-based assignment
      if (!assignedUserId && this.assignmentRules.byIndustry) {
        assignedUserId = await this.assignByIndustry(data)
      }

      // Fall back to round-robin assignment
      if (!assignedUserId && this.assignmentRules.roundRobin) {
        assignedUserId = await this.assignRoundRobin(data)
      }

      if (assignedUserId) {
        console.log(`Auto-assigned lead ${data.name} to user ${assignedUserId}`)
        
        // Emit event for assignment
        await EventEmitter.emitGeneric({
          type: 'lead.auto_assigned' as any,
          timestamp: new Date(),
          data: {
            leadName: data.name,
            assignedUserId,
            assignmentReason: 'auto-assignment'
          }
        })
      }

    } catch (error) {
      console.error('Error in lead auto-assignment:', error)
    }

    return {
      ...data,
      assignedUserId: assignedUserId || data.assignedUserId
    }
  }

  private async assignByRegion(data: any): Promise<string | undefined> {
    // Simple region detection based on phone number or company
    // In a real implementation, this would use a proper geo-location service
    
    // TODO: Implement region-based assignment logic
    // const region = await this.detectRegion(data)
    // const salesRep = await this.findSalesRepByRegion(region)
    // return salesRep?.id
    
    return undefined
  }

  private async assignByIndustry(data: any): Promise<string | undefined> {
    if (!data.company) return undefined

    // Simple industry detection based on company name
    const industryKeywords: Record<string, string[]> = {
      'tech': ['tech', 'software', 'digital', 'app', 'platform', 'cloud'],
      'healthcare': ['health', 'medical', 'hospital', 'clinic', 'pharma'],
      'finance': ['bank', 'financial', 'investment', 'insurance', 'credit'],
      'retail': ['retail', 'store', 'shop', 'commerce', 'market']
    }

    const company = data.company.toLowerCase()
    for (const [industry, keywords] of Object.entries(industryKeywords)) {
      if (keywords.some(keyword => company.includes(keyword))) {
        // TODO: Find sales rep specialized in this industry
        // const salesRep = await this.findSalesRepByIndustry(industry)
        // return salesRep?.id
      }
    }

    return undefined
  }

  private async assignRoundRobin(data: any): Promise<string | undefined> {
    // TODO: Implement round-robin assignment logic
    // const salesReps = await this.getActiveSalesReps()
    // const nextRep = await this.getNextInRotation(salesReps)
    // return nextRep?.id
    
    return undefined
  }
}

// Lead Enrichment Plugin
export class LeadEnrichmentPlugin implements Plugin {
  id = 'lead-enrichment'
  name = 'Lead Data Enrichment'
  version = '1.0.0'
  description = 'Enriches lead data with additional information from external sources'
  enabled = false // Disabled by default as it requires external API keys

  hooks: PluginHooks = {
    afterLeadCreate: this.enrichLeadData.bind(this)
  }

  private async enrichLeadData(lead: any): Promise<void> {
    try {
      console.log(`Enriching lead data for ${lead.name}`)

      // Company enrichment
      if (lead.company) {
        const companyData = await this.enrichCompanyData(lead.company)
        console.log('Company data enriched:', companyData)
        
        // TODO: Update lead with enriched company data
        // await leadRepository.update(lead.id, { 
        //   companySize: companyData.size,
        //   industry: companyData.industry,
        //   website: companyData.website 
        // })
      }

      // Social profile enrichment
      if (lead.email) {
        const socialProfiles = await this.findSocialProfiles(lead.email)
        console.log('Social profiles found:', socialProfiles)
        
        // TODO: Store social profile links
      }

    } catch (error) {
      console.error('Error enriching lead data:', error)
    }
  }

  private async enrichCompanyData(companyName: string): Promise<any> {
    // TODO: Integrate with external API (Clearbit, ZoomInfo, etc.)
    // This is a mock implementation
    return {
      size: '50-100 employees',
      industry: 'Technology',
      website: `https://${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
      description: `${companyName} is a technology company.`
    }
  }

  private async findSocialProfiles(email: string): Promise<any> {
    // TODO: Integrate with social profile discovery APIs
    // This is a mock implementation
    return {
      linkedin: `https://linkedin.com/in/${email.split('@')[0]}`,
      twitter: `https://twitter.com/${email.split('@')[0]}`
    }
  }
}