'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/shared/hooks'
import { AuthGuard } from '@/shared/components'
import { NavBar } from '@/shared/components'

interface PDFSettings {
  id: string
  companyName: string
  companyAddress: string
  companyPhone: string
  companyEmail: string
  companyWebsite: string
  companyGST: string
  logoUrl?: string
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
  // Advanced Layout Settings
  pageMarginTop: number
  pageMarginBottom: number
  pageMarginLeft: number
  pageMarginRight: number
  // Header Settings
  headerHeight: number
  headerPadding: number
  headerShowLogo: boolean
  headerShowAddress: boolean
  headerAlignment: string
  // Footer Settings
  footerHeight: number
  footerPadding: number
  footerShowPageNumber: boolean
  footerShowDate: boolean
  footerAlignment: string
  // Content Settings
  contentPadding: number
  lineHeight: number
  fontSize: number
  headingFontSize: number
  // Table Settings
  tableHeaderBg: string
  tableBorderColor: string
  tableRowPadding: number
  tableShowBorders: boolean
  // Logo Settings (Advanced)
  logoWidth: number
  logoHeight: number
  logoPosition: string
  // Page Settings
  pageSize: string
  pageOrientation: string
}

export default function SettingsPage() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<PDFSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('company')
  const [uploadingLogo, setUploadingLogo] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      console.log('Fetching settings...')
      const response = await fetch('/api/settings/pdf')
      console.log('Response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('Settings data:', data)
        // Convert Decimal fields to numbers and ensure all required fields exist
        const processedData = {
          id: data.id || '',
          companyName: data.companyName || 'YOUR COMPANY NAME',
          companyAddress: data.companyAddress || '123 Business Street, Business City, State 12345',
          companyPhone: data.companyPhone || '+91 98765 43210',
          companyEmail: data.companyEmail || 'info@company.com',
          companyWebsite: data.companyWebsite || 'www.yourcompany.com',
          companyGST: data.companyGST || '29ABCDE1234F1Z5',
          logoUrl: data.logoUrl || undefined,
          logoText: data.logoText || 'L',
          primaryColor: data.primaryColor || '#2d3748',
          secondaryColor: data.secondaryColor || '#6366f1',
          textColor: data.textColor || '#1f2937',
          lightBackground: data.lightBackground || '#f8fafc',
          quotationPrefix: data.quotationPrefix || 'QT',
          quotationNumberFormat: data.quotationNumberFormat || 'QT-YYYY-####',
          defaultValidityDays: data.defaultValidityDays || 30,
          defaultTermsConditions: data.defaultTermsConditions || '1. Prices are valid for the period mentioned above.\n2. Payment terms as agreed.\n3. Delivery will be made as per schedule.\n4. All disputes subject to local jurisdiction.',
          defaultPaymentTerms: data.defaultPaymentTerms || '100% advance payment required',
          defaultDeliveryTerms: data.defaultDeliveryTerms || 'Delivery within 7-10 working days',
          defaultTaxRate: typeof data.defaultTaxRate === 'string' ? parseFloat(data.defaultTaxRate) : (data.defaultTaxRate || 18),
          showTaxBreakdown: data.showTaxBreakdown !== undefined ? data.showTaxBreakdown : true,
          defaultCurrency: data.defaultCurrency || 'INR',
          currencySymbol: data.currencySymbol || '₹',
          footerText: data.footerText || 'Thank you for your business!',
          // Advanced Layout Settings
          pageMarginTop: data.pageMarginTop || 20,
          pageMarginBottom: data.pageMarginBottom || 20,
          pageMarginLeft: data.pageMarginLeft || 15,
          pageMarginRight: data.pageMarginRight || 15,
          // Header Settings
          headerHeight: data.headerHeight || 80,
          headerPadding: data.headerPadding || 20,
          headerShowLogo: data.headerShowLogo !== undefined ? data.headerShowLogo : true,
          headerShowAddress: data.headerShowAddress !== undefined ? data.headerShowAddress : true,
          headerAlignment: data.headerAlignment || 'left',
          // Footer Settings
          footerHeight: data.footerHeight || 60,
          footerPadding: data.footerPadding || 15,
          footerShowPageNumber: data.footerShowPageNumber !== undefined ? data.footerShowPageNumber : true,
          footerShowDate: data.footerShowDate !== undefined ? data.footerShowDate : true,
          footerAlignment: data.footerAlignment || 'center',
          // Content Settings
          contentPadding: data.contentPadding || 20,
          lineHeight: typeof data.lineHeight === 'string' ? parseFloat(data.lineHeight) : (data.lineHeight || 1.4),
          fontSize: data.fontSize || 12,
          headingFontSize: data.headingFontSize || 16,
          // Table Settings
          tableHeaderBg: data.tableHeaderBg || '#f8fafc',
          tableBorderColor: data.tableBorderColor || '#e5e7eb',
          tableRowPadding: data.tableRowPadding || 10,
          tableShowBorders: data.tableShowBorders !== undefined ? data.tableShowBorders : true,
          // Logo Settings (Advanced)
          logoWidth: data.logoWidth || 100,
          logoHeight: data.logoHeight || 60,
          logoPosition: data.logoPosition || 'header-left',
          // Page Settings
          pageSize: data.pageSize || 'A4',
          pageOrientation: data.pageOrientation || 'portrait'
        }
        setSettings(processedData)
      } else {
        console.error('Failed to fetch settings:', response.statusText)
        const errorText = await response.text()
        console.error('Error response:', errorText)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!settings) return
    
    setSaving(true)
    try {
      const response = await fetch('/api/settings/pdf', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        alert('Settings saved successfully!')
      } else {
        alert('Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (field: string, value: string | number | boolean) => {
    if (!settings) return
    setSettings({ ...settings, [field]: value })
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !settings) return

    setUploadingLogo(true)
    try {
      const formData = new FormData()
      formData.append('logo', file)

      const response = await fetch('/api/upload/logo', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        updateSetting('logoUrl', data.logoUrl)
        alert('Logo uploaded successfully!')
      } else {
        const error = await response.json()
        alert(`Failed to upload logo: ${error.error}`)
      }
    } catch (error) {
      console.error('Error uploading logo:', error)
      alert('Failed to upload logo')
    } finally {
      setUploadingLogo(false)
      // Reset the input
      event.target.value = ''
    }
  }

  const handleLogoRemove = async () => {
    if (!settings?.logoUrl || !settings) return

    if (!confirm('Are you sure you want to remove the logo?')) return

    try {
      // Extract filename from URL
      const filename = settings.logoUrl.split('/').pop()
      
      if (filename) {
        await fetch(`/api/upload/logo?filename=${filename}`, {
          method: 'DELETE',
        })
      }

      updateSetting('logoUrl', '')
      alert('Logo removed successfully!')
    } catch (error) {
      console.error('Error removing logo:', error)
      alert('Failed to remove logo')
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50">
          <NavBar currentPage="settings" />
          <div className="flex justify-center items-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-2 text-gray-700">Loading settings...</p>
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  if (!settings) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50">
          <NavBar currentPage="settings" />
          <div className="text-center mt-20">
            <p className="text-gray-700">Failed to load settings</p>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <NavBar currentPage="settings" />
        
        <main className="max-w-6xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-lg font-bold">⚙️</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Quotation Settings</h1>
                  <p className="text-gray-600">Customize quotation PDFs, company information, and default values</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                {[
                  { id: 'company', name: 'Company Info', icon: '🏢' },
                  { id: 'colors', name: 'Colors & Branding', icon: '🎨' },
                  { id: 'layout', name: 'Layout & Margins', icon: '📐' },
                  { id: 'quotation', name: 'Quotation Format', icon: '📄' },
                  { id: 'defaults', name: 'Quotation Defaults', icon: '⚙️' },
                  { id: 'advanced', name: 'Advanced', icon: '⚡' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Company Info Tab */}
              {activeTab === 'company' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                      <input
                        type="text"
                        value={settings.companyName}
                        onChange={(e) => updateSetting('companyName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>


                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company Address</label>
                      <textarea
                        value={settings.companyAddress}
                        onChange={(e) => updateSetting('companyAddress', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="text"
                        value={settings.companyPhone}
                        onChange={(e) => updateSetting('companyPhone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={settings.companyEmail}
                        onChange={(e) => updateSetting('companyEmail', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                      <input
                        type="text"
                        value={settings.companyWebsite}
                        onChange={(e) => updateSetting('companyWebsite', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">GST Number</label>
                      <input
                        type="text"
                        value={settings.companyGST}
                        onChange={(e) => updateSetting('companyGST', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Footer Text</label>
                      <input
                        type="text"
                        value={settings.footerText}
                        onChange={(e) => updateSetting('footerText', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Colors Tab */}
              {activeTab === 'colors' && (
                <div className="space-y-6">
                  {/* Logo Upload Section */}
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Company Logo</h3>
                    
                    <div className="flex flex-col space-y-4">
                      {/* Current Logo Preview */}
                      {settings.logoUrl ? (
                        <div className="flex items-center space-x-4">
                          <div className="w-20 h-20 border border-gray-300 rounded-lg overflow-hidden bg-white flex items-center justify-center">
                            <img
                              src={settings.logoUrl}
                              alt="Company Logo"
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-600">Current logo</p>
                            <button
                              onClick={handleLogoRemove}
                              className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
                            >
                              Remove Logo
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white"
                            style={{ backgroundColor: settings.primaryColor }}
                          >
                            {settings.logoText}
                          </div>
                        </div>
                      )}

                      {/* Upload Controls */}
                      <div className="flex items-center space-x-4">
                        <label className="relative cursor-pointer bg-white rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                          <input
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            disabled={uploadingLogo}
                          />
                          {uploadingLogo ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 inline-block mr-2"></div>
                              Uploading...
                            </>
                          ) : (
                            <>
                              📁 Choose Logo
                            </>
                          )}
                        </label>
                        
                        <p className="text-sm text-gray-500">
                          PNG, JPEG, GIF, WebP up to 5MB
                        </p>
                      </div>

                      {/* Logo Text Fallback */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Logo Text (fallback when no image)
                        </label>
                        <input
                          type="text"
                          value={settings.logoText}
                          onChange={(e) => updateSetting('logoText', e.target.value)}
                          className="w-32 px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          placeholder="e.g., L"
                          maxLength={3}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Used when logo image is not available (max 3 characters)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color (Header)</label>
                      <div className="flex space-x-3">
                        <input
                          type="color"
                          value={settings.primaryColor}
                          onChange={(e) => updateSetting('primaryColor', e.target.value)}
                          className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={settings.primaryColor}
                          onChange={(e) => updateSetting('primaryColor', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color (Accent)</label>
                      <div className="flex space-x-3">
                        <input
                          type="color"
                          value={settings.secondaryColor}
                          onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                          className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={settings.secondaryColor}
                          onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                      <div className="flex space-x-3">
                        <input
                          type="color"
                          value={settings.textColor}
                          onChange={(e) => updateSetting('textColor', e.target.value)}
                          className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={settings.textColor}
                          onChange={(e) => updateSetting('textColor', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Light Background</label>
                      <div className="flex space-x-3">
                        <input
                          type="color"
                          value={settings.lightBackground}
                          onChange={(e) => updateSetting('lightBackground', e.target.value)}
                          className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={settings.lightBackground}
                          onChange={(e) => updateSetting('lightBackground', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Color Preview */}
                  <div className="mt-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div 
                        className="p-4 text-white"
                        style={{ backgroundColor: settings.primaryColor }}
                      >
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold overflow-hidden"
                            style={{ backgroundColor: 'white', color: settings.primaryColor }}
                          >
                            {settings.logoUrl ? (
                              <img
                                src={settings.logoUrl}
                                alt="Logo"
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              settings.logoText
                            )}
                          </div>
                          <div>
                            <div className="font-bold">{settings.companyName}</div>
                            <div className="text-sm opacity-90">Sample Header</div>
                          </div>
                        </div>
                      </div>
                      <div 
                        className="p-4"
                        style={{ backgroundColor: settings.lightBackground, color: settings.textColor }}
                      >
                        <div className="font-medium">Sample Content Area</div>
                        <div 
                          className="inline-block px-2 py-1 rounded text-white text-sm mt-2"
                          style={{ backgroundColor: settings.secondaryColor }}
                        >
                          Accent Color
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Layout & Margins Tab */}
              {activeTab === 'layout' && (
                <div className="space-y-6">
                  {/* Page Settings */}
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Page Settings</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Page Size</label>
                        <select
                          value={settings.pageSize}
                          onChange={(e) => updateSetting('pageSize', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                          <option value="A4">A4 (210 × 297 mm)</option>
                          <option value="Letter">Letter (8.5 × 11 in)</option>
                          <option value="Legal">Legal (8.5 × 14 in)</option>
                          <option value="A3">A3 (297 × 420 mm)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Orientation</label>
                        <select
                          value={settings.pageOrientation}
                          onChange={(e) => updateSetting('pageOrientation', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                          <option value="portrait">Portrait</option>
                          <option value="landscape">Landscape</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Page Margins */}
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Page Margins (mm)</h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Top</label>
                        <input
                          type="number"
                          value={settings.pageMarginTop}
                          onChange={(e) => updateSetting('pageMarginTop', parseInt(e.target.value) || 20)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          min="0"
                          max="50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bottom</label>
                        <input
                          type="number"
                          value={settings.pageMarginBottom}
                          onChange={(e) => updateSetting('pageMarginBottom', parseInt(e.target.value) || 20)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          min="0"
                          max="50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Left</label>
                        <input
                          type="number"
                          value={settings.pageMarginLeft}
                          onChange={(e) => updateSetting('pageMarginLeft', parseInt(e.target.value) || 15)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          min="0"
                          max="50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Right</label>
                        <input
                          type="number"
                          value={settings.pageMarginRight}
                          onChange={(e) => updateSetting('pageMarginRight', parseInt(e.target.value) || 15)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          min="0"
                          max="50"
                        />
                      </div>
                    </div>

                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        💡 <strong>Tip:</strong> Standard margins are 20mm (top/bottom) and 15mm (left/right). 
                        Increase margins for more whitespace, decrease for more content per page.
                      </p>
                    </div>
                  </div>

                  {/* Header Settings */}
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Header Settings</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Header Height (px)</label>
                        <input
                          type="number"
                          value={settings.headerHeight}
                          onChange={(e) => updateSetting('headerHeight', parseInt(e.target.value) || 80)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          min="40"
                          max="200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Header Padding (px)</label>
                        <input
                          type="number"
                          value={settings.headerPadding}
                          onChange={(e) => updateSetting('headerPadding', parseInt(e.target.value) || 20)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          min="0"
                          max="50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Header Alignment</label>
                        <select
                          value={settings.headerAlignment}
                          onChange={(e) => updateSetting('headerAlignment', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.headerShowLogo}
                          onChange={(e) => updateSetting('headerShowLogo', e.target.checked)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">Show Logo in Header</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.headerShowAddress}
                          onChange={(e) => updateSetting('headerShowAddress', e.target.checked)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">Show Company Address in Header</span>
                      </label>
                    </div>
                  </div>

                  {/* Footer Settings */}
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Footer Settings</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Footer Height (px)</label>
                        <input
                          type="number"
                          value={settings.footerHeight}
                          onChange={(e) => updateSetting('footerHeight', parseInt(e.target.value) || 60)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          min="30"
                          max="150"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Footer Padding (px)</label>
                        <input
                          type="number"
                          value={settings.footerPadding}
                          onChange={(e) => updateSetting('footerPadding', parseInt(e.target.value) || 15)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          min="0"
                          max="40"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Footer Alignment</label>
                        <select
                          value={settings.footerAlignment}
                          onChange={(e) => updateSetting('footerAlignment', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.footerShowPageNumber}
                          onChange={(e) => updateSetting('footerShowPageNumber', e.target.checked)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">Show Page Numbers</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.footerShowDate}
                          onChange={(e) => updateSetting('footerShowDate', e.target.checked)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">Show Generation Date</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Quotation Format Tab */}
              {activeTab === 'quotation' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quotation Prefix</label>
                      <input
                        type="text"
                        value={settings.quotationPrefix}
                        onChange={(e) => updateSetting('quotationPrefix', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="e.g., QT, INV, QUOTE"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Number Format</label>
                      <input
                        type="text"
                        value={settings.quotationNumberFormat}
                        onChange={(e) => updateSetting('quotationNumberFormat', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="e.g., QT-YYYY-####"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Use YYYY for year, #### for sequential numbers
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Default Validity (Days)</label>
                      <input
                        type="number"
                        value={settings.defaultValidityDays}
                        onChange={(e) => updateSetting('defaultValidityDays', parseInt(e.target.value) || 30)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        min="1"
                        max="365"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Number of days quotations remain valid
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Default Currency</label>
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={settings.defaultCurrency}
                          onChange={(e) => updateSetting('defaultCurrency', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                          <option value="INR">INR</option>
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                        </select>
                        <input
                          type="text"
                          value={settings.currencySymbol}
                          onChange={(e) => updateSetting('currencySymbol', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          placeholder="Symbol"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Format Examples:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• <code>QT-YYYY-####</code> → QT-2025-0001</li>
                      <li>• <code>####/YYYY</code> → 0001/2025</li>
                      <li>• <code>INV-####</code> → INV-0001</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Quotation Defaults Tab */}
              {activeTab === 'defaults' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Default Tax Rate (%)</label>
                      <input
                        type="number"
                        value={settings.defaultTaxRate}
                        onChange={(e) => updateSetting('defaultTaxRate', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        min="0"
                        max="100"
                        step="0.01"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Default GST/Tax rate for new quotation items
                      </p>
                    </div>

                    <div className="flex items-center">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.showTaxBreakdown}
                          onChange={(e) => updateSetting('showTaxBreakdown', e.target.checked)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">Show Tax Breakdown in PDF</span>
                      </label>
                      <p className="mt-1 text-xs text-gray-500 ml-6">
                        Display detailed tax calculations in quotation PDF
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Default Payment Terms</label>
                      <textarea
                        value={settings.defaultPaymentTerms}
                        onChange={(e) => updateSetting('defaultPaymentTerms', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="e.g., 100% advance payment required"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Default Delivery Terms</label>
                      <textarea
                        value={settings.defaultDeliveryTerms}
                        onChange={(e) => updateSetting('defaultDeliveryTerms', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="e.g., Delivery within 7-10 working days"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Default Terms & Conditions</label>
                      <textarea
                        value={settings.defaultTermsConditions}
                        onChange={(e) => updateSetting('defaultTermsConditions', e.target.value)}
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Enter default terms and conditions for quotations..."
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        These terms will be automatically included in new quotations
                      </p>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2">💡 Pro Tips:</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Set realistic payment terms that work for your business</li>
                      <li>• Include clear delivery timelines to set proper expectations</li>
                      <li>• Add warranty/guarantee information in terms & conditions</li>
                      <li>• Consider adding cancellation and refund policies</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Advanced Tab */}
              {activeTab === 'advanced' && (
                <div className="space-y-6">
                  {/* Typography Settings */}
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Typography & Content</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Base Font Size (pt)</label>
                        <input
                          type="number"
                          value={settings.fontSize}
                          onChange={(e) => updateSetting('fontSize', parseInt(e.target.value) || 12)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          min="8"
                          max="20"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Heading Font Size (pt)</label>
                        <input
                          type="number"
                          value={settings.headingFontSize}
                          onChange={(e) => updateSetting('headingFontSize', parseInt(e.target.value) || 16)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          min="10"
                          max="30"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Line Height</label>
                        <input
                          type="number"
                          step="0.1"
                          value={settings.lineHeight}
                          onChange={(e) => updateSetting('lineHeight', parseFloat(e.target.value) || 1.4)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          min="1.0"
                          max="3.0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Content Padding (px)</label>
                        <input
                          type="number"
                          value={settings.contentPadding}
                          onChange={(e) => updateSetting('contentPadding', parseInt(e.target.value) || 20)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          min="0"
                          max="50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Logo Advanced Settings */}
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Advanced Logo Settings</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Logo Width (px)</label>
                        <input
                          type="number"
                          value={settings.logoWidth}
                          onChange={(e) => updateSetting('logoWidth', parseInt(e.target.value) || 100)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          min="50"
                          max="300"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Logo Height (px)</label>
                        <input
                          type="number"
                          value={settings.logoHeight}
                          onChange={(e) => updateSetting('logoHeight', parseInt(e.target.value) || 60)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          min="30"
                          max="200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Logo Position</label>
                        <select
                          value={settings.logoPosition}
                          onChange={(e) => updateSetting('logoPosition', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                          <option value="header-left">Header Left</option>
                          <option value="header-center">Header Center</option>
                          <option value="header-right">Header Right</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Table Settings */}
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Table Styling</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Table Header Background</label>
                        <div className="flex space-x-3">
                          <input
                            type="color"
                            value={settings.tableHeaderBg}
                            onChange={(e) => updateSetting('tableHeaderBg', e.target.value)}
                            className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={settings.tableHeaderBg}
                            onChange={(e) => updateSetting('tableHeaderBg', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Table Border Color</label>
                        <div className="flex space-x-3">
                          <input
                            type="color"
                            value={settings.tableBorderColor}
                            onChange={(e) => updateSetting('tableBorderColor', e.target.value)}
                            className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={settings.tableBorderColor}
                            onChange={(e) => updateSetting('tableBorderColor', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Row Padding (px)</label>
                        <input
                          type="number"
                          value={settings.tableRowPadding}
                          onChange={(e) => updateSetting('tableRowPadding', parseInt(e.target.value) || 10)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          min="5"
                          max="30"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.tableShowBorders}
                          onChange={(e) => updateSetting('tableShowBorders', e.target.checked)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">Show Table Borders</span>
                      </label>
                    </div>
                  </div>

                  {/* Live Preview */}
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <h3 className="text-lg font-medium text-gray-900 p-4 border-b border-gray-200">Live Preview</h3>
                    
                    <div className="p-4">
                      {/* Header Preview */}
                      <div 
                        className="flex items-center justify-between mb-4 p-4 rounded"
                        style={{ 
                          backgroundColor: settings.primaryColor,
                          color: 'white',
                          height: `${Math.min(settings.headerHeight, 120)}px`,
                          padding: `${settings.headerPadding}px`,
                          textAlign: settings.headerAlignment as any
                        }}
                      >
                        {settings.headerAlignment === 'left' && (
                          <>
                            <div className="flex items-center space-x-3">
                              {settings.headerShowLogo && (
                                <div 
                                  className="bg-white rounded overflow-hidden"
                                  style={{ 
                                    width: `${Math.min(settings.logoWidth, 80)}px`, 
                                    height: `${Math.min(settings.logoHeight, 50)}px` 
                                  }}
                                >
                                  {settings.logoUrl ? (
                                    <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                                  ) : (
                                    <div 
                                      className="w-full h-full flex items-center justify-center text-sm font-bold"
                                      style={{ color: settings.primaryColor }}
                                    >
                                      {settings.logoText}
                                    </div>
                                  )}
                                </div>
                              )}
                              <div>
                                <div 
                                  className="font-bold"
                                  style={{ fontSize: `${Math.min(settings.headingFontSize, 18)}px` }}
                                >
                                  {settings.companyName}
                                </div>
                                {settings.headerShowAddress && (
                                  <div 
                                    className="text-sm opacity-90 mt-1"
                                    style={{ 
                                      fontSize: `${Math.min(settings.fontSize, 14)}px`,
                                      lineHeight: settings.lineHeight 
                                    }}
                                  >
                                    Sample Address Line
                                  </div>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Content Preview */}
                      <div 
                        className="mb-4"
                        style={{ 
                          padding: `${settings.contentPadding}px`,
                          fontSize: `${settings.fontSize}px`,
                          lineHeight: settings.lineHeight,
                          color: settings.textColor 
                        }}
                      >
                        <h4 
                          className="font-medium mb-2"
                          style={{ fontSize: `${settings.headingFontSize}px` }}
                        >
                          Sample Content Section
                        </h4>
                        <p>This is how your PDF content will appear with the current typography settings.</p>
                      </div>

                      {/* Table Preview */}
                      <div className="mb-4">
                        <table 
                          className="w-full"
                          style={{ 
                            borderCollapse: 'collapse',
                            fontSize: `${settings.fontSize}px` 
                          }}
                        >
                          <thead>
                            <tr>
                              <th 
                                className="text-left font-medium"
                                style={{ 
                                  backgroundColor: settings.tableHeaderBg,
                                  color: settings.textColor,
                                  padding: `${settings.tableRowPadding}px`,
                                  ...(settings.tableShowBorders && {
                                    border: `1px solid ${settings.tableBorderColor}`
                                  })
                                }}
                              >
                                Item
                              </th>
                              <th 
                                className="text-right font-medium"
                                style={{ 
                                  backgroundColor: settings.tableHeaderBg,
                                  color: settings.textColor,
                                  padding: `${settings.tableRowPadding}px`,
                                  ...(settings.tableShowBorders && {
                                    border: `1px solid ${settings.tableBorderColor}`
                                  })
                                }}
                              >
                                Amount
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td 
                                style={{ 
                                  padding: `${settings.tableRowPadding}px`,
                                  color: settings.textColor,
                                  ...(settings.tableShowBorders && {
                                    border: `1px solid ${settings.tableBorderColor}`
                                  })
                                }}
                              >
                                Sample Item
                              </td>
                              <td 
                                className="text-right"
                                style={{ 
                                  padding: `${settings.tableRowPadding}px`,
                                  color: settings.textColor,
                                  ...(settings.tableShowBorders && {
                                    border: `1px solid ${settings.tableBorderColor}`
                                  })
                                }}
                              >
                                {settings.currencySymbol}1,000
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Footer Preview */}
                      <div 
                        className="flex items-center justify-center text-sm"
                        style={{ 
                          backgroundColor: settings.lightBackground,
                          color: settings.textColor,
                          height: `${Math.min(settings.footerHeight, 80)}px`,
                          padding: `${settings.footerPadding}px`,
                          textAlign: settings.footerAlignment as any,
                          fontSize: `${Math.min(settings.fontSize, 12)}px`
                        }}
                      >
                        <div>
                          {settings.footerText}
                          {settings.footerShowPageNumber && <span className="ml-4">Page 1</span>}
                          {settings.footerShowDate && <span className="ml-4">{new Date().toLocaleDateString()}</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h4 className="font-medium text-amber-900 mb-2">🔧 Advanced Settings Tips:</h4>
                    <ul className="text-sm text-amber-800 space-y-1">
                      <li>• Adjust font sizes carefully - too large may cause content overflow</li>
                      <li>• Line height affects readability - 1.4-1.6 is recommended for body text</li>
                      <li>• Logo dimensions will maintain aspect ratio when rendered</li>
                      <li>• Test your settings by generating a sample PDF</li>
                      <li>• Keep table padding consistent with content padding for visual harmony</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <span className="mr-2">💾</span>
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}