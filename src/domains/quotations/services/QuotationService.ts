import { prisma } from '@/lib/prisma'
import { QuotationStatus } from '@prisma/client'

export interface CreateQuotationData {
  customerId: string
  validUntil?: string | null
  paymentTerms?: string | null
  deliveryTerms?: string | null
  currency?: string
  notes?: string | null
  termsConditions?: string | null
  items: CreateQuotationItemData[]
  createdById: string
}

export interface CreateQuotationItemData {
  productId?: string | null
  variantId?: string | null
  productName: string
  description?: string | null
  configuration?: any
  quantity: number
  unitPrice: number
  calculatedPrice?: number | null
  discount: number
  taxPercent: number
  notes?: string | null
}

export interface UpdateQuotationData {
  status?: QuotationStatus
  validUntil?: string | null
  paymentTerms?: string | null
  deliveryTerms?: string | null
  currency?: string
  notes?: string | null
  termsConditions?: string | null
  items?: CreateQuotationItemData[]
}

export interface QuotationFilters {
  status?: string
  customerId?: string
  search?: string
}

export class QuotationService {
  async getQuotations(filters: QuotationFilters = {}) {
    const { status, customerId, search } = filters

    const where: any = {}

    if (status && status !== 'all') {
      where.status = status as QuotationStatus
    }

    if (customerId) {
      where.customerId = customerId
    }

    if (search) {
      where.OR = [
        { quotationNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { company: { contains: search, mode: 'insensitive' } } },
      ]
    }

    return prisma.quotation.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
            phone: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  async getQuotationById(id: string) {
    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
            phone: true,
            billingAddress: true,
            shippingAddress: true,
            gstin: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              include: {
                attributes: {
                  include: {
                    options: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })

    if (!quotation) {
      throw new Error('Quotation not found')
    }

    return quotation
  }

  private generateQuotationNumber = async (): Promise<string> => {
    const year = new Date().getFullYear()
    const count = await prisma.quotation.count()
    return `QT-${year}-${String(count + 1).padStart(4, '0')}`
  }

  private calculateQuotationTotals(items: CreateQuotationItemData[]) {
    let subtotal = 0
    let totalTax = 0
    let totalDiscount = 0

    const processedItems = items.map((item) => {
      const quantity = parseFloat(String(item.quantity)) || 0
      const unitPrice = parseFloat(String(item.unitPrice)) || 0
      const discount = parseFloat(String(item.discount)) || 0
      const taxPercent = parseFloat(String(item.taxPercent)) || 0

      const lineSubtotal = quantity * unitPrice
      const discountAmount = (lineSubtotal * discount) / 100
      const taxableAmount = lineSubtotal - discountAmount
      const taxAmount = (taxableAmount * taxPercent) / 100
      const itemTotal = taxableAmount + taxAmount

      subtotal += lineSubtotal
      totalDiscount += discountAmount
      totalTax += taxAmount

      return {
        productId: item.productId || null,
        variantId: item.variantId || null,
        productName: item.productName,
        description: item.description || null,
        configuration: item.configuration || null,
        quantity,
        unitPrice,
        calculatedPrice: item.calculatedPrice ? parseFloat(String(item.calculatedPrice)) : null,
        discount,
        taxPercent,
        subtotal: itemTotal,
        notes: item.notes || null,
      }
    })

    const grandTotal = subtotal - totalDiscount + totalTax

    return {
      processedItems,
      subtotal,
      totalTax,
      totalDiscount,
      grandTotal,
    }
  }

  async createQuotation(data: CreateQuotationData) {
    const quotationNumber = await this.generateQuotationNumber()
    const { processedItems, subtotal, totalTax, totalDiscount, grandTotal } = 
      this.calculateQuotationTotals(data.items)

    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber,
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
        paymentTerms: data.paymentTerms,
        deliveryTerms: data.deliveryTerms,
        currency: data.currency || 'INR',
        subtotal,
        totalTax,
        totalDiscount,
        grandTotal,
        notes: data.notes,
        termsConditions: data.termsConditions,
        customerId: data.customerId,
        createdById: data.createdById,
        items: {
          create: processedItems,
        },
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
            phone: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: true,
      },
    })

    return quotation
  }

  async updateQuotation(id: string, data: UpdateQuotationData) {
    // Check if quotation exists
    const existingQuotation = await prisma.quotation.findUnique({ where: { id } })
    if (!existingQuotation) {
      throw new Error('Quotation not found')
    }

    let updateData: any = {}

    if (data.status !== undefined) {
      updateData.status = data.status as QuotationStatus
    }

    if (data.validUntil !== undefined) {
      updateData.validUntil = data.validUntil ? new Date(data.validUntil) : null
    }

    if (data.paymentTerms !== undefined) updateData.paymentTerms = data.paymentTerms
    if (data.deliveryTerms !== undefined) updateData.deliveryTerms = data.deliveryTerms
    if (data.currency !== undefined) updateData.currency = data.currency
    if (data.notes !== undefined) updateData.notes = data.notes
    if (data.termsConditions !== undefined) updateData.termsConditions = data.termsConditions

    // If items are provided, recalculate totals
    if (data.items && data.items.length > 0) {
      const { processedItems, subtotal, totalTax, totalDiscount, grandTotal } = 
        this.calculateQuotationTotals(data.items)

      updateData.subtotal = subtotal
      updateData.totalTax = totalTax
      updateData.totalDiscount = totalDiscount
      updateData.grandTotal = grandTotal

      // Delete existing items and create new ones
      await prisma.quotationItem.deleteMany({
        where: { quotationId: id },
      })

      updateData.items = {
        create: processedItems,
      }
    }

    const quotation = await prisma.quotation.update({
      where: { id },
      data: updateData,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
            phone: true,
            billingAddress: true,
            shippingAddress: true,
            gstin: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              include: {
                attributes: {
                  include: {
                    options: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })

    return quotation
  }

  async deleteQuotation(id: string) {
    // Check if quotation exists
    const existingQuotation = await prisma.quotation.findUnique({ where: { id } })
    if (!existingQuotation) {
      throw new Error('Quotation not found')
    }

    return prisma.quotation.delete({
      where: { id },
    })
  }

  async duplicateQuotation(quotationId: string, createdById: string) {
    // Get the original quotation
    const originalQuotation = await prisma.quotation.findUnique({
      where: { id: quotationId },
      include: {
        items: true,
      },
    })

    if (!originalQuotation) {
      throw new Error('Quotation not found')
    }

    // Generate new quotation number
    const quotationNumber = await this.generateQuotationNumber()

    // Create duplicate quotation
    const duplicateQuotation = await prisma.quotation.create({
      data: {
        quotationNumber,
        validUntil: originalQuotation.validUntil,
        paymentTerms: originalQuotation.paymentTerms,
        deliveryTerms: originalQuotation.deliveryTerms,
        currency: originalQuotation.currency,
        subtotal: originalQuotation.subtotal,
        totalTax: originalQuotation.totalTax,
        totalDiscount: originalQuotation.totalDiscount,
        grandTotal: originalQuotation.grandTotal,
        notes: originalQuotation.notes,
        termsConditions: originalQuotation.termsConditions,
        customerId: originalQuotation.customerId,
        createdById,
        status: 'DRAFT', // Always start as draft
        items: {
          create: originalQuotation.items.map(item => ({
            productName: item.productName,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            taxPercent: item.taxPercent,
            subtotal: item.subtotal,
          })),
        },
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
            phone: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: true,
      },
    })

    return duplicateQuotation
  }

  async getQuotationForPDF(id: string) {
    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                unit: true,
                category: true,
                productType: true,
              }
            }
          }
        },
        createdBy: true,
      },
    })

    if (!quotation) {
      throw new Error('Quotation not found')
    }

    return quotation
  }

  async getPDFSettings() {
    let settings = await prisma.pDFSettings.findFirst()
    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.pDFSettings.create({
        data: {}
      })
    }
    return settings
  }

  // Convert Prisma Decimal objects to numbers for React PDF
  processQuotationForPDF(quotation: any) {
    return {
      ...quotation,
      subtotal: Number(quotation.subtotal),
      totalTax: Number(quotation.totalTax),
      totalDiscount: Number(quotation.totalDiscount),
      grandTotal: Number(quotation.grandTotal),
      items: quotation.items.map((item: any) => ({
        ...item,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        calculatedPrice: item.calculatedPrice ? Number(item.calculatedPrice) : undefined,
        discount: Number(item.discount),
        taxPercent: Number(item.taxPercent),
        subtotal: Number(item.subtotal),
      }))
    }
  }

  // Convert settings Decimal objects to numbers
  processPDFSettings(settings: any) {
    return {
      ...settings,
      defaultTaxRate: Number(settings.defaultTaxRate)
    }
  }
}