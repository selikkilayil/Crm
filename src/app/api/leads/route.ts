import { NextRequest } from 'next/server'
import { LeadHandlers } from '@/domains/leads'

export async function GET(request: NextRequest) {
  return LeadHandlers.getLeads(request)
}

export async function POST(request: NextRequest) {
  return LeadHandlers.createLead(request)
}