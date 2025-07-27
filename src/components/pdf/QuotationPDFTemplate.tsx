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
  productName: string
  description?: string
  quantity: number
  unitPrice: number
  discount: number
  taxPercent: number
  subtotal: number
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

interface QuotationPDFTemplateProps {
  quotation: Quotation
}

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 0,
  },
  
  // Header Section
  header: {
    backgroundColor: '#2d3748',
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
    color: '#2d3748',
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
    backgroundColor: '#f8fafc',
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
    color: '#2d3748',
  },
  quotationNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6366f1',
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
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 5,
    padding: 15,
    marginRight: 10,
  },
  detailsBox: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 5,
    padding: 15,
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2d3748',
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
    backgroundColor: '#2d3748',
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
    backgroundColor: '#f8fafc',
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
    backgroundColor: '#2d3748',
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
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 5,
    padding: 15,
    marginBottom: 20,
  },
  notesTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 9,
    color: '#4b5563',
    lineHeight: 1.4,
  },
  
  // Footer
  footer: {
    backgroundColor: '#2d3748',
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

const QuotationPDFTemplate: React.FC<QuotationPDFTemplateProps> = ({ quotation }) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount)
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
            <Text style={styles.headerLogoText}>L</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.companyName}>YOUR COMPANY NAME</Text>
            <Text style={styles.companyDetails}>
              123 Business Street, Business City, State 12345{'\n'}
              Phone: +91 98765 43210 | Email: info@company.com{'\n'}
              Website: www.yourcompany.com | GST: 29ABCDE1234F1Z5
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
                <Text style={styles.customerInfo}>{quotation.currency}</Text>
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
                  {item.description && (
                    <Text style={styles.tableCellDesc}>{item.description}</Text>
                  )}
                </View>
                <Text style={[styles.tableCell, styles.colQty]}>{item.quantity}</Text>
                <Text style={[styles.tableCell, styles.colRate]}>{formatCurrency(item.unitPrice)}</Text>
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
            <Text style={styles.footerText}>Thank you for your business!</Text>
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