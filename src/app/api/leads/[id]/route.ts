import { NextRequest } from 'next/server'
import { LeadHandlers } from '@/domains/leads'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return LeadHandlers.getLeadById(id)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return LeadHandlers.updateLead(id, request)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return LeadHandlers.deleteLead(id)
}