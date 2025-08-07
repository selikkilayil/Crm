'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import AuthGuard from '@/components/AuthGuard'
import LayoutWithVerticalNav from '@/components/LayoutWithVerticalNav'

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
}

export default function SettingsPage() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<PDFSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('company')

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
          footerText: data.footerText || 'Thank you for your business!'
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

  if (loading) {
    return (
      <AuthGuard>
        <LayoutWithVerticalNav currentPage="settings">
          <div className="flex justify-center items-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-2 text-gray-700">Loading settings...</p>
            </div>
          </div>
        </LayoutWithVerticalNav>
      </AuthGuard>
    )
  }

  if (!settings) {
    return (
      <AuthGuard>
        <LayoutWithVerticalNav currentPage="settings">
          <div className="text-center mt-20">
            <p className="text-gray-700">Failed to load settings</p>
          </div>
        </LayoutWithVerticalNav>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <LayoutWithVerticalNav currentPage="settings">
        
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
                  { id: 'quotation', name: 'Quotation Format', icon: '📄' },
                  { id: 'defaults', name: 'Quotation Defaults', icon: '⚙️' },
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

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Logo Text (fallback)</label>
                      <input
                        type="text"
                        value={settings.logoText}
                        onChange={(e) => updateSetting('logoText', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="e.g., Logo text when no image"
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
                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                            style={{ backgroundColor: 'white', color: settings.primaryColor }}
                          >
                            {settings.logoText}
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
      </LayoutWithVerticalNav>
    </AuthGuard>
  )
}