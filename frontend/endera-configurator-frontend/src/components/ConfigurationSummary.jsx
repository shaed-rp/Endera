import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import QuoteModal from './QuoteModal'
import { 
  Truck, 
  Bus, 
  DollarSign, 
  FileText, 
  Download,
  Users,
  Zap,
  Fuel,
  Gauge,
  Weight,
  Ruler
} from 'lucide-react'

const API_BASE_URL = 'http://localhost:3001/api'

function ConfigurationSummary({ 
  selectedChassis, 
  selectedBody, 
  sessionId,
  userType = 'customer',
  onGenerateQuote 
}) {
  const [pricing, setPricing] = useState(null)
  const [loadingPricing, setLoadingPricing] = useState(false)
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [isGeneratingQuote, setIsGeneratingQuote] = useState(false)

  useEffect(() => {
    if (selectedChassis && selectedBody && sessionId) {
      fetchPricing()
    }
  }, [selectedChassis, selectedBody, sessionId, userType])

  const fetchPricing = async () => {
    try {
      setLoadingPricing(true)
      const response = await fetch(`${API_BASE_URL}/pricing/sessions/${sessionId}?userType=${userType}`)
      if (!response.ok) {
        throw new Error('Failed to fetch pricing')
      }
      const data = await response.json()
      setPricing(data.data?.pricing || null)
    } catch (err) {
      console.error('Error fetching pricing:', err)
    } finally {
      setLoadingPricing(false)
    }
  }

  const handleGenerateQuote = async (customerInfo) => {
    setIsGeneratingQuote(true)
    
    try {
      const response = await fetch(`${API_BASE_URL}/quotes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionId,
          customerName: customerInfo.name,
          customerEmail: customerInfo.email,
          customerPhone: customerInfo.phone,
          customerCompany: customerInfo.company,
          quoteType: 'estimate',
          validityDays: 30,
          notes: customerInfo.notes
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate quote')
      }

      const result = await response.json()
      
      if (result.success) {
        // Download the PDF
        const pdfResponse = await fetch(`${API_BASE_URL}/quotes/${result.data.quoteId}/pdf`)
        
        if (pdfResponse.ok) {
          const blob = await pdfResponse.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.style.display = 'none'
          a.href = url
          a.download = `Endera_Quote_${result.data.quoteNumber}.pdf`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
          
          setShowQuoteModal(false)
          if (onGenerateQuote) {
            onGenerateQuote(result.data)
          }
        } else {
          throw new Error('Failed to download quote PDF')
        }
      } else {
        throw new Error(result.error || 'Failed to generate quote')
      }
    } catch (error) {
      console.error('Quote generation error:', error)
      alert('Failed to generate quote. Please try again.')
    } finally {
      setIsGeneratingQuote(false)
    }
  }

  const handleSaveConfiguration = async () => {
    try {
      const configData = {
        sessionId,
        selectedChassis,
        selectedBody,
        pricing,
        timestamp: new Date().toISOString()
      }

      // For now, just save to localStorage
      const savedConfigs = JSON.parse(localStorage.getItem('enderaConfigurations') || '[]')
      const newConfig = {
        id: Date.now().toString(),
        name: `${selectedChassis?.model_name || 'Chassis'} + ${selectedBody?.config_name || 'Body'}`,
        data: configData,
        createdAt: new Date().toISOString()
      }
      
      savedConfigs.push(newConfig)
      localStorage.setItem('enderaConfigurations', JSON.stringify(savedConfigs))
      
      alert('Configuration saved successfully!')
    } catch (error) {
      console.error('Save configuration error:', error)
      alert('Failed to save configuration. Please try again.')
    }
  }

  const formatPrice = (amount) => {
    if (!amount) return 'TBD'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getFuelIcon = (fuelType) => {
    switch (fuelType) {
      case 'Electric':
        return <Zap className="h-4 w-4 text-green-600" />
      case 'Gasoline':
        return <Fuel className="h-4 w-4 text-blue-600" />
      default:
        return <Gauge className="h-4 w-4 text-gray-600" />
    }
  }

  if (!selectedChassis && !selectedBody) {
    return (
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Configuration Summary</span>
          </CardTitle>
          <CardDescription>
            Your selections will appear here as you configure your vehicle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Bus className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Start by selecting a chassis</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="h-fit sticky top-4">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Configuration Summary</span>
          </CardTitle>
          <CardDescription>
            Review your vehicle configuration
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Chassis Selection */}
          {selectedChassis && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Truck className="h-4 w-4 text-gray-600" />
                <h4 className="font-medium">Chassis</h4>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-medium">{selectedChassis.seriesCode}</div>
                <div className="text-sm text-gray-600">{selectedChassis.modelDescription}</div>
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Ruler className="h-3 w-3" />
                    <span>{selectedChassis.wheelbaseInches}"</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Weight className="h-3 w-3" />
                    <span>{selectedChassis.gvwrPounds?.toLocaleString()} lbs</span>
                  </div>
                </div>
                {selectedChassis.pricing && (
                  <div className="mt-2 text-right">
                    <span className="font-medium text-purple-600">
                      {formatPrice(
                        userType === 'dealer' 
                          ? selectedChassis.pricing.dealerInvoice 
                          : selectedChassis.pricing.suggestedRetail
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Body Selection */}
          {selectedBody && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Bus className="h-4 w-4 text-gray-600" />
                <h4 className="font-medium">Body Configuration</h4>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-medium">{selectedBody.configName}</div>
                <div className="text-sm text-gray-600">{selectedBody.configCode}</div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-2">
                    {getFuelIcon(selectedBody.fuelType)}
                    <span className="text-sm">{selectedBody.fuelType}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Users className="h-3 w-3" />
                    <span>{selectedBody.passengerCapacity}</span>
                  </div>
                </div>
                <div className="mt-2 text-right">
                  <span className="font-medium text-purple-600">
                    Contact for pricing
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Pricing Summary */}
          {(selectedChassis || selectedBody) && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-gray-600" />
                  <h4 className="font-medium">Pricing Summary</h4>
                </div>
                
                {loadingPricing ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Calculating pricing...</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedChassis?.pricing && (
                      <div className="flex justify-between text-sm">
                        <span>Chassis ({userType === 'dealer' ? 'Invoice' : 'MSRP'})</span>
                        <span>{formatPrice(
                          userType === 'dealer' 
                            ? selectedChassis.pricing.dealerInvoice 
                            : selectedChassis.pricing.suggestedRetail
                        )}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-sm">
                      <span>Body Configuration</span>
                      <span>Contact for pricing</span>
                    </div>
                    
                    {selectedChassis?.pricing?.destinationCharge && (
                      <div className="flex justify-between text-sm">
                        <span>Destination Charge</span>
                        <span>{formatPrice(selectedChassis.pricing.destinationCharge)}</span>
                      </div>
                    )}
                    
                    <Separator />
                    
                    <div className="flex justify-between font-medium">
                      <span>Estimated Total</span>
                      <span className="text-purple-600">
                        {selectedChassis?.pricing 
                          ? `${formatPrice(
                              (userType === 'dealer' 
                                ? selectedChassis.pricing.dealerInvoice 
                                : selectedChassis.pricing.suggestedRetail) +
                              (selectedChassis.pricing.destinationCharge || 0)
                            )}+`
                          : 'Contact for pricing'
                        }
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-2">
                      * Final pricing includes body configuration and options
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Action Buttons */}
          {selectedChassis && selectedBody && (
            <div className="space-y-2">
              <Button 
                className="w-full endera-primary"
                onClick={() => setShowQuoteModal(true)}
                disabled={isGeneratingQuote}
              >
                <FileText className="h-4 w-4 mr-2" />
                {isGeneratingQuote ? 'Generating...' : 'Generate Quote'}
              </Button>
              
              <Button variant="outline" className="w-full" onClick={handleSaveConfiguration}>
                <Download className="h-4 w-4 mr-2" />
                Save Configuration
              </Button>
            </div>
          )}

          {/* Configuration Status */}
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex items-center justify-between">
              <span>Chassis Selected</span>
              <span className={selectedChassis ? 'text-green-600' : 'text-gray-400'}>
                {selectedChassis ? '✓' : '○'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Body Selected</span>
              <span className={selectedBody ? 'text-green-600' : 'text-gray-400'}>
                {selectedBody ? '✓' : '○'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Ready for Quote</span>
              <span className={selectedChassis && selectedBody ? 'text-green-600' : 'text-gray-400'}>
                {selectedChassis && selectedBody ? '✓' : '○'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <QuoteModal
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        onSubmit={handleGenerateQuote}
        sessionId={sessionId}
      />
    </>
  )
}

export default ConfigurationSummary

