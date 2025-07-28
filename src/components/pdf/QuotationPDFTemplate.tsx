import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

// Define interfaces for the quotation data
interface Customer {
  id: string
  name: string
  email: string
  company?: string
  phone?: string
}

interface QuotationItem {
  id?: string
  productId?: string
  variantId?: string
  productName: string
  description?: string
  configuration?: any
  quantity: number
  unitPrice: number
  calculatedPrice?: number
  discount: number
  taxPercent: number
  subtotal: number
  notes?: string
  product?: {
    id: string
    name: string
    sku?: string
    unit: string
    category?: string
    productType: 'SIMPLE' | 'CONFIGURABLE' | 'CALCULATED'
  }
}

interface Quotation {
  id: string
  quotationNumber: string
  date: string | Date
  validUntil?: string | Date
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED'
  paymentTerms?: string
  deliveryTerms?: string
  currency: string
  subtotal: number
  totalTax: number
  totalDiscount: number
  grandTotal: number
  notes?: string
  termsConditions?: string
  customer: Customer
  createdBy: {
    id: string
    name: string
    email: string
  }
  items: QuotationItem[]
  createdAt: string | Date
  updatedAt: string | Date
}

interface PDFSettings {
  id: string
  companyName: string
  companyAddress: string
  companyPhone: string
  companyEmail: string
  companyWebsite: string
  companyGST: string
  logoUrl?: string | null
  logoText: string
  primaryColor: string
  secondaryColor: string
  textColor: string
  lightBackground: string
  quotationPrefix: string
  quotationNumberFormat: string
  defaultValidityDays: number
  defaultTermsConditions: string
  defaultPaymentTerms: string
  defaultDeliveryTerms: string
  defaultTaxRate: number
  showTaxBreakdown: boolean
  defaultCurrency: string
  currencySymbol: string
  footerText: string
}

interface QuotationPDFTemplateProps {
  quotation: Quotation
  settings: PDFSettings
}

// Create dynamic styles based on settings
const createStyles = (settings: PDFSettings) => StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 0,
  },
  
  // Header Section
  header: {
    backgroundColor: settings.primaryColor,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 40,
    height: 40,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLogoText: {
    color: settings.primaryColor,
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerInfo: {
    flex: 1,
  },
  companyName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  companyDetails: {
    color: '#ffffff',
    fontSize: 9,
    lineHeight: 1.4,
  },
  
  // Content Section
  content: {
    padding: 20,
    flex: 1,
  },
  
  // Quotation Title
  quotationHeader: {
    backgroundColor: settings.lightBackground,
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 5,
    padding: 15,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quotationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: settings.textColor,
  },
  quotationNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: settings.secondaryColor,
  },
  quotationDate: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 5,
  },
  
  // Customer Section
  customerSection: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  customerBox: {
    flex: 1,
    backgroundColor: settings.lightBackground,
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 5,
    padding: 15,
    marginRight: 10,
  },
  detailsBox: {
    flex: 1,
    backgroundColor: settings.lightBackground,
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 5,
    padding: 15,
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: settings.textColor,
    marginBottom: 8,
  },
  customerName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 3,
  },
  customerInfo: {
    fontSize: 10,
    color: '#4b5563',
    marginBottom: 2,
  },
  
  // Items Table
  itemsSection: {
    marginBottom: 20,
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 10,
  },
  tableHeader: {
    backgroundColor: settings.primaryColor,
    flexDirection: 'row',
    padding: 8,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  tableHeaderText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomColor: '#e2e8f0',
    borderBottomWidth: 1,
  },
  tableRowAlt: {
    backgroundColor: '#fafbfc',
  },
  tableCell: {
    fontSize: 10,
    color: '#1f2937',
  },
  tableCellBold: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  tableCellDesc: {
    fontSize: 8,
    color: '#6b7280',
    marginTop: 2,
  },
  productSKU: {
    fontSize: 7,
    color: '#9ca3af',
    marginTop: 1,
    fontStyle: 'italic',
  },
  productCategory: {
    fontSize: 7,
    color: '#9ca3af',
    marginTop: 1,
  },
  configurationSection: {
    marginTop: 3,
    paddingLeft: 5,
  },
  configurationTitle: {
    fontSize: 8,
    color: '#4b5563',
    fontWeight: 'bold',
    marginBottom: 1,
  },
  configurationItem: {
    fontSize: 7,
    color: '#6b7280',
    marginLeft: 5,
    marginBottom: 1,
  },
  productTypeBadge: {
    fontSize: 7,
    color: '#2563eb',
    backgroundColor: '#dbeafe',
    padding: 2,
    marginTop: 2,
    borderRadius: 2,
    textAlign: 'center',
  },
  itemNotes: {
    fontSize: 7,
    color: '#059669',
    marginTop: 2,
    fontStyle: 'italic',
  },
  unitText: {
    fontSize: 7,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 1,
  },
  calculatedPriceNote: {
    fontSize: 7,
    color: '#7c3aed',
    textAlign: 'center',
    marginTop: 1,
    fontStyle: 'italic',
  },
  
  // Column widths
  colDescription: { width: '35%', paddingRight: 5 },
  colQty: { width: '10%', textAlign: 'center' },
  colRate: { width: '15%', textAlign: 'center' },
  colDiscount: { width: '10%', textAlign: 'center' },
  colTax: { width: '10%', textAlign: 'center' },
  colAmount: { width: '20%', textAlign: 'right' },
  
  // Summary Section
  summarySection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  summaryBox: {
    width: 200,
    backgroundColor: settings.lightBackground,
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 5,
    padding: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 10,
    color: '#4b5563',
  },
  summaryValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  summaryDiscount: {
    color: '#059669',
  },
  summaryTax: {
    color: '#2563eb',
  },
  totalRow: {
    backgroundColor: settings.primaryColor,
    borderRadius: 5,
    padding: 8,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  totalValue: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  // Notes Section
  notesSection: {
    backgroundColor: settings.lightBackground,
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 5,
    padding: 15,
    marginBottom: 20,
  },
  notesTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: settings.textColor,
    marginBottom: 8,
  },
  notesText: {
    fontSize: 9,
    color: '#4b5563',
    lineHeight: 1.4,
  },
  
  // Footer
  footer: {
    backgroundColor: settings.primaryColor,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  footerLeft: {
    flex: 1,
  },
  footerRight: {
    alignItems: 'flex-end',
  },
  footerText: {
    color: '#ffffff',
    fontSize: 9,
    marginBottom: 2,
  },
})

const QuotationPDFTemplate: React.FC<QuotationPDFTemplateProps> = ({ quotation, settings }) => {
  const styles = createStyles(settings)
  
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: settings.defaultCurrency,
      currencyDisplay: 'symbol'
    }).format(amount).replace(/^[^\d-]*/, settings.currencySymbol)
  }

  const formatDate = (dateInput: string | Date): string => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const calculateItemTotal = (item: QuotationItem): number => {
    const lineSubtotal = item.quantity * item.unitPrice
    const discountAmount = (lineSubtotal * item.discount) / 100
    const taxAmount = ((lineSubtotal - discountAmount) * item.taxPercent) / 100
    return lineSubtotal - discountAmount + taxAmount
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLogo}>
            <Text style={styles.headerLogoText}>{settings.logoText}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.companyName}>{settings.companyName}</Text>
            <Text style={styles.companyDetails}>
              {settings.companyAddress}{'\n'}
              Phone: {settings.companyPhone} | Email: {settings.companyEmail}{'\n'}
              Website: {settings.companyWebsite} | GST: {settings.companyGST}
            </Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Quotation Header */}
          <View style={styles.quotationHeader}>
            <View>
              <Text style={styles.quotationTitle}>QUOTATION</Text>
              <Text style={styles.quotationDate}>
                Date: {formatDate(quotation.date)}
              </Text>
              {quotation.validUntil && (
                <Text style={styles.quotationDate}>
                  Valid Until: {formatDate(quotation.validUntil)}
                </Text>
              )}
            </View>
            <Text style={styles.quotationNumber}>#{quotation.quotationNumber}</Text>
          </View>

          {/* Customer & Details Section */}
          <View style={styles.customerSection}>
            <View style={styles.customerBox}>
              <Text style={styles.sectionTitle}>BILL TO:</Text>
              <Text style={styles.customerName}>{quotation.customer.name}</Text>
              {quotation.customer.company && (
                <Text style={styles.customerInfo}>{quotation.customer.company}</Text>
              )}
              <Text style={styles.customerInfo}>{quotation.customer.email}</Text>
              {quotation.customer.phone && (
                <Text style={styles.customerInfo}>{quotation.customer.phone}</Text>
              )}
            </View>

            <View style={styles.detailsBox}>
              <Text style={styles.sectionTitle}>QUOTATION DETAILS:</Text>
              {quotation.paymentTerms && (
                <View style={{ flexDirection: 'row', marginBottom: 2 }}>
                  <Text style={[styles.customerInfo, { fontWeight: 'bold', width: 60 }]}>Payment:</Text>
                  <Text style={styles.customerInfo}>{quotation.paymentTerms}</Text>
                </View>
              )}
              {quotation.deliveryTerms && (
                <View style={{ flexDirection: 'row', marginBottom: 2 }}>
                  <Text style={[styles.customerInfo, { fontWeight: 'bold', width: 60 }]}>Delivery:</Text>
                  <Text style={styles.customerInfo}>{quotation.deliveryTerms}</Text>
                </View>
              )}
              <View style={{ flexDirection: 'row' }}>
                <Text style={[styles.customerInfo, { fontWeight: 'bold', width: 60 }]}>Currency:</Text>
                <Text style={styles.customerInfo}>{settings.defaultCurrency}</Text>
              </View>
            </View>
          </View>

          {/* Items Table */}
          <View style={styles.itemsSection}>
            <Text style={styles.itemsTitle}>ITEMS & SERVICES</Text>
            
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.colDescription]}>DESCRIPTION</Text>
              <Text style={[styles.tableHeaderText, styles.colQty]}>QTY</Text>
              <Text style={[styles.tableHeaderText, styles.colRate]}>RATE</Text>
              <Text style={[styles.tableHeaderText, styles.colDiscount]}>DISC%</Text>
              <Text style={[styles.tableHeaderText, styles.colTax]}>TAX%</Text>
              <Text style={[styles.tableHeaderText, styles.colAmount]}>AMOUNT</Text>
            </View>

            {/* Table Rows */}
            {quotation.items.map((item, index) => (
              <View key={index} style={[styles.tableRow, ...(index % 2 === 0 ? [styles.tableRowAlt] : [])]}>
                <View style={styles.colDescription}>
                  <Text style={styles.tableCellBold}>{item.productName}</Text>
                  
                  {/* Product Details */}
                  {item.product?.sku && (
                    <Text style={styles.productSKU}>SKU: {item.product.sku}</Text>
                  )}
                  
                  {item.product?.category && (
                    <Text style={styles.productCategory}>Category: {item.product.category}</Text>
                  )}
                  
                  {/* Configuration Details */}
                  {item.configuration && Object.keys(item.configuration).length > 0 && (
                    <View style={styles.configurationSection}>
                      <Text style={styles.configurationTitle}>Configuration:</Text>
                      {Object.entries(item.configuration).map(([key, value]) => (
                        <Text key={key} style={styles.configurationItem}>
                          • {key.charAt(0).toUpperCase() + key.slice(1)}: {typeof value === 'object' ? 
                            (value.width && value.height ? `${value.width} × ${value.height}` : JSON.stringify(value)) : 
                            String(value)}
                        </Text>
                      ))}
                    </View>
                  )}
                  
                  {/* Description */}
                  {item.description && (
                    <Text style={styles.tableCellDesc}>{item.description}</Text>
                  )}
                  
                  {/* Product Type Badge */}
                  {item.product?.productType && item.product.productType !== 'SIMPLE' && (
                    <Text style={styles.productTypeBadge}>
                      {item.product.productType === 'CONFIGURABLE' ? 'Configurable Product' : 
                       item.product.productType === 'CALCULATED' ? 'Calculated Pricing' : 
                       item.product.productType}
                    </Text>
                  )}
                  
                  {/* Notes */}
                  {item.notes && (
                    <Text style={styles.itemNotes}>Note: {item.notes}</Text>
                  )}
                </View>
                
                <View style={styles.colQty}>
                  <Text style={styles.tableCell}>{item.quantity}</Text>
                  {item.product?.unit && item.product.unit !== 'piece' && (
                    <Text style={styles.unitText}>{item.product.unit}</Text>
                  )}
                </View>
                
                <View style={styles.colRate}>
                  <Text style={styles.tableCell}>{formatCurrency(item.unitPrice)}</Text>
                  {item.calculatedPrice && item.calculatedPrice !== item.unitPrice && (
                    <Text style={styles.calculatedPriceNote}>
                      (Calculated: {formatCurrency(item.calculatedPrice)})
                    </Text>
                  )}
                  {item.product?.unit && item.product.unit !== 'piece' && (
                    <Text style={styles.unitText}>per {item.product.unit}</Text>
                  )}
                </View>
                
                <Text style={[styles.tableCell, styles.colDiscount]}>{item.discount}%</Text>
                <Text style={[styles.tableCell, styles.colTax]}>{item.taxPercent}%</Text>
                <Text style={[styles.tableCellBold, styles.colAmount]}>
                  {formatCurrency(calculateItemTotal(item))}
                </Text>
              </View>
            ))}
          </View>

          {/* Summary */}
          <View style={styles.summarySection}>
            <View style={styles.summaryBox}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal:</Text>
                <Text style={styles.summaryValue}>{formatCurrency(quotation.subtotal)}</Text>
              </View>
              {quotation.totalDiscount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Discount:</Text>
                  <Text style={[styles.summaryValue, styles.summaryDiscount]}>
                    -{formatCurrency(quotation.totalDiscount)}
                  </Text>
                </View>
              )}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax:</Text>
                <Text style={[styles.summaryValue, styles.summaryTax]}>{formatCurrency(quotation.totalTax)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>TOTAL:</Text>
                <Text style={styles.totalValue}>{formatCurrency(quotation.grandTotal)}</Text>
              </View>
            </View>
          </View>

          {/* Notes & Terms */}
          {(quotation.notes || quotation.termsConditions) && (
            <View style={styles.notesSection}>
              <Text style={styles.notesTitle}>NOTES & TERMS</Text>
              {quotation.notes && (
                <Text style={styles.notesText}>{quotation.notes}</Text>
              )}
              {quotation.termsConditions && (
                <Text style={[styles.notesText, { marginTop: 5 }]}>{quotation.termsConditions}</Text>
              )}
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <Text style={styles.footerText}>{settings.footerText}</Text>
            <Text style={styles.footerText}>
              Generated on {new Date().toLocaleDateString('en-IN')} | Created by {quotation.createdBy.name}
            </Text>
          </View>
          <View style={styles.footerRight}>
            <Text style={styles.footerText}>Page 1 of 1</Text>
            <Text style={styles.footerText}>Quotation #{quotation.quotationNumber}</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}

export default QuotationPDFTemplate